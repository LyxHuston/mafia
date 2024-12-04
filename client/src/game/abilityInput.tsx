import { ListMapData } from "../ListMap";
import { KiraGuess } from "../menu/game/gameScreenContent/AbilityMenu/AbilitySelectionTypes/KiraSelectionMenu";
import { PhaseType, PlayerIndex } from "./gameState.d";
import { translateChecked } from "./lang";
import { Role } from "./roleState.d";
import abilitiesJson from "../resources/abilityId.json";


export type AbilityJsonData = Partial<Record<ControllerIDLink, SingleAbilityJsonData>>;
export type SingleAbilityJsonData = {
    midnight: boolean,
}

export function allAbilitiesJsonData(): AbilityJsonData {
    return abilitiesJson;
}
export function singleAbilityJsonData(link: ControllerIDLink): SingleAbilityJsonData | null {
    return allAbilitiesJsonData()[link]??null;
}


export type AbilityInput = {
    id: ControllerID, 
    selection: AbilitySelection
}


export type SavedControllersMap = {
    save: ListMapData<ControllerID, SavedController>
}

export type SavedController = {
    selection: AbilitySelection,
    availableAbilityData: {
        available: AvailableAbilitySelection,
        grayedOut: boolean,
        resetOnPhaseStart: PhaseType | null,
        dontSave: boolean
        defaultSelection: AbilitySelection,
        allowedPlayers: PlayerIndex[]
    }
}

export type ControllerID = {
    type: "role",
    player: PlayerIndex,
    role: Role,
    id: RoleControllerID,
} | {
    type: "forfeitVote",
    player: PlayerIndex,
} | {
    type: "pitchforkVote",
    player: PlayerIndex,
} | {
    type: "syndicateGunItemShoot",
} | {
    type: "syndicateGunItemGive",
};

export type RoleControllerID = number;

/// create a type that represnts all strings that look like "abilityId/role/1"

export type ControllerIDLink = (
    `role/${Role}/${RoleControllerID}` | 
    `${ControllerID["type"]}`
);

export function controllerIdToLink(id: ControllerID): ControllerIDLink {
    let out: ControllerIDLink = `${id.type}`;
    if (id.type === "role") {
        out += `/${id.role}/${id.id}`;
    }
    return out as ControllerIDLink;
}

/// if it doesnt exist then returns ""
export function translateControllerID(
    abilityId: ControllerID
): string {
    switch (abilityId.type) {
        case "role":
            return translateChecked("controllerId."+abilityId.role+"."+abilityId.id+".name")??"";
        default:
            return translateChecked("controllerId."+abilityId.type+".name")??"";
    }
}

export type AbilitySelection = {
    type: "unit",
} | {
    type: "boolean"
    selection: BooleanSelection
} | {
    type: "onePlayerOption"
    selection: OnePlayerOptionSelection
} | {
    type: "twoPlayerOption"
    selection: TwoPlayerOptionSelection
} | {
    type: "roleOption"
    selection: RoleOptionSelection
} | {
    type: "twoRoleOption"
    selection: TwoRoleOptionSelection
} | {
    type: "twoRoleOutlineOption"
    selection: TwoRoleOutlineOptionSelection
} | {
    type: "string",
    selection: StringSelection
} | {
    type: "kira",
    selection: KiraSelection
}

export function defaultAbilitySelection(available: AvailableAbilitySelection): AbilitySelection {
    switch (available.type) {
        case "unit":
            return {type: "unit"};
        case "boolean":
            return {type: "boolean", selection: false};
        case "onePlayerOption":
            return {type: "onePlayerOption", selection: null};
        case "twoPlayerOption":
            return {type: "twoPlayerOption", selection: [null, null]};
        case "roleOption":
            return {type: "roleOption", selection: null};
        case "twoRoleOption":
            return {type: "twoRoleOption", selection: [null, null]};
        case "twoRoleOutlineOption":
            return {type: "twoRoleOutlineOption", selection: [null, null]};
        case "string":
            return {type: "string", selection: ""};
        case "kira":
            return {type: "kira", selection: []};
    }
}


export type AvailableAbilitySelection = {
    type: "unit",
} | {
    type: "boolean",
} | {
    type: "onePlayerOption"
    selection: AvailableOnePlayerOptionSelection,
} | {
    type: "twoPlayerOption"
    selection: AvailableTwoPlayerOptionSelection,
} | {
    type: "roleOption"
    selection: AvailableRoleOptionSelection,
} | {
    type: "twoRoleOption"
    selection: AvailableTwoRoleOptionSelection,
} | {
    type: "twoRoleOutlineOption"
    selection: AvailableTwoRoleOutlineOptionSelection,
} | {
    type: "string"
} | {
    type: "kira",
    selection: AvailableKiraSelection
}


export type BooleanSelection = boolean;

export type OnePlayerOptionSelection = number | null;
export type AvailableOnePlayerOptionSelection = (number | null)[];

export type TwoPlayerOptionSelection = [number | null, number | null];
export type AvailableTwoPlayerOptionSelection = {
    availableFirstPlayers: (number | null)[],
    availableSecondPlayers: (number | null)[],
    canChooseDuplicates: boolean
}

export type RoleOptionSelection = Role | null;
export type AvailableRoleOptionSelection = (Role | null)[];


export type TwoRoleOptionSelection = [Role | null, Role | null];
export type AvailableTwoRoleOptionSelection = {
    availableRoles: (Role | null)[],
    canChooseDuplicates: boolean
};

export type TwoRoleOutlineOptionSelection = [PlayerIndex | null, PlayerIndex | null];
export type AvailableTwoRoleOutlineOptionSelection = (number | null)[];

export type StringSelection = string;

export type KiraSelection = ListMapData<PlayerIndex, KiraGuess>
export type AvailableKiraSelection = {
    countMustGuess: number
};