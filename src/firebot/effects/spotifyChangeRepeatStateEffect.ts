import Spotify from "@utils/spotify";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { integrationId } from "@/main";

export enum SpotifyRepeatState {
  Track = "track",
  Context = "context",
  Off = "off",
}

export const spotifyChangeRepeatStateEffect: Firebot.EffectType<{
  repeatState: SpotifyRepeatState;
}> = {
  definition: {
    id: `${integrationId}:change-playback-state`,
    name: "Spotify Premium: Change Repeat Mode",
    description: "Changes repeat mode of active Spotify device",
    icon: "fab fa-spotify",
    categories: ["integrations"],
    //@ts-expect-error ts2353
    outputs: [
      {
        label: "Repeat mode was changed",
        description:
          "Will be true if the repeat mode was changed successfully, false if not.",
        defaultName: "repeatModeChanged",
      },
    ],
  },

  optionsTemplate: `
    <eos-container header="Looping Mode">
      <div class="btn-group">
        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <span class="list-effect-type">{{effect.repeatState ? effect.repeatState : 'Looping Mode...'}}</span> <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li ng-click="effect.repeatState = 'off'">
            <a href>Off</a>
          </li>
          <li ng-click="effect.repeatState = 'track'">
            <a href>Track</a>
          </li>
          <li ng-click="effect.repeatState = 'context'">
            <a href>Context</a>
          </li>
        </ul>
      </div>
    </eos-container>
  `,

  // @ts-expect-error ts6133: Variables must be named consistently
  optionsController: ($scope: any, backendCommunicator: any, $q: any) => {},

  optionsValidator: (effect) => {
    const errors: string[] = [];

    if (!effect.repeatState) {
      errors.push("Looping mode is required!");
    }

    return errors;
  },

  onTriggerEvent: async (event) => {
    const { repeatState } = event.effect;

    const repeatModeChanged = await Spotify.changeRepeatStateAsync(repeatState);

    return {
      success: true,
      outputs: {
        repeatModeChanged,
      },
    };
  },
};