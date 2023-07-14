import Navbar from '../Navbar/Navbar';
import {useState, useCallback, useContext} from 'react';
import 'react-calendar/dist/Calendar.css';
import './GameLanding.css'
import PlayerStats from '../LeagueStats/PlayerStats';
import { Col, Container, Modal, Row } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import PlayerCard from '../PlayerCard/PlayerCard';
import { AuthContext } from '../../context/AuthContext';
import RosterDisplay from '../RosterDisplay/RosterDisplay';

function GameLanding() {
    const {currentUser} = useContext(AuthContext);

    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [modalPlayer, setModalPlayer] = useState(currentUser.team.roster[0])
    const handleClose = () => setShowPlayerModal(false);  

    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), [])

    function activatePlayerModal(player) {
      setModalPlayer(player);
      setShowPlayerModal(true);
    }

    function sellPlayer() {

    }

    return(
    <div className="loaded">
      <div>
        <Navbar />
      </div>
      <br />
      <div className="pageContainer">
        <div className="calendarHolder">
          <div className="rosterDisplay">
            <RosterDisplay />
          </div>
          {/* <Calendar myTeam={myTeam} teamHolder={gameTeamHolder} adjustTeamRecords={adjustTeamRecords} currentDay={currentDay}/> */}
        </div>
        <div className="teamPerformanceContainer">
          <div className='teamNameContainer'>
            <h1>
              {currentUser.team.name}
            </h1>
            <PlayerStats team={currentUser.team} activatePlayerModal={activatePlayerModal}/>
          </div>
        </div>
      </div>
      <Modal show={showPlayerModal} onHide={handleClose} dialogClassName="playerCard" centered size='lg'>
          <Modal.Body className="show-grid">
          <Container>
            <Col xs={12} md={6}>
              <PlayerCard player={modalPlayer} />
            </Col>
            <Col>
            <Row>
              <h1>{modalPlayer.name}</h1>
            </Row>
              <h2>Value: <strong>250</strong></h2>
              <button onClick={sellPlayer()}>Sell</button>
            </Col>
          </Container>
        </Modal.Body>
        <Modal.Footer>
            <button className="button" onClick={handleClose}>
                Close
            </button>
        </Modal.Footer>
      </Modal>
    </div>

  )
}

export default GameLanding;