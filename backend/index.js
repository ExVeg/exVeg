const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const {
  buildCheckoutEmailPayload,
  sendCheckoutEmails,
  sendSellerApprovalEmail,
  sendProductApprovalEmail
} = require('./src/checkoutMail');

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

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
