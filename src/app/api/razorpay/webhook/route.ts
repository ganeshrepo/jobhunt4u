import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

function getServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("X-Razorpay-Signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSig) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; payload: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = getServiceRoleClient();

  const subEntity = (
    event.payload as Record<string, { entity: Record<string, unknown> }>
  )?.subscription?.entity;

  if (
    event.event === "subscription.activated" ||
    event.event === "subscription.charged"
  ) {
    const userId = (subEntity?.notes as Record<string, string>)?.user_id;
    if (userId) {
      await supabase
        .from("profiles")
        .update({
          subscription_tier: "premium",
          stripe_subscription_id: subEntity?.id as string,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
  }

  if (
    event.event === "subscription.cancelled" ||
    event.event === "subscription.completed"
  ) {
    const subId = subEntity?.id as string;
    if (subId) {
      await supabase
        .from("profiles")
        .update({
          subscription_tier: "free",
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subId);
    }
  }

  return NextResponse.json({ received: true });
}
