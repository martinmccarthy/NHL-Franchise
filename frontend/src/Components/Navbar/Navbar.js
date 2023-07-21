import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useContext, useEffect, useState } from 'react';
import {FaHockeyPuck} from "react-icons/fa";

import './Navbar.css';
import { Dropdown } from 'react-bootstrap';

function Navbar() {
  const {currentUser, dispatch} = useContext(AuthContext);
  const team = currentUser.team;
  const navigate = useNavigate();

  const [contextUpdate, setContextUpdate] = useState(false);
  useEffect(() => {
    setContextUpdate(!contextUpdate);
  }, [currentUser])

  const goToReceiver = (link) => {
    navigate(link);
  }

  function convertColorToString(color) { return "rgba(" + color.r + "," + color.g + "," + color.b + ",1)"; }

  function getTeamGradient () {
    let primaryColors = [convertColorToString(team.colors.primary), convertColorToString(team.colors.secondary)]

    var style = {
      color: '#fff',
      background: `linear-gradient(to right, ${primaryColors.join(", 75%, ")})`,
      backgroundSize: '200% 10%',
      transition: `all 0.3s ease-in`,
      boxShadow: `0 1px 10px 0 rgba(32, 38, 57, .24)`,
      width: '100%'
    }
    return style;
  }

  function doLogout() {
    dispatch("LOGOUT");
    navigate('/');
  }

  return(
  <header>
    <div class="header" style={getTeamGradient(team)}>
      <button class="menu-btn" aria-label="Open Menu">
        <svg
          height="24"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Open Menu"
          role="img"
        >
          <path d="M0 0h24v24H0z" fill="none"></path>
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
        </svg>
      </button>
      <div class="logo">
        <h1>{team.location} {team.name}</h1>
        {/* <img className="hoverAbove" key={team.abbreviation} src={myTeam.logo} alt={myTeam.name}/> */}
      </div>
      <nav class="menu">
        <div class="drawer">
          <Dropdown className='rightElement'>
            <Dropdown.Toggle className='toggle' id="dropdown-basic">
              Menu
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => (goToReceiver('/app'))}>Home</Dropdown.Item>
              <Dropdown.Item onClick={() => (goToReceiver('/store'))}>Store</Dropdown.Item>
              <Dropdown.Item onClick={() => (goToReceiver('/roster'))}>Roster</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown className='rightElement'>
            <Dropdown.Toggle className='toggle' id="dropdown-basic">
              {currentUser.username}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item><FaHockeyPuck /> {currentUser.pucks}</Dropdown.Item>
              <Dropdown.Item onClick={() => (doLogout())}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </nav>
    </div>
  </header>
  )
}

export default Navbar;