const Joi = require('joi');
const { render } = require('ejs');
const daily_api_key = process.env.DAILY_RIOT_API_KEY;

function validateSummonerCredentials(summonerUsername, summonerID) {
  //The schema below is based on RIOT's official requirements for a username and user tag.
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

async function searchSummoner (req, res) {
  delete req.session.otherRiotUsername;
  delete req.session.otherRiotID;

  var summonerUsername = req.body.summonerUsername;
  var summonerID = req.body.summonerID;

  if (validateSummonerCredentials(summonerUsername, summonerID)) {
    req.session.otherRiotUsername = summonerUsername;
    req.session.otherRiotID = summonerID;
    res.redirect('/game');
  } else {
    if (summonerUsername === "" && summonerID === "") {
      req.session.otherRiotUsername = undefined;
      req.session.otherRiotID = undefined;
    } else {
      //A known invalid username and ID are assigned in order to display the correct error message.
      req.session.otherRiotUsername = 'inval';
      req.session.otherRiotID = 'inval';
    }
    res.redirect('/game');
  }
};  

function verifyLeagueRank (rank) {
  if (rank === null) {
    return ["UNRANKED"];
  } else {
    return rank;
  }
}

//This helper function retrieves a user's unique ID.
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

//This helper funciton reqtrieves another ID specific to RIOT accounts that have played League of Legends.
//It also retrieves the user's League of Legends account level.
async function getSummonerEncryptedIdAndLevel(PUUID) {
  try {
    const data = await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${PUUID}?api_key=${daily_api_key}`);
    if (data.status != 200) {
      return false;
    }
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
    if (summonerDetails === false) {
      return false;
    } 
    const encryptedSummonerId = summonerDetails[0];
    summonerLevel = summonerDetails[1];
    const summonerRankAndWinrate = await getSummonerRankAndWinrate(encryptedSummonerId);
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

function renderCaseBaseCase (res, tasks, gamingSuggestions, summonerLevel, summonerRank, winrate) {
  res.render("game.ejs", { 
    tasks: tasks, 
    gamingSuggestions: gamingSuggestions,
    level: summonerLevel, 
    rank: summonerRank, 
    winrate: winrate, 
    noRiot: "", 
    noSummoner: " ",
    additionalSummoner: "", 
  });
  return;
}

function renderCaseBaseCaseInvalidSearch (res, tasks, gamingSuggestions, summonerLevel, summonerRank, winrate) {
  res.render("game.ejs", { 
    tasks: tasks, 
    gamingSuggestions: gamingSuggestions,
    level: summonerLevel, 
    rank: summonerRank, 
    winrate: winrate, 
    noRiot: "", 
    noSummoner: "Provided summoner credentials are invalid.",
    additionalSummoner: "", 
  });
  return;
};

function renderCaseNoRiotNoSearch (res, tasks, gamingSuggestions) {
  res.render("game.ejs", { 
    tasks: tasks, 
    gamingSuggestions: gamingSuggestions,
    noRiot: "No Riot credentials linked to this account. Cannot display your stats.", 
    noSummoner: " ",
    additionalSummoner: "", 
    rank: ["UNRANKED"],
  });
  return;
};

function renderCaseNoRiotInvalidSearch (res, tasks, gamingSuggestions) {
  res.render("game.ejs", { 
    tasks: tasks, 
    gamingSuggestions: gamingSuggestions,
    noRiot: "No Riot credentials linked to this account. Cannot display your stats.", 
    noSummoner: "Provided summoner credentials are invalid.",
    additionalSummoner: "", 
    rank: ["UNRANKED"],
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
    rank: ["UNRANKED"],
  });
  return;
};

//Logic required for rendering ejs when the use does not have a RIOT account linked to their profile.
async function displayStatsNoRiotCases (res, RiotUsername, RiotID, tasks, otherRiotUsername, otherRiotID, gamingSuggestions) {
  if (!(riotCredentialsExist(RiotUsername, RiotID)) && (riotCredentialsExist(otherRiotUsername, otherRiotID))) {
    const otherSummonerStats = await getSummonerStats(otherRiotUsername, otherRiotID);
    if (otherSummonerStats === false) {
      if (otherRiotUsername != "" || otherRiotID != "") {
      renderCaseNoRiotInvalidSearch(res, tasks, gamingSuggestions);
      return;
      } else {
        renderCaseNoRiotNoSearch(res, tasks, gamingSuggestions);
        return;
      }
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

//Logic required for rendering ejs when the user with a RIOT account linked to their profile arrives at the game page. 
async function displayStatsBaseCase (res, RiotUsername, RiotID, tasks, otherRiotUsername, otherRiotID, gamingSuggestions) {
  if ((riotCredentialsExist(RiotUsername, RiotID)) && (!riotCredentialsExist(otherRiotUsername, otherRiotID))) {
    const userStats = await getSummonerStats(RiotUsername, RiotID);
    summonerLevel = userStats[0];
    summonerRank = verifyLeagueRank(userStats[1]);
    winrate = userStats[2];
    renderCaseBaseCase(res, tasks, gamingSuggestions, summonerLevel, summonerRank, winrate);
    return;
  };
};

//Logic required for rendering ejs when the user has a RIOT account linked to their profile and a valid search is made.
async function displayStatsRiotAndSearch (res, RiotUsername, RiotID, tasks, otherRiotUsername, otherRiotID, gamingSuggestions) {
  if (riotCredentialsExist(RiotUsername, RiotID) && (riotCredentialsExist(otherRiotUsername, otherRiotID))) {
    const userStats = await getSummonerStats(RiotUsername, RiotID);
    const otherSummonerStats = await getSummonerStats(otherRiotUsername, otherRiotID);
    summonerLevel = userStats[0];
    summonerRank = verifyLeagueRank(userStats[1]);
    winrate = userStats[2];
    if (otherSummonerStats === false) {
      renderCaseBaseCaseInvalidSearch(res, tasks, gamingSuggestions, summonerLevel, summonerRank, winrate);
      return;
    } else { 
      otherSummonerLevel = otherSummonerStats[0];
      otherRank = verifyLeagueRank(otherSummonerStats[1]);
      otherWinrate = otherSummonerStats[2];
      res.render("game.ejs", { 
        tasks: tasks, 
        gamingSuggestions: gamingSuggestions,
        level: summonerLevel, 
        rank: summonerRank, 
        winrate: winrate, 
        noRiot: "", 
        noSummoner: "",
        additionalSummoner: "yes", 
        otherSummonerLevel: otherSummonerLevel,
        otherRank: otherRank,
        otherWinrate: otherWinrate,
      });
      return;
    };
  };
};

async function displayStats (res, RiotUsername, RiotID, tasks, otherRiotUsername, otherRiotID, gamingSuggestions) {
  displayStatsNoRiotCases(res, RiotUsername, RiotID, tasks, otherRiotUsername, otherRiotID, gamingSuggestions);

  displayStatsRiotAndSearch(res, RiotUsername, RiotID, tasks, otherRiotUsername, otherRiotID, gamingSuggestions);

  displayStatsBaseCase(res, RiotUsername, RiotID, tasks, otherRiotUsername, otherRiotID, gamingSuggestions);
};

//Exporting my API logic functions so they may be used in the index.js file.
module.exports = {
  validateSummonerCredentials,
  displayStats,
  getRiotPUUID,
  getSummonerEncryptedIdAndLevel,
  searchSummoner,
};
