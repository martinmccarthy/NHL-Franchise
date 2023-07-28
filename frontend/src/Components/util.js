import teams, { getTeamId } from "@nhl-api/teams";
import axios from 'axios';
import {players} from "../Roster_JSON/players";
import jsonData from "../Roster_JSON/teams.json"
import {players as apiPlayers} from "@nhl-api/players";
import {collection, doc, setDoc, query, where, getDocs, getDoc, documentId, updateDoc} from "firebase/firestore"
import { db } from "../db/firebase";
    
/* checkGameLocation simply checks to see if the game is home or away and returns that, it's here
    to clean up the code since it's useful in more than one place, mainly displaying the calendar
    itself and then when our algorithm is determining if the game is home or away */
export function checkGameLocation(schedule, date, selectedTeam) {
    let teamID = returnTeamID(selectedTeam);
    let schedule_string = date.toISOString().split('T')[0];
    const i = schedule.findIndex(e => e.date === schedule_string);
    if(schedule[i].games[0].teams.away.team.id === teamID) return 'away'
    else return 'home'
}

export function returnTeamID(selectedTeam) {
    var teamID;
    if(selectedTeam !== 'kraken' && selectedTeam !== 'SEATTLE KRAKEN') {
        teamID = getTeamId(selectedTeam);
        if(selectedTeam === 'stars' || selectedTeam === 'flames')
            teamID = teamID[0].id;
        else if(selectedTeam === 'blues')
            teamID = teamID[1].id;
    }
    else {
        teamID = 55;
    }
    return teamID;
}

export function reorder(list, startIndex, endIndex){
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
};

export function removePlayer(roster, player) {
    let spliceIndex = roster.findIndex(rosterPlayer => rosterPlayer === player);
    roster.splice(spliceIndex, 1);
    return roster;
}

export function calculateTeamRating(lineup) {
    let overall = 0;
    for(let i = 0; i < lineup.length; i++) {
        overall += lineup[i].overall;
    }

    return Math.floor((overall / (100 * 20)) * 100);
};

export function calculateForwardRating(lineup) {
    let overall = 0;
    for(let i = 0; i < lineup.length; i++) {
        overall += lineup[i].overall;
    }

    return Math.floor((overall / (100 * 12)) * 100);
}
export function calculateDefenseRating(lineup) {
    let overall = 0;
    for(let i = 0; i < lineup.length; i++) {
        overall += lineup[i].overall;
    }

    return Math.floor((overall / (100 * 6)) * 100);
}
export function calculateGoalieRating(lineup) {
    let overall = 0;
    for(let i = 0; i < lineup.length; i++) {
        overall += lineup[i].overall;
    }

    return Math.floor((overall / (100 * 2)) * 100);
}

async function getActiveTeams() {
    var currentTeams = teams.filter(team => team.isActive === true);

    // The API here has invalid links for the capitals and the flames so these two lines resolve that:
    currentTeams[13].logo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Washington_Capitals.svg/562px-Washington_Capitals.svg.png';
    currentTeams[18].logo = 'https://upload.wikimedia.org/wikipedia/en/thumb/6/61/Calgary_Flames_logo.svg/440px-Calgary_Flames_logo.svg.png';
    // The Kraken are not in the nhl-api/teams API, so I just made this small obj to add
    const KRAKEN = {
      id: 55,
      name: 'SEATTLE KRAKEN',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/48/Seattle_Kraken_official_logo.svg/440px-Seattle_Kraken_official_logo.svg.png',
      abbreviation: 'SEA',
      
    }

    currentTeams.push(KRAKEN);

    let teamsWithRoster = await populateTeams(currentTeams);

    return teamsWithRoster;
  }

async function populateTeams(activeTeams) {
    var teamsArray = [];
    for(let i = 0; i < activeTeams.length; i++) {
    let currentTeam = {
        name: activeTeams[i].name,
        id: activeTeams[i].id,
        abbreviation: activeTeams[i].abbreviation,
        wins: 0,
        losses: 0,
        logo: activeTeams[i].logo
    }
    if(activeTeams[i].abbreviation === 'NJD' || activeTeams[i].abbreviation === 'NYI' || activeTeams[i].abbreviation === 'NYR' ||
        activeTeams[i].abbreviation === 'PIT' || activeTeams[i].abbreviation === 'PHI' || activeTeams[i].abbreviation === 'CBJ' ||
        activeTeams[i].abbreviation === 'CAR' || activeTeams[i].abbreviation === 'WSH') {
        currentTeam.division = 'metro';
    }
    else if(activeTeams[i].abbreviation === 'TOR' || activeTeams[i].abbreviation === 'FLA' || activeTeams[i].abbreviation === 'TBL' ||
        activeTeams[i].abbreviation === 'OTT' || activeTeams[i].abbreviation === 'MTL' || activeTeams[i].abbreviation === 'BUF' ||
        activeTeams[i].abbreviation === 'BOS' || activeTeams[i].abbreviation === 'DET') {
        currentTeam.division = 'atlantic';
    }
    else if(activeTeams[i].abbreviation === 'EDM' || activeTeams[i].abbreviation === 'CGY' || activeTeams[i].abbreviation === 'SEA' ||
        activeTeams[i].abbreviation === 'VGK' || activeTeams[i].abbreviation === 'LAK' || activeTeams[i].abbreviation === 'VAN' ||
        activeTeams[i].abbreviation === 'ANA' || activeTeams[i].abbreviation === 'SJS') {
        currentTeam.division = 'pacific';
    }
    else if(activeTeams[i].abbreviation === 'COL' || activeTeams[i].abbreviation === 'DAL' || activeTeams[i].abbreviation === 'MIN' ||
        activeTeams[i].abbreviation === 'WPG' || activeTeams[i].abbreviation === 'NSH' || activeTeams[i].abbreviation === 'STL' ||
        activeTeams[i].abbreviation === 'ARI' || activeTeams[i].abbreviation === 'CHI') {
        currentTeam.division = 'central';
    }
    currentTeam.schedule = await getSchedule(currentTeam);

    teamsArray.push(currentTeam);
    }
    return teamsArray;
}

