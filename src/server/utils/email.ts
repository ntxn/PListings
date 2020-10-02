import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY)
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const templates = {
  welcome: 'd-7b877315ec5047e194466653fb16174f',
};

const send = async (
  email: string,
  subject: string,
  text: string,
  html: string
): Promise<void> => {
  const mailOptions = {
    from: `plistings <${process.env.EMAIL_FROM}>`,
    to: email,
    subject,
    text,
    html,
  };

  const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

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
  if (process.env.NODE_ENV === 'production') {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM!,
      templateId: templates.welcome,
      dynamic_template_data: { name },
    };

    try {
      await sgMail.send(msg);
    } catch (err) {
      console.log(err);
      if (err.response) {
        console.error(err.response.body);
      }
    }
  } else {
    const text = `Hello ${name}, welcome to PListings! We're happy you're interested in PListings. Feel free to reach out to us at ${process.env.EMAIL_FROM} if you have any questions. In the mean time, post your items to sell and start earning some money.`;
    const html = `<div><h3>Hi ${name}, welcome to PListings!</h3><p>We're happy you're interested in PListings. Feel free to reach out to us at ${process.env.EMAIL_FROM} if you have any questions.</p><p>In the mean time, post your items to sell and start earning some money.</p></div>`;
    await send(email, 'Welcome to PListings!', text, html);
  }
};
