import Navbar from '../Navbar/Navbar';
import {useState, useCallback} from 'react';
import {useLocation} from "react-router-dom";
import jsonData from '../../Roster_JSON/teams.json'
import 'react-calendar/dist/Calendar.css';
import Calendar from '../Calendar/Calendar';
import '../../App.css'
import './GameLanding.css'
import * as utils from '../util'
import PlayerStats from '../LeagueStats/PlayerStats';
import players, { getPlayerId, getPlayerMugshot } from '@nhl-api/players'

import { Modal, Col, Row, Container } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import PlayerCard from '../PlayerCard/PlayerCard';


function GameLanding() {
    const location = useLocation();
    var myTeam = location.state.myTeam
    var teamHolder = location.state.teamHolder
    const [currentDay, setCurrentDay] = useState(location.state.currentDay);

    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [modalPlayer, setModalPlayer] = useState(myTeam.roster.forwards[0])
    const handleClose = () => setShowPlayerModal(false);  

    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), [])

    const [gameTeamHolder, setTeams] = useState(teamHolder);

    function getMyTeamWins() {
        let myIndex = gameTeamHolder.findIndex(e => e.name === myTeam.name);
        return gameTeamHolder[myIndex].record.wins;
    }
    function getMyTeamLosses() {
        let myIndex = gameTeamHolder.findIndex(e => e.name === myTeam.name);
        return gameTeamHolder[myIndex].record.losses;
    }

    function adjustTeamRecords(allTeams, currentDay) {
      setTeams(allTeams);
      setCurrentDay(currentDay)
      forceUpdate();
    }

    function activatePlayerModal(player) {
      setModalPlayer(player);
      setShowPlayerModal(true);
    }

    function getPlayerImage() {
      try {
        console.log(getPlayerMugshot({name: utils.removeAccents(modalPlayer.name), team: myTeam.abbreviation}))
        return getPlayerMugshot({name: utils.removeAccents(modalPlayer.name), team: myTeam.abbreviation})
      }
      catch(err) {
        console.log(err);
        return '/standardimg/noplayericon.png'
      }
    }

    return(
    <div className="loaded">
      <div>
        <Navbar myTeam={myTeam} teamHolder={gameTeamHolder} currentDay={currentDay}/>
      </div>
      <br />
      <div className="pageContainer">
        <div className="calendarHolder">
          <Calendar myTeam={myTeam} teamHolder={gameTeamHolder} adjustTeamRecords={adjustTeamRecords} currentDay={currentDay}/>
        </div>
        <div className="teamPerformanceContainer">
          <div className='teamNameContainer'>
            <h1>
              {myTeam.name}
            </h1>
            <h2>{getMyTeamWins()} - {getMyTeamLosses()}</h2>
            <PlayerStats givenTeam={myTeam} activatePlayerModal={activatePlayerModal}/>
          </div>
        </div>
      </div>
      <Modal show={showPlayerModal} onHide={handleClose} dialogClassName="playerCard" centered size='lg'>
        <Modal.Header>
          <h1>{modalPlayer.name}</h1>
        </Modal.Header>
        <Modal.Body className="show-grid">
          <PlayerCard player={modalPlayer} team={myTeam} />
          {/* <Container>
            <Col xs={12} md={4}>
              <img src={getPlayerImage()} alt={modalPlayer.name} width="200em"/>
            </Col>
            <Col>
            <Row>
              <h2>Overall: <strong>{modalPlayer.overall}</strong></h2>
              <h2>Potential: <strong>{modalPlayer.potential}</strong></h2>
            </Row>
              <h2>Goals: <strong>{modalPlayer.goals}</strong></h2>
              <h2>Assists: <strong>{modalPlayer.assists}</strong></h2>
              <h2>Points: <strong>{modalPlayer.goals + modalPlayer.assists}</strong></h2>
            </Col>
          </Container> */}
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