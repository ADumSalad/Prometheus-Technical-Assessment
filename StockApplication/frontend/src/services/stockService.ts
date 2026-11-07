import type { StockDailySummary } from "../types/stockTypes";

const API_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api";

export async function getStockData(
    symbol: string
): Promise<StockDailySummary[]> {

    const response = await fetch(
        `${API_URL}/stocks/${encodeURIComponent(symbol)}/summary`
    );

    if (!response.ok) {

        let message = "Unable to retrieve stock data.";

        try {
            const errorData = await response.json();

            if (errorData.error) {
                message = errorData.error;
            }
        } catch {
            // Keep the default error message.
        }

        if (response.status === 400) {
            throw new Error("Invalid stock symbol.");
        }

        if (response.status === 502) {
            throw new Error(
                "The stock data provider could not retrieve this symbol. Please check the ticker and try again."
            );
        }

        throw new Error(message);
    }

    const data: unknown = await response.json();

    if (
        !Array.isArray(data) ||
        !data.every(item =>
            item !== null &&
            typeof item === "object" &&
            typeof item.day === "string" &&
            typeof item.lowAverage === "number" &&
            typeof item.highAverage === "number" &&
            typeof item.volume === "number"
        )
    ) {
        throw new Error("The backend returned an invalid data format.");
    }

    return data as StockDailySummary[];
}