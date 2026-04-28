import nodemailer from 'nodemailer'

let transporter = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return transporter
}

export async function sendPasswordResetEmail(to, resetUrl) {
  const transport = getTransporter()

  await transport.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: '佑民集团后台 - 密码重置',
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:sans-serif">
        <h2 style="color:#166534">佑民集团后台管理系统</h2>
        <p>您正在申请重置管理员密码。</p>
        <p>请点击下方按钮重置密码（链接有效期 30 分钟）：</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
          重置密码
        </a>
        <p style="color:#888;font-size:12px">如果未申请此操作，请忽略本邮件。</p>
      </div>
    `,
  })
}
