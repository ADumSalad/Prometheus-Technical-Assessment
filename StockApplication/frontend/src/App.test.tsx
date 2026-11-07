import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { getStockData } from "./services/stockService";
import type { StockDailySummary } from "./types/stockTypes";

vi.mock("./services/stockService", () => ({
  getStockData: vi.fn(),
}));

// The chart is tested separately from the search and table behavior.
vi.mock("./components/StockChart", () => ({
  default: () => <div data-testid="stock-chart">Stock chart</div>,
}));

const mockStockData: StockDailySummary[] = [
  {
    day: "2026-11-05",
    lowAverage: 300,
    highAverage: 310,
    volume: 1000,
  },
  {
    day: "2026-11-06",
    lowAverage: 315,
    highAverage: 325,
    volume: 5000,
  },
];

const mockedGetStockData = vi.mocked(getStockData);

describe("Stock application system tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows a user to search for a stock and displays its data", async () => {
    const user = userEvent.setup();

    mockedGetStockData.mockResolvedValue(mockStockData);

    render(<App />);

    await user.type(
      screen.getByRole("textbox", {
        name: /stock ticker symbol/i,
        }),
      "TSLA"
    );

    await user.click(
      screen.getByRole("button", { name: /search/i })
    );

    expect(mockedGetStockData).toHaveBeenCalledWith("TSLA");

    expect(await screen.findByTestId("stock-chart"))
      .toBeInTheDocument();

    expect(screen.getByText("2026-11-06"))
      .toBeInTheDocument();

    expect(screen.getByText("2026-11-05"))
      .toBeInTheDocument();
  });

  it("displays the newest trading date before older dates", async () => {
    const user = userEvent.setup();

    mockedGetStockData.mockResolvedValue(mockStockData);

    render(<App />);

    await user.type(screen.getByRole("textbox", {
        name: /stock ticker symbol/i,
        }), "TSLA");

    await user.click(
      screen.getByRole("button", { name: /search/i })
    );

    await screen.findByText("2026-11-06");

    const rows = screen.getAllByRole("row");

    // Row 0 is the table header.
    expect(within(rows[1]).getByText("2026-11-06"))
      .toBeInTheDocument();

    expect(within(rows[2]).getByText("2026-11-05"))
      .toBeInTheDocument();
  });

  it("does not call the API when the ticker is invalid", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.type(
      screen.getByRole("textbox", {
        name: /stock ticker symbol/i,
        }),
      "INVALID TICKER"
    );

    await user.click(
      screen.getByRole("button", { name: /search/i })
    );

    expect(mockedGetStockData).not.toHaveBeenCalled();

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("displays an error when the API request fails", async () => {
    const user = userEvent.setup();

    mockedGetStockData.mockRejectedValue(
      new Error("Unable to retrieve stock data.")
    );

    render(<App />);

    await user.type(screen.getByRole("textbox", {
        name: /stock ticker symbol/i,
    }), "TSLA");

    await user.click(
      screen.getByRole("button", { name: /search/i })
    );

    expect(
      await screen.findByText("Unable to retrieve stock data.")
    ).toBeInTheDocument();
  });
});