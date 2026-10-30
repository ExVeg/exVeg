const nodemailer = require('nodemailer');

const buildCheckoutEmailPayload = ({
  buyerName,
  email,
  phone,
  address,
  city,
  state,
  pincode,
  notes,
  deliveryDate,
  cartSummary,
  totalAmount,
  itemCount,
  sellerEmail,
  adminEmail,
}) => {
  const fullAddress = [address, city, state, pincode].filter(Boolean).join(', ');

  const htmlTable = `
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
      <tr style="background:#f0fdf4;">
        <td style="padding:10px;border:1px solid #d1fae5;font-weight:bold;">Buyer Name</td>
        <td style="padding:10px;border:1px solid #d1fae5;">${buyerName}</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #d1fae5;font-weight:bold;">Email</td>
        <td style="padding:10px;border:1px solid #d1fae5;">${email}</td>
      </tr>
      <tr style="background:#f0fdf4;">
        <td style="padding:10px;border:1px solid #d1fae5;font-weight:bold;">Phone</td>
        <td style="padding:10px;border:1px solid #d1fae5;">${phone}</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #d1fae5;font-weight:bold;">Delivery Address</td>
        <td style="padding:10px;border:1px solid #d1fae5;">${fullAddress}</td>
      </tr>
      <tr style="background:#f0fdf4;">
        <td style="padding:10px;border:1px solid #d1fae5;font-weight:bold;">Preferred Delivery</td>
        <td style="padding:10px;border:1px solid #d1fae5;">${deliveryDate}</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #d1fae5;font-weight:bold;">Notes</td>
        <td style="padding:10px;border:1px solid #d1fae5;">${notes || 'No special instructions'}</td>
      </tr>
    </table>
  `;

  const itemsBlock = cartSummary
    ? `<h3 style="color:#166534;margin-top:20px;">Order Items (${itemCount || ''}):</h3><pre style="background:#f0fdf4;padding:12px;border-radius:8px;border:1px solid #d1fae5;font-size:13px;">${cartSummary}</pre><p style="font-size:16px;font-weight:bold;color:#166534;">Total: ₹${totalAmount}</p>`
    : '';

  const htmlBody = (intro) => `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:#166534;color:white;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="margin:0;font-size:24px;">🌿 ExVeg Order Notification</h1>
      </div>
      <div style="background:#ffffff;padding:20px;border:1px solid #d1fae5;border-top:none;border-radius:0 0 12px 12px;">
        <p>${intro}</p>
        ${htmlTable}
        ${itemsBlock}
        <hr style="border:1px solid #d1fae5;margin:20px 0;" />
        <p style="font-size:12px;color:#6b7280;">This is an automated message from ExVeg Agricultural Marketplace.</p>
      </div>
    </div>
  `;

  const textSummary = [
    `Buyer: ${buyerName}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Address: ${fullAddress}`,
    `Delivery Date: ${deliveryDate}`,
    `Notes: ${notes || 'None'}`,
    cartSummary ? `\nItems:\n${cartSummary}\n\nTotal: ₹${totalAmount}` : '',
  ].join('\n');

  return {
    seller: {
      to: sellerEmail,
      subject: `New Order Received — ExVeg (${itemCount} item${itemCount > 1 ? 's' : ''})`,
      text: `A new buyer order has been placed.\n\n${textSummary}`,
      html: htmlBody('A new buyer order has been placed on ExVeg. Please prepare the items for delivery.'),
    },
    admin: {
      to: adminEmail,
      subject: `[ExVeg] New Checkout Request — ₹${totalAmount}`,
      text: `A new checkout request was submitted.\n\n${textSummary}`,
      html: htmlBody('A new checkout request was submitted on ExVeg. This is your admin copy for tracking.'),
    },
  };
};

const sendCheckoutEmails = async ({ payload, smtpConfig }) => {
  if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
    return { sent: false, reason: 'SMTP credentials are not configured.' };
  }

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });

  await transporter.verify();
  await transporter.sendMail({ from: smtpConfig.from, ...payload.seller });
  await transporter.sendMail({ from: smtpConfig.from, ...payload.admin });

  return { sent: true };
};

module.exports = {
  buildCheckoutEmailPayload,
  sendCheckoutEmails,
};