export async function getSchedule(selectedTeam) {
    console.log('getting schedule of ', selectedTeam) 
    var teamID = returnTeamID(selectedTeam.name);
    /*  There's a very specific case here where the NHL scheduled games for the predators and sharks before the season
        started, because of this, we need to have a start date variable which changes if the team is them since the rest
        of the teams potentially have preseason games at that time. */
    var startDate;
    if(selectedTeam.name === 'SAN JOSE SHARKS' || selectedTeam.name === 'NASHVILLE PREDATORS') {
        startDate = '2022-10-07';
    }
    else {
        startDate = '2022-10-11';
    }
    return axios.get(`https://statsapi.web.nhl.com/api/v1/schedule?teamId=${teamID}&startDate=${startDate}&endDate=2023-04-14`).then( res => {
        return(res.data.dates);
    });
}
    
export function getMonthFromString(mon){
    var d = Date.parse(mon + "1, 2012");
    if(!isNaN(d)){
       return new Date(d).getMonth() + 1;
    }
    return -1;
}


export function removeAccents(playerName) {
    return playerName.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export function getPlayerMugshot(player, teamAbbr) {
    console.log(teamAbbr);
    console.log(player);
    var foundPlayer = players.find(x => x.name === removeAccents(player));
    var playerId;
    if(foundPlayer) {
        playerId = foundPlayer.id;
    }

    const baseUrl = 'https://assets.nhle.com/mugs/nhl/20222023/'
    if(foundPlayer === undefined) return "https://assets.nhle.com/mugs/nhl/default-skater.png"
    var url = baseUrl + teamAbbr + '/' + playerId + '.png'
    console.log(url);
    return url;
}

/*  will be useful in the future if i can find the player ids, right now
    theres better things to do, this function simply adds the player
    to the list of all players in the case that they weren't found
    initially so that I don't need to manually do it (which i have to do rn) */
function addToPlayers(playerName) {
    var id = apiPlayers.getPlayerId(playerName);
    console.log(playerName);
    console.log(id);
}

export function returnAllForwards() {
    var teams = jsonData.teams
    var activePlayers = [];
    for(var division in teams) {
        var divisionHolder = teams[division];
        for(var team in divisionHolder) {
            var currTeam = divisionHolder[team];
            for(let idx in currTeam.roster.forwards) {
                let player = currTeam.roster.forwards[idx];
                player.team = currTeam
                activePlayers.push(player);
            }
        }
    }

    return activePlayers;
}

export function returnAllDefense() {
    var teams = jsonData.teams
    var activePlayers = [];
    for(var division in teams) {
        var divisionHolder = teams[division];
        for(var team in divisionHolder) {
            var currTeam = divisionHolder[team];
            for(let idx in currTeam.roster.defense) {
                let player = currTeam.roster.defense[idx];
                player.team = currTeam
                activePlayers.push(player);
            }
        }
    }

    return activePlayers;
}

export function returnAllGoalies() {
    var teams = jsonData.teams
    var activePlayers = [];
    for(var division in teams) {
        var divisionHolder = teams[division];
        for(var team in divisionHolder) {
            var currTeam = divisionHolder[team];
            for(let idx in currTeam.roster.goalies) {
                let player = currTeam.roster.goalies[idx];
                player.team = currTeam
                activePlayers.push(player);
            }
        }
    }

    return activePlayers;
}


function deleteTeamObjs(team) {
    return {
        name: team.name,
        abbrevation: team.abbreviation,
        colors: team.colors,
        logo: team.logo
    }
}

export async function returnAllActive() {
    var teams = jsonData.teams
    var activePlayers = [];
    for(var division in teams) {
        var divisionHolder = teams[division];
        for(var team in divisionHolder) {
            var currTeam = divisionHolder[team];
            console.log(currTeam);
            for(let idx in currTeam.roster.forwards) {
                let player = currTeam.roster.forwards[idx];
                let playerImage = getPlayerMugshot(player.name, currTeam.abbreviation);
                let playerObj = {
                    name: player.name,
                    overall: player.overall,
                    positions: player.positions,
                    image: playerImage,
                    age: player.age,
                    team: deleteTeamObjs(currTeam)
                }
                activePlayers.push(playerObj);
            }
            for(let idx in currTeam.roster.defense) {
                let player = currTeam.roster.defense[idx];
                let playerImage = getPlayerMugshot(player.name, currTeam.abbreviation);
                let playerObj = {
                    name: player.name,
                    overall: player.overall,
                    positions: player.positions,
                    image: playerImage,
                    age: player.age,
                    team: deleteTeamObjs(currTeam)
                }
                activePlayers.push(playerObj);
            }
            for(let idx in currTeam.roster.goalies) {
                let player = currTeam.roster.goalies[idx];
                let playerImage = getPlayerMugshot(player.name, currTeam.abbreviation);
                let playerObj = {
                    name: player.name,
                    overall: player.overall,
                    positions: player.positions,
                    image: playerImage,
                    age: player.age,
                    team: deleteTeamObjs(currTeam)
                }
                activePlayers.push(playerObj);
            }
        }
    }

    // for(var i = 0; i < activePlayers.length; i++) {
    //     console.log(activePlayers[i]);
    //     await addDoc(collection(db, "players"), activePlayers[i]);
    // }
    return activePlayers;
}

function buildPath(route) {
    var localPath = "http://localhost:2001/api" + route;
    var productionPath = "https://hockeymanager.co/api" + route;
    return (process.env.NODE_ENV === "development" ? localPath : productionPath)
};


export async function sendAPI(method, path, data = null) {    
    const config = {
        method,
        url: buildPath(path),
        params: '',
        data: ''
    }
    // console.log(config);
    if(method === 'get') config.params =  data;
    else config.data = data;
    const res = await axios(config);
    return res;
}

/*  This function is simple enough, enter the positions as an array if you want a specific position,
    or nothing if you want to query all of them. This can be scaled to add specific queries if the player
    might be in a certain collection say "legacy players" or something of that nature. Idk though I haven't
    implemented these things yet. */
export async function queryPlayersByPosition(positions = null) {
    var allPlayers = [];
    var q;
    if(positions === null) {
        q = query(collection(db, 'players'));
    }
    else {
        q = query(collection(db, 'players'), where('positions', 'array-contains-any', positions));
    }
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        let player = doc.data();
        player.id = doc.id;
        allPlayers.push(player);
    });

    return allPlayers;
}

