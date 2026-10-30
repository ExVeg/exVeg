/**
 * Seed Script — Run once to add dummy approved products to Firestore.
 * Usage: set FIREBASE_API_KEY before running: node seed-products.mjs
 * 
 * This uses the Firebase REST API to bypass Security Rules (uses apiKey).
 * Products are seeded with status: "Approved" so they show immediately.
 */

const PROJECT_ID = 'exveg-commercial';
const API_KEY = process.env.FIREBASE_API_KEY;
if (!API_KEY) {
  throw new Error('FIREBASE_API_KEY must be set before running this script.');
}
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products`;

const products = [
  {
    name: 'Heirloom Organic Tomato Seeds',
    description: 'Premium heirloom variety tomato seeds. High germination rate, excellent for home gardens and commercial farms.',
    price: 299,
    originalPrice: 399,
    category: 'Seeds & Bulbs',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80',
    status: 'Approved',
    stock: 150,
    rating: 4.8,
    reviewsCount: 42,
    sellerName: 'GreenLeaf Nurseries',
    sellerEmail: 'roushan211003@gmail.com',
  },
  {
    name: 'Organic Compost Fertilizer 5kg',
    description: 'Rich organic compost made from natural materials. Improves soil health and boosts plant growth naturally.',
    price: 499,
    originalPrice: 650,
    category: 'Organic Fertilizers',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
    status: 'Approved',
    stock: 80,
    rating: 4.6,
    reviewsCount: 28,
    sellerName: 'FarmFresh Organics',
    sellerEmail: 'roushan211003@gmail.com',
  },
  {
    name: 'Drip Irrigation Kit - 50 Plants',
    description: 'Complete drip irrigation system for up to 50 plants. Easy to install, water-efficient, and durable.',
    price: 1299,
    originalPrice: 1599,
    category: 'Irrigation Tools',
    imageUrl: 'https://images.unsplash.com/photo-1416864742-9fb2bdf9d9a2?w=600&q=80',
    status: 'Approved',
    stock: 35,
    rating: 4.5,
    reviewsCount: 17,
    sellerName: 'AgroTech Solutions',
    sellerEmail: 'roushan211003@gmail.com',
  },
  {
    name: 'Mixed Bell Pepper Seeds Pack',
    description: 'Assorted bell pepper varieties — red, yellow, green. Perfect for kitchen gardens.',
    price: 199,
    category: 'Seeds & Bulbs',
    imageUrl: 'https://images.unsplash.com/photo-1467019972079-a273e1bc9173?w=600&q=80',
    status: 'Approved',
    stock: 200,
    rating: 4.3,
    reviewsCount: 31,
    sellerName: 'GreenLeaf Nurseries',
    sellerEmail: 'roushan211003@gmail.com',
  },
  {
    name: 'Professional Garden Trowel Set',
    description: 'Stainless steel garden trowel set of 5 tools. Ergonomic handles, rust-resistant, lifetime warranty.',
    price: 849,
    originalPrice: 1099,
    category: 'Irrigation Tools',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
    status: 'Approved',
    stock: 60,
    rating: 4.7,
    reviewsCount: 52,
    sellerName: 'AgroTech Solutions',
    sellerEmail: 'roushan211003@gmail.com',
  },
  {
    name: 'Neem Oil Organic Pesticide 500ml',
    description: 'Cold-pressed neem oil for natural pest control. Safe for plants, humans, and beneficial insects.',
    price: 349,
    category: 'Organic Fertilizers',
    imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&q=80',
    status: 'Approved',
    stock: 120,
    rating: 4.9,
    reviewsCount: 76,
    sellerName: 'FarmFresh Organics',
    sellerEmail: 'roushan211003@gmail.com',
  },
  {
    name: 'Spinach & Leafy Greens Seed Kit',
    description: 'Bundle of spinach, amaranth, and fenugreek seeds. Grows fast — ready to harvest in 3-4 weeks.',
    price: 249,
    category: 'Seeds & Bulbs',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    status: 'Approved',
    stock: 175,
    rating: 4.4,
    reviewsCount: 19,
    sellerName: 'GreenLeaf Nurseries',
    sellerEmail: 'roushan211003@gmail.com',
  },
  {
    name: 'Terracotta Pot Set (6 pcs)',
    description: 'Handcrafted terracotta pots in 3 sizes. Ideal for herbs, succulents, and flowering plants.',
    price: 599,
    originalPrice: 799,
    category: 'Garden Decor',
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80',
    status: 'Approved',
    stock: 45,
    rating: 4.2,
    reviewsCount: 13,
    sellerName: 'FarmFresh Organics',
    sellerEmail: 'roushan211003@gmail.com',
  },
];

const toFirestoreValue = (value) => {
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') return { doubleValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (value === null) return { nullValue: null };
  return { stringValue: String(value) };
};

const toFirestoreDocument = (data) => {
  const fields = {};
  Object.entries(data).forEach(([key, value]) => {
    fields[key] = toFirestoreValue(value);
  });
  // Always add createdAt
  fields['createdAt'] = { stringValue: new Date().toISOString() };
  return { fields };
};

const seedProducts = async () => {
  console.log(`🌱 Seeding ${products.length} products to Firestore...\n`);
  let success = 0;
  let failed = 0;

  for (const product of products) {
    try {
      const res = await fetch(`${BASE_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFirestoreDocument(product)),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error(`❌ Failed to add "${product.name}":`, err.error?.message || 'Unknown error');
        failed++;
      } else {
        console.log(`✅ Added: ${product.name}`);
        success++;
      }
    } catch (e) {
      console.error(`❌ Network error for "${product.name}":`, e.message);
      failed++;
    }
  }

  console.log(`\n📊 Done! ${success} products seeded, ${failed} failed.`);
  if (failed > 0) {
    console.log('\n⚠️  If products failed with PERMISSION_DENIED, update your Firestore Security Rules:');
    console.log('   Go to Firebase Console → Firestore → Rules and allow writes temporarily:');
    console.log('   rules_version = "2";');
    console.log('   service cloud.firestore {');
    console.log('     match /databases/{database}/documents {');
    console.log('       match /products/{docId} { allow read, write: if true; }');
    console.log('       match /users/{docId} { allow read, write: if request.auth != null; }');
    console.log('     }');
    console.log('   }');
  }
};

seedProducts();
