import teams, { getTeamId } from "@nhl-api/teams";

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