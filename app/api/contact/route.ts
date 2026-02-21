import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/utils/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // TODO: Verify Turnstile token here
    // const turnstileToken = request.headers.get('cf-turnstile-response')
    // if (!turnstileToken) {
    //   return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    // }

    // Send email
    const emailContent = `
New contact form submission from AveronSoft

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from AveronSoft Contact Form
    `.trim()

    const result = await sendEmail({
      to: process.env.CONTACT_EMAIL || 'slimaye2026@gmail.com',
      subject: `[AveronSoft] ${subject}`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>'),
    })

    if (!result.success) {
      throw new Error('Failed to send email')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
