import * as utils from '../util';
import { useState, useCallback, useEffect } from 'react';
import { ListManager } from 'react-beautiful-dnd-grid';
import {useLocation} from "react-router-dom";
import { ProgressBar } from "react-bootstrap"; 
import { Modal } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";

import Navbar from '../Navbar/Navbar';

import './Roster.css'

function RosterManagement() {
    const location = useLocation();
    var myTeam = location.state.myTeam
    var teamHolder = location.state.teamHolder
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), [])

    const [editLineup, setEditLineup] = useState(false);
    const [myTeamHolder, setMyTeam] = useState();

    const [trading, setTrading] = useState(false);
    const [tradingTeam, setTradingTeam] = useState();
    const [myTrade, setMyTrade] = useState([]);
    const [opposingTrade, setOpposingTrade] = useState([]);

    const tableStates = ['Forwards', 'Defense', 'Goalies']
    const [myIndex, setMyIndex] = useState(0);
    const [myString, setMyString] = useState('Forwards')
    const [opposingString, setOpposingString] = useState('Forwards')
    const [opposingIndex, setOpposingIndex] = useState(0);
    const [lineupIndex, setLineupIndex] = useState(0);
    const [lineupString, setLineupString] = useState('Forwards');
    const [rosterChangeHolder, setTeams] = useState(teamHolder);
    const [showTradeModal, setShowTradeModal] = useState(false);
    const [resultString, setResultString] = useState('');
    const [opposingTeamName, setOpposingTeamName] = useState('');
    function getAllOtherTeams() {
        let otherTeams = [];
        for(let i = 0; i < teamHolder.length; i++) {
            if(teamHolder[i] === myTeam) continue;
            otherTeams.push(teamHolder[i]);
        }
     
        return otherTeams;
    }

    useEffect(() => {
        setMyString(tableStates[myIndex])
    }, [myIndex]);
    useEffect(() => {
        setOpposingString(tableStates[opposingIndex])
    }, [opposingIndex]);
    useEffect(() => {
        setLineupString(tableStates[lineupIndex])
    }, [lineupIndex]);

    const handleOpen = () => setShowTradeModal(true);
    const handleClose = () => setShowTradeModal(false);
  /* These two functions are for display purposes on the screen, the averageCapHits function
     will probably be useful down the line to calculate a players caphit when signing them
     to a contract. */
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function parsePositionArray(player) {
        var str = '';
        for(let i = 0; i < player.positions.length; i++) {
            str = str.concat(player.positions[i])
            if(i === player.positions.length - 1) continue;
            str = str.concat(', ')
        }
        return str;
    }

    /* This just takes the cap hits in the player data and makes them readable, the reason this is
     necessary is because we're storing caphits as integer values. */
    function parseCapHit(player) {
        return '$' + numberWithCommas(player.caphit);
    }
  
    function setEditingLineup() {
        setEditLineup(!editLineup);
    }

    function getForwards(selectedTeam) {
        let team = teamHolder.findIndex(e => e.name === selectedTeam.name);
        return teamHolder[team].roster.forwards;
    }
    function getDefense(selectedTeam) {
        let team = teamHolder.findIndex(e => e.name === selectedTeam.name);
        return teamHolder[team].roster.defense;
    }
    function getGoalies(selectedTeam) {
        let team = teamHolder.findIndex(e => e.name === selectedTeam.name);
        return teamHolder[team].roster.goalies;
    }


    /* These three functions are almost all the same thing except we replace
     the forwards, defense, and goalies respectivel, they call the force
     update to make react re-render and update them on screen. */
    function reorderForwards(sourceIndex, destinationIndex) {
        let updatedTeam = myTeam;

        const reorderedItems = utils.reorder(
            updatedTeam.roster.forwards,
            sourceIndex,
            destinationIndex
        );
        updatedTeam.roster.forwards = reorderedItems;
        console.log(myTeam.roster.forwards);
        console.log(reorderedItems);
        setMyTeam(updatedTeam);
        forceUpdate();
    };
    function reorderDefense(sourceIndex, destinationIndex) {
        let updatedTeam = myTeam;

        const reorderedItems = utils.reorder(
            updatedTeam.roster.defense,
            sourceIndex,
            destinationIndex
        );
        updatedTeam.roster.defense = reorderedItems;
        setMyTeam(updatedTeam);
        forceUpdate();
    }
    function reorderGoalies(sourceIndex, destinationIndex) {
        let updatedTeam = myTeam;
    
        const reorderedItems = utils.reorder(
            updatedTeam.roster.goalies,
            sourceIndex,
            destinationIndex
        );
        updatedTeam.roster.goalies = reorderedItems;
        setMyTeam(updatedTeam);
        forceUpdate();
    };

    function openTradeList() {
        setTrading(!trading);
        setTradingTeam(getAllOtherTeams()[0]);
    }

    function handleTradeTeamSelect(team) {
        setTradingTeam(team);
        setOpposingTrade([]);
        console.log(team);
        forceUpdate();
    }

    function setMyOffer(player) {
        let tempTrade = myTrade;
        let inArray = tempTrade.some(plyr => plyr.name === player.name);
        /* If the player is inside of the array then we want to remove them, otherwise we'll add them to the trade list. */
        if(inArray) {
            tempTrade = utils.removePlayer(tempTrade, player);
        }
        else {
            tempTrade.push(player);
        }

        setMyTrade(tempTrade);    
        forceUpdate();
        console.log(myTrade)
    }
    function setOpposingOffer(player) {
        let tempOpposingTrade = opposingTrade;
        let inArray = tempOpposingTrade.some(plyr => plyr.name === player.name);
        /* If the player is inside of the array then we want to remove them, otherwise we'll add them to the trade list. */
        if(inArray) {
            tempOpposingTrade = utils.removePlayer(tempOpposingTrade, player);
        }
        else {
            tempOpposingTrade.push(player);
        }

        setOpposingTrade(tempOpposingTrade);
        forceUpdate();
    }

    function executeTrade() {
        let opposingPlayerTeam = tradingTeam;
        let myPlayerTeam = myTeam;
        var myTradeValue = calculateTradeValue(myTrade);
        var opposingTradeValue = calculateTradeValue(opposingTrade);
        setOpposingTeamName(tradingTeam.name);
        if(!(myTradeValue > opposingTradeValue)) {
            setResultString("We think this offer is too low for what we're giving up.")
            handleOpen();
            console.log('Not good enough');
            return;
        }
        for(let i = 0; i < opposingTrade.length; i++) {
            let opposingPlayer = opposingTrade[i]
            if(opposingPlayer.positions.includes('LW') || opposingPlayer.positions.includes('C') || opposingPlayer.positions.includes('RW')) {
                opposingPlayerTeam.roster.forwards = utils.removePlayer(opposingPlayerTeam.roster.forwards, opposingPlayer);
                myPlayerTeam.roster.forwards.push(opposingPlayer);
            }
            else if(opposingPlayer.positions.includes('LD') || opposingPlayer.positions.includes('RD')) {
                opposingPlayerTeam.roster.defense = utils.removePlayer(opposingPlayerTeam.roster.defense, opposingPlayer);
                myPlayerTeam.roster.defense.push(opposingPlayer);
            }
            else {
                opposingPlayerTeam.roster.goalies = utils.removePlayer(opposingPlayerTeam.roster.goalies, opposingPlayer);
                myPlayerTeam.roster.goalies.push(opposingPlayer);
            }
        }
        for(let j = 0; j < myTrade.length; j++) {
            let myPlayer = myTrade[j];
            if(myPlayer.positions.includes('LW') || myPlayer.positions.includes('C') || myPlayer.positions.includes('RW')) {
                myPlayerTeam.roster.forwards = utils.removePlayer(myPlayerTeam.roster.forwards, myPlayer);
                opposingPlayerTeam.roster.forwards.push(myPlayer);
            }
            else if(myPlayer.positions.includes('LD') || myPlayer.positions.includes('RD')) {
                myPlayerTeam.roster.defense = utils.removePlayer(myPlayerTeam.roster.defense, myPlayer);
                opposingPlayerTeam.roster.defense.push(myPlayer);
            }
            else {
                myPlayerTeam.roster.goalies = utils.removePlayer(myPlayerTeam.roster.goalies, myPlayer);
                opposingPlayerTeam.roster.goalies.push(myPlayer);
            }
        }
        setMyTeam(myPlayerTeam);
        setTradingTeam(opposingPlayerTeam);
        let allTeams = teamHolder;
        let myTeamIndex = allTeams.findIndex(team => team.name === myTeam.name);
        let opposingTeamIndex = allTeams.findIndex(team => team.name === tradingTeam);
        allTeams[myTeamIndex] = myPlayerTeam;
        allTeams[opposingTeamIndex] = opposingPlayerTeam;
        setOpposingTrade([]);
        setMyTrade([]);
        setTeams(allTeams);
        setResultString("We think this trade is beneficial to us, we're happy to make the deal.")
        handleOpen()
        forceUpdate();
  }



    function calculateTradeValue(players) {
        if(players.length === 0) return 0;
        var totalTradeValue = 0;

        for(var i = 0; i < players.length; i++) {
            var player = players[i];
            var contractLength = player.yearsLeft;
            var age = player.age;
            var rating = player.overall;
            var salary = player.caphit;
            var potential = player.potential;

            let tradeValue = rating;

            // Add potential bonus
            let potentialValue = 0;
            if (potential === "A") {
                potentialValue = 10;
            } else if (potential === "B") {
                potentialValue = 7;
            } else if (potential === "C") {
                potentialValue = 4;
            } else if (potential === "D") {
                potentialValue = 0;
            }
            tradeValue += potentialValue;
            
            // Add age bonus
            let ageBonus = 0;
            if (age <= 22) {
                ageBonus = 3;
            } else if (age <= 25) {
                ageBonus = 2;
            } else if (age <= 27) {
                ageBonus = 1;
            } else if(age >= 35) {
                ageBonus = -5
            } else if (age >= 32) {
                ageBonus = -3;
            } else if (age >= 30) {
                if(rating < 70) {
                    ageBonus = -10;
                }
                else if(rating < 75) {
                    ageBonus = -5
                }
                else ageBonus = -2;
            } else if (age >= 28) {
                ageBonus = -1;
            }
            tradeValue += ageBonus;
            
            // Add contract bonus
            let scaledContractAmount = salary / 1000000; // Scale contract amount
            let contractBonus = 0;
            if (scaledContractAmount <= 3 && rating >= 85) { // Good contract threshold
                contractBonus = 3;
            } else if (scaledContractAmount <= 6 && rating >= 85) { // Average contract threshold
                contractBonus = 1;
            } else if (scaledContractAmount <= 1 && contractLength === 1) { // Last year of contract
                contractBonus = 2;
            } 
            else if(scaledContractAmount > 8 && rating < 80) {
                contractBonus = -20
            } else if (scaledContractAmount > 5 && rating < 80) { // Bad contract threshold
                contractBonus = -10;
            } else if (scaledContractAmount > 3 && rating < 80) { // Below average contract threshold
                contractBonus = -5;
            }
            
            if(age >= 28 && potential === 'D') {
                tradeValue -= 10;
            }
            else if(age >= 28 && potential === 'C') {
                tradeValue -= 5;
            }

            tradeValue += contractBonus;

            // Add bonus for players with high overall ratings
            if (rating >= 87) {
                let highOverallBonus = 10 * Math.pow(2, (rating - 87) / 2); // increase trade value exponentially
                tradeValue += highOverallBonus;
            }

            totalTradeValue += tradeValue; // calculate trade value
        }

        return totalTradeValue;
    }

  

    function revertMyIndexBack() {
        if(myIndex === 0) {
            setMyIndex(2);
        }
        else {
            setMyIndex(myIndex - 1);
        }
    }

    function advanceMyIndexForward() {
        if(myIndex === 2) {
            setMyIndex(0);
        }
        else {
            setMyIndex(myIndex + 1);
        }
    }

    function advanceOpposingIndexForward() {
        if(opposingIndex === 2) {
            setOpposingIndex(0);
        }
        else {
            setOpposingIndex(opposingIndex + 1);
        }
    }

    function revertOpposingIndexBack() {
        if(opposingIndex === 0) {
            setOpposingIndex(2);
        }
        else {
            setOpposingIndex(opposingIndex - 1);
        }
    }

    function advanceLineupString() {
        if(lineupIndex === 2) {
            setLineupIndex(0);
        }
        else {
            setLineupIndex(lineupIndex + 1);
        }
    }

    function revertLineupString() {
        if(lineupIndex === 0) {
            setLineupIndex(2);
        }
        else {
            setLineupIndex(lineupIndex - 1);
        }
    }

    function checkIndex(index) {
        if(index % 2 === 1) return ' listItem1';
        return ' listItem0';
    }

    return(
        <div className="rosterPage">
            <div>
                <Navbar myTeam={myTeam} teamHolder={rosterChangeHolder} currentDay={location.state.currentDay}/>
            </div>
            <div className="mainHolder">
                <div className="teamInfoContainer">
                    <img src={myTeam.logo} width={'250px'} alt={myTeam.name}/>
                    <h2>Team overall: {utils.calculateTeamRating(myTeam)}</h2>
                    {!editLineup && <button className='button' onClick={setEditingLineup}>Edit Lineups</button>}
                    {editLineup && <button className='button' onClick={setEditingLineup}>Finish Editing Lineups</button>}
                    <button className='button buttonPadding' onClick={openTradeList}>Look for a trade</button>
                </div>
    
            <div className="mainDisplayContainer">
            {editLineup && 
            <div className='lines containter'>
                <div className="tableHeader">
                    <h1 className="tableArrow" onClick={revertLineupString}> {'<'} </h1>
                    <h1>{lineupString}</h1>
                    <h1 className="tableArrow" onClick={advanceLineupString}> {'>'} </h1>
                </div>
                <div>
                    {lineupIndex === 0 && <ul className="playerContainer forwardLines">
                        {getForwards(myTeam).map(player => (
                            <li>
                                <p>{player.name}</p>
                            </li>
                        ))}
                    </ul>}
                    {lineupIndex === 1 && <ul className="playerContainer defenseLines">
                        {getDefense(myTeam).map(player => (
                            <li>
                                <p>{player.name}</p>
                            </li>
                        ))}
                    </ul>}
                   {lineupIndex === 2 && <ul className="playerContainer goalieLines">
                        {getGoalies(myTeam).map(player => (
                            <li>
                                <p>{player.name}</p>
                            </li>
                        ))}
                    </ul>}
                </div>                
            </div>}
            <br />
            {trading && <>
                <h1>Select a team to trade with: </h1>
                {getAllOtherTeams().map((team) => (
                    <img onClick={() => handleTradeTeamSelect(team)} width="50em" key={team.abbreviation} src={team.logo} alt={team.name}/>
                ))}
                <div className="tradePanel">
                    <div className='myTeamTrading'>
                        <img src={myTeam.logo} alt={myTeam.abbreviation}  className="opposingLogo"/>
                        <div className="tableHeader">
                            <h1 className="tableArrow" onClick={revertMyIndexBack}> {'<'} </h1>
                            <h1>{myString}</h1>
                            <h1 className="tableArrow" onClick={advanceMyIndexForward}> {'>'} </h1>
                        </div>
                        {myIndex === 0 && <div className="statsContainer">
                            <table className='statsTable'>
                                <tr className="tableHeadings fixed">
                                    <th>Player</th>
                                    <th>Position</th>
                                    <th>Overall</th>
                                    <th>Cap Hit</th>
                                </tr>
                                {getForwards(myTeam).map((player, index) => (
                                <tr className={"rowData" + checkIndex(index)} onClick={() => setMyOffer(player)}>
                                    <td>{player.name}</td>
                                    <td>{parsePositionArray(player)}</td>
                                    <td>{player.overall}</td>
                                    <td>{parseCapHit(player)}</td>
                                </tr>
                                ))}
                            </table>
                        </div>}
                        {myIndex === 1 && <div className="statsContainer">
                            <table className='statsTable'>
                            <tr className="tableHeadings fixed">
                                <th>Player</th>
                                <th>Position</th>
                                <th>Overall</th>
                                <th>Cap Hit</th>
                            </tr>
                            {getDefense(myTeam).map((player, index) => (
                                <tr className={"rowData" + checkIndex(index)} onClick={() => setMyOffer(player)}>
                                <td>{player.name}</td>
                                <td>{parsePositionArray(player)}</td>
                                <td>{player.overall}</td>
                                <td>{parseCapHit(player)}</td>
                                </tr>
                            ))}
                            </table>
                        </div>}
                        {myIndex === 2 && <div className="statsContainer">
                            <table className='statsTable'>
                            <tr className="tableHeadings fixed">
                                <th>Player</th>
                                <th>Position</th>
                                <th>Overall</th>
                                <th>Cap Hit</th>
                            </tr>
                            {getGoalies(myTeam).map((player, index) => (
                                <tr className={"rowData" + checkIndex(index)} onClick={() => setMyOffer(player)}>
                                <td>{player.name}</td>
                                <td>{parsePositionArray(player)}</td>
                                <td>{player.overall}</td>
                                <td>{parseCapHit(player)}</td>
                                </tr>
                            ))}
                            </table>
                        </div>}
                        <div className="tradeBar">
                            <ProgressBar className="tradeValue" variant="success" now={calculateTradeValue(myTrade)} max={600} />
                        </div>
                    </div>
                <div className="opposingTeamTrading">
                    <img src={tradingTeam.logo} alt={tradingTeam.abbreviation}  className="opposingLogo"/>
                        <div className="tableHeader">
                            <h1 className="tableArrow" onClick={revertOpposingIndexBack}> {'<'} </h1>
                            <h1>{opposingString}</h1>
                            <h1 className="tableArrow" onClick={advanceOpposingIndexForward}> {'>'} </h1>
                        </div>
                    {opposingIndex === 0 && <div className="statsContainer">
                        <table className='statsTable'>
                        <tr className='tableHeadings fixed'>
                            <th>Player</th>
                            <th>Position</th>
                            <th>Overall</th>
                            <th>Cap Hit</th>
                        </tr>
                        {getForwards(tradingTeam).map((player, index) => (
                            <tr className={"rowData" + checkIndex(index)} onClick={() => setOpposingOffer(player)}>  
                            <td>{player.name}</td>
                            <td>{parsePositionArray(player)}</td>
                            <td>{player.overall}</td>
                            <td>{parseCapHit(player)}</td>
                            </tr>
                        ))}
                        </table>
                    </div>}
                    {opposingIndex === 1 && <div className="statsContainer">
                        <table className='statsTable'>
                        <tr className="tableHeadings fixed">
                            <th>Player</th>
                            <th>Position</th>
                            <th>Overall</th>
                            <th>Cap Hit</th>
                        </tr>
                        {getDefense(tradingTeam).map((player, index) => (
                            <tr className={"rowData" + checkIndex(index)} onClick={() => setOpposingOffer(player)}>
                                <td>{player.name}</td>
                                <td>{parsePositionArray(player)}</td>
                                <td>{player.overall}</td>
                                <td>{parseCapHit(player)}</td>
                            </tr>
                        ))}
                        </table>
                    </div>}
                    {opposingIndex === 2 && <div className="statsContainer">
                        <table className='statsTable'>
                        <tr className='tableHeadings fixed'>
                            <th>Player</th>
                            <th>Position</th>
                            <th>Overall</th>
                            <th>Cap Hit</th>
                        </tr>
                        {getGoalies(tradingTeam).map((player, index) => (
                            <tr className={"rowData" + checkIndex(index)} onClick={() => setOpposingOffer(player)}>
                            <td>{player.name}</td>
                            <td>{parsePositionArray(player)}</td>
                            <td>{player.overall}</td>
                            <td>{parseCapHit(player)}</td>
                            </tr>
                        ))}
                        </table>
                    </div>}
                    <div className="tradeBar">
                        <ProgressBar className="tradeValue" variant="success" now={calculateTradeValue(opposingTrade)} max={600} />
                    </div>
                    </div>
                </div>
                <div className="tradeList">
                    <div className="myTradeList">
                        {myTrade.length > 0 && <h1>{myTeam.name} Offer: </h1>}
                        {myTrade.map(player => (
                            <h2>{player.name} - {player.overall}</h2>
                         ))}
                    </div>
                    {tradingTeam && <div className="opposingTradeList">
                        {opposingTrade.length > 0 && <h1>{tradingTeam.name} Offer: </h1>}
                        {opposingTrade.map(player => (
                            <h2>{player.name} - {player.overall}</h2>
                        ))}
                    </div>}
                </div>
                {(myTrade.length > 0 && opposingTrade.length > 0) && <div className='trade-execute'>
                    <button onClick={executeTrade} className='button'>Propose Trade</button>
                </div>}
                <Modal show={showTradeModal} onHide={handleClose}>
                    <Modal.Header>
                        Message from {opposingTeamName}
                    </Modal.Header>
                    <Modal.Body>
                        {resultString}
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="button" onClick={handleClose}>
                            Close
                        </button>
                    </Modal.Footer>
                </Modal>
            </>}
            </div>
            
            </div>
        </div>
    )
}

export default RosterManagement;