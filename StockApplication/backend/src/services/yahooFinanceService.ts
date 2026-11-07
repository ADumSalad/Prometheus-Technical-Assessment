
import { StockDailySummary } from "../types/stockTypes.js";
import { YahooChartResponse } from "../types/yahooFinanceTypes.js";

interface DailyAccumulator {
    lowTotal: number;
    lowCount: number;
    highTotal: number;
    highCount: number;
    volume: number;
}

// Converts a Unix timestamp into a date in the stock's exchange timezone.
function getTradingDate(
    timestamp: number,
    timeZone: string
): string {
    const date = new Date(timestamp * 1000);

    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts.map(part => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}`;
}

export async function getStockDailySummary(
    symbol: string
): Promise<StockDailySummary[]> {

    // Construct the Yahoo Finance URL.
    const url = new URL(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`
    );

    url.searchParams.set("range", "1mo");
    url.searchParams.set("interval", "15m");

    // Request intraday data from Yahoo Finance.
    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; StockApplication/1.0)",
            "Accept": "application/json"
        },
        signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
        throw new Error(
            `Yahoo Finance returned HTTP ${response.status}`
        );
    }

    const data = await response.json() as YahooChartResponse;

    // Check for Yahoo Finance errors.
    if (data.chart.error) {
        throw new Error(data.chart.error.description);
    }

    const result = data.chart.result?.[0];

    if (!result) {
        throw new Error("No stock data was returned.");
    }

    const timestamps = result.timestamp ?? [];
    const quote = result.indicators.quote?.[0];

    if (!quote) {
        throw new Error("Yahoo Finance returned no quote data.");
    }

    const timeZone =
        result.meta.exchangeTimezoneName || "UTC";

    const dailyData = new Map<string, DailyAccumulator>();

    // Group intraday records by trading date.
    for (let i = 0; i < timestamps.length; i++) {

        const day = getTradingDate(timestamps[i], timeZone);

        if (!dailyData.has(day)) {
            dailyData.set(day, {
                lowTotal: 0,
                lowCount: 0,
                highTotal: 0,
                highCount: 0,
                volume: 0
            });
        }

        const daily = dailyData.get(day)!;

        const low = quote.low?.[i];
        const high = quote.high?.[i];
        const volume = quote.volume?.[i];

        // Collect valid low values.
        if (typeof low === "number" && Number.isFinite(low)) {
            daily.lowTotal += low;
            daily.lowCount++;
        }

        // Collect valid high values.
        if (typeof high === "number" && Number.isFinite(high)) {
            daily.highTotal += high;
            daily.highCount++;
        }

        // Add intraday volume.
        if (
            typeof volume === "number" &&
            Number.isFinite(volume)
        ) {
            daily.volume += volume;
        }
    }

    // Convert grouped data into the required JSON structure.
    const summaries: StockDailySummary[] = [];

    for (const [day, daily] of dailyData) {

        if (daily.lowCount === 0 || daily.highCount === 0) {
            continue;
        }

        summaries.push({
            day,
            lowAverage: Number(
                (daily.lowTotal / daily.lowCount).toFixed(4)
            ),
            highAverage: Number(
                (daily.highTotal / daily.highCount).toFixed(4)
            ),
            volume: daily.volume
        });
    }

    // Return trading days in chronological order.
    return summaries.sort((a, b) => b.day.localeCompare(a.day));
}
