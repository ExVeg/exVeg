const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');

let _initialized = false;

function initCloudinary() {
  if (_initialized) return;
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Missing Cloudinary environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  _initialized = true;
}

/**
 * Builds the Cloudinary folder path for a given resource type.
 * @param {'product'|'profile'|'review'} resourceType
 * @param {string} uid  - Firebase user UID
 * @param {string} [subId] - productId or other sub-identifier
 */
function buildFolder(resourceType, uid, subId) {
  switch (resourceType) {
    case 'product':
      return `exveg/products/${uid}/${subId || 'new'}`;
    case 'profile':
      return `exveg/profiles/${uid}`;
    case 'review':
      return `exveg/reviews/${uid}`;
    default:
      throw new Error(`Unknown resourceType: ${resourceType}`);
  }
}

/**
 * Generates a signed upload signature for Cloudinary.
 * Returns params the frontend needs to POST directly to Cloudinary.
 *
 * @param {{ resourceType: string, uid: string, subId?: string }} opts
 * @returns {{ signature, timestamp, apiKey, cloudName, folder, publicId, eager, transformation }}
 */
function generateUploadSignature({ resourceType, uid, subId }) {
  initCloudinary();

  const folder = buildFolder(resourceType, uid, subId);
  const publicId = `${folder}/${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  const timestamp = Math.round(Date.now() / 1000);

  // Params that must be signed (must match what the frontend sends)
  const paramsToSign = {
    folder,
    public_id: publicId,
    timestamp,
    // Transform to WebP with auto quality on upload
    eager: 'f_webp,q_auto',
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    publicId,
    eager: paramsToSign.eager,
  };
}

/**
 * Deletes an image from Cloudinary by its public_id.
 * @param {string} publicId
 */
async function deleteCloudinaryImage(publicId) {
  initCloudinary();
  return cloudinary.uploader.destroy(publicId, { invalidate: true });
}

/**
 * Checks whether a publicId legitimately belongs to a uid.
 * Sellers can only delete their own files; Admins can delete any exveg/ path.
 *
 * @param {string} publicId
 * @param {string} uid
 * @param {'Admin'|'Seller'|string} role
 */
function validateOwnership(publicId, uid, role) {
  if (!publicId.startsWith('exveg/')) {
    return false; // must be in our namespace
  }
  if (role === 'Admin') return true;
  // Seller: path must contain their uid
  return publicId.includes(`/${uid}/`);
}

module.exports = {
  generateUploadSignature,
  deleteCloudinaryImage,
  validateOwnership,
  buildFolder,
  initCloudinary,
};

