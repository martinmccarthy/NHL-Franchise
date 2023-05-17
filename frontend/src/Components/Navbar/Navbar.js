import './Navbar.css';

import { useNavigate } from 'react-router-dom';

function Navbar({myTeam, teamHolder, currentDay}) {
  const navigate = useNavigate();

  const goToReceiver = (link) => {
    navigate(link, {state: {myTeam: myTeam, teamHolder: teamHolder, currentDay: currentDay}});
  }

  function getTeamGradient (team) {
    let primaryColors = [team.colors[0], team.colors[1]]
    var style = {
      color: '#fff',
      background: `linear-gradient(to right, ${primaryColors.join(", 75%, ")})`,
      backgroundSize: '200% 10%',
      transition: `all 0.3s ease-in`,
      boxShadow: `0 5px 20px 0 rgb(32, 38, 57)`,
      width: '100%'
    }
    return style;
  }


  return(
  <header>
    <div class="header" style={getTeamGradient(myTeam)}>
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
        <img className="hoverAbove" key={myTeam.abbreviation} src={myTeam.logo} alt={myTeam.name}/>
      </div>
      <nav class="menu">
        <div class="drawer">
          <button class="close-btn" aria-label="Close Menu">
            <svg
              height="24"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Close Menu"
              role="img"
            >
              <path d="M0 0h24v24H0z" fill="none"></path>
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              ></path>
            </svg>
          </button>
          
          <p onClick={() => (goToReceiver('/app'))}>Home</p>
          <p onClick={() => goToReceiver('/roster')}>Roster Management</p>
          <p onClick={() => goToReceiver('/league')}>League Leaderboards</p>
        </div>
        <div class="blank"></div>
      </nav>
    </div>
  </header>
  )
}

export default Navbar;