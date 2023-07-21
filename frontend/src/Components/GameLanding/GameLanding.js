import Navbar from '../Navbar/Navbar';
import {useState, useContext, useEffect} from 'react';
import 'react-calendar/dist/Calendar.css';
import './GameLanding.css'
import PlayerStats from '../LeagueStats/PlayerStats';
import { Col, Container, Modal, Row } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import PlayerCard from '../PlayerCard/PlayerCard';
import { AuthContext } from '../../context/AuthContext';
import RosterDisplay from '../RosterManagement/RosterDisplay';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../db/firebase';
import { calculateDefenseRating, calculateForwardRating, calculateGoalieRating, calculateTeamRating } from '../util';
import { useNavigate } from 'react-router-dom';

function GameLanding() {
    const naviate = useNavigate();
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
    if(overall >= 98) return 10000;
    else if(overall >= 95) return 7500;
    else if(overall >= 90) return 5000;
    else if(overall >= 87) return 2500;
    else if(overall >= 85) return 1500;
    else if(overall >= 80) return 1000;
    else if(overall >= 78) return 750;
    else if(overall >= 75) return 500;
    else if(overall >= 70) return 250;
    else if(overall >= 60) return 100;
    else return 50;
  }

  function getForwards() {
    let team = currentUser.team;
    var forwards = [];
    for(let i = 0; i < team.lineup.length; i++) {
        if(team.lineup[i].positions.includes("LW") || team.lineup[i].positions.includes("RW") || team.lineup[i].positions.includes("C")) {
            forwards.push(team.lineup[i]);
        }
    }
    return forwards;
  }
  function getDefense() {
    let team = currentUser.team;
    var defense = [];
    for(let i = 0; i < team.lineup.length; i++) {
        if(team.lineup[i].positions.includes("LD") || team.lineup[i].positions.includes("RD")) {
            defense.push(team.lineup[i]);
        }
    }
    return defense;
}
function getGoalies() {
  let team = currentUser.team;
    var goalies = [];
    for(let i = 0; i < team.lineup.length; i++) {
        if(team.lineup[i].positions.includes("G")) {
            goalies.push(team.lineup[i]);
        }
    }
    return goalies;
}

  /* The sell player function updates the DB with the coins a player earns
      and the roster removed from the DB. This can be updated with a Firebase
      function like delete or something to make it easier, I'll have to look
      into it later. */
  async function sellPlayer() {
    var sellValue = getValue(modalPlayer.overall);

    var currentRoster = currentUser.team.roster;
    const index = currentRoster.findIndex((player) => player.id === modalPlayer.id);
    if(index > -1) {
      currentRoster.splice(index, 1);
    }

    var currentLineup = currentUser.team.lineup;
    const lineupIndex = currentLineup.findIndex((player) => player.id === modalPlayer.id);
    if(lineupIndex > -1) {
      currentLineup.splice(lineupIndex, 1);
      /*  automatically filling this in requires a bit of work, we need to find the current player's
          position and fill it in with another player who fits the mold of fwd, def, or goalie. */
    }

    var contextPayload = Object.assign({}, currentUser);
    contextPayload.team = Object.assign({}, currentUser.team);
    contextPayload.team.roster = currentRoster;
    contextPayload.team.lineup = currentLineup;
    contextPayload.pucks += sellValue;

    var dbPayload = Object.assign({}, currentUser);
    dbPayload.team = Object.assign({}, currentUser.team);
    dbPayload.team.roster =  returnRosterIds(currentRoster);
    dbPayload.pucks += sellValue;
    var ref = doc(db, 'users', currentUser.id);
    await updateDoc(ref, dbPayload);
    dispatch({type: "LOGIN", payload:contextPayload});
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
              <div onClick={() => naviate('/roster')} className='gameplayElement'>
                <p>Players</p>
              </div>
              <div onClick={() => naviate('/collect')} className='gameplayElement'>
                <p>Collect</p>
              </div>
              <div onClick={() => naviate('/play')} className='gameplayElement'>
                <p onClick={() => {}}>Play</p>
              </div>
            </div>
          </div>
          {/* <Calendar myTeam={myTeam} teamHolder={gameTeamHolder} adjustTeamRecords={adjustTeamRecords} currentDay={currentDay}/> */}
        </div>
        <div className="teamPerformanceContainer">
          <div className="overallContainer">
            <h1>Team Overall: <strong>{calculateTeamRating(currentUser.team.lineup)}</strong></h1>
            <h1>Forward Overall: <strong>{calculateForwardRating(getForwards())}</strong></h1>
            <h1>Defense Overall: <strong>{calculateDefenseRating(getDefense())}</strong></h1>
            <h1>Goalie Overall: <strong>{calculateGoalieRating(getGoalies())}</strong></h1>
          </div>
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