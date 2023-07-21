import { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import jsonData from '../../Roster_JSON/teams.json'
import './Collection.css'
import { Modal } from "react-bootstrap";
import TeamCollection from "./TeamCollection";

function Collection() {
    const [teamHolder, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(undefined);

    useEffect(() => {
        getActiveTeams();
    }, []);
    

    function getActiveTeams() {
        var teams = jsonData.teams
        var teamArr = [];
        for(var division in teams) {
            var divisionHolder = teams[division];
            for(var team in divisionHolder) {
                teamArr.push(divisionHolder[team]);
            }
        }
        setTeams(teamArr);
        return teamArr;
    }

    function hexToRgbA(hex, alpha){
        var c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
        }
        throw new Error('Bad Hex');
    }
    

    function getTeamGradient (team) {
        let primaryColors = [hexToRgbA(team.colors[0], .8), hexToRgbA(team.colors[1], .8)]
        var style = {
          color: '#fff',
          backgroundColor: '#f4f1de',
          background: `linear-gradient(to bottom, ${primaryColors.join(", 75%, ")})`,
          cursor: 'pointer',
          margin: '20px',
          textAlign: 'center',
          border: 'none',
          borderRadius: '50%',
          backgroundSize: '300% 100%',
          transition: `all 0.3s ease-in`,
          boxShadow: `0 1px 20px 0 ${hexToRgbA('#3d405b', .4)}`
        }
        return style;
    }
    

    function handleTeamSelect(team) {
        setSelectedTeam(team);
    }
    function handleClose() {
        setSelectedTeam(undefined);
    }

    return(<div>
        <Navbar />
        <div className="logos">  
            <div className="iconContainer">
                <ul className='icons'>
                {teamHolder.map(team => (
                <li onClick={() => handleTeamSelect(team)} style={getTeamGradient(team)}>
                    <div className='imageContainer'>
                        <img className="hoverAbove" key={team.abbreviation} src={team.logo} alt={team.name}/>
                        <img className="glow" src={team.logo} alt={team.name}/>
                    </div>
                </li>
                ))}
                </ul>
            </div>
        </div>
        <Modal fullscreen={true} show={selectedTeam !== undefined} onHide={handleClose}>
            <Modal.Header closeButton>
                <h1>{selectedTeam ? selectedTeam.name: ''}</h1>
            </Modal.Header>
            <Modal.Body>
                <TeamCollection team={selectedTeam}/>
            </Modal.Body>
        </Modal>
    </div>)
}

export default Collection;