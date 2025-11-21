import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 * Handles all Stripe webhook events
 */
export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Handle different event types
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const betId = session.metadata?.betId;

        if (betId) {
          // Update bet status to active when checkout completes
          await supabase
            .from("bets")
            .update({
              status: "active",
              payment_intent_id: session.payment_intent as string,
            })
            .eq("id", betId)
            .eq("checkout_session_id", session.id);

          console.log(`Bet ${betId} activated after checkout completion`);
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const betId = paymentIntent.metadata?.betId;

        if (betId) {
          // Update bet status to active
          await supabase
            .from("bets")
            .update({
              status: "active",
              escrow_captured_at: new Date().toISOString(),
            })
            .eq("payment_intent_id", paymentIntent.id);

          console.log(`Payment intent succeeded for bet ${betId}`);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const betId = paymentIntent.metadata?.betId;

        if (betId) {
          // Update bet status to failed
          await supabase
            .from("bets")
            .update({
              status: "payment_failed",
            })
            .eq("payment_intent_id", paymentIntent.id);

          console.log(`Payment failed for bet ${betId}`);
        }
        break;
      }

      case "payment_intent.canceled": {
        const canceledIntent = event.data.object as Stripe.PaymentIntent;
        const betId = canceledIntent.metadata?.betId;

        if (betId) {
          // Update bet status to cancelled
          await supabase
            .from("bets")
            .update({
              status: "cancelled",
            })
            .eq("payment_intent_id", canceledIntent.id);

          console.log(`Payment canceled for bet ${betId}`);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        if (paymentIntentId) {
          // Get bet by payment intent
          const { data: bet } = await supabase
            .from("bets")
            .select("id")
            .eq("payment_intent_id", paymentIntentId)
            .single();

          if (bet) {
            // Update bet with refund information
            await supabase
              .from("bets")
              .update({
                refund_id: charge.refunds.data[0]?.id || null,
                refund_amount: charge.refunds.data[0]?.amount
                  ? charge.refunds.data[0].amount / 100
                  : null,
                status: "won",
                resolved_at: new Date().toISOString(),
              })
              .eq("id", bet.id);

            console.log(`Refund processed for bet ${bet.id}`);
          }
        }
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;
        const betId = transfer.metadata?.betId;

        if (betId) {
          // Update bet with transfer information
          await supabase
            .from("bets")
            .update({
              transfer_id: transfer.id,
              donation_amount: transfer.amount / 100,
              status: "lost",
              resolved_at: new Date().toISOString(),
            })
            .eq("id", betId);

          console.log(`Transfer created for bet ${betId}`);
        }
        break;
      }

      case "payment_intent.amount_capturable_updated": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const betId = paymentIntent.metadata?.betId;

        if (betId && paymentIntent.status === "requires_capture") {
          console.log(`Payment intent ready to capture for bet ${betId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook event:", error);
    // Return 200 to prevent Stripe from retrying
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 200 }
    );
  }
}
