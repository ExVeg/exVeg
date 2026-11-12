const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const {
  buildCheckoutEmailPayload,
  sendCheckoutEmails,
  sendSellerApprovalEmail,
  sendProductApprovalEmail
} = require('./src/checkoutMail');
const { verifyIdToken, getAdminDb } = require('./src/firebaseAdmin');
const { generateUploadSignature, deleteCloudinaryImage, validateOwnership } = require('./src/cloudinaryConfig');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.send('ExVeg API is running');
});

const getSmtpConfig = () => {
  const rawFrom = process.env.SMTP_FROM;
  const validFrom = rawFrom && rawFrom !== 'your-email@gmail.com' ? rawFrom : null;
  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: validFrom || process.env.SMTP_USER || 'no-reply@exveg.com',
  };
};

// Checkout Email Notification
app.post('/api/checkout', async (req, res) => {
  try {
    const {
      orderId,
      buyerName, email, phone, address, city, state, pincode, notes,
      deliveryDate, cartSummary, totalAmount, itemCount,
      itemName, quantity,
      sellerName, sellerEmail, sellerEmails, adminEmail,
    } = req.body;

    const resolvedCartSummary = cartSummary || (itemName ? `- ${itemName} x${quantity || 1}` : 'N/A');
    const resolvedTotal = totalAmount || 'N/A';
    const resolvedItemCount = itemCount || quantity || 1;
    const resolvedSellerEmail = sellerEmail || process.env.SELLER_EMAIL || 'kumarsumit22934@gmail.com';
    const resolvedAdminEmail = adminEmail || process.env.ADMIN_EMAIL || 'exvegcompany@gmail.com';

    const payload = buildCheckoutEmailPayload({
      orderId,
      buyerName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      notes,
      deliveryDate,
      cartSummary: resolvedCartSummary,
      totalAmount: resolvedTotal,
      itemCount: resolvedItemCount,
      itemName,
      quantity,
      sellerName: sellerName || 'Verified Seller',
      sellerEmail: resolvedSellerEmail,
      adminEmail: resolvedAdminEmail,
    });

    const extraSellers = Array.isArray(sellerEmails)
      ? sellerEmails.filter((e) => e && e !== resolvedSellerEmail && e !== resolvedAdminEmail)
      : [];

    const smtpConfig = getSmtpConfig();
    const mailResult = await sendCheckoutEmails({ payload, smtpConfig, extraSellerEmails: extraSellers });

    res.status(200).json({
      success: true,
      emailSent: mailResult.sent,
      message: mailResult.sent
        ? 'Order placed! Confirmation emails sent to seller and admin.'
        : 'Order submitted. Email notifications pending SMTP configuration.',
      mailResult,
    });
  } catch (error) {
    console.error('Checkout submission failed:', error);
    res.status(500).json({ success: false, message: 'Checkout submission failed.', error: error.message });
  }
});

// Seller Approval Email Notification
app.post('/api/notify/seller-approved', async (req, res) => {
  try {
    const { sellerEmail, sellerName } = req.body;
    if (!sellerEmail) {
      return res.status(400).json({ success: false, message: 'Seller email is required.' });
    }

    const smtpConfig = getSmtpConfig();
    const result = await sendSellerApprovalEmail({
      sellerEmail,
      sellerName: sellerName || 'Vendor',
      smtpConfig
    });

    res.status(200).json({
      success: true,
      emailSent: result.sent,
      message: result.sent ? 'Seller approval email sent.' : 'Approval email queued (pending SMTP config).'
    });
  } catch (error) {
    console.warn('Seller approval email error:', error.message);
    res.status(200).json({ success: true, emailSent: false, message: 'Seller approved in Firestore.' });
  }
});

// Product Approval Email Notification
app.post('/api/notify/product-approved', async (req, res) => {
  try {
    const { sellerEmail, sellerName, productName, price, category } = req.body;
    if (!sellerEmail || !productName) {
      return res.status(400).json({ success: false, message: 'Seller email and product name are required.' });
    }

    const smtpConfig = getSmtpConfig();
    const result = await sendProductApprovalEmail({
      sellerEmail,
      sellerName: sellerName || 'Vendor',
      productName,
      price: price || '0.00',
      category: category || 'General',
      smtpConfig
    });

    res.status(200).json({
      success: true,
      emailSent: result.sent,
      message: result.sent ? 'Product approval email sent.' : 'Product approval email queued (pending SMTP config).'
    });
  } catch (error) {
    console.warn('Product approval email error:', error.message);
    res.status(200).json({ success: true, emailSent: false, message: 'Product approved in Firestore.' });
  }
});

const translateCache = new Map();

async function translateSingleText(text, targetLang) {
  const key = `${targetLang}::${text}`;
  if (translateCache.has(key)) return translateCache.get(key);
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) return text;
    const data = await response.json();
    const translated = Array.isArray(data?.[0])
      ? data[0].map((part) => part?.[0] || '').join('')
      : text;
    const finalStr = translated || text;
    translateCache.set(key, finalStr);
    return finalStr;
  } catch {
    return text;
  }
}

