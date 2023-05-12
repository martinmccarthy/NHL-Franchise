import './MainMenu.css';
import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import * as utils from '../util'
import Navbar from '../Navbar/Navbar';

import jsonData from '../../Roster_JSON/teams.json'

function MainMenu() {
  const [rosterLoaded, setRosterLoaded] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date('2022-10-07'))
  
  const[myTeam, setMyTeam] = useState();
  const [teamHolder, setTeams] = useState([]);

  const [eastPlayoffs, setEastPlayoffs] = useState([]);
  const [westPlayoffs, setWestPlayoffs] = useState([]);

  /* This useEffect is on component mount, it sets the rosters of each
    team on the page load, this can be setup with an API in a backend to
    allow for something like multiplayer trading and storing a user's rosters. */
  useEffect(() => {
    getActiveTeams();
  }, []);

  /* This useEffect makes sure that the team is selected first before loading
      everything to make sure we aren't attempting to render undefined values */
  // useEffect(() => {
  //   if(myTeam) setRosterLoaded(true);
  // }, [myTeam])

  /* This useState and useCallback are used to trick react into re-rendering the page
      for any time it refuses to automatically refresh when a state updates. */
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), [])

  function getActiveTeams() {
    var teams = jsonData.teams
    var teamArr = [];
    for(var division in teams) {
      var divisionHolder = teams[division];
      for(var team in divisionHolder) {
        teamArr.push(divisionHolder[team]);
      }
    }
    setTeams(teamArr);
    setMyTeam(teamArr[0])
    return teamArr;
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

  function handleTeamSelect(team) {
    setMyTeam(team);
    forceUpdate();
  }

  function getStarted() {
    setRosterLoaded(true);
  }

  /* populate Days will run into an issue once we fix the current one, basically
      because we are pulling the global schedule variable that is no longer used,
      we just have to grab the schedule of myTeam */
  function populateDays(date, view) {
    let activeTeams = teamHolder;
    if(view === 'month') {
      var schedule_day = date.toISOString().split('T')[0];

      const teamIndex = teamHolder.findIndex(team => team.name === myTeam.name);


      let schedule = teamHolder[teamIndex].schedule;
      /*  We grab the day on the schedule that is the current day on the calendar, if it contains
          the current day it'll return the index in the array, otherwise it'll give us -1, hence the
          i > -1 conditional */
      const i = schedule.findIndex(e => e.date === schedule_day);
      if (i > -1) {      
        /*  We check to see if the scheduled game today is home or away, since the game data given to us
            only specifies the teams, we just check to see if the ID of the away team is ours, if it is then
            it is a road game, if it isn't then it's a home game. */
        var teamID = myTeam.name;
        if(schedule[i].games[0].teams.away.team.name === teamID) {
          const j = activeTeams.findIndex(e => e.name === schedule[i].games[0].teams.home.team.name);
          return (<img width="50px" src={activeTeams[j].logo} alt={activeTeams[j].name}/>);
        }
        else {
          const j = activeTeams.findIndex(e => e.name === schedule[i].games[0].teams.away.team.name);
          return (<img width="50px" src={activeTeams[j].logo} alt={activeTeams[j].name}/>);
        }
      }
      else return;
    }
    return;
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
        if(typedArray[0] + (utils.calculateTeamRating(allTeams[homeIndex]) / 2) > (256 / 2)) {
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
      forceUpdate();
    });
  }

  /* This function finds the top teams in a division based on the teams you give it, it's not hard coded to 8 teams,
      so if we want to add more teams to a division (expansion feature) we're allowed to. */
  function findTopFive(teams) {
    let topFive = [];
  
    for(let i = 0; i < teams.length; i++) {
      if(topFive.length < 5) {
        topFive.push(teams[i]);
      }
      else if((topFive[0].wins < teams[i].wins) && (topFive[1].wins < teams[i].wins) && (topFive[2].wins < teams[i].wins) && (topFive[3].wins < teams[i].wins) && (topFive[4].wins < teams[i].wins)) {
        const lowestTeam = topFive.reduce(
          (acc, loc) =>
            acc.wins < loc.wins
              ? acc
              : loc
        )
        let spliceIndex = topFive.findIndex(team => team === lowestTeam);
        topFive.splice(spliceIndex, 1);
        topFive.push(teams[i]);
        
      }
    }

    return topFive;
  }

  function checkForPlayoffs() {
    playoffCalculator();
    let userTeam = teamHolder.find(e => e.id === myTeam.id);
    if(userTeam.division === 'metro' || userTeam.division === 'atlantic') {
      if(eastPlayoffs.find(team => team === userTeam)) return true;
    }
    else if(userTeam.division === 'central' || userTeam.division === 'pacific') {
      if(westPlayoffs.find(team => team === userTeam)) return true;
    }

    return false;
  }

  function playoffCalculator() {
    let metroTeams = teamHolder.filter(team => team.division === 'metro');
    let atlanticTeams = teamHolder.filter(team => team.division === 'atlantic');
    let pacificTeams = teamHolder.filter(team => team.division === 'pacific');
    let centralTeams = teamHolder.filter(team => team.division === 'central');
    
    let topMetroTeams = findTopFive(metroTeams);
    let topAtlanticTeams = findTopFive(atlanticTeams);
    let topPacificTeams = findTopFive(pacificTeams);
    let topCentralTeams = findTopFive(centralTeams);


    topMetroTeams.sort((a, b) => a.wins - b.wins);
    topAtlanticTeams.sort((a, b) => a.wins - b.wins);
    topPacificTeams.sort((a, b) => a.wins - b.wins);
    topCentralTeams.sort((a, b) => a.wins - b.wins);

    let playoffsEast = [topMetroTeams[2], topMetroTeams[3], topMetroTeams[4], topAtlanticTeams[2], topAtlanticTeams[3], topAtlanticTeams[4]];
    let playoffsWest = [topPacificTeams[2], topPacificTeams[3], topPacificTeams[4], topCentralTeams[2], topCentralTeams[3], topCentralTeams[4]];

    let eastWildcard = [topMetroTeams[0], topMetroTeams[1], topAtlanticTeams[0], topAtlanticTeams[1]];
    let westWildcard = [topCentralTeams[0], topCentralTeams[1], topPacificTeams[0], topPacificTeams[1]];
    eastWildcard.sort((a, b) => a.wins - b.wins);
    westWildcard.sort((a, b) => a.wins - b.wins);
    
    eastWildcard.shift();
    eastWildcard.shift();
    westWildcard.shift();
    westWildcard.shift();

    playoffsEast.unshift(eastWildcard[0], eastWildcard[1]);
    playoffsWest.unshift(westWildcard[0], westWildcard[1]);

    setEastPlayoffs(playoffsEast);
    setWestPlayoffs(playoffsWest);
  }

  function getMyTeamWins() {
    let myIndex = teamHolder.findIndex(e => e.id === myTeam.id);
    return teamHolder[myIndex].wins
  }

  function getMyTeamLosses() {
    let myIndex = teamHolder.findIndex(e => e.id === myTeam.id);
    return teamHolder[myIndex].losses
  }

  function getTeamGradient (team) {
    let primaryColors = [team.colors[0], team.colors[1]]
    var style = {
      fontSize: '16px',
      fontWeight: '600',
      color: '#fff',
      background: `linear-gradient(to bottom, ${primaryColors.join(", 75%, ")})`,
      cursor: 'pointer',
      margin: '20px',
      textAlign: 'center',
      border: 'none',
      borderRadius: '10%',
      backgroundSize: '300% 100%',
      transition: `all 0.3s ease-in`,
      boxShadow: `0 5px 20px 0 rgb(32, 38, 57)`
    }
    return style;
  }

  function getTopPlayers(team) {
    var roster = team.roster;
    var fullTeamArr = []
    for(let i = 0; i < roster.forwards.length; i++) {
      fullTeamArr.push(roster.forwards[i])
    }
    for(let j = 0; j < roster.defense.length; j++) {
      fullTeamArr.push(roster.defense[j])
    }
    for(let k = 0; k < roster.goalies.length; k++) {
      fullTeamArr.push(roster.goalies[k])
    }
    // Sort players by rating in descending order
    fullTeamArr.sort((a, b) => b.overall - a.overall);

    // Get top three players
    const topThree = fullTeamArr.slice(0, 3);

    return topThree;
  }

  return (
    <div className="App">

      {!rosterLoaded && 
      <div className='mainContainer'>
        <div className="title">
          <h1>NHL Be a GM</h1>
          <h3>An immersive NHL experience.</h3>
        </div>
        <div className="logoContainer">
          <div className="logos">  
            {myTeam !== undefined && 
            <div className='preselectContainer'>
              <div className='preselectInfo'>
                <img src={myTeam.logo} alt={myTeam.name} width={'250px'}/>
                <h1>{myTeam.name}</h1>
                <h2>Team Overall: {utils.calculateTeamRating(myTeam)}</h2>
                <h2>Top Players:</h2>
                <ul className='topPlayers'>
                  {getTopPlayers(myTeam).map(player => (
                    <li>
                      {player.name} - <strong>{player.overall}</strong>
                    </li>
                  ))}
                </ul>
                <br/>
                <button onClick={getStarted} className='button'>Start New Franchise</button>
              </div>
            </div>}
            <div className="iconContainer">
              <ul className='icons'>
              {teamHolder.map(team => (
                <li onClick={() => handleTeamSelect(team)} style={getTeamGradient(team)}>
                  <div className='imageContainer'>
                    <img className="hoverAbove" key={team.abbreviation} src={team.logo} alt={team.name}/>
                    <img className="glow" src={team.logo} alt={team.name}/>
                  </div>
                </li>
              ))}
              </ul>
            </div>
          
          </div>
        </div>
      </div>}

      {rosterLoaded && (
        <div className="loaded">
          <div>
            <Navbar myTeam={myTeam} teamHolder={teamHolder}/>
          </div>
          <br />

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
            {(currentDate >= new Date('2023-04-17')) && (
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

export default MainMenu;

