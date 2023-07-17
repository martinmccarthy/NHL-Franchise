import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./RosterDisplay.css"
import Navbar from "../Navbar/Navbar";
import PlayerCard from "../PlayerCard/PlayerCard";
import { Modal } from "react-bootstrap";

function Roster() {
    const {currentUser} = useContext(AuthContext);
    const team = currentUser.team;

    const [forwards, setForwards] = useState([]);
    const [defense, setDefense] = useState([]);
    const [goalies, setGoalies] = useState([]);

    const [emptyForwards, setEmptyForwards] = useState(0);
    const [emptyDefense, setEmptyDefense] = useState(0);
    const [emptyGoalies, setEmptyGoalies] = useState(0);

    const [modalPlayer, setModalPlayer] = useState({name: 'Mathew Barzal', positions: ['C']});
    const [showSwapModal, setShowSwapModal] = useState(false);
    const handleClose = () => {setShowSwapModal(false)};

    useEffect(() => {
        function getForwards() {
            var tempForwards = [];
            for(let i = 0; i < team.lineup.length; i++) {
                if(team.lineup[i].positions.includes("LW") || team.lineup[i].positions.includes("RW") || team.lineup[i].positions.includes("C")) {
                    tempForwards.push(team.lineup[i]);
                }
            }
            if(tempForwards.length < 12) {
                setEmptyForwards(12 - tempForwards.length);
            }
            setForwards(tempForwards);
        }
    
        function getDefense() {
            var tempDefense = [];
            for(let i = 0; i < team.lineup.length; i++) {
                if(team.lineup[i].positions.includes("LD") || team.lineup[i].positions.includes("RD")) {
                    tempDefense.push(team.lineup[i]);
                }
            }
            if(tempDefense.length < 6) {
                setEmptyDefense(6 - tempDefense.length);
            }
            setDefense(tempDefense);
        }
    
        function getGoalies() {
            var tempGoalies = [];
            for(let i = 0; i < team.lineup.length; i++) {
                if(team.lineup[i].positions.includes("G")) {
                    tempGoalies.push(team.lineup[i]);
                }
            }
            if(tempGoalies.length < 2) {
                setEmptyGoalies(2 - tempGoalies.length);
            }
            setGoalies(tempGoalies);
        }

        console.log(emptyForwards, emptyDefense, emptyGoalies);

        getForwards();
        getDefense();
        getGoalies();
    }, [])

    function getBench() {
        var bench = [];
        for(let i = 0; i < team.roster.length; i++) {
            if(team.lineup.findIndex((player) => player.id === team.roster[i].id) > -1) continue;
            bench.push(team.roster[i]);
        }
        return bench;
    }

    function getBenchByPosition(player) {
        let positions = player.positions;
        console.log(positions);
        let bench = getBench();
        let possibleSwaps = [];
        if(positions.includes("LW") || positions.includes("RW") || positions.includes("C")) {
            for(let i = 0; i < bench.length; i++) {
                if(bench[i].positions.includes("LW") || bench[i].positions.includes("RW") || bench[i].positions.includes("C")) {
                    possibleSwaps.push(bench[i]);
                }
            }
        }
        else if(positions.includes("LD") || positions.includes("RD")) {
            for(let i = 0; i < bench.length; i++) {
                if(bench[i].positions.includes("LD") || bench[i].positions.includes("RD")) {
                    possibleSwaps.push(bench[i]);
                }
            }
        }
        else if(positions.includes("G")) {
            for(let i = 0; i < bench.length; i++) {
                if(bench[i].positions.includes("G")) {
                    possibleSwaps.push(bench[i]);
                }
            }
        }

        return possibleSwaps;
    }

    function getEmptyCards(position) {
        let returnArr = [];
        if(position === 'F') {
            for(let i = 0; i < emptyForwards; i++) {
                returnArr.push({});
            }
        }
        else if(position === 'D') {
            for(let i = 0; i < emptyDefense; i++) {
                returnArr.push({});
            }
        }
        else if(position === 'G') {
            for(let i = 0; i < emptyGoalies; i++) {
                returnArr.push({});
            }
        }

        console.log(returnArr);
        return returnArr;
    }

    function swapLineup() {

    }

    function openSwapModal(player) {
        setModalPlayer(player);
        setShowSwapModal(true);
    }

    return(
    <div>
        <Navbar />
        <div className="players">
            {forwards.map((player) => (
                <div className="forwards" onClick={() => openSwapModal(player)}>
                    <PlayerCard player={player} style={{height: "200px", width: "150px"}} />
                </div>
            ))}
            {emptyForwards > 0 && getEmptyCards('F').map((card) => (
                <div className="forwards" onClick={() => openSwapModal({name: 'empty', positions: ['LW', 'C', 'RW']})}>
                    <div className="player-card" style={{height: "200px", width: "150px"}}>
                        <div className="player-details">
                            <div className="player-name">Empty</div>
                        </div>
                    </div>
                </div>
            ))}
            {defense.map((player) => (
                <div className="defense" onClick={() => openSwapModal(player)}>
                    <PlayerCard player={player} style={{height: "200px", width: "150px"}} />
                </div>
            ))}
            {emptyDefense > 0 && getEmptyCards('D').map((card) => (
                <div className="defense" onClick={() => openSwapModal({name: 'empty', positions: ['LD', 'RD']})}>
                    <div className="player-card" style={{height: "200px", width: "150px"}}>
                        <div className="player-details">
                            <div className="player-name">Empty</div>
                        </div>
                    </div>
                </div>
            ))}
            {goalies.map((player) => (
                <div className="goalies" onClick={() => openSwapModal(player)}>
                    <PlayerCard player={player} style={{height: "200px", width: "150px"}} />
                </div>
            ))}
            {emptyGoalies > 0 && getEmptyCards('G').map((card) => (
                <div className="goalies" onClick={() => openSwapModal({name: 'empty', positions: ['G']})}>
                    <div className="player-card" style={{height: "200px", width: "150px"}}>
                        <div className="player-details">
                            <div className="player-name">Empty</div>
                        </div>
                    </div>
                </div>
            ))}
            
            <h1 style={{ width: "100%", textAlign: "center"}}>Bench</h1>
            <div className="benchHolder" style={{width: "100%"}}>
                {getBench().map((player => (
                    <div className="playerContainer bench"><p>{player.name}</p></div>
                )))}
            </div>
        </div>
        <Modal show={showSwapModal} onHide={handleClose} dialogClassName="playerCard" centered size='lg'>
            <Modal.Header>
                <h1>Swap Player</h1>
            </Modal.Header>
            <Modal.Body className="show-grid">
                <div className="benchHolder" style={{marginInline: "10px"}}>
                    {getBenchByPosition(modalPlayer).map(player => (
                        <div className="bench">
                            <PlayerCard player={player} style={{height: "200px", width: "150px"}} />
                        </div>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="button" onClick={handleClose}>
                    Close
                </button>
            </Modal.Footer>
      </Modal>
    </div>)
}

export default Roster;