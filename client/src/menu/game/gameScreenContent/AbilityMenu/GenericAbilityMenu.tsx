import { ReactElement, useState } from "react";
import { 
    TwoPlayerOptionSelection, 
    TwoRoleOptionSelection, 
    AbilityID,
    AbilitySelection,
    translateAbilityId,
    AvailableAbilitySelection,
    TwoRoleOutlineOptionSelection,
    RoleOptionSelection
} from "../../../../game/abilityInput";
import React from "react";
import { usePlayerState } from "../../../../components/useHooks";
import { Button } from "../../../../components/Button";
import OnePlayerOptionSelectionMenu from "./AbilitySelectionTypes/OnePlayerOptionSelectionMenu";
import TwoRoleOutlineOptionSelectionMenu from "./AbilitySelectionTypes/TwoRoleOutlineOptionSelectionMenu";
import GAME_MANAGER from "../../../..";
import TwoRoleOptionSelectionMenu from "./AbilitySelectionTypes/TwoRoleOptionSelectionMenu";
import TwoPlayerOptionSelectionMenu from "./AbilitySelectionTypes/TwoPlayerOptionSelectionMenu";
import ChatMessage from "../../../../components/ChatMessage";
import StyledText from "../../../../components/StyledText";
import CheckBox from "../../../../components/CheckBox";
import KiraSelectionMenu, { KiraSelection } from "./AbilitySelectionTypes/KiraSelectionMenu";
import RoleOptionSelectionMenu from "./AbilitySelectionTypes/RoleOptionSelectionMenu";


export default function GenericAbilityMenu(): ReactElement {
    const savedAbilities = usePlayerState(
        playerState => playerState.savedAbilities,
        ["yourSavedAbilities"]
    )!;

    return <>
        {savedAbilities.map(([id, saveData], i) => {
            return <SingleAbilityMenu
                key={i}
                abilityId={id}
                available={saveData.availableAbilityData.available}
                selected={saveData.selection}
            />
        })
    }</>
}


function SingleAbilityMenu(props: Readonly<{
    abilityId: AbilityID,
    key: number,
    available: AvailableAbilitySelection,
    selected: AbilitySelection
}>): ReactElement {

    const [open, setOpen] = useState<boolean>(true);

    const myIndex = usePlayerState(
        (playerState, gameState)=>playerState.myIndex
    )!;

    
    return <details key={props.key} className="role-specific-colors small-role-specific-menu" open={open}>
        <summary
            onClick={(e)=>{
                e.preventDefault();
                setOpen(!open);
            }}
        >
            <StyledText>{translateAbilityId(props.abilityId)}</StyledText>
        </summary>

        <ChatMessage message={{
            variant: {
                type: "abilityUsed",
                player: myIndex,
                abilityId: props.abilityId,
                selection: props.selected
            },
            chatGroup: "all"
        }}/>
        <SwitchSingleAbilityMenuType
            key={props.key}
            id={props.abilityId}
            available={props.available}
            selected={props.selected}
        />
    </details>
}


function SwitchSingleAbilityMenuType(props: Readonly<{
    key: number,
    id: AbilityID,
    available: AvailableAbilitySelection,
    selected: AbilitySelection
}>): ReactElement {

    const {key, id, available} = props;
    let selected: AbilitySelection = props.selected;

    switch(available.type) {
        case "unit":
            return <Button key={key}>
                {translateAbilityId(props.id)}
            </Button>
        case "boolean":{
            let bool;
            if(selected === null || selected.type !== "boolean"){
                bool = false;
            }else{
                bool = selected.selection;
            }
            return <div><CheckBox key={key} checked={bool} onChange={(x)=>{
                GAME_MANAGER.sendAbilityInput({
                    id, 
                    selection: {
                        type: "boolean",
                        selection: x
                    }
                });
            }}/></div>;
        }
        case "onePlayerOption":{
            
            let selectedPlayer;
            if(selected === null || selected.type !== "onePlayerOption"){
                selectedPlayer = null;
            }else{
                selectedPlayer = selected.selection;
            }
            
            return <OnePlayerOptionSelectionMenu
                key={key}
                availablePlayers={available.selection}
                selectedPlayer={selectedPlayer}
                onChoose={(player) => {
                    GAME_MANAGER.sendAbilityInput({
                        id, 
                        selection: {
                            type: "onePlayerOption",
                            selection: player
                        }
                    });
                }}
            />;
        }
        case "twoPlayerOption":{
            let input: TwoPlayerOptionSelection;
            if(
                props.selected === null ||
                props.selected.type !== "twoPlayerOption"
            ){
                input = [null, null];
            }else{
                input = props.selected.selection;
            }

            return <TwoPlayerOptionSelectionMenu
                key={props.key}
                selection={input}
                availableSelection={available.selection}
                onChoose={(selection) => {
                    GAME_MANAGER.sendAbilityInput({
                        id, 
                        selection: {
                            type: "twoPlayerOption",
                            selection
                        }
                    });
                }}
            />;
        }
        case "roleOption":{
            let input: RoleOptionSelection;
            if(
                props.selected === null ||
                props.selected.type !== "roleOption"
            ){
                input = null;
            }else{
                input = props.selected.selection;
            }

            return <RoleOptionSelectionMenu
                selection={input}
                enabledRoles={available.selection}
                onChoose={(selection) => {
                    GAME_MANAGER.sendAbilityInput({
                        id, 
                        selection: {
                            type: "roleOption",
                            selection
                        }
                    });
                }}
            />
        }
        case "twoRoleOption":{

            let input: TwoRoleOptionSelection;
            if(
                props.selected === null ||
                props.selected.type !== "twoRoleOption"
            ){
                input = [null, null];
            }else{
                input = props.selected.selection;
            }

            return <TwoRoleOptionSelectionMenu
                key={props.key}
                input={input}
                availableSelection={available.selection}
                onChoose={(selection) => {
                    GAME_MANAGER.sendAbilityInput({
                        id,
                        selection: {
                            type: "twoRoleOption",
                            selection: selection
                        }
                    });
                }}
            />;
        }
        case "twoRoleOutlineOption":{
            let input: TwoRoleOutlineOptionSelection;
            if(
                props.selected === null ||
                props.selected.type !== "twoRoleOutlineOption"
            ){
                input = [null, null];
            }else{
                input = props.selected.selection;
            }

            return <TwoRoleOutlineOptionSelectionMenu
                selection={input}
                available={available.selection}
                key={props.key}
                onChoose={(selection) => {
                    GAME_MANAGER.sendAbilityInput({
                        id,
                        selection: {
                            type: "twoRoleOutlineOption",
                            selection: selection
                        }
                    });
                }}
            />
        }
        case "kira":{
            let input: KiraSelection;
            if(
                props.selected === null ||
                props.selected.type !== "kira"
            ){
                input = [];
            }else{
                input = props.selected.selection;
            }

            return <KiraSelectionMenu
                key={props.key}
                selection={input}
                available={available.selection}
                onChange={(selection)=>{
                    GAME_MANAGER.sendAbilityInput({
                        id,
                        selection: {
                            type: "kira",
                            selection: selection
                        }
                    });
                }}
            />
        }
        default:
            return <></>;
    }
}
