const Joi = require('joi');
const bottleneck = require('bottleneck');
const { render } = require('ejs');
const daily_api_key = process.env.DAILY_RIOT_API_KEY;

const apiReqestLimiter = new bottleneck({
  minTime: 50
});

async function calculateWinLoss(match_ids, PUUID) {
  const numberOfMatches = 1;
  const slicedMatch_ids = match_ids.slice(0, numberOfMatches);
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  var wins = 0;
  var kills = 0;
  var deaths = 0;
  if (match_ids.length === 0) {
    console.log("No matches found in match history, returning 0% winrate and 0 KD");
    return ["Not enough games have been played on this account to display winrate.", 
    "Not enough games have been played on this account to display KD ratio."];
  } else {
    for (let match_id of slicedMatch_ids) {
      try {
        const data = await fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/${match_id}?api_key=${daily_api_key}`);
        const dataJson = await data.json();
        for (let participant of dataJson.info.participants) {
          if (participant.puuid === PUUID) {
            kills += participant.kills;
            deaths += participant.deaths;
            if (participant.win === true) {
              wins++;
            }
          }
        }
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
      }
      await delay(50);
    };
    let decimal_places = 2;
    let winrate = (wins/numberOfMatches * 100).toFixed(decimal_places);
    let kd = (kills/deaths).toFixed(decimal_places);
    return [winrate, kd];
  }
}

async function getMatchHistory(PUUID) {
  try {
    const data = await fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${PUUID}/ids?start=0&count=20&api_key=${daily_api_key}`);
    const dataJson = await data.json();
    var match_ids = dataJson;
    return match_ids;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  };
}

function validateSummonerCredentials(summonerUsername, summonerID) {
  const summonerUsernameSchema = Joi.string().min(3).max(16).alphanum().required();
  const summonerIDSchema = Joi.string().min(3).max(5).alphanum().required();
  
  const summonerUsernameValidationResult = summonerUsernameSchema.validate(summonerUsername);
  if (summonerUsernameValidationResult.error != null) {
    return false;
  }
  
  const summonerIDValidationResult = summonerIDSchema.validate(summonerID);
  if (summonerIDValidationResult.error != null) {
    return false;
  }
  
  return true;
};

function riotCredentialsExist (RiotUsername, RiotID) {
  if (!RiotUsername || !RiotID) {
    return false;
  } else {
    return true;
  }
}

function verifyLeagueRank (rank) {
  if (rank === null) {
    return ["UNRANKED"];
  } else {
    return rank;
  }
}

async function getRiotPUUID(riotUsername, riotID) {
  try {
    const data = await fetch(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${riotUsername}/${riotID}?api_key=${daily_api_key}`)
    if (data.status != 200) {
      return false;
    }
    const dataJson = await data.json();
    const PUUID = dataJson.puuid;
    if (PUUID === undefined) {
      return false;
    }
    return PUUID;
  } catch (error){
    console.error('Could not fetch puuid:', error);
  }
}

async function getSummonerEncryptedIdAndLevel(PUUID) {
  try {
    const data = await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${PUUID}?api_key=${daily_api_key}`);
    const dataJson = await data.json();
    const encryptedSummonerId = dataJson.id;
    if (encryptedSummonerId === undefined) {
      return false;
    }
    const summonerLevel = dataJson.summonerLevel;
    if (summonerLevel === undefined) {
      return false;
    }
    return [encryptedSummonerId, summonerLevel];
  } catch (error) {
    console.error('Could not fetch encrypted id and level:', error);
  }
}

async function getSummonerRankAndWinrate(encryptedSummonerId) {
  try {
    const data = await fetch(`https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}?api_key=${daily_api_key}`);
    const dataJson = await data.json();
    console.log(dataJson);
    if (dataJson.length === 0) {
      return null;
    } else {
      return [returnSummonerRank(dataJson), returnSummonerWinrate(dataJson)];
    };
  } catch (error) {
    console.error('Could not fetch rank and winrate:', error);
  }
};

function returnSummonerWinrate(dataJson) {
  for (let i = 0; i < dataJson.length; i++) {
    if (dataJson[i].queueType === "RANKED_SOLO_5x5") {
      let decimalPlaces = 2;
      return (dataJson[i].wins / (dataJson[i].wins + dataJson[i].losses) * 100).toFixed(decimalPlaces);
    }
  }
}

function returnSummonerRank(dataJson) {
  for (let i = 0; i < dataJson.length; i++) {
    if (dataJson[i].queueType === "RANKED_SOLO_5x5") {
      return [dataJson[i].tier, dataJson[i].rank];
    }
  }
};

async function getSummonerStats(riotUsername, riotID) {
  var summonerLevel;
  var summonerRank;
  var summonerWinrate;
  try {
    const PUUID = await getRiotPUUID(riotUsername, riotID);
    if (PUUID === false) {
      return false;
    } 
    const summonerDetails = await getSummonerEncryptedIdAndLevel(PUUID);
    const encryptedSummonerId = summonerDetails[0];
    summonerLevel = summonerDetails[1];
    const summonerRankAndWinrate = await getSummonerRankAndWinrate(encryptedSummonerId);
    console.log(summonerRankAndWinrate);
    if (summonerRankAndWinrate === null) {
      summonerRank = ["UNRANKED"];
      summonerWinrate = 0.00;
    } else {
      summonerRank = summonerRankAndWinrate[0];
      summonerWinrate = summonerRankAndWinrate[1];
    }
  } catch (error) {
    console.error('Could not fetch summoner stats:', error);
  }
  return [summonerLevel, summonerRank, summonerWinrate];

};

function renderCaseNoRiotNoSearch (res, tasks, gamingSuggestions) {
  res.render("game.ejs", { 
    tasks: tasks, 
    gamingSuggestions: gamingSuggestions,
    noRiot: "No Riot credentials linked to this account. Cannot display your stats.", 
    noSummoner: "No summoner credentials provided. Cannot display other summoner stats.",
    additionalSummoner: "", 
  });
  return;
};

function renderCaseNoRiotInvalidSearch (res, tasks, gamingSuggestions) {
  res.render("game.ejs", { 
    tasks: tasks, 
    gamingSuggestions: gamingSuggestions,
    noRiot: "No Riot credentials linked to this account. Cannot display your stats.", 
    noSummoner: "Summoner credentials provided are invalid. Cannot display other summoner stats.",
    additionalSummoner: "", 
  });
  return;
};

function renderCaseNoRiotValidSearch (res, tasks, gamingSuggestions, otherSummonerLevel, otherRank, otherWinrate) {
  res.render("game.ejs", { 
    tasks: tasks, 
    gamingSuggestions: gamingSuggestions,
    noRiot: "No Riot credentials linked to this account. Cannot display your stats.", 
    noSummoner: "",
    additionalSummoner: "yes", 
    otherSummonerLevel: otherSummonerLevel,
    otherRank: otherRank,
    otherWinrate: otherWinrate,
  });
  return;
};

async function displayStatsNoRiotCases (res, RiotUsername, RiotID, tasks, otherRiotUsername, otherRiotID, gamingSuggestions) {
  
  if (!(riotCredentialsExist(RiotUsername, RiotID)) && (riotCredentialsExist(otherRiotUsername, otherRiotID))) {
    const otherSummonerStats = await getSummonerStats(otherRiotUsername, otherRiotID);
    console.log(otherSummonerStats);
    console.log('here')
    if (otherSummonerStats === false) {
      renderCaseNoRiotInvalidSearch(res, tasks, gamingSuggestions);
      return;
    } else {
      otherSummonerLevel = otherSummonerStats[0];
      otherRank = verifyLeagueRank(otherSummonerStats[1]);
      otherWinrate = otherSummonerStats[2]; 
      renderCaseNoRiotValidSearch(res, tasks, gamingSuggestions, otherSummonerLevel, otherRank, otherWinrate);
      return;
    }    
  } else {
    if (!(riotCredentialsExist(RiotUsername, RiotID)) && !(riotCredentialsExist(otherRiotUsername, otherRiotID))) {
      renderCaseNoRiotNoSearch(res, tasks, gamingSuggestions);
      return;
    };
  }
};

async function displayStats (res, RiotUsername, RiotID, tasks, otherRiotUsername, otherRiotID, gamingSuggestions) {
  
  displayStatsNoRiotCases(res, RiotUsername, RiotID, tasks, otherRiotUsername, otherRiotID, gamingSuggestions);



  if (riotCredentialsExist(RiotUsername, RiotID) && (!(otherRiotUsername === undefined) || !(otherRiotID === undefined))) {
    const PUUID = await getRiotPUUID(RiotUsername, RiotID);
    const summonerDetails = await getSummonerLevelAndID(PUUID);
    const summonerLevel = summonerDetails[1];
    const encryptedSummonerId = summonerDetails[0];
    const summonerRank = await getSummonerRank(encryptedSummonerId);
    if (summonerRank === null) {
      var rank = ["UNRANKED"];
    } else {
      var rank = summonerRank;
    }
    const match_ids = await getMatchHistory(PUUID);
    const winrateAndKD = await calculateWinLoss(match_ids, PUUID);
    const winrate = winrateAndKD[0];
    const kd = winrateAndKD[1];
    
    const otherPUUID = await getRiotPUUID(otherRiotUsername, otherRiotID);
    const otherSummonerDetails = await getSummonerLevelAndID(otherPUUID);
    const otherSummonerLevel = otherSummonerDetails[1];
    const otherEncryptedSummonerId = otherSummonerDetails[0];
    const otherSummonerRank = await getSummonerRank(otherEncryptedSummonerId);
    if ((otherEncryptedSummonerId || otherSummonerRank) === undefined) {
      res.render("game.ejs", { 
        tasks: tasks, 
        gamingSuggestions: gamingSuggestions,
        level: summonerLevel, 
        rank: rank, 
        winrate: winrate, 
        kd: kd, 
        noRiot: "", 
        noSummoner: "Summoner credentials provided are invalid. Cannot display other summoner stats.",
        additionalSummoner: "", 
      });
      return;
    };
    if (otherSummonerRank === null) {
      var otherRank = ["UNRANKED"];
    } else {
      var otherRank = otherSummonerRank;
    }
    const otherMatch_ids = await getMatchHistory(otherPUUID);
    const otherWinrateAndKD = await calculateWinLoss(otherMatch_ids, otherPUUID);
    // const otherWinrate = otherWinrateAndKD[0];
    const otherWinrate = await getSummonerWinrate(otherEncryptedSummonerId);
    const otherkd = otherWinrateAndKD[1];
    
    res.render("game.ejs", { 
      tasks: tasks, 
      gamingSuggestions: gamingSuggestions,
      level: summonerLevel, 
      rank: rank, 
      winrate: winrate, 
      kd: kd, 
      noRiot: "", 
      noSummoner: "",
      additionalSummoner: "yes", 
      otherSummonerLevel: otherSummonerLevel,
      otherRank: otherRank,
      otherWinrate: otherWinrate,
      otherkd: otherkd
    });
    return;
  };

  // const PUUID = await getRiotPUUID(RiotUsername, RiotID);
  // const summonerDetails = await getSummonerLevelAndID(PUUID);
  // const summonerLevel = summonerDetails[1];
  // const encryptedSummonerId = summonerDetails[0];
  // const summonerRank = await getSummonerRank(encryptedSummonerId);
  // if (summonerRank === null) {
  //   var rank = ["UNRANKED"];
  // } else {
  //   var rank = summonerRank;
  // }
  // const match_ids = await getMatchHistory(PUUID);
  // const winrateAndKD = await calculateWinLoss(match_ids, PUUID);
  // const winrate = winrateAndKD[0];
  // const kd = winrateAndKD[1];
  // res.render("game.ejs", { 
  //   tasks: tasks, 
  //   gamingSuggestions: gamingSuggestions,
  //   level: summonerLevel, 
  //   rank: rank, 
  //   winrate: winrate, 
  //   kd: kd, 
  //   noRiot: "", 
  //   noSummoner: "No summoner credentials provided. Cannot display other summoner stats.",
  //   additionalSummoner: "", 
  // });
  // return;
};

//Exporting my API logic functions so they may be used in the index.js file.
module.exports = {
  validateSummonerCredentials,
  displayStats,
};
