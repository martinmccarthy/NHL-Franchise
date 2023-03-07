import './App.css';
import {useState} from 'react';
import axios from 'axios';
import teams from "@nhl-api/teams";

import jsonData from './Roster_JSON/teams.json'

function App() {
  const [rosterLoaded, setRosterLoaded] = useState(false);
  const [roster, setRoster] = useState([]);
  const [forwards, setForwards] = useState();
  const [forwardsActive, setForwardsActive] = useState(false);
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

  function getRoster(team) {
    let teamArray = team.name.toLowerCase().split(' ');
    let teamName = teamArray[teamArray.length - 1];
    let currentRoster = jsonData[teamName];
    console.log(currentRoster.forward);
    delete currentRoster.forward[currentRoster.forward.length - 1]
    setForwards(currentRoster.forward);
    setForwardsActive(true);
  }

  function parseCapHit(player) {
    if(!player) return;
    let yearsLeft = Number(player[1].split(' ')[0]);
    var caphits = []
    console.log('for player: ', player[0]);

    for(var i = 8; i < (yearsLeft + 8); i++) {
      console.log(player[i])
      if(player[i] === undefined) {
        caphits.push(caphits[caphits.length - 1]);
      }
      else {
        var hitString = player[i].split('$', 2)[1].replace(/,/g, '');
        caphits.push(Number(hitString));
      }
    }

    console.log(caphits);
    const average = list => list.reduce((prev, curr) => prev + curr) / list.length;

    return average(caphits);
  }

  return (
    <div className="App">
      {!rosterLoaded && <div className="logos">
        <h1>Pick your franchise!</h1>
        {getLogos().map(team => (
          <img onClick={() => getRoster(team)} width="100px" key={team.id} src={team.logo} alt={team.name}/>
        ))}
      </div>}
      {forwardsActive && (
        <div className="forwards">
          <h1>Forwards</h1>
          <table>
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
      )}

      {/* {rosterLoaded && (
        <div>
          <table>
            <tr>
              <th>Player</th>
              <th>Position</th>
              <th>Number</th>
            </tr>
            {roster.map(player => (
              <tr>
                <td>{player.person.fullName}</td>
                <td>{player.position.name}</td>
                <td>{player.jerseyNumber}</td>
              </tr>
            ))}
          </table>
        </div>
      )} */}
    </div>
  );
}

export default App;
