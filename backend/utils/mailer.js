const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test account automatically for ethereal
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  return transporter;
};

const sendMail = async (to, subject, html) => {
  try {
    const t = await getTransporter();
    const fromEmail = process.env.SMTP_USER || t.options.auth.user || 'no-reply@stayhub.com';
    const info = await t.sendMail({
      from: `"StayHub Team" <${fromEmail}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    // If using ethereal email for testing, log the preview URL
    if (info.messageId && (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.ethereal.email')) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// ================== TEMPLATES ==================

const sendWelcomeEmail = async (email, password) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #059669;">Welcome to StayHub!</h2>
      <p>Congratulations! Your property has been approved by our admin team.</p>
      <p>We've automatically created an Owner account for you. You can log in to your dashboard to manage your inventory and track your revenue.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Dashboard:</strong> <a href="http://localhost:5173/owner/login">Owner Portal</a></p>
        <p style="margin: 5px 0 0 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 5px 0 0 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${password}</span></p>
      </div>
      <p>We highly recommend changing your password after your first login.</p>
      <p>Best regards,<br/>The StayHub Team</p>
    </div>
  `;
  return sendMail(email, 'Welcome to StayHub! Your Property is Live 🎉', html);
};

const sendBookingConfirmation = async (email, booking) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #059669;">Booking Confirmed!</h2>
      <p>Hi there,</p>
      <p>Your booking at StayHub is confirmed. Here are the details:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Check-in:</strong> ${new Date(booking.checkInDate).toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Guests:</strong> ${booking.guests}</p>
        <p style="margin: 5px 0; font-weight: bold; font-size: 1.1em;">Total Amount: ₹${booking.totalAmount}</p>
      </div>
      <p>Thank you for choosing StayHub. We wish you a pleasant stay!</p>
    </div>
  `;
  return sendMail(email, 'Booking Confirmation - StayHub', html);
};

const sendOwnerNotification = async (email, booking) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #059669;">New Reservation Received!</h2>
      <p>Good news! A new booking has been made for your property.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Check-in:</strong> ${new Date(booking.checkInDate).toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Total Revenue:</strong> ₹${booking.totalAmount}</p>
      </div>
      <p>Log in to your Owner Portal for more details.</p>
    </div>
  `;
  return sendMail(email, 'New Reservation on StayHub!', html);
};

const sendPasswordReset = async (email, token) => {
  const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #059669;">Password Reset Request</h2>
      <p>We received a request to reset your StayHub password.</p>
      <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset My Password</a>
      </div>
      <p style="font-size: 12px; color: #6b7280;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
  return sendMail(email, 'StayHub Password Reset', html);
};

module.exports = {
  sendWelcomeEmail,
  sendBookingConfirmation,
  sendOwnerNotification,
  sendPasswordReset,
};
