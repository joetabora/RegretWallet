# Deployment Guide for RegretWallet

## Prerequisites

1. **Vercel Account** - Deploy to Vercel
2. **Clerk Account** - For authentication
3. **Supabase Account** - For database
4. **Stripe Account** - For payments

## Step 1: Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add the following:

### Required Environment Variables:

```env
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Database (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# Stripe Payments (Required)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
ADMIN_EMAILS=admin@example.com,another@example.com
```

### Important Notes:

1. **All environment variables must be set** for the app to function properly
2. After adding environment variables, **redeploy** your application
3. Use **test mode keys** initially for testing
4. Switch to **production keys** when ready to launch

## Step 2: Database Setup

1. Run the SQL files in Supabase SQL Editor in order:
   - `supabase/schema.sql` - Base schema
   - `supabase/schema-updates.sql` - Onboarding wizard fields
   - `supabase/stripe-schema-updates.sql` - Stripe payment fields
   - `supabase/social-schema.sql` - Social features (referrals, challenges)

2. Enable Row Level Security (RLS) policies as defined in the schema files

## Step 3: Stripe Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
   - `transfer.created`
4. Copy the webhook signing secret and add to `STRIPE_WEBHOOK_SECRET`

## Step 4: Clerk Setup

1. Create a Clerk application
2. Configure authentication methods (Email, Social)
3. Add your Vercel URL to allowed origins
4. Copy publishable and secret keys to environment variables

## Step 5: Common Issues

### 500 Error: MIDDLEWARE_INVOCATION_FAILED

**Cause:** Clerk environment variables are missing or incorrect

**Solution:**
1. Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set in Vercel
2. Verify keys are correct (no extra spaces, full key copied)
3. Redeploy after adding variables

### Supabase Connection Errors

**Cause:** Supabase environment variables missing or incorrect

**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
2. Ensure database schema has been run
3. Check Supabase project is active

### Stripe Payment Errors

**Cause:** Stripe keys missing or webhook not configured

**Solution:**
1. Verify all Stripe environment variables are set
2. Ensure webhook endpoint is configured in Stripe Dashboard
3. Check webhook secret matches `STRIPE_WEBHOOK_SECRET`

## Post-Deployment Checklist

- [ ] All environment variables added to Vercel
- [ ] Database schema executed in Supabase
- [ ] RLS policies enabled
- [ ] Stripe webhook configured
- [ ] Clerk authentication working
- [ ] Test payment flow
- [ ] Test bet creation
- [ ] Verify admin panel access

## Support

For issues, check:
1. Vercel deployment logs
2. Supabase logs
3. Stripe webhook logs
4. Clerk dashboard

