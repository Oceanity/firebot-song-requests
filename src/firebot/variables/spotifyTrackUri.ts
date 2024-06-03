import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackUriVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackUrl",
    description:
      "Gets the url of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyTrackUrl",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.track?.url ?? "",
};