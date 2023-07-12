import './MainMenu.css';
import {useState, useEffect, useCallback, useRef} from 'react';
import 'react-calendar/dist/Calendar.css';
import * as utils from '../util'
import { CompactPicker } from 'react-color';

import jsonData from '../../Roster_JSON/teams.json'

import { useNavigate } from 'react-router-dom';

function MainMenu() {
  const [rosterLoaded, setRosterLoaded] = useState(false);

  const formRef = useRef();

  const[myTeam, setMyTeam] = useState();
  const [teamHolder, setTeams] = useState([]);

  const [errorMsg, setErrorMsg] = useState();

  const initialPrimary = {
		displayColorPicker: false,
		color: {
		  r: '14',
		  g: '14',
		  b: '14',
		  a: '14',
		},
	}
  const initialSecondary = {
		displayColorPicker: false,
		color: {
		  r: '14',
		  g: '14',
		  b: '14',
		  a: '14',
		},
	}

  const [primaryColor, setPrimaryColor] = useState(initialPrimary);
  const [secondaryColor, setSecondaryColor] = useState(initialSecondary);
  const [teamName, setTeamName] = useState('');
  const [teamAbbr, setTeamAbbr] = useState('');
  const [teamLocation, setTeamLocation] = useState('');

  const handleNameChange = (e) => {setTeamName(e.target.value);};
  const handleAbbrChange = (e) => {setTeamAbbr(e.target.value);};
  const handleLocationChange = (e) => {setTeamLocation(e.target.value);};

  const setPrimary = (color) => { setPrimaryColor({ displayColorPicker: primaryColor.displayColorPicker, color: color.rgb });};
  const setSecondary = (color) => {setSecondaryColor({ displayColorPicker: secondaryColor.displayColorPicker, color: color.rgb });};


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(teamName);
    console.log(teamAbbr);
    console.log(teamLocation);
    if(teamName.length < 1) {
      setErrorMsg('Team name is required.')
      return;
    }
    if(teamAbbr.length !== 3) {
      setErrorMsg('Team abbreviation is required and must be 3 characters.')
      return;
    }
    if(teamLocation.length < 1) {
      setErrorMsg('Team location is required.')
      return;
    }
    const createdTeam = {
      name: teamName,
      abbreviation: teamAbbr,
      roster: {forwards: [], defense: [], goalies: []},
      colors: [primaryColor.color, secondaryColor.color]
    }

    navigate('/setup', {state: createdTeam})
  };


  const currentDay = new Date(2022, 9, 1);

  /* This useEffect is on component mount, it sets the rosters of each
    team on the page load, this can be setup with an API in a backend to
    allow for something like multiplayer trading and storing a user's rosters. */
  useEffect(() => {
    getActiveTeams();
  }, []);

  const navigate = useNavigate();

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

  function handleTeamSelect(team) {
    setMyTeam(team);
    forceUpdate();
  }

  function getStarted() {
    setRosterLoaded(true);
    navigate('/app', {state: {myTeam: myTeam, teamHolder: teamHolder, currentDay: currentDay}})
  }


  function hexToRgbA(hex, alpha){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    }
    throw new Error('Bad Hex');
}

  function getTeamGradient (team) {
    let primaryColors = [hexToRgbA(team.colors[0], .8), hexToRgbA(team.colors[1], .8)]
    var style = {
      color: '#fff',
      backgroundColor: '#f4f1de',
      background: `linear-gradient(to bottom, ${primaryColors.join(", 75%, ")})`,
      cursor: 'pointer',
      margin: '20px',
      textAlign: 'center',
      border: 'none',
      borderRadius: '50%',
      backgroundSize: '300% 100%',
      transition: `all 0.3s ease-in`,
      boxShadow: `0 1px 20px 0 ${hexToRgbA('#3d405b', .4)}`
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

  function getPrimaryStyle() {
    var textColor = "white"
    if(primaryColor.color.r + primaryColor.color.g + primaryColor.color.b === 765) textColor = "black";
    return {
      backgroundColor: "rgba(" + primaryColor.color.r + "," + primaryColor.color.g + "," + primaryColor.color.b + ",1)",
      height: "150px",
      width: "150px",
      textAlign: "center",
      color: textColor,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }
  }
  function getSecondaryStyle() {
    console.log(secondaryColor.color)
    var textColor = "white"
    if(secondaryColor.color.r + secondaryColor.color.g + secondaryColor.color.b === 765) textColor = "black";
    return {
      backgroundColor: "rgba(" + secondaryColor.color.r + "," + secondaryColor.color.g + "," + secondaryColor.color.b + ",1)",
      height: "150px",
      width: "150px",
      textAlign: "center",
      color: textColor,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }
  }


  return (
    <div className="App">
      {!rosterLoaded && 
      <div className='mainContainer'>
        <div className="title">
          <h1>NHL Be a GM</h1>
          <h3>An immersive NHL experience.</h3>
        </div>
        <div className="landingLogin">
          <p>Already have an account with us?</p>
          <button onClick={() => navigate('/login')}>Sign in here!</button>
          <p>Otherwise, create a team now to get started!</p>
        </div>
        <div className="logoContainer">
          <form ref={formRef} onSubmit={handleSubmit} className="form">
            <h1 className="formHeader">Create your team!</h1>
            <label htmlFor="team_name">Team Name:</label><br />
            <input
                type="text"
                id="name"
                name="team_name"
                value={teamName}
                onChange={handleNameChange}
                required
            />
            <label htmlFor="team_abbr">Team Abbreviation:</label><br />
            <input
                type="text"
                id="abbr"
                name="team_abbr"
                value={teamAbbr}
                onChange={handleAbbrChange}
                required
            />
            <label htmlFor="team_loc">Team Location:</label><br />
            <input
                type="text"
                id="abbr"
                name="team_loc"
                value={teamLocation}
                onChange={handleLocationChange}
                required
            />
            <label htmlFor="primaryColor">Team Primary Color:</label>
            <div className="colorHolder">
              <CompactPicker required onChange={setPrimary}/>
            </div>
            <label htmlFor="primaryColor">Team Secondary Color:</label>
            <div className="colorHolder">
             <CompactPicker required onChange={setSecondary}/>
            </div>
            {/* <button type="submit">Submit</button> */}
          </form>
          <div className="form submitForm">
            <h1>{teamLocation} {teamName}</h1>
            {teamAbbr.length > 0 && <h1>{teamAbbr}</h1>}
            <div className="colorsContainer">
              <div className="colorBlock" style={getPrimaryStyle()}>Primary</div>
              <div className="colorBlock" style={getSecondaryStyle()}>Secondary</div>
            </div>
            <button onClick={handleSubmit}>Get Started!</button> 
            <span>{errorMsg}</span>    
          </div>
          {/* <div className="logos">  
            {myTeam !== undefined && 
            <div className='preselectContainer'>
              <div className='preselectInfo'>
                <img src={myTeam.logo} alt={myTeam.name} width={'100em'}/>
                <h1>{myTeam.name}</h1>
                <h2>Team Overall: <strong className="secondary-color">{utils.calculateTeamRating(myTeam)}</strong></h2>
                <h2>Top Players:</h2>
                <ul className='topPlayers'>
                  {getTopPlayers(myTeam).map(player => (
                    <li>
                      {player.name} - <strong className='secondary-color'>{player.overall}</strong>
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
          </div> */}
        </div>
      </div>}
    </div>
  );
}

export default MainMenu;

