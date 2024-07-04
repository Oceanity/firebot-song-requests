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

  public async searchAsync<T extends SpotifyContextType>(
    query: string,
    type: T,
    options: SearchOptions = {}
  ): Promise<SearchResponse<T>> {
    try {
      const encodedQuery = encodeURIComponent(query);

      const params = new URLSearchParams({
        q: encodedQuery,
        type: type,
        limit: String(options.limit ?? 50),
        offset: String(options.offset ?? 0),
      }).toString();

      const response = await this.api.fetch<SpotifyAPISearchResponse>(
        `/search?${params}`
      );

      if (!response.data) {
        throw new Error("Could not retrieve Spotify track");
      }

      switch (type) {
        case "track":
          return this.getFirstTrack(
            response.data,
            options
          ) as SearchResponse<T>;
        case "artist":
          return this.getFirstArtist(response.data) as SearchResponse<T>;
        case "album":
          return this.getFirstAlbum(response.data) as SearchResponse<T>;
        case "playlist":
          return this.getFirstPlaylist(response.data) as SearchResponse<T>;
        default:
          throw new Error("Invalid search type");
      }
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      throw error;
    }
  }

  private getFirstTrack(
    search: SpotifyAPISearchResponse,
    options: SearchOptions
  ): SearchResponse<"track"> {
    let foundTrack: SpotifyTrackDetails | null = null;
    const filteredTracks: FilteredEntry<SpotifyTrackDetails>[] = [];
    let maxLengthMs: number = options.maximumLength
      ? options.maximumLength * 60 * 1000
      : 0;

    while (foundTrack === null) {
      const entry = search.tracks.items.shift();
      if (!entry) continue;

      const reasons: FilteredReason[] = [];
      if (options.filterExplicit && entry.explicit) {
        reasons.push("explicit");
      }
      if (maxLengthMs > 0 && entry.duration_ms < maxLengthMs) {
        reasons.push("length");
      }

      if (reasons.length) {
        filteredTracks.push({ reasons, entry });
        continue;
      }

      foundTrack = entry;
    }

    return {
      found: foundTrack,
      filtered: filteredTracks,
    };
  }

  private getFirstArtist(
    search: SpotifyAPISearchResponse
  ): SearchResponse<"artist"> {
    return {
      found: search.artists.items[0],
      filtered: [],
    };
  }

  private getFirstAlbum(
    search: SpotifyAPISearchResponse
  ): SearchResponse<"album"> {
    return {
      found: search.albums.items[0],
      filtered: [],
    };
  }

  private getFirstPlaylist(
    search: SpotifyAPISearchResponse
  ): SearchResponse<"playlist"> {
    return {
      found: search.playlists.items[0],
      filtered: [],
    };
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
