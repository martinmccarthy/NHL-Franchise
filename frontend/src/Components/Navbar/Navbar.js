import './Navbar.css';

import { useNavigate } from 'react-router-dom';

function Navbar({myTeam, teamHolder}) {
  const navigate = useNavigate();

  const goToReceiver = (link) => {
    navigate(link, {state: {myTeam: myTeam, teamHolder: teamHolder}});
  }

  return(
  <header>
    <div class="header">
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
      <div class="logo"><img src={myTeam.logo} width={50} alt={myTeam.name}/></div>
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
          
          <p>Home</p>
          <p onClick={() => goToReceiver('/Roster')}>Roster Management</p>
          <p>League Leaderboards</p>
        </div>
        <div class="blank"></div>
      </nav>
    </div>
  </header>
  )
}

export default Navbar;