import { Request, Response } from "express";
import { getStockDailySummary } from "../services/yahooFinanceService.js";

export async function getStockSummary(
    req: Request,
    res: Response
): Promise<void> {
    const value: string | string[] = req.params.symbol;
    try {
        const symbol = (value as string).toUpperCase();

        const stockData = await getStockDailySummary(symbol);

        res.status(200).json(stockData);

    } catch (error) {

        console.error("Stock API Error:", error);

        res.status(502).json({
            error: "Unable to retrieve stock information.",
            details: error instanceof Error
                ? error.message
                : "Unknown error"
        });
    }
}