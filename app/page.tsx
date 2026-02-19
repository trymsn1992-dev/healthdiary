import { redirect } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { getOuraData, type OuraDailySleep, type OuraDailyActivity, type OuraDailyReadiness } from "@/lib/oura";
import { createClient } from "@/lib/supabase/server";
import { format, subDays } from "date-fns";
import { getCalendarEvents } from "@/lib/calendar";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

  // Fetch last 2 days to ensure we have *some* data to show if today isn't synced yet
  const sleepDataPromise = getOuraData("daily_sleep", yesterday, today);
  const activityDataPromise = getOuraData("daily_activity", yesterday, today);
  const readinessDataPromise = getOuraData("daily_readiness", yesterday, today);

  const [sleepData, activityData, readinessData] = await Promise.all([
    sleepDataPromise,
    activityDataPromise,
    readinessDataPromise,
  ]);

  // Helper to get the latest item from the array
  const getLatest = <T,>(data: T[] | null) => {
    if (!data || data.length === 0) return null;
    return data[data.length - 1]; // Oura API usually returns sorted by date, but last is safest bet for "latest" in range
  };

  const latestSleep = getLatest(sleepData as OuraDailySleep[]);
  const latestActivity = getLatest(activityData as OuraDailyActivity[]);
  const latestReadiness = getLatest(readinessData as OuraDailyReadiness[]);

  // Fetch Today's Log
  const { data: moodLog } = await supabase
    .from("mood_logs")
    .select("mood_score, note")
    .eq("date", today)
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: symptomLog } = await supabase
    .from("symptom_logs")
    .select("symptoms")
    .eq("date", today)
    .eq("user_id", user.id)
    .maybeSingle();

  // Fetch Calendar Events
  const calendarData = await getCalendarEvents(new Date());

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <Dashboard
        initialOuraData={{
          sleep: latestSleep,
          activity: latestActivity,
          readiness: latestReadiness
        }}
        user={user}
        initialMoodLog={moodLog}
        initialSymptomLog={symptomLog}
        calendarData={calendarData}
      />
    </main>
  );
}