export async function queryPlayer(playerId) {
    if(playerId === null) return;
    const playerCol = collection(db, 'players');
    const docRef = doc(playerCol, playerId);
    const snap = await getDoc(docRef);
    if(snap.exists()) {
        return snap.data();
    }

    return null;
}

export async function queryAllPlayersOnRoster(roster) {
    var allPlayers = [];
    for(let i = 0; i < Math.ceil(roster.length / 30); i++) {
        var elements = roster.slice(i * 30, i * 30 + 30);
        console.log(elements);
        var q = query(collection(db, 'players'), where(documentId(), 'in', elements));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            console.log(doc);
            let player = doc.data();
            player.id = doc.id;
            allPlayers.push(player);
        })    
    }
    console.log(allPlayers);
    return allPlayers;
}

export async function queryPlayersByTeam(team) {
    var allPlayers = [];
    console.log(team)
    var q = query(collection(db, 'players'), where('team.name', '==', team.name));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        let player = doc.data();
        player.id = doc.id;
        allPlayers.push(player);
    })

    console.log(allPlayers);

    return allPlayers;
}

export async function addCollectionToDB(collectionName, players) {
    /*  This variable name may look weird, but it's just because the sets of
        collecting players are called "Collections" and that's how they're stored
        in the DB. Maybe a better name could be used but I don't see it as a big deal. */
    const collectionsCollection = collection(db, 'collections');
    const docRef = doc(collectionsCollection, collectionName);
    const payload = {
        players: players
    }
    setDoc(docRef, payload);
}

export async function updateUser(payload, uid) {
    const userCollection = collection(db, 'users');
    const docRef = doc(userCollection, uid);
    setDoc(docRef, payload)
}

export async function updateAllPlayers() {
    const data = {
        collectionCard: false
    }
    let allPlayers = await getDocs(collection(db, "players"));
    allPlayers.forEach(document => {
        // var player = doc.data();
        // console.log(player);
        // player.id = doc.id;
        // allPlayers.push(player);
        let id = document.id;
        const coll = collection(db, 'players')
        const docRef = doc(coll, id);
        updateDoc(docRef, data);
    })
}

export async function queryPlayersByCollection(collectionName) {
    var q = query(collection(db, 'players'), where('team.name', '==', collectionName));
    const querySnapshot = await getDocs(q);
    var player;
    querySnapshot.forEach(document => {
        console.log(document);
        player = document.data();
        console.log(player);
        player.id = document.id;
    });
    return player;
}