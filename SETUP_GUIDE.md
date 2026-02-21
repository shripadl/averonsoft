# AveronSoft - Complete Setup Guide

## Project Overview

**AveronSoft** is a complete SaaS platform with three integrated tools:
1. **URL Shortener** - Create short links with analytics
2. **Bookmark Manager** - Save and organize web resources
3. **Digital Business Card** - Create shareable digital cards

## Current Status

✅ **Completed:**
- Next.js 16 project initialized with TypeScript and Tailwind CSS
- Supabase client and server utilities configured
- Database schema created (`supabase_schema.sql`)
- Middleware for authentication routing
- UI components (Button, Card)
- Navigation (Header, Footer)
- Landing page with hero, tools overview, and pricing preview
- Theme provider for dark/light mode
- Utility functions (QR code, email, short code generation)
- TypeScript types for all database tables

📋 **Remaining Tasks:**

### 1. Database Setup
```bash
# Run this SQL in Supabase SQL Editor
cat supabase_schema.sql
```

### 2. Environment Variables
Update `.env.local` with your actual values:
- Get Supabase keys from: https://app.supabase.com/project/vtfgbabovryseydcwjza/settings/api
- Get Gmail App Password from: https://myaccount.google.com/apppasswords
- Get Turnstile keys from: https://dash.cloudflare.com/
- Get Paddle keys from: https://vendors.paddle.com/

### 3. Authentication Pages
Need to create:
- `/app/login/page.tsx` - Google Sign-In
- `/app/signup/page.tsx` - Sign up with ToS acceptance
- `/app/auth/callback/route.ts` - OAuth callback handler

### 4. Dashboard
- `/app/dashboard/page.tsx` - Main user dashboard
- Shows all three tools overview
- Quick stats and recent activity

### 5. URL Shortener Tool
Files needed:
- `/app/tools/shortener/page.tsx` - Main interface
- `/app/api/shorten/route.ts` - Create short URL
- `/app/s/[code]/route.ts` - Redirect handler (tracks clicks)
- `/components/tools/url-shortener-form.tsx` - Form component
- `/components/tools/url-stats.tsx` - Analytics display

### 6. Bookmark Manager Tool
Files needed:
- `/app/tools/bookmarks/page.tsx` - Main interface
- `/app/api/bookmarks/route.ts` - CRUD operations
- `/app/api/collections/route.ts` - Collection management
- `/components/tools/bookmark-form.tsx` - Add bookmark form
- `/components/tools/bookmark-list.tsx` - Display bookmarks
- `/components/tools/collection-manager.tsx` - Manage collections

### 7. Digital Business Card Tool
Files needed:
- `/app/tools/business-card/page.tsx` - Card editor
- `/app/card/[slug]/page.tsx` - Public card view
- `/app/api/business-card/route.ts` - CRUD operations
- `/components/tools/card-editor.tsx` - Card builder
- `/components/tools/card-preview.tsx` - Live preview

### 8. Paddle Billing Integration
Files needed:
- `/app/pricing/page.tsx` - Pricing page with Paddle checkout
- `/app/api/paddle/webhook/route.ts` - Handle subscription events
- `/lib/paddle/client.ts` - Paddle SDK wrapper
- `/components/pricing/paddle-checkout.tsx` - Checkout button

### 9. Admin Console
Files needed:
- `/app/admin/page.tsx` - Admin dashboard
- `/app/admin/users/page.tsx` - User management
- `/app/admin/reports/page.tsx` - Abuse reports
- `/app/admin/settings/page.tsx` - Platform settings
- `/lib/actions/admin.ts` - Admin server actions

### 10. Contact Form
Files needed:
- `/app/contact/page.tsx` - Contact form with Turnstile
- `/app/api/contact/route.ts` - Send email via nodemailer

### 11. Legal Pages
Create all legal pages in `/app/legal/`:
- `privacy/page.tsx` - Privacy Policy
- `terms/page.tsx` - Terms of Service
- `refunds/page.tsx` - Refund Policy
- `eula/page.tsx` - EULA
- `gdpr/page.tsx` - GDPR Notice
- `cookies/page.tsx` - Cookie Policy

Also create:
- `/app/about/page.tsx` - About page
- `/app/faq/page.tsx` - FAQ page

### 12. Additional Features
- Cookie consent banner component
- Dark/light mode toggle in header
- Loading states and error handling
- Form validation with Zod
- Toast notifications

## Quick Start

```bash
# Install dependencies (already done)
cd /home/ubuntu/averonsoft
pnpm install

# Set up environment variables
cp .env.local .env.local.example
# Edit .env.local with your actual keys

# Run Supabase schema
# Copy contents of supabase_schema.sql to Supabase SQL Editor and execute

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Environment Variables for Production
Make sure to set all variables in your hosting platform:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- CONTACT_EMAIL
- SMTP_USER
- SMTP_PASS
- TURNSTILE_SITE_KEY
- TURNSTILE_SECRET_KEY
- PADDLE_CLIENT_TOKEN
- PADDLE_ENVIRONMENT
- NEXT_PUBLIC_APP_URL

## Architecture

```
averonsoft/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/
│   ├── tools/
│   │   ├── shortener/
│   │   ├── bookmarks/
│   │   └── business-card/
│   ├── admin/
│   ├── legal/
│   ├── api/
│   └── contact/
├── components/
│   ├── ui/
│   ├── navigation/
│   ├── forms/
│   ├── tools/
│   └── providers/
├── lib/
│   ├── supabase/
│   ├── utils/
│   ├── actions/
│   ├── hooks/
│   └── types/
└── public/
```

## Database Schema Summary

**Tables:**
- `profiles` - User metadata
- `short_urls` - Shortened URLs
- `short_url_clicks` - Click tracking
- `bookmarks` - Saved bookmarks
- `bookmark_collections` - Bookmark collections
- `business_cards` - Digital business cards
- `business_card_views` - Card view tracking
- `abuse_reports` - User-reported abuse
- `admin_settings` - Platform configuration
- `subscription_status` - Paddle subscription data
- `logs` - Activity logs (optional)

**RLS (Row Level Security):**
- Enabled on all tables
- Users can only access their own data
- Public content (business cards, collections) has special policies

## Next Steps

1. **Complete Database Setup**: Run the SQL schema in Supabase
2. **Configure Environment Variables**: Add all required API keys
3. **Build Authentication**: Implement Google Sign-In with Supabase Auth
4. **Build Tools**: Create the three main tools (URL Shortener, Bookmarks, Business Card)
5. **Integrate Paddle**: Set up billing and subscription management
6. **Create Admin Console**: Build admin dashboard for platform management
7. **Add Legal Pages**: Generate all required legal documents
8. **Test Everything**: Comprehensive testing of all features
9. **Deploy**: Deploy to Vercel or your preferred hosting platform

## Support

For issues or questions:
- Email: slimaye2026@gmail.com
- Check Supabase docs: https://supabase.com/docs
- Check Next.js docs: https://nextjs.org/docs
- Check Paddle docs: https://developer.paddle.com/

---

**Note**: This is a comprehensive SaaS platform. Take time to understand each component before deployment. Test thoroughly in development before going to production.
