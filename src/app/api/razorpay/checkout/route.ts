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

  let body: { annual?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    // default to monthly
  }

  const planId = body.annual
    ? process.env.RAZORPAY_ANNUAL_PLAN_ID || process.env.RAZORPAY_PLAN_ID!
    : process.env.RAZORPAY_PLAN_ID!;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.jobhunt4u.com";

  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan_id: planId,
      total_count: body.annual ? 12 : 120,
      quantity: 1,
      customer_notify: 1,
      notes: { user_id: user.id, email: user.email },
      notify_info: { notify_email: user.email },
      callback_url: `${siteUrl}/dashboard?upgraded=true`,
      callback_method: "get",
    }),
  });

  const subscription = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: subscription.error?.description || "Razorpay error" },
      { status: res.status }
    );
  }

  return NextResponse.json({ url: subscription.short_url });
}
