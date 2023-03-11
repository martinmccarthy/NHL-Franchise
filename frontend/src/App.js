/*  This will 100000% need to be split up into different components and functions,
    I am lazy though so this will do for now. */

import './App.css';
import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import teams from "@nhl-api/teams";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import * as utils from './util'


import { ListManager } from 'react-beautiful-dnd-grid';

import jsonData from './Roster_JSON/teams.json'

function App() {
  const [rosterLoaded, setRosterLoaded] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date('2022-10-07'))
  
  const[myTeam, setMyTeam] = useState();
  const [teamHolder, setTeams] = useState([]);

  const [editLineup, setEditLineup] = useState(false);
  const [trading, setTrading] = useState(false);
  const [tradingTeam, setTradingTeam] = useState();
  const [tradeLoaded, setTradeLoaded] = useState(false);
  const [myTrade, setMyTrade] = useState();
  const [opposingTrade, setOpposingTrade] = useState();

  /* This useEffect is on component mount, it sets the rosters of each
    team on the page load, this can be setup with an API in a backend to
    allow for something like multiplayer trading and storing a user's rosters. */
  useEffect(() => {
    getActiveTeams();
  }, []);

  /* This useEffect makes sure that the team is selected first before loading
     everything to make sure we aren't attempting to render undefined values */
  useEffect(() => {
    if(myTeam) setRosterLoaded(true);
  }, [myTeam])

  /* This useState and useCallback are used to trick react into re-rendering the page
     for any time it refuses to automatically refresh when a state updates. */
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), [])

  function getActiveTeams() {
    var currentTeams = teams.filter(team => team.isActive === true);

    // The API here has invalid links for the capitals and the flames so these two lines resolve that:
    currentTeams[13].logo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Washington_Capitals.svg/562px-Washington_Capitals.svg.png';
    currentTeams[18].logo = 'https://upload.wikimedia.org/wikipedia/en/thumb/6/61/Calgary_Flames_logo.svg/440px-Calgary_Flames_logo.svg.png';
    // The Kraken are not in the nhl-api/teams API, so I just made this small obj to add
    const KRAKEN = {
      id: 55,
      name: 'SEATTLE KRAKEN',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/48/Seattle_Kraken_official_logo.svg/440px-Seattle_Kraken_official_logo.svg.png',
      abbreviation: 'SEA'
    }

    currentTeams.push(KRAKEN);
    if(teamHolder.length === 0) {
      populateTeams(currentTeams);
    }
    return currentTeams;
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
      currentTeam.roster = getRoster(currentTeam);
      currentTeam.schedule = await getSchedule(currentTeam);

      teamsArray.push(currentTeam);
    }

    setTeams(teamsArray);
  }

  function getRoster(team) {
    /* This block of code splits the name of the input string into
       an array and grabs the json object based on the team's name  */
    let teamNameArray = team.name.toLowerCase().split(' ');
    let teamName = teamNameArray[teamNameArray.length - 1];
    let currentRoster = jsonData[teamName];
    
    return {
      forwards: currentRoster.forward,
      defense: currentRoster.defense,
      goalies: currentRoster.goalie
    }
  }

  async function getSchedule(selectedTeam) {
    var teamID = utils.returnTeamID(selectedTeam.name);
    /*  There's a very specific case here where the NHL scheduled games for the predators and sharks before the season
        started, because of this, we need to have a start date variable which changes if the team is them since the rest
        of the teams potentially have preseason games at that time. */
    var startDate;
    if(selectedTeam === 'SAN JOSE SHARKS' || selectedTeam === 'NASHVILLE PREDATORS') {
      startDate = '2022-10-07';
    }
    else {
      startDate = '2022-10-11';
    }
    return axios.get(`https://statsapi.web.nhl.com/api/v1/schedule?teamId=${teamID}&startDate=${startDate}&endDate=2023-04-14`).then( res => {
      return(res.data.dates);
    });
  }

  function handleTeamSelect(team) {
    setMyTeam(team);
  }

  /* populate Days will run into an issue once we fix the current one, basically
     because we are pulling the global schedule variable that is no longer used,
     we just have to grab the schedule of myTeam */
  function populateDays(date, view) {
    let activeTeams = teamHolder;
    if(view === 'month') {
      var schedule_day = date.toISOString().split('T')[0];

      const teamIndex = teamHolder.findIndex(team => team.id === myTeam.id);
      let schedule = teamHolder[teamIndex].schedule;

      /*  We grab the day on the schedule that is the current day on the calendar, if it contains
          the current day it'll return the index in the array, otherwise it'll give us -1, hence the
          i > -1 conditional */
      const i = schedule.findIndex(e => e.date === schedule_day);
      if (i > -1) {      
        /*  We check to see if the scheduled game today is home or away, since the game data given to us
            only specifies the teams, we just check to see if the ID of the away team is ours, if it is then
            it is a road game, if it isn't then it's a home game. */
        var teamID = myTeam.id;

        if(schedule[i].games[0].teams.away.team.id === teamID) {
          const j = activeTeams.findIndex(e => e.id === schedule[i].games[0].teams.home.team.id);
          return (<img width="50px" src={activeTeams[j].logo} alt={activeTeams[j].name}/>);
        }
        else {
          const j = activeTeams.findIndex(e => e.id === schedule[i].games[0].teams.away.team.id);
          return (<img width="50px" src={activeTeams[j].logo} alt={activeTeams[j].name}/>);
        }
      }
      else return;
    }
    return;
  }


  function getForwards(selectedTeam) {
    let team = teamHolder.findIndex(e => e.id === selectedTeam.id);
    return teamHolder[team].roster.forwards;
  }
  function getDefense(selectedTeam) {
    let team = teamHolder.findIndex(e => e.id === selectedTeam.id);
    return teamHolder[team].roster.defense;
  }
  function getGoalies(selectedTeam) {
    let team = teamHolder.findIndex(e => e.id === selectedTeam.id);
    return teamHolder[team].roster.goalies;
  }


  /* This just takes the cap hits in the player data and makes them readable, the reason this is
     necessary is because we're taking from the capfriendly website and the scraper returns an
     odd data array. */
  function parseCapHit(player) {
    if(player[0] === 'TOTAL') return;
    let yearsLeft = Number(player[1].split(' ')[0]);
    var caphits = []

    for(var i = 8; i < (yearsLeft + 8); i++) {
      /* The undefined here occurs because it can be the case where the capfriendly datatable
         doesn't display all the data in the table because the contract is longer than the display,
         in this case we just fill the array with the previous year's contract data based on how
         many years they have left. They technically could have different cap hits at these times but
         I personally don't want to go through and individually check every player to make sure. */
      if(player[i] === undefined) {
        caphits.push(caphits[caphits.length - 1]);
      }
      else {
        var hitString = player[i].split('$', 2)[1].replace(/,/g, '');
        caphits.push(Number(hitString));
      }
    }
    return '$' + numberWithCommas(averageCaphits(caphits));
  }
  
  /* These two functions are for display purposes on the screen, the averageCapHits function
     will probably be useful down the line to calculate a players caphit when signing them
     to a contract. */
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function averageCaphits(capHits) {
    return Math.round(capHits.reduce((prev, curr) => prev + curr) / capHits.length)
  }


  /* The roster is indexed based on the players positions on their lines, with this in mind
     the logic is built to put more weight on the top line than the next line and so on.
     The goal is to have incentive to have better players on the top lines and allow the
     algorithm to be built to favor more defensive impact the further down the lineup you
     go in the future. */
  function getTeamOverall(team) {
    let roster = team.roster;
    let topLineOverall = 0;
    let secondLineOverall = 0;
    let thirdLineOverall = 0;
    let fourthLineAndDepthOverall = 0;
    for(let i = 0; i < roster.forwards.length; i++) {
      if(i < 3) {
        topLineOverall += Number(roster.forwards[i][4]);
      }
      else if(i < 6) {
        secondLineOverall += Number(roster.forwards[i][4])
      }
      else if(i < 9) {
        thirdLineOverall += Number(roster.forwards[i][4])
      }
      else {
        fourthLineAndDepthOverall += Number(roster.forwards[i][4])
      }
    }    

    let topPairOverall = 0;
    let secondPairOverall = 0;
    let thirdPairAndDepthOverall = 0;

    for(let j = 0; j < roster.defense.length; j++) {
      if(j < 2) {
        topPairOverall += Number(roster.defense[j][4]);
      }
      else if(j < 4) {
        secondPairOverall += Number(roster.defense[j][4]);
      }
      else {
        thirdPairAndDepthOverall += Number(roster.defense[j][4]);
      }
    }

    let starterOverall = 0;
    let backupAndDepthOverall = 0;
    for(let k = 0; k < roster.goalies.length; k++) {
      if(k === 0) {
        starterOverall = Number(roster.goalies[k][4]);
      }
      else {
        backupAndDepthOverall += Number(roster.goalies[k][4]);
      }
    }

    topLineOverall = (topLineOverall / 300) * .5;
    secondLineOverall = (secondLineOverall / 300) * .25;
    thirdLineOverall = (thirdLineOverall / 300) * .15;
    fourthLineAndDepthOverall = (fourthLineAndDepthOverall / ((roster.forwards.length - 9) * 100)) * .1;
    let forwardOveralls = topLineOverall + secondLineOverall + thirdLineOverall + fourthLineAndDepthOverall;

    console.warn('defense overalls: ');
    console.log('top pair: ', topPairOverall, '\n',
                'second pair: ', secondPairOverall, '\n',
                'third pair: ', thirdPairAndDepthOverall, '\n');

    topPairOverall = (topPairOverall / 200) * .6;
    secondPairOverall = (secondPairOverall / 200) * .3;
    thirdPairAndDepthOverall = (thirdPairAndDepthOverall / ((roster.defense.length - 4) * 100)) * .1;
    let defenseOveralls = topPairOverall + secondPairOverall + thirdPairAndDepthOverall;

    starterOverall = (starterOverall / 100) * .7;
    backupAndDepthOverall = (backupAndDepthOverall / ((roster.goalies.length - 1) * 100)) * .3;
    let goalieOveralls = starterOverall + backupAndDepthOverall;

    console.log(forwardOveralls);
    console.log(defenseOveralls);
    console.log(goalieOveralls);

    return Math.round((forwardOveralls * 33) + (defenseOveralls * 33) + (goalieOveralls * 33));
  }

  function tileDisabled({ date, view }) {
    return date < currentDate;
  }

  function simulateToDate(date) {
    let iterationDate = currentDate; 

    while(iterationDate < date) {
      let tempDate = new Date((iterationDate).valueOf() + 1000*3600*24);
      let tempDate2 = new Date((iterationDate).valueOf() - 1000*3600*24);
      let schedule_string = tempDate2.toISOString().split('T')[0];
      simulateGames(schedule_string);
      setCurrentDate(tempDate);
      iterationDate = tempDate;
    }
    forceUpdate();
  }

  function simulateGames(date) {
    let allTeams = teamHolder;
    axios.get(`https://statsapi.web.nhl.com/api/v1/schedule?startDate=${date}&endDate=${date}`).then( res => {
      if(res.data.totalGames === 0) return;
      let allGames = res.data.dates[0].games;
      for(let i = 0; i < allGames.length; i++) {
        /* Because the preds and sharks start early this year, there are preseason games going on at the same time
           as the regular season games that they are having, we just skip those with the PR game type because of this */
        if(allGames[i].gameType === 'PR') continue;

        let teams = allGames[i].teams;
        let awayTeam = teams.away.team;
        let homeTeam = teams.home.team;

        // let personalTeamID = utils.returnTeamID(myTeam);
        const awayIndex = teamHolder.findIndex(e => e.id === awayTeam.id);
        const homeIndex = teamHolder.findIndex(e => e.id === homeTeam.id);
        
        /* Math.random isn't seeded in JS, so in order to add a random factor to
           our function we create an array that has a max of 256 (based on the 8 bits
           from Uint8) and check to see if it is greater than the halfway point. There
           is more that will factor into this, such as team overall */
        var typedArray = new Uint8Array(1);
        crypto.getRandomValues(typedArray);
        if(typedArray[0] + (getTeamOverall(allTeams[homeIndex]) / 2) > (256 / 2)) {
          allTeams[homeIndex].wins = allTeams[homeIndex].wins + 1;
          allTeams[awayIndex].losses = allTeams[awayIndex].losses + 1;
          setTeams(allTeams);
        }
        else {
          allTeams[awayIndex].wins = allTeams[awayIndex].wins + 1;
          allTeams[homeIndex].losses = allTeams[homeIndex].losses + 1;
          setTeams(allTeams);
        }
      }
    });
  }

  /* This function finds the top teams in a division based on the teams you give it, it's not hard coded to 8 teams,
     so if we want to add more teams to a division (expansion feature) we're allowed to. */
  function findTopThree(teams) {
    let topThree = [];
  
    for(let i = 0; i < teams.length; i++) {
      if(topThree.length < 3) {
        topThree.push(teams[i]);
      }
      else if((topThree[0].wins < teams[i].wins) && (topThree[1].wins < teams[i].wins) && (topThree[2].wins < teams[i].wins)) {
        const lowestTeam = topThree.reduce(
          (acc, loc) =>
            acc.wins < loc.wins
              ? acc
              : loc
        )
        let spliceIndex = topThree.findIndex(team => team === lowestTeam);
        topThree.splice(spliceIndex, 1);
        topThree.push(teams[i]);
        
      }
    }

    return topThree;
  }

  function getAllOtherTeams() {
    let otherTeams = [];
    for(let i = 0; i < teamHolder.length; i++) {
      if(teamHolder[i] === myTeam) continue;
      otherTeams.push(teamHolder[i]);
    }

    return otherTeams;
  }

  function checkForPlayoffs() {
    let metroTeams = teamHolder.filter(team => team.division === 'metro');
    let atlanticTeams = teamHolder.filter(team => team.division === 'atlantic');
    let pacificTeams = teamHolder.filter(team => team.division === 'pacific');
    let centralTeams = teamHolder.filter(team => team.division === 'central');
    
    let topMetroTeams = findTopThree(metroTeams);
    let topAtlanticTeams = findTopThree(atlanticTeams);
    let topPacificTeams = findTopThree(pacificTeams);
    let topCentralTeams = findTopThree(centralTeams);

    let userTeam = teamHolder.find(e => e.id === myTeam.id);
    if(userTeam.division === 'metro') {
      if(topMetroTeams.find(team => team === userTeam)) return true;
    }
    else if(userTeam.division === 'atlantic') {
      if(topAtlanticTeams.find(team => team === userTeam)) return true;
    }
    else if(userTeam.division === 'pacific') {
      if(topPacificTeams.find(team => team === userTeam)) return true;
    }
    else if(userTeam.division === 'central') {
      if(topCentralTeams.find(team => team === userTeam)) return true;
    }

    return false;
  }

  function getMyTeamWins() {
    let myIndex = teamHolder.findIndex(e => e.id === myTeam.id);
    return teamHolder[myIndex].wins
  }

  function getMyTeamLosses() {
    let myIndex = teamHolder.findIndex(e => e.id === myTeam.id);
    return teamHolder[myIndex].losses
  }

  /* These three functions are almost all the same thing except we replace
     the forwards, defense, and goalies respectivel, they call the force
     update to make react re-render and update them on screen. */
  function reorderForwards(sourceIndex, destinationIndex) {
    let updatedTeam = myTeam;

    const reorderedItems = utils.reorder(
      updatedTeam.roster.forwards,
      sourceIndex,
      destinationIndex
    );
    updatedTeam.roster.forwards = reorderedItems;
    console.log(myTeam.roster.forwards);
    console.log(reorderedItems);
    setMyTeam(updatedTeam);
    forceUpdate();
  };
  function reorderDefense(sourceIndex, destinationIndex) {
    let updatedTeam = myTeam;

    const reorderedItems = utils.reorder(
      updatedTeam.roster.defense,
      sourceIndex,
      destinationIndex
    );
    updatedTeam.roster.defense = reorderedItems;
    setMyTeam(updatedTeam);
    forceUpdate();
  }

  function reorderGoalies(sourceIndex, destinationIndex) {
    let updatedTeam = myTeam;

    const reorderedItems = utils.reorder(
      updatedTeam.roster.goalies,
      sourceIndex,
      destinationIndex
    );
    updatedTeam.roster.goalies = reorderedItems;
    setMyTeam(updatedTeam);
    forceUpdate();
  };


  function ListElement(player) {
    return(
      <div className='grid-item'>
        <div className='grid-item-content'>{player.player[0]}</div>
      </div>
    );
  }

  function setEditingLineup() {
    setEditLineup(!editLineup);
  }

  function openTradeList() {
    setTrading(!trading)
    setTradeLoaded(false);
  }

  function handleTradeTeamSelect(team) {
    setTradingTeam(team);
    setTradeLoaded(true);
    forceUpdate();
  }

  function setMyOffer(player) {
    setMyTrade(player);
    console.log(player);
  }
  function setOpposingOffer(player) {
    setOpposingTrade(player);
    console.log(player);
  }

  function executeTrade() {
    let opposingPlayerTeam = tradingTeam;
    let myPlayerTeam = myTeam;
    console.log(opposingTrade);
    if(opposingTrade[3].includes('LW') || opposingTrade[3].includes('C') || opposingTrade[3].includes('RW')) {
      opposingPlayerTeam.roster.forwards = utils.removePlayer(opposingPlayerTeam.roster.forwards, opposingTrade);
      myPlayerTeam.roster.forwards.push(opposingTrade);
    }
    else if(opposingTrade[3].includes('LD') || opposingTrade[3].includes('RD')) {
      opposingPlayerTeam.roster.defense = utils.removePlayer(opposingPlayerTeam.roster.defense, opposingTrade);
      myPlayerTeam.roster.defense.push(opposingTrade);
    }
    else {
      opposingPlayerTeam.roster.goalies = utils.removePlayer(opposingPlayerTeam.roster.goalies, opposingTrade);
      myPlayerTeam.roster.goalies.push(opposingTrade);
    }

    if(myTrade[3].includes('LW') || myTrade[3].includes('C') || myTrade[3].includes('RW')) {
      myPlayerTeam.roster.forwards = utils.removePlayer(myPlayerTeam.roster.forwards, myTrade);
      opposingPlayerTeam.roster.forwards.push(myTrade);
    }
    else if(myTrade[3].includes('LD') || myTrade[3].includes('RD')) {
      myPlayerTeam.roster.defense = utils.removePlayer(myPlayerTeam.roster.defense, myTrade);
      opposingPlayerTeam.roster.defense.push(myTrade);
    }
    else {
      myPlayerTeam.roster.goalies = utils.removePlayer(myPlayerTeam.roster.goalies, myTrade);
      opposingPlayerTeam.roster.goalies.push(myTrade);
    }

    setMyTeam(myPlayerTeam);
    setTradingTeam(opposingPlayerTeam);

    let allTeams = teamHolder;
    let myTeamIndex = allTeams.findIndex(team => team.name === myTeam.name);
    let opposingTeamIndex = allTeams.findIndex(team => team.name === tradingTeam);
    allTeams[myTeamIndex] = myPlayerTeam;
    allTeams[opposingTeamIndex] = opposingPlayerTeam;
    setTeams(allTeams);
    forceUpdate();
  }

  return (
    <div className="App">
      {!rosterLoaded && <div className="logos">
        <h1>Pick your franchise!</h1>
        <ul className='icons'>
        {teamHolder.map(team => (
          <li>
            <div className='imageContainer'>
              <img onClick={() => handleTeamSelect(team)} width="100px" key={team.id} src={team.logo} alt={team.name}/>
            </div>
          </li>
        ))}
        </ul>
      </div>}

      {rosterLoaded && (
        <div className="loaded">
          <div className="myTeamPlayers">
            <img src={myTeam.logo} width={'250px'} alt={myTeam.name}/>
            <h2>Team overall: {getTeamOverall(myTeam)}</h2>

            {!editLineup && <button onClick={setEditingLineup}>Edit Lineups</button>}
            {editLineup && <button onClick={setEditingLineup}>Finish Editing Lineups</button>}

            {editLineup && <div className='lines containter'>
              <div className='dropzone'>
              <ListManager
                items={getForwards(myTeam)}
                direction="horizontal"
                maxItems={3}
                render={item => <ListElement player={item}/>}
                onDragEnd={reorderForwards}
              />
              </div>
              <div className='dropzone'>
              <ListManager
                items={getDefense(myTeam)}
                direction="horizontal"
                maxItems={2}
                render={item => <ListElement player={item}/>}
                onDragEnd={reorderDefense}
              />
              </div>
              <div className='dropzone'>
              <ListManager
                items={getGoalies(myTeam)}
                direction="horizontal"
                maxItems={1}
                render={item => <ListElement player={item}/>}
                onDragEnd={reorderGoalies}
              />
              </div>
            </div>}
            <br /><button onClick={openTradeList}>Look for a trade</button>
            {trading && <>
              <h1>Select a team to trade with: </h1>
              {getAllOtherTeams().map((team) => (
                <img onClick={() => handleTradeTeamSelect(team)} width="100px" key={team.id} src={team.logo} alt={team.name}/>
              ))}
              {tradeLoaded && <div className="tradePanel">
                <div className='myTeamTrading'>
                  <div className="forwards">
                    <h1>Forwards</h1>
                    <table className='table'>
                      <tr>
                        <th>Player</th>
                        <th>Position</th>
                        <th>Overall</th>
                        <th>Cap Hit</th>
                      </tr>
                      {getForwards(myTeam).map(player => (
                        <tr onClick={() => setMyOffer(player)}>
                          <td>{player[0]}</td>
                          <td>{player[3]}</td>
                          <td>{player[4]}</td>
                          <td>{parseCapHit(player)}</td>
                        </tr>
                      ))}
                    </table>
                  </div>
                  <div className="defense">
                    <h1>Defense</h1>
                    <table className='table'>
                      <tr>
                        <th>Player</th>
                        <th>Position</th>
                        <th>Overall</th>
                        <th>Cap Hit</th>
                      </tr>
                      {getDefense(myTeam).map(player => (
                        <tr onClick={() => setMyOffer(player)}>
                          <td>{player[0]}</td>
                          <td>{player[3]}</td>
                          <td>{player[4]}</td>
                          <td>{parseCapHit(player)}</td>
                        </tr>
                      ))}
                    </table>
                  </div>
                  <div className="goalie">
                    <h1>Goalies</h1>
                    <table className='table'>
                      <tr>
                        <th>Player</th>
                        <th>Position</th>
                        <th>Overall</th>
                        <th>Cap Hit</th>
                      </tr>
                      {getGoalies(myTeam).map(player => (
                        <tr onClick={() => setMyOffer(player)}>
                          <td>{player[0]}</td>
                          <td>{player[3]}</td>
                          <td>{player[4]}</td>
                          <td>{parseCapHit(player)}</td>
                        </tr>
                      ))}
                    </table>
                  </div>
                  {myTrade && <h1>{myTrade[0]}</h1>}
                </div>
                <div className="opposingTeamTrading">
                <div className="forwards">
                    <h1>Forwards</h1>
                    <table className='table'>
                      <tr>
                        <th>Player</th>
                        <th>Position</th>
                        <th>Overall</th>
                        <th>Cap Hit</th>
                      </tr>
                      {getForwards(tradingTeam).map(player => (
                        <tr onClick={() => setOpposingOffer(player)}>  
                          <td>{player[0]}</td>
                          <td>{player[3]}</td>
                          <td>{player[4]}</td>
                          <td>{parseCapHit(player)}</td>
                        </tr>
                      ))}
                    </table>
                  </div>
                  <div className="defense">
                    <h1>Defense</h1>
                    <table className='table'>
                      <tr>
                        <th>Player</th>
                        <th>Position</th>
                        <th>Overall</th>
                        <th>Cap Hit</th>
                      </tr>
                      {getDefense(tradingTeam).map(player => (
                        <tr onClick={() => setOpposingOffer(player)}>
                          <td>{player[0]}</td>
                          <td>{player[3]}</td>
                          <td>{player[4]}</td>
                          <td>{parseCapHit(player)}</td>
                        </tr>
                      ))}
                    </table>
                  </div>
                  <div className="goalie">
                    <h1>Goalies</h1>
                    <table className='table'>
                      <tr>
                        <th>Player</th>
                        <th>Position</th>
                        <th>Overall</th>
                        <th>Cap Hit</th>
                      </tr>
                      {getGoalies(tradingTeam).map(player => (
                        <tr onClick={() => setOpposingOffer(player)}>
                          <td>{player[0]}</td>
                          <td>{player[3]}</td>
                          <td>{player[4]}</td>
                          <td>{parseCapHit(player)}</td>
                        </tr>
                      ))}
                    </table>
                  </div>
                  {opposingTrade && <h1>{opposingTrade[0]}</h1>}
                </div>
                <div className='trade-execute'>
                  
                  <button onClick={executeTrade}>Propose Trade</button>

                </div>
              </div>}

            </>}
          </div>
          <div className="Season">
            <Calendar 
              minDate={new Date('2022-10-07')}
              maxDate={new Date('2023-04-17')}
              value={currentDate}
              minDetail='year'
              tileContent={({ date, view }) => populateDays(date, view)}
              onChange={simulateToDate}
              tileDisabled={tileDisabled}
            />
            <p>Current Record: {getMyTeamWins()}-{getMyTeamLosses()}</p>
            {(getMyTeamWins() + getMyTeamLosses()) >= 82 && (
              <div>
                {checkForPlayoffs() && <p>You made the playoffs!</p>}
                {!checkForPlayoffs() && <p>You missed the playoffs :(</p>}
              </div>
            )}
            <table>
              <tr>
                <th>Team</th>
                <th>Record</th>
              </tr>
              {teamHolder.map(team => (
                  <tr>
                    <td>{team.name}</td>
                    <td>{team.wins}-{team.losses}</td>
                  </tr>
                ))}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;