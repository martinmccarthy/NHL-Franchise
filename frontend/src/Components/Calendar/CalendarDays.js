import './Calendar.css'
import { useState, useEffect } from 'react';

function CalendarDays(props) {
    let firstDayOfMonth = new Date(props.day.getFullYear(), props.day.getMonth(), 1);
    let weekdayOfFirstDay = firstDayOfMonth.getDay();
    let currentDays = [];

    const [eastPlayoffs, setEastPlayoffs] = useState([]);
    const [westPlayoffs, setWestPlayoffs] = useState([]);
    const [playoffBracket, setPlayoffBracket] = useState(props.playoffBracket);

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
          status: '',
          playoffGame: false
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
        let homeIndex = playoffBracket.findIndex(({home}) => home.team === props.myTeam);
        let awayIndex = playoffBracket.findIndex(({away}) => away.team === props.myTeam);
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
            let index = currentDays.findIndex((day) => day === givenDate);
            let timeBetween = Math.round((givenDate.date.getTime() - playoffDate.getTime()) / (1000 * 60 * 60 * 24))
            if(timeBetween % 2 === 0 || timeBetween > 14) {
                return;
            }
            currentDays[index].playoffGame = true;
            let bracket = calculatePlayoffBracket()
            if(bracket.status === 'away') {
                let logo = bracket.matchup.home.team.logo;
                return(
                    <div className={"calendarImage " + checkIfSimmed(givenDate)} style={getAwaySecondary(props.myTeam, givenDate)}>
                        <img src={logo} alt={bracket.matchup.home.team.name}/>
                    </div>
                )
            }
            else if(bracket.status === 'home') {
                let logo = bracket.matchup.away.team.logo;
                return(
                    <div className={"calendarImage " + checkIfSimmed(givenDate)} style={getHomePrimary(props.myTeam, givenDate)}>
                        <img src={logo} alt={bracket.matchup.away.team.name}/>
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
        let metroMatchup = {home: {team: playoffsEast[1], seriesRecord: {wins: 0, losses: 0}}, away: {team: playoffsEast[0] , seriesRecord: {wins: 0, losses: 0}}, matchup:'metro'};
        let atlanticMatchup = {home: {team: playoffsEast[4], seriesRecord: {wins: 0, losses: 0}}, away: {team: playoffsEast[3], seriesRecord: {wins: 0, losses: 0}}, matchup: 'atlantic'};
        let pacificMatchup = {home: {team: playoffsWest[1], seriesRecord: {wins: 0, losses: 0}}, away: {team: playoffsWest[0], seriesRecord: {wins: 0, losses: 0}}, matchup: 'pacific'}
        let centralMatchup = {home: {team: playoffsWest[4], seriesRecord: {wins: 0, losses: 0}}, away: {team: playoffsWest[3], seriesRecord: {wins: 0, losses: 0}}, matchup: 'central'}

        /* This block just checks the which team plays wildcard one and which one plays wildcard 2, the first if condition is the atlantic team winning the east, its respective else is
            the metro team winning the east. In the west, the first if condition is the central team winning the west and the second is the pacific team winning the west. */
        if(playoffsEast[5].record.wins > playoffsEast[2].record.wins) {
            topMatchupEast = {home: {team: playoffsEast[5], seriesRecord: {wins: 0, losses: 0}}, away: {team: eastWildcard[0], seriesRecord: {wins: 0, losses: 0}}, matchup: 'atlantic'}
            secondMatchupEast = {home: {team: playoffsEast[2], seriesRecord: {wins: 0, losses: 0}}, away: {team: eastWildcard[1], seriesRecord: {wins: 0, losses: 0}}, matchup: 'metro'}
        }
        else {
            topMatchupEast = {home: {team: playoffsEast[2], seriesRecord: {wins: 0, losses: 0}}, away: {team: eastWildcard[0], seriesRecord: {wins: 0, losses: 0}}, matchup: 'metro'}
            secondMatchupEast = {home: {team: playoffsEast[5], seriesRecord: {wins: 0, losses: 0}}, away: {team: eastWildcard[1], seriesRecord: {wins: 0, losses: 0}}, matchup: 'atlantic'}
        }
        if(playoffsWest[5].record.wins > playoffsWest[2].record.wins) {
            topMatchupWest = {home: {team: playoffsWest[5], seriesRecord: {wins: 0, losses: 0}}, away: {team: westWildcard[0], seriesRecord: {wins: 0, losses: 0}}, matchup: 'central'}
            secondMatchupWest = {home: {team: playoffsWest[2], seriesRecord: {wins: 0, losses: 0}}, away: {team: westWildcard[1], seriesRecord: {wins: 0, losses: 0}}, matchup: 'pacific'}
        }
        else {
            topMatchupWest = {home: {team: playoffsWest[2], seriesRecord: {wins: 0, losses: 0}}, away: {team: westWildcard[0], seriesRecord: {wins: 0, losses: 0}}, matchup: 'pacific'}
            secondMatchupWest = {home: {team: playoffsWest[5], seriesRecord: {wins: 0, losses: 0}}, away: {team: westWildcard[1], seriesRecord: {wins: 0, losses: 0}}, matchup: 'central'}
        }

        playoffsEast.unshift(eastWildcard[0], eastWildcard[1]);
        playoffsWest.unshift(westWildcard[0], westWildcard[1]);

        if(eastPlayoffs.length < 1 && westPlayoffs.length < 1) {
            setEastPlayoffs(playoffsEast);
            setWestPlayoffs(playoffsWest);
            let playoffs = [topMatchupEast, topMatchupWest, secondMatchupEast, secondMatchupWest, atlanticMatchup, metroMatchup, centralMatchup, pacificMatchup]
            setPlayoffBracket(playoffs)
            props.setPlayoffBracket(playoffs);
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
                    <div className={"calendarDay" + (day.currentMonth ? " current" : "") + (day.selected ? " selected" : "") + (checkIfSimmed(day))} onClick={(e) => {if(e.target.className.includes('inactive')) return; props.changeCurrentDay(day, currentDays)}}>
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