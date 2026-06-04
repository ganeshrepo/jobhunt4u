import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Check and increment AI usage for free tier users.
 * Returns true if the call is allowed, false if the daily limit has been exceeded.
 *
 * Limits:
 *   - Free tier: 5 AI calls per day (resets at midnight UTC)
 *   - Premium tier: unlimited
 */
export async function checkAndIncrementUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("subscription_tier, ai_calls_today, ai_calls_reset_date")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    // If we can't read the profile, fail open (allow the call)
    return true;
  }

  const { subscription_tier, ai_calls_today, ai_calls_reset_date } = profile;

  // Premium users have no limit
  if (subscription_tier === "premium") {
    return true;
  }

  const todayUtc = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  // Reset counter if the reset date is before today
  if (!ai_calls_reset_date || ai_calls_reset_date < todayUtc) {
    await supabase
      .from("profiles")
      .update({
        ai_calls_today: 1,
        ai_calls_reset_date: todayUtc,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    return true;
  }

  const FREE_TIER_DAILY_LIMIT = 5;
  const currentCount: number = ai_calls_today ?? 0;

  if (currentCount >= FREE_TIER_DAILY_LIMIT) {
    return false;
  }

  // Increment usage
  await supabase
    .from("profiles")
    .update({
      ai_calls_today: currentCount + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  return true;
}
