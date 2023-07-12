import { Routes, Route, BrowserRouter as Router, Navigate} from 'react-router-dom'
import MainMenu from './Components/MainMenu/MainMenu';
import RosterManagement from './Components/RosterManagement/RosterManagement';
import GameLanding from './Components/GameLanding/GameLanding';
import LeagueStats from './Components/LeagueStats/LeagueStats';
import Store from './Components/Store/Store';
import Setup from './Components/Setup/Setup';
import Login from './Components/Login/Login';
import CreateAccount from './Components/CreateAccount/CreateAccount';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

function App() {
  const {currentUser} = useContext(AuthContext);

  const RequireAuth = ({children}) => {
    return currentUser ? (children) : <Navigate to="/login" />
  }

  console.log(currentUser);

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
            <RosterManagement />
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
        <Route path='/setup' element={<Setup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<CreateAccount />} />
      </Routes>
    </Router>    
  );
}

export default App;