import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// TODO: Add Stripe webhook signature verification using the Stripe-Signature header
// and process.env.STRIPE_WEBHOOK_SECRET before deploying to production.
// See: https://stripe.com/docs/webhooks/signatures

function getServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  // const signature = request.headers.get("Stripe-Signature");

  let event: {
    type: string;
    data: { object: Record<string, unknown> };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = getServiceRoleClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = (session.metadata as Record<string, string>)?.user_id;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (userId) {
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_tier: "premium",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error("Failed to update profile to premium:", error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      if (customerId) {
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_tier: "free",
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("Failed to downgrade subscription:", error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
      break;
    }

    default:
      // Unhandled event type — acknowledge receipt
      break;
  }

  return NextResponse.json({ received: true });
}
