import * as utils from '../util';
import { useState, useCallback, useEffect } from 'react';
import { ListManager } from 'react-beautiful-dnd-grid';
import {useLocation} from "react-router-dom";

import { ProgressBar } from "react-bootstrap"; 
import "bootstrap/dist/css/bootstrap.min.css";

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
    const [tradeLoaded, setTradeLoaded] = useState(false);
    const [myTrade, setMyTrade] = useState();
    const [opposingTrade, setOpposingTrade] = useState();

    const tableStates = ['Forwards', 'Defense', 'Goalies']
    const [myIndex, setMyIndex] = useState(0);
    const [myString, setMyString] = useState('Forwards')
    const [opposingString, setOpposingString] = useState('Forwards')
    const [opposingIndex, setOpposingIndex] = useState(0);
    const [teamHolderTemp, setTeams] = useState([]);

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

  /* These two functions are for display purposes on the screen, the averageCapHits function
     will probably be useful down the line to calculate a players caphit when signing them
     to a contract. */
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    function averageCaphits(capHits) {
        return Math.round(capHits.reduce((prev, curr) => prev + curr) / capHits.length)
    }

      /* This just takes the cap hits in the player data and makes them readable, the reason this is
     necessary is because we're taking from the capfriendly website and the scraper returns an
     odd data array. */
    function parseCapHit(player) {
        if(player[0] === 'TOTAL') return;
        let yearsLeft = Number(player[1].split(' ')[0]);
        var caphits = []

        for(var i = 8; i < (yearsLeft + 8); i++) {
            /* The undefined here occurs because it can be the case where the capfriendly datatable
                doesn't display all the data in the table because the contract is longer than the display,
                in this case we just fill the array with the previous year's contract data based on how
                many years they have left. They technically could have different cap hits at these times but
                I personally don't want to go through and individually check every player to make sure. */
            if(player[i] === undefined) {
                caphits.push(caphits[caphits.length - 1]);
            }
            else {
                var hitString = player[i].split('$', 2)[1].replace(/,/g, '');
                caphits.push(Number(hitString));
            }
        }
        return '$' + numberWithCommas(averageCaphits(caphits));
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

    function ListElement(player) {
        return(
            <div className='grid-item'>
                <div className='grid-item-content'>
                    <p>{displayPlayer(player.player[0])}</p>
                    <p className='playerOverall'>{player.player[4]}</p>
                </div>
            </div>
        );
    }

    function displayPlayer(playerName) {
    let arr = playerName.split(',');
    if(arr[1].includes('"C"')) {
        let arr2 = arr[1].split(' ');
        return arr2[1] + ' ' + arr[0];
    }
    return arr[1] + ' ' + arr[0];
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
        setTrading(!trading)
        setTradeLoaded(false);
    }

    function handleTradeTeamSelect(team) {
        setTradingTeam(team);
        console.log(team);
        setTradeLoaded(true);
        forceUpdate();
    }

    function setMyOffer(player) {
        setMyTrade(player);
    }
    function setOpposingOffer(player) {
        setOpposingTrade(player);
        console.log(player);
    }

    function executeTrade() {
        let opposingPlayerTeam = tradingTeam;
        let myPlayerTeam = myTeam;
        console.log(opposingTrade);
        if(opposingTrade.positions.includes('LW') || opposingTrade.positions.includes('C') || opposingTrade.positions.includes('RW')) {
            opposingPlayerTeam.roster.forwards = utils.removePlayer(opposingPlayerTeam.roster.forwards, opposingTrade);
            myPlayerTeam.roster.forwards.push(opposingTrade);
        }
        else if(opposingTrade.positions.includes('LD') || opposingTrade.positions.includes('RD')) {
            opposingPlayerTeam.roster.defense = utils.removePlayer(opposingPlayerTeam.roster.defense, opposingTrade);
            myPlayerTeam.roster.defense.push(opposingTrade);
        }
        else {
            opposingPlayerTeam.roster.goalies = utils.removePlayer(opposingPlayerTeam.roster.goalies, opposingTrade);
            myPlayerTeam.roster.goalies.push(opposingTrade);
        }

        if(myTrade.positions.includes('LW') || myTrade.positions.includes('C') || myTrade.positions.includes('RW')) {
            myPlayerTeam.roster.forwards = utils.removePlayer(myPlayerTeam.roster.forwards, myTrade);
            opposingPlayerTeam.roster.forwards.push(myTrade);
        }
        else if(myTrade.positions.includes('LD') || myTrade.positions.includes('RD')) {
            myPlayerTeam.roster.defense = utils.removePlayer(myPlayerTeam.roster.defense, myTrade);
            opposingPlayerTeam.roster.defense.push(myTrade);
        }
        else {
            myPlayerTeam.roster.goalies = utils.removePlayer(myPlayerTeam.roster.goalies, myTrade);
            opposingPlayerTeam.roster.goalies.push(myTrade);
        }

        setMyTeam(myPlayerTeam);
        setTradingTeam(opposingPlayerTeam);


        let allTeams = teamHolder;
        let myTeamIndex = allTeams.findIndex(team => team.name === myTeam.name);
        let opposingTeamIndex = allTeams.findIndex(team => team.name === tradingTeam);
        allTeams[myTeamIndex] = myPlayerTeam;
        allTeams[opposingTeamIndex] = opposingPlayerTeam;
        setTeams(allTeams);
        forceUpdate();
  }

    function calculateTradeValue(player) {
        if(player === undefined) return 0;
        var contractLength = player.yearsLeft;
        var age = player.age;
        var rating = player.overall;
        var salary = player.caphit
        var potential = player.potential

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
        } else if (age >= 32) {
        ageBonus = -3;
        } else if (age >= 30) {
        ageBonus = -2;
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
        } else if (scaledContractAmount > 5 && rating < 80) { // Bad contract threshold
        contractBonus = -5;
        } else if (scaledContractAmount > 3 && rating < 80) { // Below average contract threshold
        contractBonus = -3;
        }
        tradeValue += contractBonus;
    
        return tradeValue;
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

    return(
        <div className="myTeamPlayers">
            <img src={myTeam.logo} width={'250px'} alt={myTeam.name}/>
            <h2>Team overall: {utils.calculateTeamRating(myTeam)}</h2>
    
            {!editLineup && <button className='button' onClick={setEditingLineup}>Edit Lineups</button>}
            {editLineup && <button className='button' onClick={setEditingLineup}>Finish Editing Lineups</button>}
    
            {editLineup && 
            <div className='lines containter'>
                <div className='dropzone'>
                    <ListManager
                        items={getForwards(myTeam)}
                        direction="horizontal"
                        maxItems={3}
                        render={item => <ListElement player={item}/>}
                        onDragEnd={reorderForwards}
                    />
                </div>
                <div className='dropzone'>
                    <ListManager
                        items={getDefense(myTeam)}
                        direction="horizontal"
                        maxItems={2}
                        render={item => <ListElement player={item}/>}
                        onDragEnd={reorderDefense}
                    />
                </div>
                <div className='dropzone'>
                    <ListManager
                        items={getGoalies(myTeam)}
                        direction="horizontal"
                        maxItems={1}
                        render={item => <ListElement player={item}/>}
                        onDragEnd={reorderGoalies}
                    />
                </div>
            </div>}
            <br />
            <button className='button buttonPadding' onClick={openTradeList}>Look for a trade</button>
            {trading && <>
                <h1>Select a team to trade with: </h1>
                {getAllOtherTeams().map((team) => (
                    <img onClick={() => handleTradeTeamSelect(team)} width="50em" key={team.abbreviation} src={team.logo} alt={team.name}/>
                ))}
                {tradeLoaded && 
                <div className="tradePanel">
                    <div className='myTeamTrading'>
                        <div className="tableHeader">
                            <h1 className="tableArrow" onClick={revertMyIndexBack}> {'<'} </h1>
                            <h1>{myString}</h1>
                            <h1 className="tableArrow" onClick={advanceMyIndexForward}> {'>'} </h1>
                        </div>
                        {myIndex === 0 && <div className="forwards">
                            <table className='tradeTable'>
                            <tr>
                                <th>Player</th>
                                <th>Position</th>
                                <th>Overall</th>
                                <th>Cap Hit</th>
                            </tr>
                            {getForwards(myTeam).map(player => (
                                <tr className="playerData" onClick={() => setMyOffer(player)}>
                                <td>{player.name}</td>
                                <td>{player.positions}</td>
                                <td>{player.overall}</td>
                                <td>{player.caphit}</td>
                                </tr>
                            ))}
                            </table>
                        </div>}
                        {myIndex === 1 && <div className="defense">
                            <table className='tradeTable'>
                            <tr>
                                <th>Player</th>
                                <th>Position</th>
                                <th>Overall</th>
                                <th>Cap Hit</th>
                            </tr>
                            {getDefense(myTeam).map(player => (
                                <tr className="playerData" onClick={() => setMyOffer(player)}>
                                <td>{player.name}</td>
                                <td>{player.positions}</td>
                                <td>{player.overall}</td>
                                <td>{player.caphit}</td>
                                </tr>
                            ))}
                            </table>
                        </div>}
                        {myIndex === 2 && <div className="goalie">
                            <table className='tradeTable'>
                            <tr>
                                <th>Player</th>
                                <th>Position</th>
                                <th>Overall</th>
                                <th>Cap Hit</th>
                            </tr>
                            {getGoalies(myTeam).map(player => (
                                <tr className="playerData" onClick={() => setMyOffer(player)}>
                                <td>{player.name}</td>
                                <td>{player.positions}</td>
                                <td>{player.overall}</td>
                                <td>{player.caphit}</td>
                                </tr>
                            ))}
                            </table>
                        </div>}
                        <div className="tradeBar">
                            <ProgressBar className="tradeValue" variant="success" now={calculateTradeValue(myTrade)} max={345} />
                        </div>
                    </div>
                <div className="opposingTeamTrading">
                        <div className="tableHeader">
                            <h1 className="tableArrow" onClick={revertOpposingIndexBack}> {'<'} </h1>
                            <h1>{opposingString}</h1>
                            <h1 className="tableArrow" onClick={advanceOpposingIndexForward}> {'>'} </h1>
                        </div>
                    {opposingIndex === 0 && <div className="forwards">
                        <table className='tradeTable'>
                        <tr>
                            <th>Player</th>
                            <th>Position</th>
                            <th>Overall</th>
                            <th>Cap Hit</th>
                        </tr>
                        {getForwards(tradingTeam).map(player => (
                            <tr className="playerData" onClick={() => setOpposingOffer(player)}>  
                            <td>{player.name}</td>
                            <td>{player.positions}</td>
                            <td>{player.overall}</td>
                            <td>{player.caphit}</td>
                            </tr>
                        ))}
                        </table>
                    </div>}
                    {opposingIndex === 1 && <div className="defense">
                        <table className='tradeTable'>
                        <tr>
                            <th>Player</th>
                            <th>Position</th>
                            <th>Overall</th>
                            <th>Cap Hit</th>
                        </tr>
                        {getDefense(tradingTeam).map(player => (
                            <tr className="playerData" onClick={() => setOpposingOffer(player)}>
                            <td>{player.name}</td>
                            <td>{player.positions}</td>
                            <td>{player.overall}</td>
                            <td>{player.caphit}</td>
                            </tr>
                        ))}
                        </table>
                    </div>}
                    {opposingIndex === 2 && <div className="goalie">
                        <table className='tradeTable'>
                        <tr>
                            <th>Player</th>
                            <th>Position</th>
                            <th>Overall</th>
                            <th>Cap Hit</th>
                        </tr>
                        {getGoalies(tradingTeam).map(player => (
                            <tr className="playerData" onClick={() => setOpposingOffer(player)}>
                            <td>{player.name}</td>
                            <td>{player.positions}</td>
                            <td>{player.overall}</td>
                            <td>{player.caphit}</td>
                            </tr>
                        ))}
                        </table>
                    </div>}
                    <div className="tradeBar">
                        <ProgressBar className="tradeValue" variant="success" now={calculateTradeValue(opposingTrade)} max={345} />
                    </div>
                    </div>
                </div>}
                {(myTrade && opposingTrade) && <div className='trade-execute'>
                    <button onClick={executeTrade} className='button'>Propose Trade</button>
                </div>}
            </>}
        </div>
    )
}

export default RosterManagement;