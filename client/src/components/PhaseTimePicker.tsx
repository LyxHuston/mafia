import React, { ReactElement } from "react";
import { Phase, PhaseTimes } from "../game/gameState.d";
import translate from "../game/lang";
import { isValidPhaseTime } from "../game/gameManager";



export default function PhaseTimePicker(props: {
    disabled?: boolean,
    phaseTimes: PhaseTimes,
    onChange: (phaseTimes: PhaseTimes) => void,
}): ReactElement {

    const onChange = (phase: Phase, time: number) => {
        let newPhaseTimes = {...props.phaseTimes};
        newPhaseTimes[phase] = time;
        props.onChange(newPhaseTimes);
    }

    return <div>
        <TimePicker disabled={props.disabled} phase={"morning"} time={props.phaseTimes["morning"]} onChange={onChange}/>
        <TimePicker disabled={props.disabled} phase={"discussion"} time={props.phaseTimes["discussion"]} onChange={onChange}/>
        <TimePicker disabled={props.disabled} phase={"voting"} time={props.phaseTimes["voting"]} onChange={onChange}/>
        <TimePicker disabled={props.disabled} phase={"testimony"} time={props.phaseTimes["testimony"]} onChange={onChange}/>
        <TimePicker disabled={props.disabled} phase={"judgement"} time={props.phaseTimes["judgement"]} onChange={onChange}/>
        <TimePicker disabled={props.disabled} phase={"evening"} time={props.phaseTimes["evening"]} onChange={onChange}/>
        <TimePicker disabled={props.disabled} phase={"night"} time={props.phaseTimes["night"]} onChange={onChange}/>
    </div>
}


function TimePicker(props: {
    disabled?: boolean,
    phase: Phase,
    time: number,
    onChange: (phase: Phase, time: number) => void,
}): ReactElement {
    let phaseKey = "phase." + props.phase;
    
    return <div className="time-picker">
        <label htmlFor={phaseKey}>{translate(phaseKey)}:</label>
        <input
            disabled={props.disabled??false}
            name={phaseKey}
            type="text"
            value={props.time}
            onChange={(e)=>{
                let value = Number(e.target.value);

                if (!isValidPhaseTime(value)) return
                
                props.onChange(props.phase, value);
                
            }}
            onKeyUp={(e)=>{
                if(e.key !== 'Enter') return;
                
                props.onChange(props.phase, props.time);
            }}
        />
    </div>
}