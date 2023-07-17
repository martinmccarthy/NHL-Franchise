import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import PlayerCard from "../PlayerCard/PlayerCard";

import "./RosterDisplay.css"

function RosterDisplay(props) {
    const {currentUser} = useContext(AuthContext);

    const team = currentUser.team;

    function getForwards() {
        var forwards = [];
        for(let i = 0; i < team.lineup.length; i++) {
            if(team.lineup[i].positions.includes("LW") || team.lineup[i].positions.includes("RW") || team.lineup[i].positions.includes("C")) {
                forwards.push(team.lineup[i]);
            }
        }
        return forwards;
    }

    function getDefense() {
        var defense = [];
        for(let i = 0; i < team.lineup.length; i++) {
            if(team.lineup[i].positions.includes("LD") || team.lineup[i].positions.includes("RD")) {
                defense.push(team.lineup[i]);
            }
        }
        return defense;
    }

    function getGoalies() {
        var goalies = [];
        for(let i = 0; i < team.lineup.length; i++) {
            if(team.lineup[i].positions.includes("G")) {
                goalies.push(team.lineup[i]);
            }
        }
        return goalies;
    }

    return(<div className="players">
        {getForwards().map((player) => (
            <div className="playerContainer forwards"><p onClick={() => props.activatePlayerModal(player)}>{player.name}</p></div>
        ))}
        {getDefense().map((player) => (
            <div className="playerContainer defense"><p onClick={() => props.activatePlayerModal(player)}>{player.name}</p></div>
        ))}
        {getGoalies().map((player) => (
            <div className="playerContainer goalies"><p onClick={() => props.activatePlayerModal(player)}>{player.name}</p></div>
        ))}
    </div>)
}

export default RosterDisplay;