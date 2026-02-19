export interface OuraDailySleep {
    id: string;
    day: string;
    score: number;
    contributors: {
        deep_sleep: number;
        efficiency: number;
        latency: number;
        rem_sleep: number;
        restfulness: number;
        timing: number;
        total_sleep: number;
    };
}

export interface OuraDailyActivity {
    id: string;
    day: string;
    score: number;
    active_calories: number;
    steps: number;
    total_calories: number;

}

export interface OuraDailyReadiness {
    id: string;
    day: string;
    score: number;
    contributors: {
        activity_balance: number;
        body_temperature: number;
        hrv_balance: number;
        previous_day_activity: number;
        previous_night: number;
        recovery_index: number;
        resting_heart_rate: number;
        sleep_balance: number;
    };
}

const OURA_API_BASE = "https://api.ouraring.com/v2/usercollection";

export async function getOuraData(dataType: "daily_sleep" | "daily_activity" | "daily_readiness", startDate: string, endDate: string) {
    const token = process.env.OURA_PERSONAL_ACCESS_TOKEN;
    if (!token) {
        console.error("Missing OURA_PERSONAL_ACCESS_TOKEN");
        return null;
    }

    const url = `${OURA_API_BASE}/${dataType}?start_date=${startDate}&end_date=${endDate}`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            console.error(`Oura API error: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching Oura data:", error);
        return null;
    }
}
