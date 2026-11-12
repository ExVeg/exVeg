const nodemailer = require('nodemailer');

const buildCheckoutEmailPayload = ({
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
  cartSummary,
  totalAmount,
  itemCount,
  itemName,
  quantity,
  sellerName,
  sellerEmail,
  adminEmail,
}) => {
  const fullAddress = [address, city, state, pincode].filter(Boolean).join(', ');
  const resolvedItemsSummary = cartSummary || (itemName ? `- ${itemName} x${quantity || 1}` : '');
  const resolvedSellerLabel = sellerName ? `${sellerName}${sellerEmail ? ` (${sellerEmail})` : ''}` : (sellerEmail || 'Verified Seller');

  const htmlTable = `
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
      ${orderId ? `
      <tr style="background:#ecfdf5;">
        <td style="padding:10px;border:1px solid #d1fae5;font-weight:bold;">Order ID</td>
        <td style="padding:10px;border:1px solid #d1fae5;font-family:monospace;">${orderId}</td>
      </tr>` : ''}
      <tr style="background:#f0fdf4;">
        <td style="padding:10px;border:1px solid #d1fae5;font-weight:bold;">Buyer Name</td>
        <td style="padding:10px;border:1px solid #d1fae5;">${buyerName || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #d1fae5;font-weight:bold;">Buyer Email</td>
        <td style="padding:10px;border:1px solid #d1fae5;">${email || 'N/A'}</td>
      </tr>
      <tr style="background:#f0fdf4;">
        <td style="padding:10px;border:1px solid #d1fae5;font-weight:bold;">Buyer Phone</td>
        <td style="padding:10px;border:1px solid #d1fae5;">${phone || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #d1fae5;font-weight:bold;">Delivery Address</td>
        <td style="padding:10px;border:1px solid #d1fae5;">${fullAddress || 'N/A'}</td>
      </tr>
      <tr style="background:#f0fdf4;">
        <td style="padding:10px;border:1px solid #d1fae5;font-weight:bold;">Preferred Delivery</td>
        <td style="padding:10px;border:1px solid #d1fae5;">${deliveryDate || 'Standard'}</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #d1fae5;font-weight:bold;">Seller</td>
        <td style="padding:10px;border:1px solid #d1fae5;">${resolvedSellerLabel}</td>
      </tr>
      <tr style="background:#f0fdf4;">
        <td style="padding:10px;border:1px solid #d1fae5;font-weight:bold;">Notes</td>
        <td style="padding:10px;border:1px solid #d1fae5;">${notes || 'No special instructions'}</td>
      </tr>
    </table>
  `;

  const itemsBlock = resolvedItemsSummary
    ? `<h3 style="color:#166534;margin-top:20px;">Order Items (${itemCount || quantity || 1}):</h3><pre style="background:#f0fdf4;padding:12px;border-radius:8px;border:1px solid #d1fae5;font-size:13px;white-space:pre-wrap;">${resolvedItemsSummary}</pre>${totalAmount ? `<p style="font-size:16px;font-weight:bold;color:#166534;">Total: ₹${totalAmount}</p>` : ''}`
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
    orderId ? `Order ID: ${orderId}` : '',
    `Buyer: ${buyerName || 'N/A'}`,
    email ? `Email: ${email}` : '',
    `Phone: ${phone || 'N/A'}`,
    `Address: ${fullAddress || 'N/A'}`,
    `Delivery Date: ${deliveryDate || 'Standard'}`,
    `Seller: ${resolvedSellerLabel}`,
    `Notes: ${notes || 'None'}`,
    resolvedItemsSummary ? `\nItems:\n${resolvedItemsSummary}${totalAmount ? `\n\nTotal: ₹${totalAmount}` : ''}` : '',
  ].filter(Boolean).join('\n');

  const resolvedItemCount = itemCount || quantity || 1;

  return {
    seller: {
      to: sellerEmail,
      subject: `New Order Received — ExVeg (${resolvedItemCount} item${resolvedItemCount > 1 ? 's' : ''})`,
      text: `A new buyer order has been placed.\n\n${textSummary}`,
      html: htmlBody('A new buyer order has been placed on ExVeg. Please prepare the items for delivery.'),
    },
    admin: {
      to: adminEmail,
      subject: `[ExVeg] New Order${totalAmount ? ` — ₹${totalAmount}` : ''}`,
      text: `A new checkout request was submitted.\n\n${textSummary}`,
      html: htmlBody('A new checkout request was submitted on ExVeg. This is your admin copy for tracking.'),
    },
  };
};

