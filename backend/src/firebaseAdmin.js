const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

let _auth = null;
let _db = null;

function initAdmin() {
  if (getApps().length > 0) {
    _auth = getAuth();
    _db = getFirestore();
    return;
  }

  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = rawKey
    ? rawKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n')
    : undefined;

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw new Error(
      'Missing Firebase Admin environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
    );
  }

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });

  _auth = getAuth();
  _db = getFirestore();
}

/**
 * Verifies a Firebase ID token and returns the decoded token.
 * @param {string} token - Bearer token from Authorization header
 */
async function verifyIdToken(token) {
  if (!_auth) initAdmin();
  return _auth.verifyIdToken(token);
}

/**
 * Returns the Firestore admin instance.
 */
function getAdminDb() {
  if (!_db) initAdmin();
  return _db;
}

module.exports = { verifyIdToken, getAdminDb, initAdmin };
