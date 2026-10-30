const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { buildCheckoutEmailPayload, sendCheckoutEmails } = require('./src/checkoutMail');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('ExVeg API is running');
});

app.post('/api/checkout', async (req, res) => {
  try {
    const {
      buyerName, email, phone, address, city, state, pincode, notes,
      deliveryDate, cartSummary, totalAmount, itemCount,
      // Legacy single-item fields (kept for backward compatibility)
      itemName, quantity,
      sellerEmail, adminEmail,
    } = req.body;

    // Build cart summary for legacy single-item requests
    const resolvedCartSummary = cartSummary || (itemName ? `- ${itemName} x${quantity || 1}` : 'N/A');
    const resolvedTotal = totalAmount || 'N/A';
    const resolvedItemCount = itemCount || quantity || 1;

    const payload = buildCheckoutEmailPayload({
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
      sellerEmail: sellerEmail || process.env.SELLER_EMAIL || 'seller@exveg.com',
      adminEmail: adminEmail || process.env.ADMIN_EMAIL || 'admin@exveg.com',
    });

    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@exveg.com',
    };

    const mailResult = await sendCheckoutEmails({ payload, smtpConfig });

    res.status(200).json({
      success: true,
      message: mailResult.sent
        ? 'Order placed! Confirmation emails sent to seller and admin.'
        : 'Order submitted. Email notifications pending SMTP configuration.',
      mailResult,
    });
  } catch (error) {
    console.error('Checkout submission failed:', error);
    res.status(500).json({ success: false, message: 'Checkout submission failed. Please try again.', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
