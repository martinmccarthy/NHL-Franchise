import { useState } from "react";
import { useLocation } from "react-router-dom";
import { queryPlayersByPosition, returnAllDefense, returnAllForwards, returnAllGoalies } from "../util";
import PlayerCard from "../PlayerCard/PlayerCard";
import { query, where, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../db/firebase";


function Setup() {
    const location = useLocation();
    var team = location.state;
    console.log(team);

    const navigate = useNavigate();

    const [openedPlayers, setOpenedPlayers] = useState([]);

    function getRandomInt(min, max) {
        var range = max - min + 1;
        var byteArrayLength = Math.ceil(Math.log2(range) / 8); // Calculate the number of bytes needed based on the range
        
        var byteArray = new Uint8Array(byteArrayLength);
        window.crypto.getRandomValues(byteArray);
      
        var maxRange = Math.pow(256, byteArrayLength); // Calculate the maximum possible value from the generated bytes
        
        if (byteArray[0] >= Math.floor(maxRange / range) * range) {
          return getRandomInt(min, max); // If the generated value is outside the desired range, recursively call the function again
        }
        
        var randomValue = 0;
        for (var i = 0; i < byteArrayLength; i++) {
          randomValue += byteArray[i] * Math.pow(256, i); // Calculate the random value by combining the generated bytes
        }
        
        return min + (randomValue % range);
    }
          
    async function openPack() {
        var allPlayers = [];

        const forwardQuery = await queryPlayersByPosition(['LW', 'RW', 'C']);
        const defenseQuery = await queryPlayersByPosition(['LD', 'RD']);
        const goalieQuery = await queryPlayersByPosition(['G']);
        var forwards = [];
        while(forwards.length !== 12) {
            let random = getRandomInt(0, forwardQuery.length);
            let plyr = forwardQuery[random];
            if(forwards.find(x => x.name === plyr.name) !== undefined || plyr.overall >= 86) continue;
            forwards.push(plyr);
            allPlayers.push(plyr);
        }

        var defense = [];
        while(defense.length !== 6) {
            let random = getRandomInt(0, defenseQuery.length);
            let plyr = defenseQuery[random];
            if(defense.find(x => x.name === plyr.name) !== undefined || plyr.overall >= 86) continue;
            defense.push(plyr);
            allPlayers.push(plyr);
        }

        var goalies = [];
        while(goalies.length !== 2) {
            let random = getRandomInt(0, goalieQuery.length);
            let plyr = goalieQuery[random];
            if(goalies.find(x => x.name === plyr.name) !== undefined || plyr.overall >= 86) continue;
            goalies.push(plyr);
            allPlayers.push(plyr);
        }
        setOpenedPlayers(allPlayers);
    }

    function beginGame() {
        team.roster = openedPlayers;
        navigate('/register', {state: team});
    }

    return(
        <div>
            {openedPlayers.length === 0 && <div>
                <h1>Welcome to Hockey Dynasty!</h1>
                <h2>To get started, first lets build a roster</h2>
                <h2>Open the getting started pack to assemble a team</h2>
                <button onClick={openPack}>Open Pack</button>
            </div>}
            {openedPlayers.length > 0 && 
            <div>
                <h1>This will be your starter squad!</h1>
                <h2>Click next to get started</h2>
                <button onClick={beginGame}>Next</button>
                <div className="openedPlayers">
                    {openedPlayers.map(player => (
                        <div className="playerCardContainer">
                            <PlayerCard player={player} team={player.team} />
                        </div>
                    ))}
                </div>
            </div>}
        </div>
    )
}

export default Setup;