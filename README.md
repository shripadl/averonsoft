# AveronSoft - Complete SaaS Platform

A comprehensive SaaS platform with three integrated tools: URL Shortener, Bookmark Manager, and Digital Business Card creator.

## 🚀 Features

### URL Shortener
- Create short, trackable links
- Click analytics and tracking
- Custom short codes
- Link management dashboard

### Bookmark Manager
- Save and organize bookmarks
- Collections and tags
- Search and filter
- Public/private collections

### Digital Business Card
- Create professional digital cards
- QR code generation
- View analytics
- Shareable public pages

### Platform Features
- Google Sign-In authentication
- Paddle billing integration
- Admin console
- Dark/light mode
- Cookie consent banner
- Complete legal pages
- Contact form with email

## 📋 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google OAuth)
- **Payments:** Paddle
- **Email:** Nodemailer (Gmail SMTP)
- **Deployment:** Vercel (recommended)

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js 22+ installed
- Supabase account
- Google Cloud Console project (for OAuth)
- Paddle account
- Gmail account (for SMTP)
- Cloudflare account (for Turnstile - optional)

### 2. Database Setup

1. Go to [Supabase](https://supabase.com) and create a new project (or use existing: vtfgbabovryseydcwjza)
2. Copy the SQL from `supabase_schema.sql`
3. Go to SQL Editor in Supabase dashboard
4. Paste and execute the SQL to create all tables and policies

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
6. In Supabase Dashboard → Authentication → Providers:
   - Enable Google provider
   - Add your Google Client ID and Secret

### 4. Environment Variables

Update `.env.local` with your actual values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vtfgbabovryseydcwjza.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Contact & Email
CONTACT_EMAIL=stonehavenst@gmail.com
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password

# Cloudflare Turnstile (optional)
TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here

# Paddle
PADDLE_CLIENT_TOKEN=your_paddle_token_here
PADDLE_ENVIRONMENT=production

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Getting Gmail App Password:**
1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate new app password
4. Use this password in `SMTP_PASS`

### 5. Install Dependencies

```bash
pnpm install
```

### 6. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add all environment variables
5. Deploy!

**Important:** Set `NEXT_PUBLIC_APP_URL` to your production domain.

## 🔧 Configuration

### Admin Access

Admin email is currently: `stonehavenst@gmail.com`

To add more admins, update the `ADMIN_EMAILS` array in:
- `/app/admin/page.tsx`
- `/app/admin/users/page.tsx`
- `/app/admin/reports/page.tsx`
- `/app/admin/settings/page.tsx`

### Paddle Setup

1. Create products in Paddle dashboard
2. Set up webhook: `https://yourdomain.com/api/paddle/webhook`
3. Update pricing page with actual Paddle product IDs

## 📁 Project Structure

```
averonsoft/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── login/                    # Authentication
│   ├── dashboard/                # User dashboard
│   ├── tools/                    # Three main tools
│   ├── admin/                    # Admin console
│   ├── legal/                    # Legal pages
│   ├── api/                      # API routes
│   └── ...
├── components/                   # React components
├── lib/                          # Utilities and types
└── supabase_schema.sql           # Database schema
```

## 🧪 Testing Checklist

- [ ] Sign up with Google
- [ ] Create short URL
- [ ] Create bookmark
- [ ] Create business card
- [ ] Test contact form
- [ ] Access admin console
- [ ] Test dark/light mode
- [ ] Verify all legal pages

## 📝 Next Steps

1. **Set up Supabase:** Run the SQL schema
2. **Configure Google OAuth:** Set up credentials
3. **Add environment variables:** Fill in all keys
4. **Test locally:** Run `pnpm dev`
5. **Deploy:** Push to Vercel
6. **Configure Paddle:** Set up products and webhook

## 📞 Support

Email: stonehavenst@gmail.com

---

**Built with ❤️ for modern professionals**
