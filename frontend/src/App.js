import './App.css';
import {useState} from 'react';
import axios from 'axios';
import teams from "@nhl-api/teams";

function App() {
  const [rosterLoaded, setRosterLoaded] = useState(false);
  const [roster, setRoster] = useState([]);

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
    axios.get(`https://statsapi.web.nhl.com/api/v1/teams/${team.id}/roster`).then(res => {
      setRoster(res.data.roster); 
      setRosterLoaded(true); 
    }).catch(err => {
      console.log(err);
    }) 
  }

  return (
    <div className="App">
      <div>Team logos</div>
      <div className="logos">
        {getLogos().map(team => (
          <img onClick={() => getRoster(team)} width="50px" key={team.id} src={team.logo} alt={team.name}/>
        ))}
      </div>
      {rosterLoaded && (
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
      )}
    </div>
  );
}

export default App;
