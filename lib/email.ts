import * as nodemailer from 'nodemailer';

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@jelantahgo.com';

// Create transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

/**
 * Send email
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  try {
    // Skip sending email if credentials not configured
    if (!EMAIL_USER || !EMAIL_PASSWORD) {
      console.log('Email credentials not configured, skipping email send');
      console.log('Would send email to:', to);
      console.log('Subject:', subject);
      return { success: false, message: 'Email not configured' };
    }

    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text: text || subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

/**
 * Send payment received email to customer
 */
export async function sendPaymentReceivedEmail(
  to: string,
  userName: string,
  invoiceNumber: string,
  amount: number,
  type: 'BILL' | 'COMMISSION'
) {
  const subject = type === 'BILL'
    ? `Pembayaran Diterima - Invoice ${invoiceNumber}`
    : `Komisi Dibayarkan - ${invoiceNumber}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .amount { font-size: 32px; font-weight: bold; color: #22c55e; margin: 20px 0; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #22c55e; margin: 20px 0; }
        .button { display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Pembayaran Berhasil</h1>
        </div>
        <div class="content">
          <p>Halo <strong>${userName}</strong>,</p>

          <p>Kami informasikan bahwa pembayaran Anda telah berhasil diproses.</p>

          <div class="info-box">
            <p><strong>${type === 'BILL' ? 'Invoice Number' : 'Komisi ID'}:</strong> ${invoiceNumber}</p>
            <p><strong>Jumlah Dibayarkan:</strong></p>
            <div class="amount">Rp ${amount.toLocaleString('id-ID')}</div>
          </div>

          <p>${type === 'BILL'
            ? 'Terima kasih atas kontribusi Anda dalam program daur ulang minyak jelantah. Pembayaran akan segera diproses ke rekening Anda.'
            : 'Komisi Anda telah diproses. Silakan cek saldo Anda.'
          }</p>

          <p>Jika Anda memiliki pertanyaan, silakan hubungi customer service kami.</p>

          <p>Salam,<br><strong>Tim JelantahGO</strong></p>
        </div>
        <div class="footer">
          <p>&copy; 2024 JelantahGO. All rights reserved.</p>
          <p style="font-size: 12px; margin-top: 10px;">Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(to, subject, html);
}

/**
 * Send commission payment email to courier/affiliate
 */
export async function sendCommissionPaymentEmail(
  to: string,
  userName: string,
  type: 'COURIER' | 'AFFILIATE',
  amount: number,
  pickupCount?: number
) {
  const subject = `Komisi ${type === 'COURIER' ? 'Kurir' : 'Affiliate'} Dibayarkan`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .amount { font-size: 32px; font-weight: bold; color: #8b5cf6; margin: 20px 0; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #8b5cf6; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💵 Komisi Dibayarkan</h1>
        </div>
        <div class="content">
          <p>Halo <strong>${userName}</strong>,</p>

          <p>Selamat! Komisi ${type === 'COURIER' ? 'kurir' : 'affiliate'} Anda telah dibayarkan.</p>

          <div class="info-box">
            <p><strong>Tipe Komisi:</strong> ${type === 'COURIER' ? 'Kurir' : 'Affiliate Referral'}</p>
            ${pickupCount ? `<p><strong>Jumlah Pickup:</strong> ${pickupCount}</p>` : ''}
            <p><strong>Total Komisi:</strong></p>
            <div class="amount">Rp ${amount.toLocaleString('id-ID')}</div>
          </div>

          <p>${type === 'COURIER'
            ? 'Terima kasih atas dedikasi Anda dalam melayani pickup minyak jelantah. Pembayaran akan segera masuk ke rekening Anda.'
            : 'Terima kasih telah merekomendasikan JelantahGO kepada orang lain. Terus ajak teman dan dapatkan lebih banyak komisi!'
          }</p>

          <p>Salam,<br><strong>Tim JelantahGO</strong></p>
        </div>
        <div class="footer">
          <p>&copy; 2024 JelantahGO. All rights reserved.</p>
          <p style="font-size: 12px; margin-top: 10px;">Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(to, subject, html);
}
