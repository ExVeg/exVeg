import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const app = initializeApp({
  apiKey: 'AIzaSyDffh5ZeXxA9oZz9o_oQKMFnYCy0wvujTo',
  projectId: 'exveg-commercial'
});
const auth = getAuth(app);

async function run() {
  const cred = await signInWithEmailAndPassword(auth, 'testadmin@exveg.com', 'AdminPass123!');
  const token = await cred.user.getIdToken();
  const uid = cred.user.uid;

  const collections = ['users', 'products', 'orders', 'cart', 'nursery', 'tools', 'sellers', 'notifications'];
  for (const c of collections) {
    // try GET
    const rGet = await fetch(`https://firestore.googleapis.com/v1/projects/exveg-commercial/databases/(default)/documents/${c}?key=AIzaSyDffh5ZeXxA9oZz9o_oQKMFnYCy0wvujTo`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // try POST
    const rPost = await fetch(`https://firestore.googleapis.com/v1/projects/exveg-commercial/databases/(default)/documents/${c}?key=AIzaSyDffh5ZeXxA9oZz9o_oQKMFnYCy0wvujTo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { test: { stringValue: '123' }, uid: { stringValue: uid }, userId: { stringValue: uid } } })
    });
    console.log(`${c}: GET ${rGet.status}, POST ${rPost.status}`);
  }
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
