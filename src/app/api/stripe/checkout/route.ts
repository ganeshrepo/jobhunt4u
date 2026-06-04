import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Determine price ID based on billing period
  let body: { annual?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    // default to monthly
  }

  const priceId = body.annual
    ? process.env.STRIPE_ANNUAL_PRICE_ID || process.env.STRIPE_PRICE_ID!
    : process.env.STRIPE_PRICE_ID!;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.jobhunt4u.com";

  const params = new URLSearchParams({
    "payment_method_types[]": "card",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    mode: "subscription",
    success_url: `${siteUrl}/dashboard?upgraded=true`,
    cancel_url: `${siteUrl}/pricing`,
    customer_email: user.email ?? "",
    "metadata[user_id]": user.id,
  });

  const stripeRes = await fetch(
    "https://api.stripe.com/v1/checkout/sessions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );

  const session = await stripeRes.json();

  if (!stripeRes.ok) {
    return NextResponse.json(
      { error: session.error?.message || "Stripe error" },
      { status: stripeRes.status }
    );
  }

  return NextResponse.json({ url: session.url });
}
