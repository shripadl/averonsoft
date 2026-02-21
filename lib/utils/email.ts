import nodemailer from 'nodemailer'

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string
  subject: string
  text: string
  html?: string
}) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const mailOptions = {
    from: `AveronSoft <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html: html || text,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}
