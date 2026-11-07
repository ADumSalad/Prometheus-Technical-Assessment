import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

const originalFetch = globalThis.fetch;

const yahooResponse = {
  chart: {
    result: [
      {
        meta: {
          symbol: "TSLA",
          exchangeTimezoneName: "America/New_York",
        },
        timestamp: [
          Math.floor(new Date("2026-11-05T15:00:00Z").getTime() / 1000),
          Math.floor(new Date("2026-11-06T15:00:00Z").getTime() / 1000),
          Math.floor(new Date("2026-11-06T16:00:00Z").getTime() / 1000),
        ],
        indicators: {
          quote: [
            {
              low: [300, 310, 320],
              high: [310, 320, 330],
              volume: [1000, 2000, 3000],
            },
          ],
        },
      },
    ],
    error: null,
  },
};

describe("Stock API system tests", () => {
  beforeEach(() => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify(yahooResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns stock summaries with the newest date first", async () => {
    const response = await request(app)
      .get("/api/stocks/TSLA/summary");

    assert.equal(response.status, 200);
    assert.equal(response.body.length, 2);

    // Newest date should appear first.
    assert.equal(response.body[0].day, "2026-11-06");
    assert.equal(response.body[1].day, "2026-11-05");

    // November 6 contains two 15-minute intervals.
    assert.equal(response.body[0].lowAverage, 315);
    assert.equal(response.body[0].highAverage, 325);
    assert.equal(response.body[0].volume, 5000);
  });

  it("rejects an invalid ticker symbol", async () => {
    const response = await request(app)
      .get("/api/stocks/INVALID%20SYMBOL/summary");

    assert.equal(response.status, 400);
  });

  it("returns an error when Yahoo Finance is unavailable", async () => {
    globalThis.fetch = async () =>
      new Response("Service unavailable", { status: 503 });

    const response = await request(app)
      .get("/api/stocks/TSLA/summary");

    assert.equal(response.status, 502);
    assert.equal(
      response.body.error,
      "Unable to retrieve stock information."
    );
  });
});