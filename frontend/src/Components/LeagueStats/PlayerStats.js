import { useEffect, useState } from 'react';
import * as util from '../util';

function PlayerStats(props) {
    let team = props.team;

    function checkIndex(index) {
        if(index % 2 === 1) return ' listItem1';
        return ' listItem0';
    }

    function positionsToString(positions) {
        var str = "";
        for(let i = 0; i < positions.length; i++) {
            str += positions[i];
            if(i < positions.length - 1) {
                str += ", "
            }
        }
        return str;
    }

    return(
        <div>
            <div className="statsContainer">
                <table className='statsTable'>
                    <tr className="tableHeadings fixed">
                        <th>Player</th>
                        <th>Overall</th>
                        <th>Positions</th>
                    </tr>
                    {team.roster.map((player, index) => (
                    <tr className={"rowData" + checkIndex(index)} onClick={() => props.activatePlayerModal(player)}>
                        <td>{player.name}</td>
                        <td>{player.overall}</td>
                        <td>{positionsToString(player.positions)}</td>
                    </tr>
                    ))}
                </table>
            </div>
        </div>
    )
}
export default PlayerStats;