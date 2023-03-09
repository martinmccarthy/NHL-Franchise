/*  This will 100000% need to be split up into different components and functions,
    I am lazy though so this will do for now. */

import './App.css';
import {useState, useMemo} from 'react';
import axios from 'axios';
import teams, { getTeamId } from "@nhl-api/teams";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import * as utils from './util'
import Leaderboard from "./Leaderboard";

import getRandomValues from 'crypto-js';

import jsonData from './Roster_JSON/teams.json'

function App() {
  const [rosterLoaded, setRosterLoaded] = useState(false);
  
  const [forwards, setForwards] = useState();
  const [defense, setDefense] = useState();
  const[goalie, setGoalie] = useState();

  const [schedule, setSchedule] = useState();
  const [currentDate, setCurrentDate] = useState(new Date('2022-10-07'))
  var tempDate = new Date('2022-10-07');
  const[myTeam, setMyTeam] = useState();
  const [myTeamID, setMyTeamID] = useState(0);

  const[wins, setWins] = useState(0)
  const[losses, setLosses] = useState(0);

  const [teamHolder, setTeams] = useState([]);

  var otherTeams = [];

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
    return currentTeams;
  }

  function getSchedule(selectedTeam) {
    var teamID = utils.returnTeamID(selectedTeam);

    /*  There's a very specific case here where the NHL scheduled games for the predators and sharks before the season
        started, because of this, we need to have a start date variable which changes if the team is them since the rest
        of the teams potentially have preseason games at that time. */
    var startDate;
    if(selectedTeam === 'sharks' || selectedTeam === 'predators') {
      startDate = '2022-10-07';
    }
    else {
      startDate = '2022-10-11';
    }
    axios.get(`https://statsapi.web.nhl.com/api/v1/schedule?teamId=${teamID}&startDate=${startDate}&endDate=2023-04-14`).then( res => {
      setSchedule(res.data.dates);
      setRosterLoaded(true);
      populateTeams();
    });
  }

  function populateDays(date, view) {
    if(view === 'month') {
      var activeTeams = getActiveTeams();
      var schedule_day = date.toISOString().split('T')[0];

      /*  We grab the day on the schedule that is the current day on the calendar, if it contains
          the current day it'll return the index in the array, otherwise it'll give us -1, hence the
          i > -1 conditional/ */
      const i = schedule.findIndex(e => e.date === schedule_day);

      if (i > -1) {      
        /*  We check to see if the scheduled game today is home or away, since the game data given to us
            only specifies the teams, we just check to see if the ID of the away team is ours, if it is then
            it is a road game, if it isn't then it's a home game. */
        var teamID = utils.returnTeamID(myTeam);

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

  function getRoster(team, whoseTeam) {
    let teamArray = team.name.toLowerCase().split(' ');
    let teamName = teamArray[teamArray.length - 1];
    let currentRoster = jsonData[teamName];
    setMyTeam(teamName);

    if(whoseTeam === 'myteam') {
      delete currentRoster.forward[currentRoster.forward.length - 1];
      setForwards(currentRoster.forward);
      
      delete currentRoster.defense[currentRoster.defense.length - 1];
      setDefense(currentRoster.defense);
      
      delete currentRoster.goalie[currentRoster.goalie.length - 1];
      setGoalie(currentRoster.goalie);
    }

    getSchedule(teamName);
  }

  /* This just takes the cap hits in the player data and makes them readable, the reason this is
     necessary is because we're taking from the capfriendly website and the scraper returns an
     odd data array. */
  function parseCapHit(player) {
    if(!player) return;
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


  function populateTeams() {
    var activeTeams = getActiveTeams();
    var teamsArray = [];
    for(let i = 0; i < activeTeams.length; i++) {
      let currentTeam = {
        name: activeTeams[i].name,
        id: activeTeams[i].id,
        abbreviation: activeTeams[i].abbreviation,
        wins: 0,
        losses: 0
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
        currentTeam.division = 'pacific';
      }
      teamsArray.push(currentTeam);
    }

    setTeams(teamsArray);
  }

  const columns = useMemo(
    () => [
      {
        // first group - TV Show
        Header: "Team Name",
        // First group columns
        columns: [
          {
            Header: "Name",
            accessor: "team.name",
          },
        ],
      },
      {
        // Second group - Details
        Header: "Record",
        // Second group columns
        columns: [
          {
            Header: "Wins",
            accessor: "team.wins",
          },
          {
            Header: "Losses",
            accessor: "team.losses",
          },
        ],
      },
    ],
    []
  );

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
        if(typedArray[0] > (256 / 2)) {
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

  function checkForPlayoffs() {
    let metroTeams = teamHolder.filter(team => team.division === 'metro');
    let atlanticTeams = teamHolder.filter(team => team.division === 'atlantic');
    let pacificTeams = teamHolder.filter(team => team.division === 'pacific');
    let centralTeams = teamHolder.filter(team => team.division === 'central');
    
    let topMetroTeams = findTopThree(metroTeams);
    let topAtlanticTeams = findTopThree(atlanticTeams);
    let topPacificTeams = findTopThree(pacificTeams);
    let topCentralTeams = findTopThree(centralTeams);

    console.log(topMetroTeams);
    console.log(topAtlanticTeams);
    console.log(topPacificTeams);
    console.log(topCentralTeams);
  }

  function getMyTeamWins() {
    let myIndex = teamHolder.findIndex(e => e.id === utils.returnTeamID(myTeam));
    return teamHolder[myIndex].wins
  }

  function getMyTeamLosses() {
    let myIndex = teamHolder.findIndex(e => e.id === utils.returnTeamID(myTeam));
    console.log(teamHolder[myIndex]);
    return teamHolder[myIndex].losses
  }

  return (
    <div className="App">
      {!rosterLoaded && <div className="logos">
        <h1>Pick your franchise!</h1>
        {getActiveTeams().map(team => (
          <img onClick={() => getRoster(team, 'myteam')} width="100px" key={team.id} src={team.logo} alt={team.name}/>
        ))}
      </div>}

      {rosterLoaded && (
        <div className="loaded">
          <div className="myTeamPlayers">
            <div className="forwards">
              <h1>Forwards</h1>
              <table className='table'>
                <tr>
                  <th>Player</th>
                  <th>Position</th>
                  <th>Cap Hit</th>
                </tr>
                {Object.keys(forwards).map(player => (
                  <tr>
                    <td>{forwards[player][0]}</td>
                    <td>{forwards[player][3]}</td>
                    <td>{parseCapHit(forwards[player])}</td>
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
                  <th>Cap Hit</th>
                </tr>
                {Object.keys(defense).map(player => (
                  <tr>
                    <td>{defense[player][0]}</td>
                    <td>{defense[player][3]}</td>
                    <td>{parseCapHit(defense[player])}</td>
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
                  <th>Cap Hit</th>
                </tr>
                {Object.keys(goalie).map(player => (
                  <tr>
                    <td>{goalie[player][0]}</td>
                    <td>{goalie[player][3]}</td>
                    <td>{parseCapHit(goalie[player])}</td>
                  </tr>
                ))}
              </table>
            </div>
          </div>
          {/* <div className="tradingTeam">
            <h1>Pick a team to trade with</h1>
            {getLogos().map(team => (
              <img onClick={() => getRoster(team, 'myteam')} width="100px" key={team.id} src={team.logo} alt={team.name}/>
            ))}
          </div> */}
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
            {(wins + losses) === 82 && (
              checkForPlayoffs(),
              <div>
                {wins > 44 && <p>You made the playoffs!</p>}
                {wins <= 44 && <p>You missed the playoffs :(</p>}
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