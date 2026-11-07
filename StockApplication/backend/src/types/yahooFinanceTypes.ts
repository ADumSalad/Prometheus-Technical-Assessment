export interface YahooChartResponse {
    chart: {
        result: YahooChartResult[] | null;
        error: {
            code: string;
            description: string;
        } | null;
    };
}

export interface YahooChartResult {
    meta: {
        symbol: string;
        exchangeTimezoneName?: string;
    };

    timestamp: number[];

    indicators: {
        quote: {
            low: (number | null)[];
            high: (number | null)[];
            volume: (number | null)[];
        }[];
    };
}