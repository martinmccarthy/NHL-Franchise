/*  This will 100000% need to be split up into different components and functions,
    I am lazy though so this will do for now. */

import './App.css';
import {useState} from 'react';
import axios from 'axios';
import teams, { getTeamId } from "@nhl-api/teams";
import Calendar from 'react-calendar';

import jsonData from './Roster_JSON/teams.json'

function App() {
  const [rosterLoaded, setRosterLoaded] = useState(false);
  
  const [forwards, setForwards] = useState();
  const [defense, setDefense] = useState();
  const[goalie, setGoalie] = useState();

  const [schedule, setSchedule] = useState();
  
  const[myTeam, setMyTeam] = useState();

  function getLogos() {
    var currentTeams = teams.filter(team => team.isActive === true);

    // The API here has invalid links for the capitals and the flames so these two lines resolve that:
    currentTeams[13].logo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Washington_Capitals.svg/562px-Washington_Capitals.svg.png';
    currentTeams[18].logo = 'https://upload.wikimedia.org/wikipedia/en/thumb/6/61/Calgary_Flames_logo.svg/440px-Calgary_Flames_logo.svg.png';

    // The Kraken are not in the nhl-api/teams API, so I just made this small obj to add
    const KRAKEN = {
      id: 55,
      name: 'SEATTLE KRAKEN',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/48/Seattle_Kraken_official_logo.svg/440px-Seattle_Kraken_official_logo.svg.png'
    }

    currentTeams.push(KRAKEN);
    return currentTeams;
  }

  function getSchedule(selectedTeam) {
    var teamID;
    if(selectedTeam !== 'kraken') {
      teamID = getTeamId(selectedTeam);
    }
    else {
      teamID = 55;
    }

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
    })
  }

  function populateDays(date) {
    var teamLogos = getLogos();
    var schedule_day = date.toISOString().split('T')[0];

    /*  We grab the day on the schedule that is the current day on the calendar, if it contains
        the current day it'll return the index in the array, otherwise it'll give us -1, hence the
        i > -1 conditional/ */
    const i = schedule.findIndex(e => e.date === schedule_day);

    if (i > -1) {      
      /*  We check to see if the scheduled game today is home or away, since the game data given to us
          only specifies the teams, we just check to see if the ID of the away team is ours, if it is then
          it is a road game, if it isn't then it's a home game. */
      var teamID;
      if(myTeam !== 'kraken') {
        teamID = getTeamId(myTeam);
      }
      else {
        teamID = 55;
      }

      if(schedule[i].games[0].teams.away.team.id === teamID) {
        const j = teamLogos.findIndex(e => e.id === schedule[i].games[0].teams.home.team.id);
        console.log('schedule: ', schedule);
        console.log('logos: ', teamLogos);
        return (<img width="50px" src={teamLogos[j].logo} alt={teamLogos[j].name}/>);
      }
      else {
        const j = teamLogos.findIndex(e => e.id === schedule[i].games[0].teams.away.team.id);

        return (<img width="50px" src={teamLogos[j].logo} alt={teamLogos[j].name}/>);

      }
    }
    else return;
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

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function averageCaphits(capHits) {
    return Math.round(capHits.reduce((prev, curr) => prev + curr) / capHits.length)
  }

  function simSeason() {

  }

  function parseCapHit(player) {
    if(!player) return;
    let yearsLeft = Number(player[1].split(' ')[0]);
    var caphits = []

    for(var i = 8; i < (yearsLeft + 8); i++) {
      if(player[i] === undefined) {
        caphits.push(caphits[caphits.length - 1]);
      }
      else {
        var hitString = player[i].split('$', 2)[1].replace(/,/g, '');
        caphits.push(Number(hitString));
      }
    }

    return numberWithCommas(averageCaphits(caphits));
  }

  return (
    <div className="App">
      {!rosterLoaded && <div className="logos">
        <h1>Pick your franchise!</h1>
        {getLogos().map(team => (
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
              maxDate={new Date('2023-04-15')}
              defaultValue={new Date('2022-10-07')}
              minDetail='year'
              tileContent={({ date }) => populateDays(date)}/>
            <button onClick={simSeason}>
              Simulate a season
            </button>
          </div>

         
        </div>
      )}
    </div>
  );
}

export default App;
