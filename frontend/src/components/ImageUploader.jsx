import { useState, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { auth } from '../firebase';
import { getApiBaseUrl } from '../utils/api';

const MAX_FILES = 5;
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Reusable image uploader with drag-drop, preview, progress, multi-image, primary selection.
 *
 * Props:
 *  - onImagesChange(images: Array<{url, publicId, isPrimary}>)  — called after each upload
 *  - resourceType: 'product' | 'profile' | 'review'
 *  - productId: string (optional, used for product folder path)
 *  - existingImages: Array<{url, publicId, isPrimary}>
 *  - maxImages: number (default 5)
 *
 * Ref methods (use with forwardRef / useRef):
 *  - uploadPending() → Promise<Array<{url, publicId, isPrimary}>>
 *      Uploads any locally-selected-but-not-yet-uploaded files,
 *      then returns the full final images array.
 *      Call this from your form submit handler before saving to Firestore.
 *  - hasUploaded() → boolean  — true if at least one image is already uploaded
 */
const ImageUploader = forwardRef(function ImageUploader(
  {
    onImagesChange,
    resourceType = 'product',
    productId = '',
    existingImages = [],
    maxImages = MAX_FILES,
  },
  ref
) {
  const [localFiles, setLocalFiles] = useState([]); // { file, previewUrl, id }
  const [uploadedImages, setUploadedImages] = useState(existingImages); // { url, publicId, isPrimary }
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({}); // { [id]: 0-100 }
  const [errors, setErrors] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Keep a ref to current state so uploadPending() always sees latest values
  const localFilesRef = useRef(localFiles);
  const uploadedImagesRef = useRef(uploadedImages);
  localFilesRef.current = localFiles;
  uploadedImagesRef.current = uploadedImages;

  const totalImages = localFiles.length + uploadedImages.length;
  const remaining = maxImages - totalImages;

  // ── Expose uploadPending() to parent via ref ───────────────────────────────
  useImperativeHandle(ref, () => ({
    /**
     * Uploads any locally-selected files and returns the final images array.
     * If nothing is pending, returns the already-uploaded images immediately.
     */
    async uploadPending() {
      const pending = localFilesRef.current;
      if (pending.length === 0) {
        return uploadedImagesRef.current;
      }
      return await doUpload(pending, uploadedImagesRef.current);
    },
    hasUploaded() {
      return uploadedImagesRef.current.length > 0;
    },
    hasPending() {
      return localFilesRef.current.length > 0;
    },
  }));

  // ── Validation ─────────────────────────────────────────────────────────────
  function validateFile(file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Only JPEG, PNG and WebP are allowed.`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `${file.name}: File must be under ${MAX_SIZE_MB} MB.`;
    }
    return null;
  }

  function addFiles(files) {
    setErrors([]);
    const newErrors = [];
    const valid = [];

    for (const file of files) {
      if (valid.length + localFilesRef.current.length + uploadedImagesRef.current.length >= maxImages) {
        newErrors.push(`Maximum ${maxImages} images allowed.`);
        break;
      }
      const err = validateFile(file);
      if (err) {
        newErrors.push(err);
      } else {
        valid.push({
          file,
          previewUrl: URL.createObjectURL(file),
          id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        });
      }
    }

    if (newErrors.length) setErrors(newErrors);
    if (valid.length) setLocalFiles((prev) => [...prev, ...valid]);
  }

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(Array.from(e.dataTransfer.files));
    },
    [] // eslint-disable-line
  );

  const handleFileInput = (e) => {
    addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  // ── Remove local (not yet uploaded) ───────────────────────────────────────
  function removeLocal(id) {
    setLocalFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }

  // ── Remove already-uploaded image ─────────────────────────────────────────
  async function removeUploaded(publicId) {
    try {
      const token = await auth.currentUser?.getIdToken();
      const base = getApiBaseUrl();
      await fetch(`${base}/api/uploads/image?id=${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    } catch (_) {}

    const updated = uploadedImages.filter((img) => img.publicId !== publicId);
    if (updated.length && !updated.some((img) => img.isPrimary)) {
      updated[0] = { ...updated[0], isPrimary: true };
    }
    setUploadedImages(updated);
    onImagesChange?.(updated);
  }

  // ── Set primary ────────────────────────────────────────────────────────────
  function setPrimary(publicId) {
    const updated = uploadedImages.map((img) => ({
      ...img,
      isPrimary: img.publicId === publicId,
    }));
    setUploadedImages(updated);
    onImagesChange?.(updated);
  }

  // ── Core upload logic (shared by button click and ref.uploadPending) ───────
  async function doUpload(filesToUpload, currentUploaded) {
    setUploading(true);
    setErrors([]);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('You must be logged in to upload images.');

      const base = getApiBaseUrl();
      const newImages = [...currentUploaded];

      for (const item of filesToUpload) {
        // 1. Get a signed upload signature from our backend
        const sigRes = await fetch(`${base}/api/uploads/signature`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ resourceType, productId }),
        });

        if (!sigRes.ok) {
          const err = await sigRes.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to get upload signature.');
        }

        const { signature, timestamp, apiKey, cloudName, folder, publicId, eager } =
          await sigRes.json();

        // 2. Upload directly to Cloudinary (API secret stays on server)
        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', folder);
        formData.append('public_id', publicId);
        formData.append('eager', eager);

        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const pct = Math.round((event.loaded / event.total) * 100);
              setProgress((prev) => ({ ...prev, [item.id]: pct }));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText);
              const isFirst = newImages.length === 0;
              newImages.push({
                url: data.secure_url,
                publicId: data.public_id,
                isPrimary: isFirst,
              });
              resolve();
            } else {
              reject(new Error(`Upload failed: ${xhr.statusText || xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error('Network error during upload.'));
          xhr.send(formData);
        });

        setProgress((prev) => ({ ...prev, [item.id]: 100 }));
      }

      // Clear local previews
      filesToUpload.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      setLocalFiles([]);
      setProgress({});
      setUploadedImages(newImages);
      onImagesChange?.(newImages);
      return newImages;
    } catch (err) {
      setErrors([err.message || 'Upload failed. Please try again.']);
      throw err; // re-throw so form submit handler can catch it
    } finally {
      setUploading(false);
    }
  }

  // ── Upload button click ────────────────────────────────────────────────────
  async function uploadAll() {
    await doUpload(localFiles, uploadedImages);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {remaining > 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all select-none
            ${dragOver
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-outline-variant hover:border-primary hover:bg-surface-container'
            }`}
        >
          <span className="material-symbols-outlined text-3xl text-primary mb-1 block">cloud_upload</span>
          <p className="font-semibold text-on-surface text-sm">
            Drag & drop images here, or{' '}
            <span className="text-primary underline">browse files</span>
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            JPEG, PNG or WebP · Max {MAX_SIZE_MB} MB · Up to {maxImages} images
          </p>
          {remaining < maxImages && (
            <p className="text-xs text-on-surface-variant mt-0.5">
              {remaining} slot{remaining !== 1 ? 's' : ''} remaining
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
          {errors.map((e, i) => (
            <p key={i} className="text-red-700 text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">error</span>
              {e}
            </p>
          ))}
        </div>
      )}

      {/* Already-uploaded images */}
      {uploadedImages.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">
            Uploaded ({uploadedImages.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {uploadedImages.map((img) => (
              <div
                key={img.publicId}
                className="relative group rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
              >
                <img src={img.url} alt="Uploaded" className="w-full h-24 object-cover" />
                {img.isPrimary && (
                  <span className="absolute top-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    Primary
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  {!img.isPrimary && (
                    <button
                      type="button"
                      title="Set as primary"
                      onClick={() => setPrimary(img.publicId)}
                      className="p-1 bg-white/90 rounded-full text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">star</span>
                    </button>
                  )}
                  <button
                    type="button"
                    title="Remove"
                    onClick={() => removeUploaded(img.publicId)}
                    className="p-1 bg-white/90 rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local previews (pending upload) */}
      {localFiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
              Selected — not uploaded yet ({localFiles.length})
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {localFiles.map((item) => (
              <div
                key={item.id}
                className="relative group rounded-lg overflow-hidden border border-amber-300 bg-amber-50"
              >
                <img src={item.previewUrl} alt="Preview" className="w-full h-24 object-cover" />
                {/* Progress bar */}
                {progress[item.id] !== undefined && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress[item.id]}%` }}
                    />
                  </div>
                )}
                {!uploading && progress[item.id] === undefined && (
                  <button
                    type="button"
                    title="Remove"
                    onClick={() => removeLocal(item.id)}
                    className="absolute top-1 right-1 p-0.5 bg-white/90 rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
                {progress[item.id] === 100 && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Info tip */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
            <span className="material-symbols-outlined text-amber-600 text-sm mt-0.5">info</span>
            <p className="text-xs text-amber-700">
              Click <strong>Upload Images</strong> now, or they'll be uploaded automatically when you submit the form.
            </p>
          </div>

          {/* Upload button */}
          <button
            type="button"
            onClick={uploadAll}
            disabled={uploading}
            className="w-full py-2 px-4 bg-primary text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60 transition-all"
          >
            {uploading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                Uploading…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">cloud_upload</span>
                Upload {localFiles.length} Image{localFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}

      {/* Empty state */}
      {uploadedImages.length === 0 && localFiles.length === 0 && (
        <p className="text-xs text-on-surface-variant text-center py-1">No images added yet. Add images above.</p>
      )}
    </div>
  );
});

export default ImageUploader;
