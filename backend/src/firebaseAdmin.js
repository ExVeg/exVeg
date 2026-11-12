const jwt = require('jsonwebtoken');

const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

let cachedCerts = null;
let certsExpiresAt = 0;

let cachedAccessToken = null;
let accessTokenExpiresAt = 0;

function getFirebaseConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'exveg-commercial';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = rawKey
    ? rawKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n')
    : undefined;

  return { projectId, clientEmail, privateKey };
}

async function getGooglePublicCerts() {
  if (cachedCerts && Date.now() < certsExpiresAt) {
    return cachedCerts;
  }
  const res = await fetch(GOOGLE_CERTS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch Google public certificates (${res.status})`);
  }
  const cacheControl = res.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSec = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;

  cachedCerts = await res.json();
  certsExpiresAt = Date.now() + maxAgeSec * 1000;
  return cachedCerts;
}

/**
 * Verifies a Firebase ID token using Google's public x509 certificates.
 * @param {string} token - Bearer token from Authorization header
 */
async function verifyIdToken(token) {
  const { projectId } = getFirebaseConfig();
  const decodedHeader = jwt.decode(token, { complete: true });
  if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid) {
    const err = new Error('Invalid Firebase ID token format.');
    err.status = 401;
    throw err;
  }

  const certs = await getGooglePublicCerts();
  const cert = certs[decodedHeader.header.kid];
  if (!cert) {
    const err = new Error('Unknown Firebase ID token key ID.');
    err.status = 401;
    throw err;
  }

  try {
    const payload = jwt.verify(token, cert, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
    });

    if (!payload.sub || typeof payload.sub !== 'string') {
      throw new Error('Firebase ID token missing subject.');
    }

    return {
      ...payload,
      uid: payload.sub,
    };
  } catch (verifyErr) {
    const err = new Error(verifyErr.message || 'Invalid or expired Firebase ID token.');
    err.status = 401;
    if (verifyErr.name === 'TokenExpiredError') {
      err.code = 'auth/id-token-expired';
    }
    throw err;
  }
}

async function getServiceAccountAccessToken() {
  if (cachedAccessToken && Date.now() < accessTokenExpiresAt) {
    return cachedAccessToken;
  }

  const { clientEmail, privateKey } = getFirebaseConfig();
  if (!clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin environment variables: FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/datastore',
      aud: GOOGLE_TOKEN_URL,
      iat: now,
      exp: now + 3600,
    },
    privateKey,
    { algorithm: 'RS256' }
  );

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Failed to authenticate Firebase service account.');
  }

  cachedAccessToken = data.access_token;
  accessTokenExpiresAt = Date.now() + ((data.expires_in || 3600) - 300) * 1000;
  return cachedAccessToken;
}

function decodeFirestoreFields(fields = {}) {
  const out = {};
  for (const [key, val] of Object.entries(fields)) {
    if ('stringValue' in val) out[key] = val.stringValue;
    else if ('booleanValue' in val) out[key] = val.booleanValue;
    else if ('integerValue' in val) out[key] = Number(val.integerValue);
    else if ('doubleValue' in val) out[key] = Number(val.doubleValue);
    else if ('nullValue' in val) out[key] = null;
  }
  return out;
}

/**
 * Lightweight Firestore REST wrapper compatible with adminDb.collection(...).doc(...).get().
 */
function getAdminDb() {
  const { projectId } = getFirebaseConfig();
  return {
    collection(collectionName) {
      return {
        doc(docId) {
          return {
            async get() {
              const accessToken = await getServiceAccountAccessToken();
              const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
                projectId
              )}/databases/(default)/documents/${encodeURIComponent(collectionName)}/${encodeURIComponent(docId)}`;

              const res = await fetch(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
              });

              if (res.status === 404) {
                return { exists: false, data: () => undefined };
              }

              if (!res.ok) {
                const errBody = await res.text();
                throw new Error(`Firestore read failed (${res.status}): ${errBody}`);
              }

              const docJson = await res.json();
              const parsed = decodeFirestoreFields(docJson.fields);
              return {
                exists: true,
                data: () => parsed,
              };
            },
          };
        },
      };
    },
  };
}

function initAdmin() {
  return getFirebaseConfig();
}

module.exports = { verifyIdToken, getAdminDb, initAdmin };
