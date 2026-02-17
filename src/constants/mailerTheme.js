const LeaveRequestStatus = require('../enums/leaveRequestStatus');

const verificationData = (verificationCode, email) => {
  const data = {
    from: `Goshu HR (No-reply) <no-reply@goshu.vn>`,
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
    from: `Goshu HR (No-reply) <no-reply@goshu.vn>`,
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

const ratingKpiPerformanceData = (email, fullname, rank, totalScore) => {
  const data = {
    from: `Goshu HR (No-reply) <no-reply@goshu.vn>`,
    to: email,
    subject: 'Kết quả đánh giá hiệu suất làm việc - CÔNG TY TNHH GOSHU',
    text: '',
    html: `
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Kết quả đánh giá hiệu suất</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e0e4e8;">
                <!-- Header -->
                <tr>
                  <td style="background:#003366;color:#ffffff;padding:16px 24px;text-align:left;">
                    <h1 style="margin:0;font-size:20px;font-weight:bold;">CÔNG TY TNHH GOSHU</h1>
                    <p style="margin:4px 0 0;font-size:13px;opacity:0.9;">Thông báo kết quả đánh giá hiệu suất làm việc</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:24px 24px 8px;color:#222222;font-size:14px;line-height:1.6;">
                    <p style="margin:0 0 12px;">Kính gửi anh/chị <strong>${fullname}</strong>,</p>
                    <p style="margin:0 0 12px;">
                      Bộ phận nhân sự xin thông báo kết quả đánh giá hiệu suất làm việc của anh/chị trong kỳ vừa qua.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-collapse:collapse;">
                      <tr>
                        <td style="padding:8px 12px;border:1px solid #e0e4e8;background:#f8fafc;font-size:13px;width:40%;"><strong>Họ và tên</strong></td>
                        <td style="padding:8px 12px;border:1px solid #e0e4e8;font-size:13px;">${fullname}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 12px;border:1px solid #e0e4e8;background:#f8fafc;font-size:13px;"><strong>Xếp loại</strong></td>
                        <td style="padding:8px 12px;border:1px solid #e0e4e8;font-size:13px;">${rank}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 12px;border:1px solid #e0e4e8;background:#f8fafc;font-size:13px;"><strong>Điểm đánh giá</strong></td>
                        <td style="padding:8px 12px;border:1px solid #e0e4e8;font-size:13px;">${totalScore}</td>
                      </tr>
                    </table>
                    <p style="margin:0 0 12px;">
                      Kết quả trên được tổng hợp dựa trên các tiêu chí đánh giá KPI nội bộ của công ty.
                    </p>
                    <p style="margin:0 0 12px;">
                      Nếu anh/chị có bất kỳ thắc mắc nào liên quan đến kết quả đánh giá, vui lòng liên hệ bộ phận nhân sự để được hỗ trợ.
                    </p>
                  </td>
                </tr>
                <!-- Call to action -->
                <tr>
                  <td style="padding:0 24px 24px;color:#222222;font-size:14px;line-height:1.6;">
                    <p style="margin:0 0 16px;">
                      Trân trọng cảm ơn sự đóng góp của anh/chị cho CÔNG TY TNHH GOSHU.
                    </p>
                    <p style="margin:0 0 4px;">Trân trọng,</p>
                    <p style="margin:0;font-weight:bold;">Phòng Nhân sự - CÔNG TY TNHH GOSHU</p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f4f6f8;color:#777777;font-size:11px;padding:12px 24px;text-align:center;">
                    <p style="margin:4px 0;">
                      Email này được gửi tự động từ hệ thống Goshu HR. Vui lòng không trả lời trực tiếp email này.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `,
  };
  return data;
};

const leaveApprovalEmailData = (email, fullname, startDate, endDate, reason, status) => {
  let textColor = '#6b7280'; // mặc định xám
  switch (status) {
    case LeaveRequestStatus.APPROVED:
      textColor = '#16a34a';
      break;

    case LeaveRequestStatus.PENDING:
      textColor = '#f59e0b';
      break;

    case LeaveRequestStatus.REJECTED:
      textColor = '#dc2626';
      break;

    default:
      textColor = '#6b7280';
      break;
  }

  const data = {
    from: `Goshu HR (No-reply) <no-reply@goshu.vn>`,
    to: email,
    subject: 'Đơn xin nghỉ phép của bạn - CÔNG TY TNHH GOSHU',
    text: '',
    html: `
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Thông báo đơn nghỉ phép</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e0e4e8;">
                <!-- Header -->
                <tr>
                  <td style="background:#005c99;color:#ffffff;padding:16px 24px;text-align:left;">
                    <h1 style="margin:0;font-size:20px;font-weight:bold;">CÔNG TY TNHH GOSHU</h1>
                    <p style="margin:4px 0 0;font-size:13px;opacity:0.9;">Thông báo về đơn xin nghỉ phép</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:24px 24px 8px;color:#222222;font-size:14px;line-height:1.6;">
                    <p style="margin:0 0 12px;">Kính gửi anh/chị <strong>${fullname}</strong>,</p>
                    <p style="margin:0 0 12px;">
                      CÔNG TY TNHH GOSHU xin thông báo thông tin đơn xin nghỉ phép của anh/chị như sau:
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-collapse:collapse;">
                      <tr>
                        <td style="padding:8px 12px;border:1px solid #e0e4e8;background:#f8fafc;font-size:13px;width:40%;"><strong>Họ và tên</strong></td>
                        <td style="padding:8px 12px;border:1px solid #e0e4e8;font-size:13px;">${fullname}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 12px;border:1px solid #e0e4e8;background:#f8fafc;font-size:13px;"><strong>Thời gian nghỉ</strong></td>
                        <td style="padding:8px 12px;border:1px solid #e0e4e8;font-size:13px;">
                          Từ ngày <strong>${startDate}</strong> đến hết ngày <strong>${endDate}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 12px;border:1px solid #e0e4e8;background:#f8fafc;font-size:13px;"><strong>Lý do nghỉ</strong></td>
                        <td style="padding:8px 12px;border:1px solid #e0e4e8;font-size:13px;">${reason}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 12px;border:1px solid #e0e4e8;background:#f8fafc;font-size:13px;"><strong>Trạng thái đơn</strong></td>
                        <td style="padding:8px 12px;border:1px solid #e0e4e8;font-size:13px;">
                          <strong>${status}</strong>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 12px;color:${textColor}">
                      Trạng thái đơn nghỉ phép hiện tại của anh/chị là: <strong>${status}</strong>.
                    </p>
                    <p style="margin:0 0 12px;">
                      Nếu có thay đổi về kế hoạch nghỉ hoặc cần điều chỉnh thông tin, vui lòng liên hệ trực tiếp với quản lý hoặc bộ phận nhân sự để được hỗ trợ.
                    </p>
                  </td>
                </tr>
                <!-- Closing -->
                <tr>
                  <td style="padding:0 24px 24px;color:#222222;font-size:14px;line-height:1.6;">
                    <p style="margin:0 0 16px;">
                      Trân trọng cảm ơn anh/chị đã tuân thủ quy trình và phối hợp cùng công ty.
                    </p>
                    <p style="margin:0 0 4px;">Trân trọng,</p>
                    <p style="margin:0;font-weight:bold;">Phòng Nhân sự - CÔNG TY TNHH GOSHU</p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f4f6f8;color:#777777;font-size:11px;padding:12px 24px;text-align:center;">
                    <p style="margin:4px 0;">
                      Email này được gửi tự động từ hệ thống Goshu HR. Vui lòng không trả lời trực tiếp email này.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `,
  };
  return data;
};

module.exports = { verificationData, forgotPasswordData, ratingKpiPerformanceData, leaveApprovalEmailData };
