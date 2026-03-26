const nodemailer = require('nodemailer');
const Order = require('../models/Order');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Debug log to check if environment variables are loaded
console.log('Email configuration check:');
console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Found' : 'MISSING');
console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'Found' : 'MISSING');
console.log('- ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? 'Found' : 'MISSING');
console.log('- RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Found' : 'MISSING');
console.log('- PREFER_GMAIL:', process.env.PREFER_GMAIL);

// Initialize Nodemailer transporter
let transporter;
try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false // Helps with some hosting environments
      }
    });
    console.log('Nodemailer transporter initialized');
  }
} catch (error) {
  console.error('Failed to initialize nodemailer transporter:', error.message);
}

// Logic to decide which service to use
const canUseResend = !!process.env.RESEND_API_KEY;
const canUseGmail = !!transporter;
const preferGmail = process.env.PREFER_GMAIL === 'true';

const sendViaResend = async ({ from, to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is missing');
  }

  const payload = {
    from: from || process.env.RESEND_FROM || 'onboarding@resend.dev',
    to,
    subject,
    html
  };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Resend API error: ${res.status} - ${JSON.stringify(data)}`);
  }
  return data;
};

// Main function to send emails that handles switching between Resend and Nodemailer
const sendEmail = async (mailOptions) => {
  const fromEmail = process.env.RESEND_FROM || process.env.EMAIL_USER || 'onboarding@resend.dev';
  const finalOptions = {
    ...mailOptions,
    from: mailOptions.from || `Siva Honey Form <${fromEmail}>`
  };

  // If PREFER_GMAIL is true and Gmail is configured, use it first
  if (preferGmail && canUseGmail) {
    console.log('Using Gmail as preferred provider...');
    try {
      return await transporter.sendMail(finalOptions);
    } catch (error) {
      console.warn('Gmail failed, falling back to Resend if available:', error.message);
      if (canUseResend) return await sendViaResend(finalOptions);
      throw error;
    }
  }

  // Otherwise, use Resend if available
  if (canUseResend) {
    console.log('Using Resend as primary provider...');
    return await sendViaResend(finalOptions);
  } else if (canUseGmail) {
    console.log('Using Gmail as fallback provider...');
    return await transporter.sendMail(finalOptions);
  } else {
    throw new Error('No email provider configured (missing RESEND_API_KEY or EMAIL_USER/PASS)');
  }
};

// Send order notification email to admin
const sendOrderEmail = async (order) => {
  try {
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name price');

    const adminEmail = process.env.ADMIN_EMAIL || 'dharshiniakb@gmail.com';
    
    // Email to Admin
    await sendEmail({
      to: adminEmail,
      subject: `New Order Received - Order #${order._id.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #8B4513; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">New Order Notification</h1>
          </div>
          <div style="padding: 20px;">
            <p>You have received a new order from Siva Honey Form.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Order ID:</strong> #${order._id.toString().toUpperCase()}</p>
              <p><strong>Customer:</strong> ${populatedOrder.user.name} (${populatedOrder.user.email})</p>
              <p><strong>Total:</strong> Rs.${order.totalAmount.toFixed(2)}</p>
            </div>
            <p>Please log in to your admin dashboard to process this order.</p>
          </div>
        </div>
      `
    });
    console.log('Order notification sent to admin');

    // Send confirmation to user
    await sendUserOrderConfirmation(populatedOrder);
    
  } catch (error) {
    console.error('sendOrderEmail Error:', error.message);
  }
};

const sendUserOrderConfirmation = async (order) => {
  try {
    await sendEmail({
      to: order.user.email,
      subject: `Order Confirmation - Order #${order._id.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #8B4513; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Thank You for Your Order!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${order.user.name},</p>
            <p>Your order has been placed successfully. We are getting it ready for you!</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #8B4513; margin-top: 0;">Order Summary:</h3>
              <p><strong>Order ID:</strong> #${order._id.toString().toUpperCase()}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> Rs.${order.totalAmount.toFixed(2)}</p>
            </div>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #8B4513; margin-top: 0;">Items Ordered:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 1px solid #ddd;">
                    <th style="text-align: left; padding: 8px;">Product</th>
                    <th style="text-align: center; padding: 8px;">Qty</th>
                    <th style="text-align: right; padding: 8px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map(item => `
                    <tr style="border-bottom: 1px solid #eee;">
                      <td style="padding: 8px;">${item.product ? item.product.name : 'Product'}</td>
                      <td style="text-align: center; padding: 8px;">${item.quantity}</td>
                      <td style="text-align: right; padding: 8px;">Rs.${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <p>You can track your order status in your <a href="${process.env.FRONTEND_URL}/orders" style="color: #8B4513; text-decoration: underline;">Order History</a>.</p>
          </div>
          <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #999;">
            &copy; ${new Date().getFullYear()} Siva Honey Form. All rights reserved.
          </div>
        </div>
      `
    });
    console.log(`Confirmation sent to ${order.user.email}`);
  } catch (error) {
    console.error('sendUserOrderConfirmation Error:', error.message);
  }
};

// Send contact form message to admin
const sendContactEmail = async (contactData) => {
  try {
    const { name, email, message } = contactData;
    const adminEmail = process.env.ADMIN_EMAIL || 'dharshiniakb@gmail.com';
    
    await sendEmail({
      to: adminEmail,
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #8B4513; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">New Contact Message</h1>
          </div>
          <div style="padding: 20px;">
            <p>You have received a new message from your website contact form.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #8B4513; margin-top: 0;">Sender Details:</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
            </div>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #8B4513; margin-top: 0;">Message:</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
          </div>
        </div>
      `
    });
    console.log(`Contact message email sent to admin from: ${email}`);
    return true;
  } catch (error) {
    console.error('sendContactEmail Error:', error.message);
    return false;
  }
};

module.exports = { sendOrderEmail, sendUserOrderConfirmation, sendContactEmail };
