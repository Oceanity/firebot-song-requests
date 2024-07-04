import { logger } from "@utils/firebot";
import { SpotifyApiService } from "./api";
import SpotifyAuthService from "./auth";
import { SpotifyDeviceService } from "./device";
import { SpotifyEventService } from "./events";
import SpotifyProfileService from "./user";
import SpotifyPlayerService from "./player";
import { getErrorMessage } from "../string";
import ResponseError from "@/models/responseError";
import { SpotifySettingsService } from "./settings";
import { SpotifyArtistService } from "./artist";
import { trackSummaryFromDetails } from "./player/track";

type SearchOptions = {
  limit?: number;
  offset?: number;
  filterExplicit?: boolean;
  maximumLength?: number;
};

type FilteredTrack = {
  reason: "explicit" | "length";
  track: SpotifyTrackDetails;
};

type SearchResponse = {
  found: SpotifyTrackDetails;
  filtered: FilteredTrack[];
};

export class SpotifyService {
  public readonly api: SpotifyApiService;
  public readonly artist: SpotifyArtistService;
  public readonly auth: SpotifyAuthService;
  public readonly device: SpotifyDeviceService;
  public readonly events: SpotifyEventService;
  public readonly user: SpotifyProfileService;
  public readonly player: SpotifyPlayerService;
  public readonly settings: SpotifySettingsService;

  constructor() {
    this.api = new SpotifyApiService(this);
    this.artist = new SpotifyArtistService(this);
    this.auth = new SpotifyAuthService(this);
    this.device = new SpotifyDeviceService();
    this.events = new SpotifyEventService();
    this.user = new SpotifyProfileService(this);
    this.player = new SpotifyPlayerService(this);
    this.settings = new SpotifySettingsService(this);
  }

  public async init() {
    await this.player.init();
    await this.settings.init();
    await this.user.init();
  }

  public async searchAsync(
    query: string,
    types: SpotifyContextType[] | SpotifyContextType,
    options: SearchOptions = {}
  ): Promise<SearchResponse> {
    try {
      if (!Array.isArray(types)) {
        types = [types];
      }

      const encodedQuery = encodeURIComponent(query);

      const params = new URLSearchParams({
        q: encodedQuery,
        type: types.join(","),
        limit: String(options.limit ?? 50),
        offset: String(options.offset ?? 0),
      }).toString();

      const response = await this.api.fetch<SpotifySearchResponse>(
        `/search?${params}`
      );

      if (!response.data) {
        throw new Error("Could not retrieve Spotify track");
      }

      let foundTrack: SpotifyTrackDetails | null = null;
      const filteredTracks: FilteredTrack[] = [];
      let maxLengthMs: number = options.maximumLength
        ? options.maximumLength * 60 * 1000
        : 0;

      while (foundTrack === null) {
        const track = response.data.tracks.items.shift();
        if (!track) continue;

        if (options.filterExplicit) {
          filteredTracks.push({ reason: "explicit", track });
          continue;
        }

        if (maxLengthMs > 0 && track.duration_ms < maxLengthMs) {
          filteredTracks.push({ reason: "length", track });
          continue;
        }

        foundTrack = track;
      }

      return {
        found: foundTrack,
        filtered: filteredTracks,
      };
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      throw error;
    }
  }

  public async getTrackAsync(id: string) {
    try {
      const response = await this.api.fetch<SpotifyTrackDetails>(
        `/tracks/${id}`
      );

      if (!response.data) {
        throw new ResponseError("Could not retrieve Spotify track", response);
      }

      return response.data;
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      throw error;
    }
  }

  public getIdFromUri = (uri?: string) => uri?.split(":")[2] ?? "";

  public getUriFromId = (id?: string) => (id ? `spotify:track:${id}` : "");
}
