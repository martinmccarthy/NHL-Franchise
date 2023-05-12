import { Routes, Route, BrowserRouter as Router} from 'react-router-dom'
import MainMenu from './Components/MainMenu/MainMenu';
import RosterManagement from './Components/RosterManagement/RosterManagement';

function App() {
  return (      
    <Router>
      <Routes>
        <Route path='/' element={<MainMenu />}  />
        <Route path='/roster' element={<RosterManagement />} />
      </Routes>
    </Router>    
  );
}

export default App;