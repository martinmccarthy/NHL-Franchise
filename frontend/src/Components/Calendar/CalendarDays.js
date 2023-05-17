import './Calendar.css'
import { useState, useEffect } from 'react';

function CalendarDays(props) {
    let firstDayOfMonth = new Date(props.day.getFullYear(), props.day.getMonth(), 1);
    let weekdayOfFirstDay = firstDayOfMonth.getDay();
    let currentDays = [];

    const [eastPlayoffs, setEastPlayoffs] = useState([]);
    const [westPlayoffs, setWestPlayoffs] = useState([]);
    const [playoffBracket, setPlayoffBracket] = useState([]);

    const playoffDate = new Date(2023, 3, 17)

    for (let day = 0; day < 42; day++) {
        if (day === 0 && weekdayOfFirstDay === 0) {
          firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 7);
        } else if (day === 0) {
          firstDayOfMonth.setDate(firstDayOfMonth.getDate() + (day - weekdayOfFirstDay));
        } else {
          firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
        }
    
        let calendarDay = {
          currentMonth: (firstDayOfMonth.getMonth() === props.day.getMonth()),
          date: (new Date(firstDayOfMonth)),
          month: firstDayOfMonth.getMonth(),
          number: firstDayOfMonth.getDate(),
          selected: (firstDayOfMonth.toDateString() === props.day.toDateString()),
          year: firstDayOfMonth.getFullYear(),
          status: ''
        }
    
        currentDays.push(calendarDay);
      }

    function checkIfSimmed(givenDate) {
        if(props.day.getTime() > givenDate.date.getTime()){
            return " inactive";
        }
        return "";
    }

    function getHomePrimary(team, givenDate) {
        let colors = team.colors;
        var style = {
            backgroundColor: colors[0]
        }
        if(checkIfSimmed(givenDate) === " inactive"){
            style.background = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))`
        }

        return style
    }

    function getAwaySecondary(team, givenDate) {
        let colors = team.colors;
        var style = {
            backgroundColor: colors[1]
        }
        if(checkIfSimmed(givenDate) === " inactive"){
            style.background = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))`
        }
        return style;
    }

    function calculatePlayoffBracket() {
        let homeIndex = playoffBracket.findIndex(({home}) => home.name === props.myTeam.name);
        let awayIndex = playoffBracket.findIndex(({away}) => away.name === props.myTeam.name);
        if(homeIndex > -1) return {matchup: playoffBracket[homeIndex], status: 'home'}
        return {matchup: playoffBracket[awayIndex], status: 'away'}
    }

    function checkForGameDay(givenDate) {
        let schedule = props.myTeam.schedule;
        let yearStr = givenDate.year;
        let monthStr = givenDate.month + 1
        let dayStr = givenDate.number;
        if(givenDate.number < 10) dayStr = '0' + givenDate.number;
        if(givenDate.month + 1 < 10) monthStr = '0' + (givenDate.month + 1);
        let currentDay = yearStr + '-' + monthStr + '-' + dayStr;
        let scheduleIndex = schedule.findIndex(({date}) => date === currentDay);
        
        /* The playoffs are started */
        if(givenDate.date.getTime() > playoffDate.getTime() && checkForPlayoffs() && props.day.getTime() >= playoffDate.getTime()) {
            let timeBetween = Math.round((givenDate.date.getTime() - playoffDate.getTime()) / (1000 * 60 * 60 * 24))
            console.log(timeBetween);
            if(timeBetween % 2 === 0 || timeBetween > 14) {
                return;
            }
            let bracket = calculatePlayoffBracket()
            console.log(bracket);
            if(bracket.status === 'away') {
                let logo = bracket.matchup.home.logo;
                return(
                    <div className={"calendarImage " + checkIfSimmed(givenDate)} style={getAwaySecondary(props.myTeam, givenDate)}>
                        <img src={logo} alt={bracket.matchup.home.name}/>
                    </div>
                )
            }
            else if(bracket.status === 'home') {
                let logo = bracket.matchup.away.logo;
                return(
                    <div className={"calendarImage " + checkIfSimmed(givenDate)} style={getHomePrimary(props.myTeam, givenDate)}>
                        <img src={logo} alt={bracket.matchup.away.name}/>
                    </div>
                )
            }
        }
        if(scheduleIndex > -1) {
            /*  We check to see if the scheduled game today is home or away, since the game data given to us
                only specifies the teams, we just check to see if the ID of the away team is ours, if it is then
                it is a road game, if it isn't then it's a home game. */
            if(schedule[scheduleIndex].games[0].teams.away.team.name === props.myTeam.name) {
                // We're away
                let homeTeam = schedule[scheduleIndex].games[0].teams.home.team.name;
                let homeIndex = props.teamHolder.findIndex(({name}) => name === homeTeam);
                let logo = '';
                if(homeIndex === -1) {
                } else {
                    logo = props.teamHolder[homeIndex].logo;
                }
                return (
                    <div className={"calendarImage " + checkIfSimmed(givenDate)} style={getAwaySecondary(props.myTeam, givenDate)}>
                        <img src={logo} />
                    </div>
                )
            }
            else {
                let awayTeam = schedule[scheduleIndex].games[0].teams.away.team.name;
                let awayIndex = props.teamHolder.findIndex(({name}) => name === awayTeam);
                let logo = props.teamHolder[awayIndex].logo;
                let abbr = props.teamHolder[awayIndex].abbreviation;
                return (
                    <div className={"calendarImage " + checkIfSimmed(givenDate)} style={getHomePrimary(props.myTeam, givenDate)}>
                        <img src={logo} alt={abbr}/>
                    </div>
                )
            }
        }
        return (<></>)
    }

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
        let metroTeams = props.teamHolder.filter(team => team.division === 'metropolitan');
        let atlanticTeams = props.teamHolder.filter(team => team.division === 'atlantic');
        let pacificTeams = props.teamHolder.filter(team => team.division === 'pacific');
        let centralTeams = props.teamHolder.filter(team => team.division === 'central');
        
        let topMetroTeams = findTopFive(metroTeams);
        let topAtlanticTeams = findTopFive(atlanticTeams);
        let topPacificTeams = findTopFive(pacificTeams);
        let topCentralTeams = findTopFive(centralTeams);

        topMetroTeams.sort((a, b) => a.record.wins - b.record.wins);
        topAtlanticTeams.sort((a, b) => a.record.wins - b.record.wins);
        topPacificTeams.sort((a, b) => a.record.wins - b.record.wins);
        topCentralTeams.sort((a, b) => a.record.wins - b.record.wins);
        let playoffsEast = [topMetroTeams[2], topMetroTeams[3], topMetroTeams[4], topAtlanticTeams[2], topAtlanticTeams[3], topAtlanticTeams[4]];
        let playoffsWest = [topPacificTeams[2], topPacificTeams[3], topPacificTeams[4], topCentralTeams[2], topCentralTeams[3], topCentralTeams[4]];

        let eastWildcard = [topMetroTeams[0], topMetroTeams[1], topAtlanticTeams[0], topAtlanticTeams[1]];
        let westWildcard = [topCentralTeams[0], topCentralTeams[1], topPacificTeams[0], topPacificTeams[1]];
        eastWildcard.sort((a, b) => a.record.wins - b.record.wins);
        westWildcard.sort((a, b) => a.record.wins - b.record.wins);
        
        eastWildcard.shift();
        eastWildcard.shift();
        westWildcard.shift();
        westWildcard.shift();
        
        let topMatchupEast;
        let secondMatchupEast;
        let topMatchupWest;
        let secondMatchupWest;
        let metroMatchup = {home: playoffsEast[1], away: playoffsEast[0]};
        let atlanticMatchup = {home: playoffsEast[4], away: playoffsEast[3]};
        let pacificMatchup = {home: playoffsWest[1], away: playoffsWest[0]}
        let centralMatchup = {home: playoffsWest[4], away: playoffsWest[3]}

        /* This block just checks the which team plays wildcard one and which one plays wildcard 2 */
        if(playoffsEast[5].record.wins > playoffsEast[2].record.wins) {
            topMatchupEast = {home: playoffsEast[5], away: eastWildcard[0]}
            secondMatchupEast = {home: playoffsEast[2], away: eastWildcard[1]}
        }
        else {
            topMatchupEast = {home: playoffsEast[2], away: eastWildcard[0]}
            secondMatchupEast = {home: playoffsEast[5], away: eastWildcard[1]}
        }
        if(playoffsWest[5].record.wins > playoffsWest[2].record.wins) {
            topMatchupWest = {home: playoffsWest[5], away: westWildcard[0]}
            secondMatchupWest = {home: playoffsWest[2], away: westWildcard[1]}
        }
        else {
            topMatchupWest = {home: playoffsWest[2], away: westWildcard[0]}
            secondMatchupWest = {home: playoffsWest[5], away: westWildcard[1]}
        }

        playoffsEast.unshift(eastWildcard[0], eastWildcard[1]);
        playoffsWest.unshift(westWildcard[0], westWildcard[1]);

        if(eastPlayoffs.length < 1 && westPlayoffs.length < 1) {
            setEastPlayoffs(playoffsEast);
            setWestPlayoffs(playoffsWest);
            setPlayoffBracket([topMatchupEast, topMatchupWest, secondMatchupEast, secondMatchupWest, atlanticMatchup, metroMatchup, centralMatchup, pacificMatchup])
        }
    }

    function checkForPlayoffs() {
        playoffCalculator();
        let userTeam = props.teamHolder.find(e => e.name === props.myTeam.name);
        if(userTeam.division === 'metropolitan' || userTeam.division === 'atlantic') {
            if(eastPlayoffs.find(team => team === userTeam)) return true;
        }
        else if(userTeam.division === 'central' || userTeam.division === 'pacific') {
            if(westPlayoffs.find(team => team === userTeam)) return true;
        }
        return false;
    }

    return(
        <div className="tableContent">
            {currentDays.map(day => {
                return(
                    <div className={"calendarDay" + (day.currentMonth ? " current" : "") + (day.selected ? " selected" : "") + (checkIfSimmed(day))} onClick={(e) => {if(e.target.className.includes('inactive')) return; props.changeCurrentDay(day)}}>
                        <p>{day.number}</p>
                        {checkForGameDay(day)}
                        <span>{day.status}</span>
                    </div>
                )
            })}
        </div>
    )
}

export default CalendarDays;