//#region Spotify API /search
type SpotifyAPISearchCategory<T> = {
  href: string;
  limit: number;
  next: string;
  offset: number;
  previous: string;
  total: number;
  items: T[];
};

type SpotifyAPISearchResponse = {
  tracks: SpotifySearchCategory<SpotifyTrackDetails>;
  artists: SpotifySearchCategory<SpotifyArtistDetails>;
  albums: SpotifySearchCategory<SpotifyAlbumDetails>;
  playlists: SpotifySearchCategory<SpotifyPlaylistDetails>;
  shows: SpotifySearchCategory<SpotifyShowDetials>;
  episodes: SpotifySearchCategory<SpotifyEpisodeDetails>;
  audiobooks: SpotifySearchCategory<SpotifyAudiobookDetails>;
};
//#endregion

//#region spotify.searchAsync
type SearchOptions = {
  limit?: number;
  offset?: number;
  filterExplicit?: boolean;
  maximumLength?: number;
};

type FilteredReason = "explicit" | "length";

type FilteredEntry<T> = {
  reasons: FilteredReason[];
  entry: T;
};

type SearchResponseMap = {
  track: SpotifyTrackDetails;
  artist: SpotifyArtistDetails;
  album: SpotifyAlbumDetails;
  audiobook: SpotifyAudiobookDetails;
  playlist: SpotifyPlaylistDetails;
  show: SpotifyShowDetails;
  episode: SpotifyEpisodeDetails;
};

// type SearchResponse<T extends SpotifyContextType | SpotifyContextType[]> = {
//   [K in T as `filtered${Capitalize<K>}s`]: FilteredEntry<ResponseMap[K]>;
// } & {
//   [K in T as `found${Capitalize<K>}`]: ResponseMap[K];
// };

type SearchResponse<T extends SpotifyContextType> = {
  found: SearchResponseMap[T];
  filtered: FilteredEntry<SearchResponseMap[T]>[];
};

//#endregion
