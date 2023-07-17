import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "../RosterDisplay/RosterDisplay.css"
import Navbar from "../Navbar/Navbar";

function Roster() {
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

    function getBench() {
        var bench = [];
        for(let i = 0; i < team.roster.length; i++) {
            if(team.lineup.findIndex((player) => player.id === team.roster[i].id) > -1) continue;
            bench.push(team.roster[i]);
        }
        return bench;
    }

    return(
    <div>
        <Navbar />
        <div className="players">
            {getForwards().map((player) => (
                <div className="playerContainer forwards"><p>{player.name}</p></div>
            ))}
            {getDefense().map((player) => (
                <div className="playerContainer defense"><p>{player.name}</p></div>
            ))}
            {getGoalies().map((player) => (
                <div className="playerContainer goalies"><p>{player.name}</p></div>
            ))}
            <h1 style={{ width: "100%", textAlign: "center"}}>Bench</h1>
            <div className="benchHolder" style={{width: "100%"}}>
                {getBench().map((player => (
                    <div className="playerContainer bench"><p>{player.name}</p></div>
                )))}
            </div>
        </div>
    </div>)
}

export default Roster;