import './MainMenu.css';
import {useState, useEffect, useCallback, useRef} from 'react';
import 'react-calendar/dist/Calendar.css';
import * as utils from '../util'
import { CompactPicker } from 'react-color';
import jsonData from '../../Roster_JSON/teams.json'
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';

function MainMenu() {
  const formRef = useRef();
  const [errorMsg, setErrorMsg] = useState();
  const [confirmStart, setConfirmStart] = useState(false);
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

  const handleClose = () => setConfirmStart(false);  

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(teamName);
    console.log(teamAbbr);
    console.log(teamLocation);
    
    const createdTeam = {
      name: teamName,
      abbreviation: teamAbbr,
      location: teamLocation,
      roster: [],
      colors: {primary: primaryColor.color, secondary: secondaryColor.color}
    }

    navigate('/setup', {state: createdTeam})
  };


  const currentDay = new Date(2022, 9, 1);

  const navigate = useNavigate();

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

  function checkStart() {
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

    setConfirmStart(true);
  }


  return (
    <div className="App">
      <div className='mainContainer'>
        <div className="header">
          <div className="title">
            <h1 style={{float: "left", marginLeft: "25px"}}>DYNASTY HOCKEY</h1>
          </div>
          <div className="landingLogin">
            <button className="signinButton" onClick={() => navigate('/login')}><FaUser /> Sign in!</button>
          </div>
        </div>
        <div className="logoContainer">
          <form ref={formRef} onSubmit={handleSubmit} className="form">
            <h1 className="formHeader">Create your team!</h1>
            <label htmlFor="team_loc">Team Location:</label><br />
            <input
                type="text"
                id="abbr"
                name="team_loc"
                value={teamLocation}
                onChange={handleLocationChange}
                required
            />
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
            <label htmlFor="primaryColor">Team Primary Color:</label>
            <div className="colorHolder">
              <CompactPicker required onChange={setPrimary}/>
            </div>
            <label htmlFor="primaryColor">Team Secondary Color:</label>
            <div className="colorHolder">
             <CompactPicker required onChange={setSecondary}/>
            </div>
            <button style={{margin: "15px"}} onClick={() => checkStart()}>Submit</button>
            <span style={{color: "red"}}>{errorMsg}</span>
          </form>
          
        </div>
      </div>
      <Modal show={confirmStart} onHide={handleClose} dialogClassName="playerCard" centered size='lg'>
        <Modal.Body className="show-grid">
          <div className="form submitForm">
            <h1>{teamLocation} {teamName}</h1>
            {teamAbbr.length > 0 && <h1>{teamAbbr}</h1>}
            <div className="colorsContainer">
              <div className="colorBlock" style={getPrimaryStyle()}>Primary</div>
              <div className="colorBlock" style={getSecondaryStyle()}>Secondary</div>
            </div>
            <button onClick={handleSubmit}>Get Started!</button> 
          </div>
        </Modal.Body>
        <Modal.Footer>
            <button className="button" onClick={handleClose}>
                Close
            </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default MainMenu;

