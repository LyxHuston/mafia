import { ReactElement } from "react"
import React from "react"
import { useGameState } from "../../../../../components/useHooks";
import GAME_MANAGER from "../../../../..";
import { Role, RoleState } from "../../../../../game/roleState.d";
import RoleDropdown from "../../../../../components/RoleDropdown";
import translate from "../../../../../game/lang";
import TwoRoleOutlineOptionSelectionMenu from "../AbilitySelectionTypes/TwoRoleOutlineOptionSelectionMenu";
import { AbilityInput, AbilitySelection, TwoRoleOutlineOptionSelection } from "../../../../../game/abilityInput";


export default function OjoMenu(
    props: {
        roleState: RoleState & {type: "ojo"}
    }
): ReactElement | null {

    const sendRoleChosen = (roleChosen: Role | null) => {
        GAME_MANAGER.sendSetRoleChosen(roleChosen);
    }

    const dayNumber = useGameState(
        state=>state.dayNumber,
        ["phase"]
    )!;

    const onInput = (chosenOutlines: TwoRoleOutlineOptionSelection) => {
        const selection: AbilitySelection = {
            type: "twoRoleOutlineOption" as const,
            selection: chosenOutlines
        }

        const input: AbilityInput = {
            id: {
                type: "role",
                role: "ojo",
                id: 0
            },
            selection: selection
        }
        GAME_MANAGER.sendAbilityInput(input);
    }

    return <>
        <TwoRoleOutlineOptionSelectionMenu
            previouslyGivenResults={props.roleState.previouslyGivenResults}
            chosenOutlines={props.roleState.chosenOutline}
            onChoose={onInput}
        />
        {(dayNumber > 1) && <div>
            {translate("role.ojo.attack")}
            <RoleDropdown
                value={props.roleState.roleChosen}
                onChange={(roleOption)=>{
                    sendRoleChosen(roleOption)
                }}
                canChooseNone={true}
            />
        </div>}
    </>
}