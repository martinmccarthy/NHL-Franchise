import {useState} from 'react';

function PlayerStats(props) {
    let team = props.givenTeam;

    function getForwards() { return team.roster.forwards; }
    function getDefense() { return team.roster.defense; }

    function checkIndex(index) {
        if(index % 2 === 1) return ' listItem1';
        return ' listItem0';
    }

    return(
        <div>
            <div className="statsContainer">
                <table className='statsTable'>
                    <tr className="tableHeadings fixed">
                        <th>Player</th>
                        <th>Goals</th>
                        <th>Assists</th>
                        <th>Points</th>
                    </tr>
                    {getForwards().map((player, index) => (
                    <tr className={"rowData" + checkIndex(index)} onClick={() => props.activatePlayerModal(player)}>
                        <td>{player.name}</td>
                        <td>{player.goals}</td>
                        <td>{player.assists}</td>
                        <td>{(player.goals + player.assists)}</td>
                    </tr>
                    ))}
                    {getDefense().map((player, index) => (
                    <tr className={"rowData" + checkIndex(team.roster.forwards.length + index)} onClick={() => props.activatePlayerModal(player)}>
                        <td>{player.name}</td>
                        <td>{player.goals}</td>
                        <td>{player.assists}</td>
                        <td>{(player.goals + player.assists)}</td>
                    </tr>
                    ))}
                </table>
            </div>
        </div>
    )
}
export default PlayerStats;