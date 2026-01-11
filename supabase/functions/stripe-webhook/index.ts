import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Product ID for Compliance Pack (TEST MODE)
const VALID_PRODUCT_ID = "prod_TlNdrEbFfZcfIg";

// Valid statuses for purchases
type PurchaseStatus = "active" | "canceled" | "payment_failed" | "pending";

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    let event: Stripe.Event;

    // SECURITY: Webhook signature verification is REQUIRED
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET is not configured");
      return new Response(
        JSON.stringify({ error: "Webhook signature verification required - STRIPE_WEBHOOK_SECRET not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!signature) {
      logStep("ERROR: Missing stripe-signature header");
      return new Response(
        JSON.stringify({ error: "Webhook signature verification required - missing signature header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      logStep("Webhook signature verified successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      logStep("Webhook signature verification failed", { error: message });
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${message}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    logStep("Processing event", { type: event.type, id: event.id });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle Stripe events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { 
          sessionId: session.id,
          mode: session.mode,
          paymentStatus: session.payment_status 
        });

        // Get customer email from session
        const customerEmail = session.customer_email || session.customer_details?.email;
        if (!customerEmail) {
          logStep("No customer email found in session, skipping");
          break;
        }

        logStep("Found customer email", { email: customerEmail });

        // Find user by email
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        if (userError) {
          logStep("Error listing users", { error: userError.message });
          break;
        }

        const user = userData.users.find(u => u.email === customerEmail);
        if (!user) {
          logStep("No user found with email", { email: customerEmail });
          break;
        }

        logStep("Found user", { userId: user.id });

        // Only process if payment was successful
        if (session.payment_status === "paid") {
          // Get line item details
          const stripe = new Stripe(stripeKey!, { apiVersion: "2025-08-27.basil" });
          const sessionWithItems = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ["line_items.data.price.product"]
          });
          
          const lineItem = sessionWithItems.line_items?.data[0];
          const price = lineItem?.price;
          const priceId = price?.id || "unknown";
          const productId = typeof price?.product === "string" ? price.product : VALID_PRODUCT_ID;
          const amount = session.amount_total || 0;
          const currency = session.currency || "eur";

          logStep("Purchase details", { priceId, productId, amount, currency });

          // Upsert purchase record
          const { error: upsertError } = await supabaseAdmin
            .from("user_purchases")
            .upsert({
              user_id: user.id,
              user_email: customerEmail,
              product_id: productId,
              price_id: priceId,
              amount: amount,
              currency: currency,
              status: "active",
              stripe_session_id: session.id,
              stripe_customer_id: session.customer as string,
              purchased_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: "user_id,product_id"
            });

          if (upsertError) {
            logStep("Error upserting purchase", { error: upsertError.message });
          } else {
            logStep("Purchase recorded successfully", { userId: user.id, productId });
          }

          // Also update profiles.is_paid to true
          const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .update({ is_paid: true, updated_at: new Date().toISOString() })
            .eq("user_id", user.id);

          if (profileError) {
            logStep("Error updating profile is_paid", { error: profileError.message });
          } else {
            logStep("Profile is_paid updated to true", { userId: user.id });
          }
        } else {
          logStep("Payment not completed yet", { paymentStatus: session.payment_status });
        }
        break;
      }

      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        logStep("Processing subscription event", { 
          subscriptionId: subscription.id, 
          status: subscription.status,
          customerId 
        });

        // Get customer email to find user
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) {
          logStep("Customer was deleted, skipping");
          break;
        }
        
        const customerEmail = (customer as Stripe.Customer).email;
        if (!customerEmail) {
          logStep("No customer email found, skipping");
          break;
        }

        logStep("Found customer email", { email: customerEmail });

        // Find user by email
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        if (userError) {
          logStep("Error listing users", { error: userError.message });
          break;
        }

        const user = userData.users.find(u => u.email === customerEmail);
        if (!user) {
          logStep("No user found with email", { email: customerEmail });
          break;
        }

        logStep("Found user", { userId: user.id });

        // Check subscription status
        const isActive = subscription.status === "active" || subscription.status === "trialing";
        const isCanceled = subscription.status === "canceled" || 
                          subscription.cancel_at_period_end === true;

        if (event.type === "customer.subscription.deleted" || 
            (event.type === "customer.subscription.updated" && !isActive)) {
          
          // Update purchase status to canceled
          const { error: updateError } = await supabaseAdmin
            .from("user_purchases")
            .update({ 
              status: "canceled",
              updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id)
            .eq("product_id", VALID_PRODUCT_ID);

          if (updateError) {
            logStep("Error updating purchase status", { error: updateError.message });
          } else {
            logStep("Purchase status updated to canceled", { userId: user.id });
          }
        } else if (isCanceled) {
          // Subscription will be canceled at end of period
          logStep("Subscription marked for cancellation at period end", { 
            userId: user.id,
            cancelAt: subscription.cancel_at 
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        logStep("Payment failed", { invoiceId: invoice.id, customerId });

        // Get customer email
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) break;
        
        const customerEmail = (customer as Stripe.Customer).email;
        if (!customerEmail) break;

        // Find user and update status
        const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
        const user = userData?.users.find(u => u.email === customerEmail);
        
        if (user) {
          await supabaseAdmin
            .from("user_purchases")
            .update({ 
              status: "payment_failed",
              updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id)
            .eq("product_id", VALID_PRODUCT_ID);

          logStep("Purchase status updated to payment_failed", { userId: user.id });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
