import { useEffect, useState } from "react";
import PlayerCard from "../PlayerCard/PlayerCard";
import { addCollectionToDB, queryPlayersByTeam } from "../util";

function TeamCollection(props) {
    let team = props.team;
    const[roster, setRoster] = useState([]);

    useEffect(() => {getRoster()}, []);

    function returnRosterIds(roster) {
        var ids = [];
        for(let i = 0; i < roster.length; i++) {
            ids.push(roster[i].id);
        }
        return ids;
    }

    async function getRoster() {
        let tempRoster = await queryPlayersByTeam(team);
        let collectionName = team.name + ' Live Series'
        // await addCollectionToDB(collectionName, returnRosterIds(tempRoster));
        setRoster(tempRoster);
    }

    return(
        <div className="players">
            {roster.map((player) => (
                <div className="playerContainer">
                    <PlayerCard player={player} area={'collection'} style={{width: '150px', height:'200px'}}/>
                </div>
            ))}
        </div>
    )
}

export default TeamCollection;