const sendCheckoutEmails = async ({ payload, smtpConfig, extraSellerEmails = [] }) => {
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
  const sends = [
    transporter.sendMail({ from: smtpConfig.from, ...payload.seller }),
    transporter.sendMail({ from: smtpConfig.from, ...payload.admin }),
  ];

  for (const extraEmail of extraSellerEmails) {
    sends.push(
      transporter.sendMail({
        from: smtpConfig.from,
        ...payload.seller,
        to: extraEmail,
      })
    );
  }

  await Promise.all(sends);

  return { sent: true };
};

const sendSellerApprovalEmail = async ({ sellerEmail, sellerName, smtpConfig }) => {
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

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:#166534;color:white;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="margin:0;font-size:24px;">🌿 ExVeg Vendor Approved</h1>
      </div>
      <div style="background:#ffffff;padding:24px;border:1px solid #d1fae5;border-top:none;border-radius:0 0 12px 12px;">
        <h2 style="color:#166534;margin-top:0;">Congratulations, ${sellerName || 'Vendor'}!</h2>
        <p style="font-size:15px;color:#374151;line-height:1.6;">
          Your merchant application on <strong>ExVeg</strong> has been reviewed and <strong>Approved</strong>.
        </p>
        <div style="background:#f0fdf4;border-left:4px solid #166534;padding:14px 16px;margin:20px 0;border-radius:0 8px 8px 0;">
          <p style="margin:0;font-weight:bold;color:#166534;">Your Vendor Privileges are Now Active:</p>
          <ul style="margin:8px 0 0 20px;color:#374151;font-size:14px;">
            <li>Publish fresh agricultural produce to the marketplace</li>
            <li>List nursery plants & saplings</li>
            <li>Manage farming tools & equipment listings</li>
            <li>Access real-time sales reports and order tracking</li>
          </ul>
        </div>
        <div style="text-align:center;margin:28px 0 16px;">
          <a href="http://localhost:5173/seller-dashboard" style="background:#166534;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;display:inline-block;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
            Go to Vendor Portal
          </a>
        </div>
        <hr style="border:1px solid #d1fae5;margin:24px 0;" />
        <p style="font-size:12px;color:#6b7280;margin:0;">This is an automated notification from ExVeg Agricultural Marketplace.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: smtpConfig.from,
    to: sellerEmail,
    subject: `Congratulations! Your ExVeg Seller Account has been Approved 🌿`,
    html,
    text: `Congratulations ${sellerName}!\n\nYour ExVeg vendor application has been approved. You can now access your Vendor Portal at http://localhost:5173/seller-dashboard to start listing products.`
  });

  return { sent: true };
};

const sendProductApprovalEmail = async ({ sellerEmail, sellerName, productName, price, category, smtpConfig }) => {
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

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:#166534;color:white;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="margin:0;font-size:24px;">🌿 ExVeg Listing Approved</h1>
      </div>
      <div style="background:#ffffff;padding:24px;border:1px solid #d1fae5;border-top:none;border-radius:0 0 12px 12px;">
        <h2 style="color:#166534;margin-top:0;">Your Product is Now Live!</h2>
        <p style="font-size:15px;color:#374151;line-height:1.6;">
          Hello ${sellerName || 'Vendor'}, your product submission has passed administrative verification and is now publicly visible to buyers.
        </p>
        <div style="background:#f0fdf4;border:1px solid #d1fae5;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0 0 6px 0;font-size:16px;font-weight:bold;color:#166534;">${productName}</p>
          <p style="margin:0;font-size:14px;color:#4b5563;">Category: <strong>${category || 'General'}</strong></p>
          <p style="margin:4px 0 0 0;font-size:16px;font-weight:bold;color:#166534;">Price: ₹${price}</p>
        </div>
        <div style="text-align:center;margin:28px 0 16px;">
          <a href="http://localhost:5173/products" style="background:#166534;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;display:inline-block;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
            View on Marketplace
          </a>
        </div>
        <hr style="border:1px solid #d1fae5;margin:24px 0;" />
        <p style="font-size:12px;color:#6b7280;margin:0;">This is an automated notification from ExVeg Agricultural Marketplace.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: smtpConfig.from,
    to: sellerEmail,
    subject: `Your Product "${productName}" is Live on ExVeg! 🌿`,
    html,
    text: `Hello ${sellerName}!\n\nYour product "${productName}" (Price: ₹${price}) has been approved and is now live on the ExVeg marketplace.`
  });

  return { sent: true };
};

module.exports = {
  buildCheckoutEmailPayload,
  sendCheckoutEmails,
  sendSellerApprovalEmail,
  sendProductApprovalEmail,
};