app.post('/api/translate', async (req, res) => {
  try {
    const { texts, targetLang } = req.body || {};
    if (!targetLang || targetLang === 'en' || !Array.isArray(texts) || texts.length === 0) {
      return res.status(200).json({ translations: {} });
    }

    const uniqueTexts = [...new Set(
      texts.filter((t) => typeof t === 'string' && t.trim().length > 0).slice(0, 100)
    )];

    const translations = {};
    const uncached = [];

    for (const t of uniqueTexts) {
      const key = `${targetLang}::${t}`;
      if (translateCache.has(key)) {
        translations[t] = translateCache.get(key);
      } else {
        uncached.push(t);
      }
    }

    if (uncached.length > 0) {
      // Translate in small chunks using a delimiter for speed; fall back per-item if needed
      const SEP = '\n[[[EXVEG_SEP]]]\n';
      const chunks = [];
      let current = [];
      let currentLen = 0;

      for (const item of uncached) {
        if (currentLen + item.length > 1400 && current.length > 0) {
          chunks.push(current);
          current = [item];
          currentLen = item.length;
        } else {
          current.push(item);
          currentLen += item.length + SEP.length;
        }
      }
      if (current.length > 0) chunks.push(current);

      for (const chunk of chunks) {
        if (chunk.length === 1) {
          translations[chunk[0]] = await translateSingleText(chunk[0], targetLang);
          continue;
        }
        try {
          const joined = chunk.join(SEP);
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(joined)}`;
          const response = await fetch(url);
          if (!response.ok) throw new Error('Translate HTTP error');
          const data = await response.json();
          const fullTranslated = Array.isArray(data?.[0])
            ? data[0].map((part) => part?.[0] || '').join('')
            : '';
          const parts = fullTranslated.split(/\s*\[\[\[EXVEG_SEP\]\]\]\s*/);

          if (parts.length === chunk.length) {
            chunk.forEach((orig, idx) => {
              const val = (parts[idx] || orig).trim() || orig;
              translateCache.set(`${targetLang}::${orig}`, val);
              translations[orig] = val;
            });
          } else {
            const results = await Promise.all(chunk.map((orig) => translateSingleText(orig, targetLang)));
            chunk.forEach((orig, idx) => {
              translations[orig] = results[idx];
            });
          }
        } catch {
          const results = await Promise.all(chunk.map((orig) => translateSingleText(orig, targetLang)));
          chunk.forEach((orig, idx) => {
            translations[orig] = results[idx];
          });
        }
      }
    }

    res.status(200).json({ translations });
  } catch (error) {
    console.warn('Translation endpoint note:', error.message);
    res.status(200).json({ translations: {} });
  }
});

// ─── Helper: extract & verify Bearer token ──────────────────────────────────
async function authenticate(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw Object.assign(new Error('Missing or invalid Authorization header.'), { status: 401 });
  }
  const token = authHeader.slice(7);
  const decoded = await verifyIdToken(token);
  return decoded; // { uid, email, ... }
}

// ─── POST /api/uploads/signature ────────────────────────────────────────────
// Returns signed Cloudinary upload params. Never returns API secret.
app.post('/api/uploads/signature', async (req, res) => {
  try {
    const decoded = await authenticate(req);
    const uid = decoded.uid;

    // Fetch user role from Firestore (never trust frontend)
    const adminDb = getAdminDb();
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(403).json({ success: false, message: 'User not found in Firestore.' });
    }
    const role = userDoc.data().role || '';
    if (!['Seller', 'Admin'].includes(role)) {
      return res.status(403).json({ success: false, message: 'Only Sellers and Admins can upload images.' });
    }

    const { resourceType = 'product', productId = '' } = req.body || {};
    const allowedTypes = ['product', 'profile', 'review'];
    if (!allowedTypes.includes(resourceType)) {
      return res.status(400).json({ success: false, message: `Invalid resourceType. Allowed: ${allowedTypes.join(', ')}` });
    }

    const signatureParams = generateUploadSignature({ resourceType, uid, subId: productId });

    res.status(200).json({
      success: true,
      ...signatureParams,
    });
  } catch (err) {
    const status = err.status || (err.code === 'auth/id-token-expired' ? 401 : 500);
    console.error('Upload signature error:', err.message);
    res.status(status).json({ success: false, message: err.message || 'Failed to generate upload signature.' });
  }
});

// ─── DELETE /api/uploads/image ──────────────────────────────────────────────
// Deletes a Cloudinary image. Pass publicId as ?id=... query param to avoid slash issues.
app.delete('/api/uploads/image', async (req, res) => {
  try {
    const decoded = await authenticate(req);
    const uid = decoded.uid;

    const publicId = req.query.id ? decodeURIComponent(req.query.id) : (req.body?.publicId || '');
    if (!publicId) {
      return res.status(400).json({ success: false, message: 'publicId is required.' });
    }

    // Get user role from Firestore
    const adminDb = getAdminDb();
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const role = userDoc.exists ? (userDoc.data().role || '') : '';

    if (!validateOwnership(publicId, uid, role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this image.' });
    }

    const result = await deleteCloudinaryImage(publicId);
    res.status(200).json({ success: true, result });
  } catch (err) {
    const status = err.status || 500;
    console.error('Image delete error:', err.message);
    res.status(status).json({ success: false, message: err.message || 'Failed to delete image.' });
  }
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
