import nodemailer from 'nodemailer';

const transporter =
  process.env.NODE_ENV === 'production'
    ? nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      })
    : nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
          user: process.env.MAILTRAP_USERNAME,
          pass: process.env.MAILTRAP_PASSWORD,
        },
      });

const send = async (
  email: string,
  subject: string,
  text: string,
  html: string
): Promise<void> => {
  const mailOptions = {
    from: `Ngan Nguyen <${process.env.EMAIL_FROM}>`,
    to: email,
    subject,
    text,
    html,
  };
  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (
  name: string,
  email: string,
  resetUrl: string
): Promise<void> => {
  const text = `Hi ${name}, here's your password reset link ${resetUrl}`;
  const html = `<div><h3>Hi ${name}</h3><p>Click on the link below to reset your password. The link is valid for 10 minutes.</p><a href="${resetUrl}" target="_blank">Reset Password</a></div>`;
  await send(
    email,
    'Your password reset token (Valid for only 10 minutes)',
    text,
    html
  );
};

export const sendWelcomeEmail = async (
  name: string,
  email: string
): Promise<void> => {
  const text = `Hello ${name}, welcome to PListings! We're happy you're interested in PListings. Feel free to reach out to us at ${process.env.EMAIL_FROM} if you have any questions. In the mean time, post your items to sell and start earning some money.`;
  const html = `<div><h3>Hi ${name}, welcome to PListings!</h3><p>We're happy you're interested in PListings. Feel free to reach out to us at ${process.env.EMAIL_FROM} if you have any questions.</p><p>In the mean time, post your items to sell and start earning some money.</p></div>`;
  await send(email, 'Welcome to PListings!', text, html);
};
