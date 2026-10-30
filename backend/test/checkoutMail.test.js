const test = require('node:test');
const assert = require('node:assert/strict');
const { buildCheckoutEmailPayload } = require('../src/checkoutMail');

test('buildCheckoutEmailPayload includes buyer and delivery details for seller and admin', () => {
  const payload = buildCheckoutEmailPayload({
    buyerName: 'Asha Rao',
    phone: '9876543210',
    address: '12, Green Lane',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    notes: 'Leave at the gate',
    deliveryDate: '2026-08-05',
    itemName: 'Fresh Tomatoes',
    quantity: 3,
    sellerEmail: 'seller@exveg.com',
    adminEmail: 'admin@exveg.com'
  });

  assert.equal(payload.seller.to, 'seller@exveg.com');
  assert.equal(payload.admin.to, 'admin@exveg.com');
  assert.match(payload.seller.text, /Fresh Tomatoes/);
  assert.match(payload.admin.text, /Asha Rao/);
  assert.match(payload.admin.text, /560001/);
});
