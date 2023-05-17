import teams, { getTeamId } from "@nhl-api/teams";
import axios from 'axios';
    
/* checkGameLocation simply checks to see if the game is home or away and returns that, it's here
    to clean up the code since it's useful in more than one place, mainly displaying the calendar
    itself and then when our algorithm is determining if the game is home or away */
export function checkGameLocation(schedule, date, selectedTeam) {
    let teamID = returnTeamID(selectedTeam);
    let schedule_string = date.toISOString().split('T')[0];
    const i = schedule.findIndex(e => e.date === schedule_string);
    if(schedule[i].games[0].teams.away.team.id === teamID) return 'away'
    else return 'home'
}

export function returnTeamID(selectedTeam) {
    var teamID;
    if(selectedTeam !== 'kraken' && selectedTeam !== 'SEATTLE KRAKEN') {
        teamID = getTeamId(selectedTeam);
        if(selectedTeam === 'stars' || selectedTeam === 'flames')
            teamID = teamID[0].id;
        else if(selectedTeam === 'blues')
            teamID = teamID[1].id;
    }
    else {
        teamID = 55;
    }
    return teamID;
}

export function reorder(list, startIndex, endIndex){
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
};

export function removePlayer(roster, player) {
    let spliceIndex = roster.findIndex(rosterPlayer => rosterPlayer === player);
    roster.splice(spliceIndex, 1);
    return roster;
}

export function calculateTeamRating(team) {
    let totalRating = 0;
    let topPlayersRating = 0;
    let topPlayersCount = 0;

    let rosterSize = team.roster.forwards.length + team.roster.defense.length + team.roster.goalies.length

    team.roster.forwards.forEach((player) => {
      totalRating += player.overall;

      // Check if player is a top player
      if (player.overall >= 80) {
        topPlayersRating += player.overall;
        topPlayersCount++;
      }
    });

    team.roster.defense.forEach((player) => {
        totalRating += player.overall;
  
        // Check if player is a top player
        if (player.rating >= 80) {
          topPlayersRating += player.overall;
          topPlayersCount++;
        }
    });

    team.roster.goalies.forEach((player) => {
        totalRating += player.overall;

        // Check if player is a top player
        if (player.overall >= 85) {
            topPlayersRating += player.overall;
            topPlayersCount++;
        }
    });

    // Calculate weighted average of top player ratings
    const topPlayerRatingAverage = topPlayersCount > 0 ? topPlayersRating / topPlayersCount : 0;
    const topPlayerRatingWeight = 1.25; // Change this value to adjust emphasis on top players
    const weightedTopPlayerRating = topPlayerRatingAverage * topPlayerRatingWeight;

    // Calculate overall team rating
    const overallRating = (totalRating + weightedTopPlayerRating) / (rosterSize + topPlayerRatingWeight);

    // Adjust overall team rating to be closer to 100
    const adjustedRating = overallRating + 5; // Change this value to adjust the adjustment amount

    // Ensure adjusted rating is no greater than 100
    const finalRating = Math.min(adjustedRating, 100);

    return Math.round(finalRating);
  };

async function getActiveTeams() {
    var currentTeams = teams.filter(team => team.isActive === true);

    // The API here has invalid links for the capitals and the flames so these two lines resolve that:
    currentTeams[13].logo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Washington_Capitals.svg/562px-Washington_Capitals.svg.png';
    currentTeams[18].logo = 'https://upload.wikimedia.org/wikipedia/en/thumb/6/61/Calgary_Flames_logo.svg/440px-Calgary_Flames_logo.svg.png';
    // The Kraken are not in the nhl-api/teams API, so I just made this small obj to add
    const KRAKEN = {
      id: 55,
      name: 'SEATTLE KRAKEN',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/48/Seattle_Kraken_official_logo.svg/440px-Seattle_Kraken_official_logo.svg.png',
      abbreviation: 'SEA',
      
    }

    currentTeams.push(KRAKEN);

    let teamsWithRoster = await populateTeams(currentTeams);

    return teamsWithRoster;
  }

async function populateTeams(activeTeams) {
    var teamsArray = [];
    for(let i = 0; i < activeTeams.length; i++) {
    let currentTeam = {
        name: activeTeams[i].name,
        id: activeTeams[i].id,
        abbreviation: activeTeams[i].abbreviation,
        wins: 0,
        losses: 0,
        logo: activeTeams[i].logo
    }
    if(activeTeams[i].abbreviation === 'NJD' || activeTeams[i].abbreviation === 'NYI' || activeTeams[i].abbreviation === 'NYR' ||
        activeTeams[i].abbreviation === 'PIT' || activeTeams[i].abbreviation === 'PHI' || activeTeams[i].abbreviation === 'CBJ' ||
        activeTeams[i].abbreviation === 'CAR' || activeTeams[i].abbreviation === 'WSH') {
        currentTeam.division = 'metro';
    }
    else if(activeTeams[i].abbreviation === 'TOR' || activeTeams[i].abbreviation === 'FLA' || activeTeams[i].abbreviation === 'TBL' ||
        activeTeams[i].abbreviation === 'OTT' || activeTeams[i].abbreviation === 'MTL' || activeTeams[i].abbreviation === 'BUF' ||
        activeTeams[i].abbreviation === 'BOS' || activeTeams[i].abbreviation === 'DET') {
        currentTeam.division = 'atlantic';
    }
    else if(activeTeams[i].abbreviation === 'EDM' || activeTeams[i].abbreviation === 'CGY' || activeTeams[i].abbreviation === 'SEA' ||
        activeTeams[i].abbreviation === 'VGK' || activeTeams[i].abbreviation === 'LAK' || activeTeams[i].abbreviation === 'VAN' ||
        activeTeams[i].abbreviation === 'ANA' || activeTeams[i].abbreviation === 'SJS') {
        currentTeam.division = 'pacific';
    }
    else if(activeTeams[i].abbreviation === 'COL' || activeTeams[i].abbreviation === 'DAL' || activeTeams[i].abbreviation === 'MIN' ||
        activeTeams[i].abbreviation === 'WPG' || activeTeams[i].abbreviation === 'NSH' || activeTeams[i].abbreviation === 'STL' ||
        activeTeams[i].abbreviation === 'ARI' || activeTeams[i].abbreviation === 'CHI') {
        currentTeam.division = 'central';
    }
    currentTeam.schedule = await getSchedule(currentTeam);

    teamsArray.push(currentTeam);
    }
    return teamsArray;
}

export async function getSchedule(selectedTeam) {
    console.log('getting schedule of ', selectedTeam) 
    var teamID = returnTeamID(selectedTeam.name);
    /*  There's a very specific case here where the NHL scheduled games for the predators and sharks before the season
        started, because of this, we need to have a start date variable which changes if the team is them since the rest
        of the teams potentially have preseason games at that time. */
    var startDate;
    if(selectedTeam.name === 'SAN JOSE SHARKS' || selectedTeam.name === 'NASHVILLE PREDATORS') {
        startDate = '2022-10-07';
    }
    else {
        startDate = '2022-10-11';
    }
    return axios.get(`https://statsapi.web.nhl.com/api/v1/schedule?teamId=${teamID}&startDate=${startDate}&endDate=2023-04-14`).then( res => {
        return(res.data.dates);
    });
}
    
export async function main() {
    console.log('calling');
    let teams = await getActiveTeams();
    console.log(teams);
}

export function getMonthFromString(mon){
    var d = Date.parse(mon + "1, 2012");
    if(!isNaN(d)){
       return new Date(d).getMonth() + 1;
    }
    return -1;
}


export function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}