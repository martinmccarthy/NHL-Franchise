import { useContext, useEffect, useState } from "react";
import PlayerCard from "../PlayerCard/PlayerCard";
import { queryPlayersByTeam, updateUser } from "../util";
import { collection, doc, getDoc, where, setDoc } from "firebase/firestore";
import { db } from "../../db/firebase";
import { AuthContext } from "../../context/AuthContext";


function TeamCollection(props) {
    const {dispatch, currentUser} = useContext(AuthContext);

    let team = props.team;
    const [roster, setRoster] = useState([]);
    const [collectionData, setCollectionData] = useState([]);
    const [changedState, setChangedState] = useState(false);

    useEffect(() => {
        getRoster();
        getCollection();
    }, []);

    function returnRosterIds(roster) {
        var ids = [];
        for(let i = 0; i < roster.length; i++) {
            ids.push(roster[i].id);
        }
        return ids;
    }

    async function getCollection() {
        let collectionName = props.collectionName;
        let playerQuery = await getDoc(doc(collection(db, 'users'), currentUser.id));
        let collections = playerQuery.data().collections;
        const collectionIndex = collections.findIndex(collection => collection.name === collectionName);

        setCollectionData(collections[collectionIndex].players);
    }

    async function getRoster() {
        let tempRoster = await queryPlayersByTeam(team);
        let collectionName = team.name + ' Live Series'
        // await addCollectionToDB(collectionName, returnRosterIds(tempRoster));
        var dbPayload = Object.assign({}, currentUser);
        dbPayload.team = Object.assign({}, currentUser.team);
        dbPayload.team.roster = returnRosterIds(dbPayload.team.roster);
        dbPayload.team.lineup =  returnRosterIds(dbPayload.team.lineup);

        let tempCollections = dbPayload.collections;
        const index = tempCollections.findIndex(x => x.name === collectionName);
        if(index < 0) {
            let currentCollection = {
                name: collectionName,
                players: []
            }
            tempCollections.push(currentCollection);
            dbPayload.collections = tempCollections;
            await updateUser(dbPayload, currentUser.id);
        }
        setRoster(tempRoster);
    }
    
    function checkIfCollected(player) {
        const index = collectionData.indexOf(player.id);
        console.log('checking style');
        if(index > -1) {
            return true;
        }
        else return false;
    }

    async function collectPlayer(player) {
        console.log(player);
        console.log(currentUser.team.roster);
        let userRoster = currentUser.team.roster;
        const index = userRoster.findIndex(userPlayer => userPlayer.id === player.id);
        if(index < 0) return;
        else {
            console.log('is in');
            // add player to collection
            console.log(collectionData)
            if(collectionData.indexOf(player.id) > 0) return;
            let tempCollectionData = collectionData;
            tempCollectionData.push(player.id);
            setCollectionData(tempCollectionData);
            let collectionName = team.name + ' Live Series'
            let currentCollection = {
                name: collectionName,
                players: tempCollectionData
            }
            var dbPayload = Object.assign({}, currentUser);
            dbPayload.team = Object.assign({}, currentUser.team);
            dbPayload.team.roster = returnRosterIds(dbPayload.team.roster);
            dbPayload.team.lineup =  returnRosterIds(dbPayload.team.lineup);
            const collectionIndex = dbPayload.collections.findIndex(collection => collection.name === collectionName);
            dbPayload.collections[collectionIndex] = currentCollection;
            updateUser(dbPayload, currentUser.id);
        }
        setChangedState(!changedState);
    }

    function finishCollection() {
        if(collectionData.length === roster.length) {
            console.log('all collected');
        }
    }

    return(
        <div className="players">
            {roster.map((player) => (
                <div className="playerContainer" onClick={() => collectPlayer(player)}>
                    <PlayerCard player={player} area={'collection'} style={{width: '150px', height:'200px', isCollected: checkIfCollected(player)}}/>
                </div>
            ))}
        </div>
    )
}

export default TeamCollection;