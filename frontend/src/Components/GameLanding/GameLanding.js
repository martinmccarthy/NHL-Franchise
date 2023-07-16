import Navbar from '../Navbar/Navbar';
import {useState, useContext, useEffect} from 'react';
import 'react-calendar/dist/Calendar.css';
import './GameLanding.css'
import PlayerStats from '../LeagueStats/PlayerStats';
import { Col, Container, Modal, Row } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import PlayerCard from '../PlayerCard/PlayerCard';
import { AuthContext } from '../../context/AuthContext';
import RosterDisplay from '../RosterDisplay/RosterDisplay';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../db/firebase';

function GameLanding() {
    const {currentUser, dispatch} = useContext(AuthContext);

    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [modalPlayer, setModalPlayer] = useState({name: 'Mathew Barzal'})
    const handleClose = () => setShowPlayerModal(false);  

    const [contextUpdate, setContextUpdate] = useState(false);
    useEffect(() => {
      setContextUpdate(!contextUpdate);
    }, [currentUser])

    function activatePlayerModal(player) {
      setModalPlayer(player);
      setShowPlayerModal(true);
    }

    function returnRosterIds(roster) {
      var ids = [];
      for(let i = 0; i < roster.length; i++) {
          ids.push(roster[i].id);
      }
      return ids;
  }

  function getValue(overall) {
    if(modalPlayer.overall >= 98) return 10000;
    else if(modalPlayer.overall >= 95) return 7500;
    else if(modalPlayer.overall >= 90) return 5000;
    else if(modalPlayer.overall >= 87) return 2500;
    else if(modalPlayer.overall >= 85) return 1500;
    else if(modalPlayer.overall >= 80) return 1000;
    else if(modalPlayer.overall >= 78) return 750;
    else if(modalPlayer.overall >= 75) return 500;
    else if(modalPlayer.overall >= 70) return 250;
    else if(modalPlayer.overall >= 60) return 100;
    else return 50;
  }

    async function sellPlayer() {
      var sellValue = getValue(modalPlayer.overall);

      var currentRoster = currentUser.team.roster;
      console.log('modal player: ', modalPlayer);
      const index = currentRoster.findIndex((player) => player.id === modalPlayer.id);
      console.log('Modal Player ID: ', modalPlayer.id);
      console.log('Current Roster: ', currentRoster);
      console.log(index);
      if(index > -1) {
        currentRoster.splice(index, 1);
      }


      var contextPayload = Object.assign({}, currentUser);
      contextPayload.team = Object.assign({}, currentUser.team);
      contextPayload.team.roster = currentRoster;
      contextPayload.pucks += sellValue;

      var dbPayload = Object.assign({}, currentUser);
      dbPayload.team = Object.assign({}, currentUser.team);
      dbPayload.team.roster =  returnRosterIds(currentRoster);
      dbPayload.pucks += sellValue;
      var ref = doc(db, 'users', currentUser.id);
      await updateDoc(ref, dbPayload);
      dispatch({type: "UPDATE", payload:contextPayload});
      handleClose();
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
            <RosterDisplay activatePlayerModal={activatePlayerModal} />
            <div className="gameplayNav">
              <div className='gameplayElement'>
                <p>Players</p>
              </div>
              <div className='gameplayElement'>
                <p>Collect</p>
              </div>
              <div className='gameplayElement'>
                <p onClick={() => {}}>Play</p>
              </div>
            </div>
          </div>
          {/* <Calendar myTeam={myTeam} teamHolder={gameTeamHolder} adjustTeamRecords={adjustTeamRecords} currentDay={currentDay}/> */}
        </div>
        <div className="teamPerformanceContainer">
          <div className='teamNameContainer'>
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
              <h2>Value: <strong>{getValue(modalPlayer.overall)}</strong></h2>
              <button onClick={sellPlayer}>Sell</button>
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