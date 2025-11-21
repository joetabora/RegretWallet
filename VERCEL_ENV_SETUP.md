# Adding Environment Variables to Vercel

## Quick Steps:

1. Go to your Vercel project: https://vercel.com/your-project/settings/environment-variables

2. Click **"Add New"** for each variable below:

### Clerk Authentication (REQUIRED - Add these first)

**Variable 1:**
- Key: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Value: `pk_test_ZGlzdGluY3QtcG9zc3VtLTg1LmNsZXJrLmFjY291bnRzLmRldiQ`
- Environment: Production, Preview, Development (select all)

**Variable 2:**
- Key: `CLERK_SECRET_KEY`
- Value: `sk_test_QRYRzYircHSgeZ0d7pmeKUgqdgxwkxQoMhFIrR071c`
- Environment: Production, Preview, Development (select all)

### Still Need to Add:

- `NEXT_PUBLIC_SUPABASE_URL` - From Supabase Dashboard
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase Dashboard
- `STRIPE_SECRET_KEY` - From Stripe Dashboard
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard
- `STRIPE_WEBHOOK_SECRET` - From Stripe Webhooks (after creating webhook)
- `NEXT_PUBLIC_APP_URL` - Your Vercel URL (e.g., `https://regretwallet.vercel.app`)
- `ADMIN_EMAILS` - Comma-separated emails (e.g., `admin@example.com`)

## After Adding Variables:

1. **Redeploy** your application:
   - Go to Deployments tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"

2. The middleware error should be resolved once Clerk keys are added.

## Important Security Notes:

✅ **DO NOT** commit these keys to Git
✅ **DO NOT** share these keys publicly
✅ Use `.env.local` for local development (already in .gitignore)
✅ Vercel environment variables are encrypted and secure

