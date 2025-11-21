# Stripe Integration Setup Guide

This guide explains how to set up Stripe integration for RegretWallet, including test mode keys and webhook configuration.

## Overview

RegretWallet uses Stripe for:
- **Checkout Sessions**: Collect bet payments from users
- **Escrow System**: Hold funds until bet resolution
- **Refunds**: Full refund on bet success
- **Platform Fees**: 20% platform fee on bet failure
- **Transfers**: Donate remaining amount to anti-charity on failure

## Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Keys (Test Mode)
# Replace these with your actual test keys from Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Test Mode Keys

### Getting Test Mode Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### Sample Test Card Numbers

For testing checkout sessions:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any ZIP code.

## Webhook Setup

### Local Development (using Stripe CLI)

1. **Install Stripe CLI**:
   ```bash
   brew install stripe/stripe-cli/stripe
   # or download from https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`) and add it to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Production Webhook Setup

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
   - `transfer.created`
   - `payment_intent.amount_capturable_updated`
5. Copy the **Signing secret** and add it to your environment variables

## API Routes

### 1. Create Checkout Session
**POST** `/api/stripe/checkout`

Creates a Stripe Checkout Session for bet payment.

**Request Body**:
```json
{
  "betId": "bet-uuid"
}
```

**Response**:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### 2. Resolve Bet Success
**POST** `/api/bets/[id]/success`

Processes a successful bet - refunds full amount to user.

**Response**:
```json
{
  "success": true,
  "betId": "bet-uuid",
  "refundId": "re_...",
  "refundAmount": 100.00
}
```

### 3. Resolve Bet Failure
**POST** `/api/bets/[id]/failure`

Processes a failed bet - deducts 20% platform fee and donates remaining to anti-charity.

**Response**:
```json
{
  "success": true,
  "betId": "bet-uuid",
  "platformFee": 20.00,
  "donationAmount": 80.00,
  "transferId": "tr_..."
}
```

### 4. Webhook Handler
**POST** `/api/stripe/webhook`

Handles all Stripe webhook events and updates bet status in Supabase.

## React Hooks

### useStripeCheckout

Hook for creating Stripe checkout sessions.

```tsx
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";

function MyComponent() {
  const { createCheckout, loading, error } = useStripeCheckout({
    onSuccess: (betId) => {
      console.log("Checkout initiated for bet:", betId);
    },
    onError: (error) => {
      console.error("Checkout error:", error);
    },
  });

  const handleCheckout = () => {
    createCheckout("bet-uuid");
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? "Loading..." : "Pay for Bet"}
    </button>
  );
}
```

### useBetResolution

Hook for resolving bets (success or failure).

```tsx
import { useBetResolution } from "@/hooks/use-bet-resolution";

function BetResolutionComponent({ betId }: { betId: string }) {
  const { resolveSuccess, resolveFailure, loading, error } = useBetResolution({
    onSuccess: (result) => {
      console.log("Bet resolved:", result);
    },
  });

  return (
    <div>
      <button onClick={() => resolveSuccess(betId)} disabled={loading}>
        Mark as Won
      </button>
      <button onClick={() => resolveFailure(betId)} disabled={loading}>
        Mark as Lost
      </button>
    </div>
  );
}
```

## Payment Flow

### 1. Bet Creation → Checkout
1. User creates a bet
2. System creates a bet record with `status: "pending"`
3. User clicks "Pay for Bet"
4. System creates Stripe Checkout Session
5. User completes payment on Stripe Checkout page

### 2. Payment Success → Escrow
1. Stripe sends `checkout.session.completed` webhook
2. System captures payment intent (held in escrow)
3. Bet status updated to `active`
4. Payment held in escrow until bet resolution

### 3. Bet Success → Full Refund
1. User/admin marks bet as successful
2. System calls `/api/bets/[id]/success`
3. Payment intent is canceled/refunded
4. Full amount refunded to user
5. Bet status updated to `won`

### 4. Bet Failure → Fee + Donation
1. User/admin marks bet as failed
2. System calls `/api/bets/[id]/failure`
3. Payment intent is captured
4. 20% platform fee retained by Stripe
5. Remaining 80% transferred to anti-charity
6. Bet status updated to `lost`

## Database Schema

The bets table includes these payment-related fields:

- `checkout_session_id` - Stripe Checkout Session ID
- `payment_intent_id` - Stripe Payment Intent ID
- `platform_fee` - Platform fee amount (20%)
- `refund_id` - Stripe Refund ID (on success)
- `refund_amount` - Refunded amount
- `transfer_id` - Stripe Transfer ID (on failure)
- `donation_amount` - Amount donated to anti-charity
- `escrow_captured_at` - When escrow was captured

Run the schema update:
```sql
-- Run supabase/stripe-schema-updates.sql
```

## Testing Checklist

- [ ] Test checkout session creation
- [ ] Test successful payment flow
- [ ] Test payment failure handling
- [ ] Test bet success (full refund)
- [ ] Test bet failure (fee + donation)
- [ ] Test webhook events
- [ ] Test error handling
- [ ] Verify Supabase updates

## Troubleshooting

### Webhook signature verification failed
- Ensure `STRIPE_WEBHOOK_SECRET` matches your webhook endpoint secret
- Verify webhook endpoint URL is correct

### Payment intent not found
- Check that `payment_intent_id` is set in bet record
- Verify payment was completed successfully

### Transfer failed
- Ensure anti-charity has valid `stripe_account_id`
- Verify Stripe Connect account is active

## Production Considerations

1. **Switch to Live Mode Keys**: Replace test keys with live keys
2. **Update Webhook Endpoint**: Point to production URL
3. **Enable Stripe Connect**: Set up for charity transfers
4. **Monitoring**: Set up error tracking for failed payments
5. **Compliance**: Ensure PCI compliance for card handling

