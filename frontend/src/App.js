import { Routes, Route, BrowserRouter as Router} from 'react-router-dom'
import MainMenu from './Components/MainMenu/MainMenu';
import RosterManagement from './Components/RosterManagement/RosterManagement';
import GameLanding from './Components/GameLanding/GameLanding';
import LeagueStats from './Components/LeagueStats/LeagueStats';
function App() {
  return (      
    <Router>
      <Routes>
        <Route path='/' element={<MainMenu />}  />
        <Route path='/app' element={<GameLanding />} />
        <Route path='/roster' element={<RosterManagement />} />
        <Route path='/league' element={<LeagueStats />} />
      </Routes>
    </Router>    
  );
}

export default App;