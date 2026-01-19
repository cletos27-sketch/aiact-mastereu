import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Product ID for Compliance Pack (LIVE MODE)
const VALID_PRODUCT_ID = "prod_TlXNDRDgiLZ09U";

// Valid statuses for purchases
// "paid" = successful one-time payment
// "active" = active subscription (kept for backward compatibility)
// "canceled" = canceled subscription
// "payment_failed" = payment attempt failed
// "pending" = awaiting payment
type PurchaseStatus = "paid" | "active" | "canceled" | "payment_failed" | "pending";

serve(async (req: Request) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      return new Response(JSON.stringify({ error: "Stripe secret key not set" }), { status: 500 });
    }
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET is not set");
      return new Response(JSON.stringify({ error: "Stripe webhook secret not set" }), { status: 500 });
    }
    logStep("Stripe keys verified");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    let event: Stripe.Event;

    // SECURITY: Webhook signature verification is REQUIRED
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      logStep("ERROR: Missing Supabase environment variables for admin client");
      return new Response(JSON.stringify({ error: "Missing Supabase environment variables" }), { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });

    // Helper function to find user by email
    const findUserByEmail = async (email: string) => {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      if (userError) {
        logStep("Error listing users", { error: userError.message });
        return null;
      }
      return userData.users.find((u) => u.email === email);
    };

    // Handle Stripe events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { 
          sessionId: session.id,
          mode: session.mode,
          paymentStatus: session.payment_status 
        });

        const metadataUserId = session.metadata?.user_id;
        const clientReferenceId = session.client_reference_id;
        const customerEmail = session.customer_email || session.customer_details?.email;

        logStep("Session identifiers", { metadataUserId, clientReferenceId, customerEmail });

        let userId: string | null = null;
        let userEmail: string | null = customerEmail || null;

        if (metadataUserId) {
          userId = metadataUserId;
          logStep("Using session.metadata.user_id as user_id", { userId });
        } else if (clientReferenceId) {
          userId = clientReferenceId;
          logStep("Using client_reference_id as user_id", { userId });
        } else if (customerEmail) {
          const user = await findUserByEmail(customerEmail);
          if (user) {
            userId = user.id;
            userEmail = user.email;
            logStep("Found user by email", { userId, email: userEmail });
          }
        }

        if (!userId || !userEmail) {
          logStep("No user found or email missing for checkout.session.completed");
          break;
        }

        logStep("Processing for user", { userId });

        if (session.payment_status === "paid") {
          const productId = VALID_PRODUCT_ID;
          const lineItem = session.line_items?.data?.[0];
          const priceId = lineItem?.price?.id || session.metadata?.price_id || "unknown";
          const amount = session.amount_total || 0;
          const currency = session.currency || "eur";
          
          const status: PurchaseStatus = "paid";

          logStep("Upserting paid purchase", {
            userId,
            userEmail,
            productId,
            priceId,
            amount,
            currency,
            stripeSessionId: session.id,
          });

          const { error: upsertError } = await supabaseAdmin
            .from("user_purchases")
            .upsert(
              {
                user_id: userId,
                user_email: userEmail,
                product_id: productId,
                price_id: priceId,
                amount: amount,
                currency: currency,
                status,
                purchased_at: new Date().toISOString(),
                stripe_session_id: session.id,
                stripe_customer_id: (session.customer as string) || null,
                updated_at: new Date().toISOString(),
              },
              { 
                onConflict: "user_id,product_id",
                ignoreDuplicates: false 
              }
            );

          if (upsertError) {
            logStep("Error upserting purchase", { error: upsertError.message });
          } else {
            logStep("Purchase upserted successfully", { userId, productId, status });
          }

          const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .update({ is_paid: true, updated_at: new Date().toISOString() })
            .eq("user_id", userId);

          if (profileError) {
            logStep("Error updating profile is_paid to true", { error: profileError.message });
          } else {
            logStep("Profile is_paid updated to true", { userId });
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
          customerId,
          eventType: event.type
        });

        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) {
          logStep("Customer was deleted, skipping subscription update");
          break;
        }
        
        const customerEmail = (customer as Stripe.Customer).email;
        if (!customerEmail) {
          logStep("No customer email found for subscription event, skipping");
          break;
        }

        const user = await findUserByEmail(customerEmail);
        if (!user) {
          logStep("No user found with email for subscription event", { email: customerEmail });
          break;
        }

        logStep("Found user for subscription event", { userId: user.id });

        const isActiveSubscription = subscription.status === "active" || subscription.status === "trialing";
        const newPurchaseStatus: PurchaseStatus = isActiveSubscription ? "active" : "canceled";
        const newIsPaid = isActiveSubscription;

        logStep("Updating subscription status and profile for user", { 
          userId: user.id, 
          subscriptionStatus: subscription.status,
          newPurchaseStatus,
          newIsPaid
        });

        // Update user_purchases status
        const { error: upsertError } = await supabaseAdmin
          .from("user_purchases")
          .upsert(
            {
              user_id: user.id,
              user_email: customerEmail,
              product_id: VALID_PRODUCT_ID,
              price_id: subscription.items.data[0]?.price?.id || "unknown",
              amount: subscription.items.data[0]?.price?.unit_amount || 0,
              currency: subscription.currency || "eur",
              status: newPurchaseStatus,
              updated_at: new Date().toISOString(),
              stripe_customer_id: customerId,
            },
            { 
                onConflict: "user_id,product_id",
                ignoreDuplicates: false 
            }
          );

        if (upsertError) {
          logStep("Error upserting purchase status for subscription event", { error: upsertError.message });
        } else {
          logStep("Purchase status upserted successfully for subscription event", { userId: user.id, status: newPurchaseStatus });
        }

        // Update profiles.is_paid
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({ is_paid: newIsPaid, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);

        if (profileError) {
            logStep("Error updating profile is_paid for subscription event", { error: profileError.message });
          } else {
            logStep("Profile is_paid updated successfully for subscription event", { userId: user.id, isPaid: newIsPaid });
          }
          break;
        }
  
        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;
          
          logStep("Processing invoice.payment_failed", { invoiceId: invoice.id, customerId });
  
          const customer = await stripe.customers.retrieve(customerId);
          if (customer.deleted) {
            logStep("Customer was deleted, skipping payment_failed update");
            break;
          }
          
          const customerEmail = (customer as Stripe.Customer).email;
          if (!customerEmail) {
            logStep("No customer email found for payment_failed event, skipping");
            break;
          }
  
          const user = await findUserByEmail(customerEmail);
          if (!user) {
            logStep("No user found with email for payment_failed event", { email: customerEmail });
            break;
          }
  
          logStep("Found user for payment_failed event", { userId: user.id });
  
          // Update user_purchases status to payment_failed
          const { error: purchaseUpdateError } = await supabaseAdmin
            .from("user_purchases")
            .update({ 
              status: "payment_failed",
              updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id)
            .eq("product_id", VALID_PRODUCT_ID);
  
          if (purchaseUpdateError) {
            logStep("Error updating purchase status to payment_failed", { error: purchaseUpdateError.message });
          } else {
            logStep("Purchase status updated to payment_failed", { userId: user.id });
          }
  
          // Update profiles.is_paid to false
          const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .update({ is_paid: false, updated_at: new Date().toISOString() })
            .eq("user_id", user.id);
  
          if (profileError) {
            logStep("Error updating profile is_paid to false for payment_failed", { error: profileError.message });
          } else {
            logStep("Profile is_paid updated to false for payment_failed", { userId: user.id });
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