import translate from "./lang";
import { Role, getFactionAlignmentFromRole, getFactionFromRole } from "./roleState.d";


export const FACTIONS = ["town", "mafia", "neutral"] as const;
export type Faction = typeof FACTIONS[number]
export function getAllFactionAlignments(faction: Faction): FactionAlignment[] {
    switch(faction){
        case "town": return [
            "townPower", "townKilling", "townProtective", "townInvestigative", "townSupport"
        ];
        case "mafia": return [
            "mafiaKilling", "mafiaDeception", "mafiaSupport", "mafiaPower"
        ];
        case "neutral": return [
            "neutralKilling", "neutralEvil", "neutralChaos"
        ];
    }
}
export function getRoleOutlineFromFaction(faction: Faction): RoleOutline {
    return {
        type: "faction",
        faction: faction
    }
}

export const FACTION_ALIGNMENTS = [
    "townPower","townKilling","townProtective","townInvestigative","townSupport",
    "mafiaKilling","mafiaDeception","mafiaSupport","mafiaPower",
    "neutralKilling","neutralEvil","neutralChaos"
] as const;
export type FactionAlignment = typeof FACTION_ALIGNMENTS[number]

export function getFactionFromFactionAlignment(factionAlignment: FactionAlignment): Faction {
    switch(factionAlignment){
        case "townPower": return "town";
        case "townKilling": return "town";
        case "townProtective": return "town";
        case "townInvestigative": return "town";
        case "townSupport": return "town";

        case "mafiaKilling": return "mafia";
        case "mafiaDeception": return "mafia";
        case "mafiaSupport": return "mafia";
        case "mafiaPower": return "mafia";

        case "neutralKilling": return "neutral";
        case "neutralEvil": return "neutral";
        case "neutralChaos": return "neutral";
    }
}
export function getAlignmentStringFromFactionAlignment(factionAlignment: FactionAlignment): string {
    const alignment = factionAlignment.replace(getFactionFromFactionAlignment(factionAlignment).toString(), "");
    return alignment.charAt(0).toLowerCase() + alignment.slice(1);
}
export function getRoleOutlineFromFactionAlignment(factionAlignment: FactionAlignment): RoleOutline {
    return {
        type: "factionAlignment",
        factionAlignment: factionAlignment
    }
}


export type RoleOutline = ({
    type: "any",
} | { 
    type: "faction",
    faction: Faction,
} | {
    type: "factionAlignment",
    factionAlignment: FactionAlignment,
} | {
    type: "exact",
    role: Role,
});
export type RoleOutlineType = RoleOutline["type"];

export function getFactionFromRoleOutline(roleOutline: RoleOutline): Faction | null {
    switch(roleOutline.type){
        case "any": return null;
        case "faction": return roleOutline.faction;
        case "factionAlignment": return getFactionFromFactionAlignment(roleOutline.factionAlignment);
        case "exact": return getFactionFromRole(roleOutline.role);
    }
}
export function getFactionAlignmentFromRoleOutline(roleOutline: RoleOutline): FactionAlignment | null {
    switch(roleOutline.type){
        case "any": return null;
        case "faction": return null;
        case "factionAlignment": return roleOutline.factionAlignment;
        case "exact": return getFactionAlignmentFromRole(roleOutline.role);
    }
}

export function translateRoleOutline(roleOutline: RoleOutline): string | null {
    if(roleOutline.type === "any"){
        return translate("any");
    }
    if(roleOutline.type === "faction"){
        return translate("faction."+roleOutline.faction.toString())+" "+translate("any");
    }
    if(roleOutline.type === "factionAlignment"){
        return translate("faction."+getFactionFromFactionAlignment(roleOutline.factionAlignment))+" "+translate("alignment."+getAlignmentStringFromFactionAlignment(roleOutline.factionAlignment));
    }
    if(roleOutline.type === "exact"){
        return translate("role."+roleOutline.role+".name");
    }
    return null
}