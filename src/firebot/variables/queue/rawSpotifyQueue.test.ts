import { SpotifyService } from "@/utils/spotify";
import { RawSpotifyQueueVariable } from "./rawSpotifyQueue";
import { testQueue, testTrigger } from "@/testData";

// Mocking the entire @/main module to provide the mocked spotify instance
jest.mock("@/main", () => ({
  spotify: {
    player: {
      queue: {},
    },
  },
}));

describe("Spotify - Raw Queue Replace Variable", () => {
  let spotify: SpotifyService;

  beforeEach(() => {
    // Access the mocked spotify from the mocked @/main module
    spotify = require("@/main").spotify;

    // Mock the summary getter on the queue object
    Object.defineProperty(spotify.player.queue, "raw", {
      get: jest.fn(() => testQueue),
      configurable: true,
    });
  });

  it("returns all details on current queue", async () => {
    const response = await RawSpotifyQueueVariable.evaluator(testTrigger);
    expect(response).toEqual(testQueue);
  });

  it("returns empty string when queue is undefined", async () => {
    Object.defineProperty(spotify.player.queue, "raw", {
      get: jest.fn(() => undefined),
      configurable: true,
    });
    const response = await RawSpotifyQueueVariable.evaluator(testTrigger);
    expect(response).toEqual("");
  });

  it("returns empty string when queue is null", async () => {
    Object.defineProperty(spotify.player.queue, "raw", {
      get: jest.fn(() => null),
      configurable: true,
    });
    const response = await RawSpotifyQueueVariable.evaluator(testTrigger);
    expect(response).toEqual("");
  });
});
