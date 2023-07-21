import { Routes, Route, BrowserRouter as Router, Navigate} from 'react-router-dom'

/* Imports all of the main components of the website */
import MainMenu from './Components/MainMenu/MainMenu';
import GameLanding from './Components/GameLanding/GameLanding';
import LeagueStats from './Components/LeagueStats/LeagueStats';
import Store from './Components/Store/Store';
import Setup from './Components/Setup/Setup';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import Play from './Components/Play/Play';
import Roster from './Components/RosterManagement/Roster';

/* Imports necessary components for managing user data */
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import './App.css';
import Collection from './Components/Collections/Collections';

function App() {
  const {dispatch, currentUser} = useContext(AuthContext);

  const RequireAuth = ({children}) => {
    if(currentUser === null) return <Navigate to="/login" />
    const expirationTimestamp = currentUser.token.loginTime + currentUser.token.expiresIn * 1000; // Convert to milliseconds
    if(expirationTimestamp <= Date.now()) {
      dispatch('LOGOUT');
      return <Navigate to="/login" />
    }
    return (children);
  }

  /* can be useful to redirect back to home page */
  const NonAuthentication = ({children}) => {
    return !currentUser ? (children) : <Navigate to="/" />
  }

  return (      
    <Router>
      <Routes>
        <Route path='/' element={<MainMenu />}  />
        <Route path='/app' element={
          <RequireAuth>
             <GameLanding />
          </RequireAuth>
        }/>
        <Route path='/roster' element={
          <RequireAuth>
            <Roster />
          </RequireAuth>
        } />
        <Route path='/league' element={          
          <RequireAuth>
            <LeagueStats />
          </RequireAuth>
        }/>
        <Route path='/store' element={
          <RequireAuth>
            <Store />
          </RequireAuth>
        }/>
        <Route path='/play' element={
          <RequireAuth>
            <Play />
          </RequireAuth>
        }/>
        <Route path='/collect' element={
          <RequireAuth>
            <Collection />
          </RequireAuth>
        }/>
        <Route path='/setup' element={<Setup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </Router>    
  );
}

export default App;