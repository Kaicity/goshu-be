const verificationData = (verificationCode, email) => {
  const data = {
    from: `Support Goshu System <${process.env.USERNAME_EMAIL}>`,
    to: email,
    subject: 'Verification Email Code',
    text: 'Your verification code has been sent to your email.',
    html: `
      <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 30px;">
        <div style="max-width: 400px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 24px;">
        <h2 style="color: #2d7ff9; text-align: center; margin-bottom: 16px;">Goshu Verification</h2>
        <p style="font-size: 16px; color: #333; text-align: center;">
          Hello,<br>
          Please use the following verification code to complete your registration:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; background: #2d7ff9; color: #fff; font-size: 28px; letter-spacing: 4px; padding: 12px 32px; border-radius: 6px; font-weight: bold;">
          ${verificationCode}
          </span>
        </div>
        <p style="font-size: 14px; color: #888; text-align: center;">
          If you did not request this, please ignore this email.
        </p>
        <div style="text-align: center; margin-top: 24px;">
          <img src="https://img.icons8.com/color/48/000000/checked--v1.png" alt="Eventhub" style="width: 48px;"/>
        </div>
        </div>
      </div>
      `,
  };

  return data;
};

const forgotPasswordData = (resetCode, email) => {
  const data = {
    from: `Goshu Support <${process.env.USERNAME_EMAIL}>`,
    to: email,
    subject: 'Your Password Reset Code - Goshu System',
    text: `Your password reset code is: ${resetCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
        <div style="max-width: 500px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align: center; color: #2d7ff9;">Reset Your Password</h2>
          <p style="font-size: 16px; color: #333;">Hi there,</p>
          <p style="font-size: 16px; color: #333;">We received a request to reset the password associated with this email address. If you made this request, use the code below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-size: 32px; color: #fff; background-color: #2d7ff9; padding: 14px 30px; border-radius: 8px; letter-spacing: 4px; font-weight: bold;">
              ${resetCode}
            </span>
          </div>

          <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

          <p style="font-size: 12px; color: #999; text-align: center;">
            &copy; ${new Date().getFullYear()} EventHub. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  return data;
};

module.exports = { verificationData, forgotPasswordData };
