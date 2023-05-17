import {useEffect, useState} from 'react';
import * as utils from '../util';
import CalendarDays from './CalendarDays';
import './Calendar.css'

function Calendar(props) {
    let myTeam = props.myTeam;
    let teamHolder = props.teamHolder;
    const months = ["January","February","March","April","May","June","July",
                    "August","September","October","November","December"];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const [currentDay, setCurrentDay] = useState(props.currentDay)

    const playoffDate = new Date(2023, 3, 17)

    function changeCurrentDay(day) {
        let dayToSimTo = day.date;
        let tempDate = new Date(currentDay);
        while(tempDate.getTime() < dayToSimTo.getTime()) {
            simulateGames(tempDate);
            tempDate.setDate(tempDate.getDate() + 1);
        }
        setCurrentDay(new Date(day.year, day.month, day.number));
    }

    function getRandomInt(min, max) {       
        // Create byte array and fill with 1 random number
        var byteArray = new Uint8Array(1);
        window.crypto.getRandomValues(byteArray);
    
        var range = max - min + 1;
        var max_range = 256;
        if (byteArray[0] >= Math.floor(max_range / range) * range)
            return getRandomInt(min, max);
        return min + (byteArray[0] % range);
    }


    function generateWeightedNumber(weights) {
        // Assign weights to each number      
        // Calculate the total weight
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      
        // Generate a random value using crypto.getRandomValues
        const randomBytes = new Uint8Array(1);
        crypto.getRandomValues(randomBytes);
        const randomValue = randomBytes[0] / 255;
      
        // Determine the weighted number based on the random value
        let cumulativeWeight = 0;
        for (let i = 0; i < weights.length; i++) {
          cumulativeWeight += weights[i] / totalWeight;
          if (randomValue < cumulativeWeight) {
            return i; // Return the index as the weighted number
          }
        }
      
        return weights.length - 1; // Fallback to the last index if something goes wrong
      }

    function assignPlayerPoints(allTeams, homeTeam, homeGoals, awayTeam, awayGoals) {
        var newTeams = allTeams;
        let homeIndex = newTeams.findIndex(({name})=> name === homeTeam);
        let homeRoster = newTeams[homeIndex].roster;
        console.log(homeTeam + ': ', homeGoals)

        for (let i = 0; i < homeGoals; i++) {
            let position = getRandomInt(0, 25);
            let scorer;
            let scorerPosition = '';
        
            if (position < 20) {
            // Calculate the weights based on player overalls
                let forwardsWeights = homeRoster.forwards.map((player) => player.overall);
                let weightsSum = forwardsWeights.reduce((sum, weight) => sum + weight, 0);
                let normalizedWeights = forwardsWeights.map((weight) => weight / weightsSum);

                // Generate a random player index based on the weighted overalls
                let randomPlayerIndex = generateWeightedNumber(normalizedWeights);
                homeRoster.forwards[randomPlayerIndex].goals++;
                scorer = homeRoster.forwards[randomPlayerIndex];
                scorerPosition = 'forwards';
            } 
            else {
                let defenseWeights = homeRoster.defense.map((player) => player.overall);
                let randomPlayerIndex = generateWeightedNumber(defenseWeights);
                homeRoster.defense[randomPlayerIndex].goals++;
                scorer = homeRoster.defense[randomPlayerIndex];
                scorerPosition = 'defense';
                }
            
                let assisters = generateWeightedNumber([0.05, .15, 0.8]);
        
                for (let j = 0; j < assisters; j++) {
                let assistPosition = getRandomInt(0, 20);
                let randomPlayerIndex;
            
                if (assistPosition >= 5) {
                    if (scorerPosition === 'forwards') {
                    randomPlayerIndex = getRandomInt(0, homeRoster.forwards.length - 2);
                    while(homeRoster[scorerPosition][randomPlayerIndex] === scorer) randomPlayerIndex = getRandomInt(0, homeRoster.forwards.length - 1);
                    homeRoster.forwards[randomPlayerIndex].assists++;
                    } else {
                    randomPlayerIndex = getRandomInt(0, homeRoster.forwards.length - 1);
                    homeRoster.forwards[randomPlayerIndex].assists++;
                    }
              } 
              else {
                if (scorerPosition === 'defense') {
                  randomPlayerIndex = getRandomInt(0, homeRoster.defense.length - 2);
                  while(homeRoster[scorerPosition][randomPlayerIndex] === scorer) randomPlayerIndex = getRandomInt(0, homeRoster.defense.length - 1);
                  homeRoster.defense[randomPlayerIndex].assists++;
                } else {
                  randomPlayerIndex = getRandomInt(0, homeRoster.defense.length - 1);
                  homeRoster.defense[randomPlayerIndex].assists++;
                }
              }
            }
        }
        let awayIndex = newTeams.findIndex(({name})=> name === awayTeam);
        let awayRoster = newTeams[awayIndex].roster;
        for (let i = 0; i < awayGoals; i++) {
            let position = getRandomInt(0, 25);
            let scorer;
            let scorerPosition = '';
        
            if (position < 20) {
              let forwardsWeights = awayRoster.forwards.map((player) => player.overall);
              let randomPlayerIndex = generateWeightedNumber(forwardsWeights);
              awayRoster.forwards[randomPlayerIndex].goals++;
              scorer = awayRoster.forwards[randomPlayerIndex];
              scorerPosition = 'forwards';
            } else {
              let defenseWeights = awayRoster.defense.map((player) => player.overall);
              let randomPlayerIndex = generateWeightedNumber(defenseWeights);
              awayRoster.defense[randomPlayerIndex].goals++;
              scorer = awayRoster.defense[randomPlayerIndex];
              scorerPosition = 'defense';
            }
        
            let assisters = generateWeightedNumber([0.05, .15, 0.8]);
        
            for (let j = 0; j < assisters; j++) {
              let assistPosition = getRandomInt(0, 20);
              let randomPlayerIndex;
        
              if (assistPosition >= 5) {
                if (scorerPosition === 'forwards') {
                  randomPlayerIndex = getRandomInt(0, awayRoster.forwards.length - 2);
                  while(awayRoster[scorerPosition][randomPlayerIndex] === scorer) randomPlayerIndex = getRandomInt(0, awayRoster.forwards.length - 1);
                  awayRoster.forwards[randomPlayerIndex].assists++;
                } else {
                  randomPlayerIndex = getRandomInt(0, awayRoster.forwards.length - 1);
                  awayRoster.forwards[randomPlayerIndex].assists++;
                }
              } else {
                if (scorerPosition === 'defense') {
                  randomPlayerIndex = getRandomInt(0, awayRoster.defense.length - 2);
                  while(awayRoster[scorerPosition][randomPlayerIndex] === scorer) randomPlayerIndex = getRandomInt(0, awayRoster.defense.length - 1);
                  awayRoster.defense[randomPlayerIndex].assists++;
                } else {
                  randomPlayerIndex = getRandomInt(0, awayRoster.defense.length - 1);
                  awayRoster.defense[randomPlayerIndex].assists++;
                }
              }
            }

        }

        return newTeams;
    }

    /*  simulateGames simulates UP UNTIL the day that's passed in, if the
        user wants to simulate a game on the current day then it can be done
        with a modal */
    function simulateGames(givenDate) {
        let yearStr = givenDate.getFullYear();
        let monthStr = givenDate.getMonth() + 1
        let dayStr = givenDate.getDate();
        if(givenDate.getDate() < 10) dayStr = '0' + givenDate.getDate();
        if(givenDate.getMonth() + 1 < 10) monthStr = '0' + (givenDate.getMonth() + 1);
        var dateStr = yearStr + '-' + monthStr + '-' + dayStr;
        let allTeams = props.teamHolder.slice(0);
        let marked = [];
        for(let i = 0; i < allTeams.length; i++) {
            let team = allTeams[i];
            if(marked.find(name => name.toLowerCase() === team.name.toLowerCase())) {
                continue; // We've already done this team and don't want to recalculate
            }
            let schedule = team.schedule;
            let scheduleIndex = schedule.findIndex(({date}) => date === dateStr);
            if(scheduleIndex > -1) {
                let game = schedule[scheduleIndex].games[0]
                /* The current team is playing an away game */
                let awayTeam = game.teams.away.team.name;
                let awayIndex = allTeams.findIndex(({name})=> name === awayTeam);

                let homeTeam = game.teams.home.team.name;
                let homeIndex = allTeams.findIndex(({name})=> name === homeTeam);

                /* We know that the home team is the other team so we can just remove it once
                we've given them the wins and losses */
                let homeGoals = 0;
                let awayGoals = 0;
                let homeTeamOverall = utils.calculateTeamRating(allTeams[homeIndex])
                let awayTeamOverall = utils.calculateTeamRating(allTeams[awayIndex])
                let gameFactor;
                console.log(homeTeam + ': ' + homeTeamOverall)
                console.log(awayTeam + ': ' + awayTeamOverall)
                if(homeTeamOverall > awayTeamOverall) {
                    let homeOdds = .5 + ((homeTeamOverall - awayTeamOverall) / 100)
                    let awayOdds = 1 - homeOdds;
                    gameFactor = [homeOdds, awayOdds]
                }
                else {
                    let awayOdds = .5 + ((awayTeamOverall - homeTeamOverall) / 100)
                    let homeOdds = 1 - awayOdds;
                    gameFactor = [homeOdds, awayOdds]
                }
                if(generateWeightedNumber(gameFactor) === 0) {
                    homeGoals = getRandomInt(1, 10);
                    if(homeGoals > 1) {
                        awayGoals = getRandomInt(0, homeGoals - 1)
                    }
                    allTeams[homeIndex].record.wins = allTeams[homeIndex].record.wins + 1;
                    allTeams[awayIndex].record.losses = allTeams[awayIndex].record.losses + 1;
                }
                else {
                    awayGoals = getRandomInt(1, 10);
                    if(awayGoals > 1) {
                        homeGoals = getRandomInt(0, awayGoals - 1)
                    }
                    allTeams[awayIndex].record.wins = allTeams[awayIndex].record.wins + 1;
                    allTeams[homeIndex].record.losses = allTeams[homeIndex].record.losses + 1;            
                }
                allTeams = assignPlayerPoints(allTeams, homeTeam, homeGoals, awayTeam, awayGoals);
                marked.push(homeTeam, awayTeam);
            }
            props.adjustTeamRecords(allTeams, givenDate);
        }
    }

    return(<div className="calendar">
        <div className="calendarHeader">
            <div>{months[currentDay.getMonth()]} {currentDay.getFullYear()}</div>
        </div>
        <div className="calendarBody">
            <div className="tableHeader">
                {days.map(day => (
                    <div className="weekday">
                        <p>{day}</p>
                    </div>
                ))}
            </div>
        </div>
        <div className='cal'>
            <CalendarDays day={currentDay} myTeam={myTeam} teamHolder={teamHolder} changeCurrentDay={changeCurrentDay}/>
        </div>
    </div>)
}

export default Calendar;