import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  typescript: true,
});

/**
 * Create a payment intent for escrow
 */
export async function createEscrowPaymentIntent(amount: number, betId: string) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: "usd",
    metadata: {
      betId,
      type: "escrow",
    },
    capture_method: "manual", // Hold funds without capturing immediately
  });
}

/**
 * Create a Stripe Checkout Session for bet payment
 */
export async function createCheckoutSession({
  betId,
  amount,
  title,
  description,
  userId,
  userEmail,
}: {
  betId: string;
  amount: number;
  title: string;
  description: string;
  userId: string;
  userEmail: string;
}) {
  // First create payment intent for escrow
  const paymentIntent = await createEscrowPaymentIntent(amount, betId);

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Bet: ${title}`,
            description: description,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      capture_method: "manual", // Hold in escrow
      metadata: {
        betId,
        userId,
        type: "bet_escrow",
      },
    },
    customer_email: userEmail,
    metadata: {
      betId,
      userId,
      type: "bet_checkout",
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/bets/${betId}?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/bets/${betId}?canceled=true`,
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
  });

  return session;
}

/**
 * Capture payment intent (when bet is lost)
 */
export async function capturePaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.capture(paymentIntentId);
}

/**
 * Cancel payment intent (when bet is won - refund full amount)
 */
export async function cancelPaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.cancel(paymentIntentId);
}

/**
 * Process bet success - refund full amount
 */
export async function processBetSuccess({
  paymentIntentId,
  betId,
  amount,
}: {
  paymentIntentId: string;
  betId: string;
  amount: number;
}) {
  // Get payment intent to check status
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  let refundId: string | null = null;

  // If payment was already captured, create explicit refund
  if (paymentIntent.status === "succeeded" || paymentIntent.status === "requires_capture") {
    // Find the charge and refund it
    const charges = await stripe.charges.list({
      payment_intent: paymentIntentId,
      limit: 1,
    });

    if (charges.data.length > 0 && charges.data[0].paid) {
      const refund = await stripe.refunds.create({
        charge: charges.data[0].id,
        amount: Math.round(amount * 100), // Full refund
        metadata: {
          betId,
          type: "bet_success_refund",
        },
      });
      refundId = refund.id;
    }
  } else {
    // If payment intent hasn't been captured yet, just cancel it
    // No refund needed as funds haven't been captured
    await cancelPaymentIntent(paymentIntentId);
    refundId = paymentIntentId; // Use payment intent ID as reference
  }

  return {
    refundId: refundId || paymentIntentId,
    amount,
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Process bet failure - capture payment, deduct platform fee, transfer to anti-charity
 */
export async function processBetFailure({
  paymentIntentId,
  betId,
  totalAmount,
  platformFeePercentage,
  antiCharityStripeAccountId,
  antiCharityName,
}: {
  paymentIntentId: string;
  betId: string;
  totalAmount: number;
  platformFeePercentage: number;
  antiCharityStripeAccountId: string;
  antiCharityName: string;
}) {
  // Capture the payment intent (holds funds in our account)
  const capturedIntent = await capturePaymentIntent(paymentIntentId);

  if (capturedIntent.status !== "succeeded") {
    throw new Error("Failed to capture payment intent");
  }

  // Calculate amounts (in cents)
  const totalAmountCents = Math.round(totalAmount * 100);
  const platformFeeCents = Math.round(totalAmount * platformFeePercentage * 100);
  const donationAmountCents = totalAmountCents - platformFeeCents;

  // Convert back to dollars for return values
  const platformFee = totalAmount * platformFeePercentage;
  const donationAmount = totalAmount - platformFee;

  // Find the charge to get the transfer source
  const charges = await stripe.charges.list({
    payment_intent: paymentIntentId,
    limit: 1,
  });

  if (charges.data.length === 0) {
    throw new Error("No charge found for payment intent");
  }

  const charge = charges.data[0];

  // Create transfer to anti-charity using Stripe Connect
  // The platform fee is automatically retained (difference between charge and transfer)
  const transfer = await stripe.transfers.create({
    amount: donationAmountCents,
    currency: "usd",
    destination: antiCharityStripeAccountId,
    source_transaction: charge.id, // Transfer from this charge
    metadata: {
      betId,
      antiCharityName,
      type: "bet_failure_donation",
      originalAmount: totalAmount.toString(),
      platformFee: platformFee.toString(),
      donationAmount: donationAmount.toString(),
    },
  });

  // Platform fee is automatically retained by Stripe
  // It's the difference: totalAmount - donationAmount = platformFee

  return {
    transferId: transfer.id,
    paymentIntentId: capturedIntent.id,
    chargeId: charge.id,
    platformFee,
    donationAmount,
    totalAmount,
  };
}

/**
 * Create a transfer to charity (after capturing escrow)
 */
export async function transferToCharity(
  amount: number,
  charityStripeAccountId: string,
  metadata?: Record<string, string>
) {
  return await stripe.transfers.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    destination: charityStripeAccountId,
    metadata: metadata || {},
  });
}

/**
 * Get payment intent details
 */
export async function getPaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Get checkout session details
 */
export async function getCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId);
}

