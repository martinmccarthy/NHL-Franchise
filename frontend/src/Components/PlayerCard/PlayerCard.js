import './PlayerCard.css';

function PlayerCard(props) {
    var player = props.player;
    if(props.style !== undefined) {
        var params = props.style;
    }

    function getOverallColor() {
        var ovr = player.overall;
        
        if(ovr >= 86) return {backgroundColor: "blue"};
        if(ovr >= 80) return {backgroundColor: "gold"};
        if(ovr >= 70) return {backgroundColor: "grey"};
        if(ovr >= 60) return {backgroundColor: "brown"};
        return {backgroundColor: "black"};
    }

    function hexToRgbA(hex, alpha){
        var c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length === 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
        }
        throw new Error('Bad Hex');
    }

    function getTeamGradient () {
        let primaryColors = [hexToRgbA(player.team.colors[0], 1), hexToRgbA(player.team.colors[1], 1)]
        var style = {
            color: '#fff',
            backgroundColor: '#f4f1de',
            background: `linear-gradient(to bottom, ${primaryColors.join(", 75%, ")})`,
            cursor: 'pointer',
            textAlign: 'center',
            border: 'none',
            backgroundSize: '300% 100%',
            boxShadow: `0 1px 20px 0 ${hexToRgbA('#3d405b', .4)}`,
            height: (params !== undefined) ? params.height : "300px",
            width: (params !== undefined) ? params.width : "250px"
        }
        style = checkArea(style);
        return style;
    }

    function checkArea(style) {
        if(props.area === undefined) return style;
        else if(props.area==='collection') {

            return style;
        }
    }

    async function checkIfCollected() {
        
    }

    return(
        <div className="player-card" style={getTeamGradient()}>
            <div className="player-image-container">
                <img src={player.image} alt={player.name} className="player-image" />
            </div>
            <div className="player-overall" style={getOverallColor()}>{player.overall}</div>
            <div className="player-details">
                <div className="player-name">{player.name}{props.style === undefined && `• ${player.positions[0]}`}</div>
            </div>
        </div>
    )
}

export default PlayerCard;