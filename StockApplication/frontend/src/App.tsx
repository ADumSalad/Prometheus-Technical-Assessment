import { useState } from "react";

import { getStockData } from "./services/stockService";

import type { StockDailySummary } from "./types/stockTypes";

import StockChart from "./components/StockChart";
import StockTable from "./components/StockTable";

import "./App.css";

function App() {

    const [symbol, setSymbol] = useState("");

    const [currentSymbol, setCurrentSymbol] = useState("");

    const [stockData, setStockData] =
        useState<StockDailySummary[]>([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        const ticker = symbol.trim().toUpperCase();

        // Basic ticker validation.
        if (!ticker || !/^[A-Z0-9.^=_-]{1,20}$/.test(ticker)) {
            setError("Please enter a valid stock symbol.");
            setStockData([]);
            setCurrentSymbol("");
            setHasSearched(true);
            return;
        }

        setLoading(true);
        setError("");
        setStockData([]);
        setCurrentSymbol(ticker);
        setHasSearched(true);

        try {

            const data = await getStockData(ticker);

            if (data.length === 0) {
                setError(
                    "No trading data was found for this symbol."
                );
                return;
            }

            setStockData(data);

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "An unexpected error occurred."
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className="app">

            <header className="header">

                <div className="header-content">

                    <h1>Stock Market Dashboard</h1>

                    <p>
                        View daily stock price averages and trading volume.
                    </p>

                </div>

            </header>

            <main className="main-content">

                <section className="search-section">

                    <h2>Search Stocks</h2>

                    <form onSubmit={handleSearch}>

                        <input
                            type="text"
                            placeholder="Enter stock symbol (e.g. TSLA)"
                            value={symbol}
                            onChange={(event) =>
                                setSymbol(event.target.value.toUpperCase())
                            }
                            maxLength={20}
                            aria-label="Stock ticker symbol"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Searching..." : "Search"}
                        </button>

                    </form>

                </section>

                {loading && (
                    <div className="status-message">
                        Retrieving stock information...
                    </div>
                )}

                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}

                {stockData.length > 0 && (

                    <section className="results-section">

                        <div className="results-header">

                            <h2>{currentSymbol}</h2>

                            <span>
                                {stockData.length} trading days returned
                            </span>

                        </div>

                        <StockChart data={stockData} />

                        <StockTable data={stockData} />

                    </section>

                )}

                {!loading && !error && !hasSearched && (

                    <div className="welcome-message">

                        <h2>Welcome to your stock dashboard</h2>

                        <p>
                            Enter a stock ticker above to view its
                            recent trading information.
                        </p>

                        <p className="examples">
                            Try TSLA, AAPL, MSFT, or NVDA.
                        </p>

                    </div>

                )}

            </main>

            <footer className="footer">

                <p>
                    Stock Market Dashboard | Powered by React and Express
                </p>

            </footer>

        </div>

    );
}

export default App;