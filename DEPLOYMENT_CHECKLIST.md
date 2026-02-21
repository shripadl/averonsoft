# AveronSoft Deployment Checklist

## Pre-Deployment Setup

### 1. Supabase Configuration
- [ ] Create Supabase project (or use vtfgbabovryseydcwjza)
- [ ] Run `supabase_schema.sql` in SQL Editor
- [ ] Verify all tables created successfully
- [ ] Check RLS policies are enabled
- [ ] Copy Supabase URL and keys

### 2. Google OAuth Setup
- [ ] Create Google Cloud project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Add redirect URIs (localhost + production)
- [ ] Configure Supabase Auth with Google credentials
- [ ] Test Google Sign-In locally

### 3. Email Configuration
- [ ] Enable 2FA on Gmail account
- [ ] Generate Gmail App Password
- [ ] Test email sending locally
- [ ] Verify contact form works

### 4. Paddle Setup (Optional for MVP)
- [ ] Create Paddle account
- [ ] Set up products:
  - Shortener Pro (Monthly: $15, Annual: $150)
  - Bookmarks Pro (Monthly: $9, Annual: $90)
  - Business Card Pro (Monthly: $6, Annual: $60)
  - Suite Bundle (Monthly: $25, Annual: $250)
- [ ] Configure webhook endpoint
- [ ] Test checkout flow
- [ ] Update pricing page with product IDs

### 5. Environment Variables
- [ ] Copy `.env.local` template
- [ ] Fill in all Supabase credentials
- [ ] Add Gmail SMTP credentials
- [ ] Add Paddle credentials (if using)
- [ ] Add Turnstile keys (optional)
- [ ] Set NEXT_PUBLIC_APP_URL

## Local Testing

- [ ] Run `pnpm install`
- [ ] Run `pnpm dev`
- [ ] Test landing page loads
- [ ] Test Google Sign-In
- [ ] Create test short URL
- [ ] Create test bookmark
- [ ] Create test business card
- [ ] Test contact form
- [ ] Access admin console
- [ ] Test dark/light mode toggle
- [ ] Test cookie consent banner
- [ ] Verify all legal pages load
- [ ] Test mobile responsiveness

## Deployment to Vercel

### 1. Prepare Repository
- [ ] Initialize git: `git init`
- [ ] Create `.gitignore` (ensure `.env.local` is ignored)
- [ ] Commit all files
- [ ] Push to GitHub

### 2. Vercel Setup
- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Configure project settings
- [ ] Add all environment variables
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Deploy

### 3. Post-Deployment
- [ ] Verify deployment successful
- [ ] Test production URL
- [ ] Update Google OAuth redirect URIs with production URL
- [ ] Update Paddle webhook URL (if using)
- [ ] Test all features in production

## Production Verification

### Authentication
- [ ] Sign up with Google works
- [ ] Sign in with Google works
- [ ] Logout works
- [ ] Protected routes redirect correctly

### Tools
- [ ] URL Shortener creates links
- [ ] Short URLs redirect correctly
- [ ] Bookmark Manager saves bookmarks
- [ ] Business Card creator works
- [ ] Public business card pages load

### Admin
- [ ] Admin console accessible
- [ ] User list displays
- [ ] Reports page works
- [ ] Settings page loads

### Other
- [ ] Contact form sends emails
- [ ] All legal pages accessible
- [ ] Dark/light mode persists
- [ ] Cookie consent appears once
- [ ] Mobile version works

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Service role key only used server-side
- [ ] No sensitive data in client code
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Environment variables secured
- [ ] Admin access restricted

## Performance Optimization

- [ ] Enable Vercel Analytics
- [ ] Configure caching headers
- [ ] Optimize images
- [ ] Enable compression
- [ ] Test Lighthouse score

## Monitoring & Maintenance

- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up database backups
- [ ] Document admin procedures
- [ ] Create support email workflow

## Optional Enhancements

- [ ] Add Turnstile to contact form
- [ ] Implement rate limiting
- [ ] Add analytics (Plausible/GA)
- [ ] Set up CDN for assets
- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add data export feature
- [ ] Create API documentation

## Launch Checklist

- [ ] All tests passing
- [ ] Production deployment verified
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Monitoring enabled
- [ ] Support email configured
- [ ] Documentation complete

## Post-Launch

- [ ] Monitor error logs
- [ ] Track user signups
- [ ] Monitor performance
- [ ] Collect user feedback
- [ ] Plan feature updates

---

**Note:** This is a comprehensive checklist. For MVP launch, focus on Pre-Deployment Setup, Local Testing, and basic Deployment to Vercel sections.
