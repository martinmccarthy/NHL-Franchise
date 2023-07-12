import {useState} from 'react';
import {useLocation} from "react-router-dom";
import Navbar from '../Navbar/Navbar';
import PlayerCard from '../PlayerCard/PlayerCard';

function LeagueStats() {
    const location = useLocation();

    var myTeam = location.state.myTeam
    var teamHolder = location.state.teamHolder

    const [gameTeamHolder, setTeams] = useState(teamHolder);

    const [eastPlayoffs, setEastPlayoffs] = useState([]);
    const [westPlayoffs, setWestPlayoffs] = useState([]);

    /* This function finds the top teams in a division based on the teams you give it, it's not hard coded to 8 teams,
    so if we want to add more teams to a division (expansion feature) we're allowed to. */
    function findTopFive(teams) {
        let topFive = [];
    
        for(let i = 0; i < teams.length; i++) {
        if(topFive.length < 5) {
            topFive.push(teams[i]);
        }
        else if((topFive[0].wins < teams[i].wins) && (topFive[1].wins < teams[i].wins) && (topFive[2].wins < teams[i].wins) && (topFive[3].wins < teams[i].wins) && (topFive[4].wins < teams[i].wins)) {
            const lowestTeam = topFive.reduce(
            (acc, loc) =>
                acc.wins < loc.wins
                ? acc
                : loc
            )
            let spliceIndex = topFive.findIndex(team => team === lowestTeam);
            topFive.splice(spliceIndex, 1);
            topFive.push(teams[i]);
            
        }
        }

        return topFive;
    }

    function playoffCalculator() {
        let metroTeams = gameTeamHolder.filter(team => team.division === 'metro');
        let atlanticTeams = gameTeamHolder.filter(team => team.division === 'atlantic');
        let pacificTeams = gameTeamHolder.filter(team => team.division === 'pacific');
        let centralTeams = gameTeamHolder.filter(team => team.division === 'central');
        
        let topMetroTeams = findTopFive(metroTeams);
        let topAtlanticTeams = findTopFive(atlanticTeams);
        let topPacificTeams = findTopFive(pacificTeams);
        let topCentralTeams = findTopFive(centralTeams);


        topMetroTeams.sort((a, b) => a.wins - b.wins);
        topAtlanticTeams.sort((a, b) => a.wins - b.wins);
        topPacificTeams.sort((a, b) => a.wins - b.wins);
        topCentralTeams.sort((a, b) => a.wins - b.wins);

        let playoffsEast = [topMetroTeams[2], topMetroTeams[3], topMetroTeams[4], topAtlanticTeams[2], topAtlanticTeams[3], topAtlanticTeams[4]];
        let playoffsWest = [topPacificTeams[2], topPacificTeams[3], topPacificTeams[4], topCentralTeams[2], topCentralTeams[3], topCentralTeams[4]];

        let eastWildcard = [topMetroTeams[0], topMetroTeams[1], topAtlanticTeams[0], topAtlanticTeams[1]];
        let westWildcard = [topCentralTeams[0], topCentralTeams[1], topPacificTeams[0], topPacificTeams[1]];
        eastWildcard.sort((a, b) => a.wins - b.wins);
        westWildcard.sort((a, b) => a.wins - b.wins);
        
        eastWildcard.shift();
        eastWildcard.shift();
        westWildcard.shift();
        westWildcard.shift();

        playoffsEast.unshift(eastWildcard[0], eastWildcard[1]);
        playoffsWest.unshift(westWildcard[0], westWildcard[1]);

        setEastPlayoffs(playoffsEast);
        setWestPlayoffs(playoffsWest);
    }


    function checkForPlayoffs() {
        playoffCalculator();
        let userTeam = gameTeamHolder.find(e => e.id === myTeam.id);
        if(userTeam.division === 'metro' || userTeam.division === 'atlantic') {
        if(eastPlayoffs.find(team => team === userTeam)) return true;
        }
        else if(userTeam.division === 'central' || userTeam.division === 'pacific') {
        if(westPlayoffs.find(team => team === userTeam)) return true;
        }
        return false;
    }

    function getMyTeamWins() {
        let myIndex = gameTeamHolder.findIndex(e => e.name === myTeam.name);
        console.log(gameTeamHolder);
        return gameTeamHolder[myIndex].record.wins
    }

    function getMyTeamLosses() {
        let myIndex = gameTeamHolder.findIndex(e => e.name === myTeam.name);
        return gameTeamHolder[myIndex].record.losses
    }

    function getFirstPlayer() {
        
    }

    return(<div>
    <div>
        <Navbar myTeam={myTeam} teamHolder={gameTeamHolder} currentDay={location.state.currentDay} />
      </div>
        <p>Current Record: {getMyTeamWins()}-{getMyTeamLosses()}</p>
        <table>
          <tr>
            <th>Team</th>
            <th>Record</th>
          </tr>
          {gameTeamHolder.map(team => (
              <tr>
                <td>{team.name}</td>
                <td>{team.record.wins}-{team.record.losses}</td>
              </tr>
            ))}
        </table>
    </div>)    
}

export default LeagueStats;