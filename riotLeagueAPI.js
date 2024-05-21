const Joi = require('joi');
const daily_api_key = process.env.DAILY_RIOT_API_KEY;

async function calculateWinLoss(match_ids, PUUID) {
  const numberOfMatches = 1
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
      await delay(500);
    };
    let decimal_places = 2;
    let winrate = (wins/numberOfMatches * 100).toFixed(decimal_places);
    let kd = (kills/deaths).toFixed(decimal_places);
    console.log("winrate: " + winrate + "%");
    console.log("KD:" + kd)
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

async function getSummonerRank(encryptedSummonerId) {
  try {
    const data = await fetch(`https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}?api_key=${daily_api_key}`);
    const dataJson = await data.json();
    if (dataJson.length === 0) {
      console.log("Currrent rank: unranked");
      return null;
    } else {
      var tier = dataJson[0].tier;
      var rank = dataJson[0].rank;
      return [tier, rank];
    };
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
};

async function getSummonerLevelAndID(PUUID) {
  try {
    const data = await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${PUUID}?api_key=${daily_api_key}`);
    const dataJson = await data.json();
    const encryptedSummonerId = dataJson.id;
    console.log("summonerID: " + encryptedSummonerId);
    const summonerLevel = dataJson.summonerLevel;
    console.log("summoner level: " + summonerLevel);
    return [encryptedSummonerId, summonerLevel];
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}

async function getRiotPUUID(user_name, user_tag) {
  try {
    const data = await fetch(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${user_name}/${user_tag}?api_key=${daily_api_key}`)
    const dataJson = await data.json();
    const PUUID = dataJson.puuid;
    console.log("account_puuid =" + PUUID);
    return PUUID;
  } catch (error){
    console.error('There has been a problem with your fetch operation:', error);
  }
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

function riotCredentialsExist (RiotUsername, RiotID, res) {
  if (RiotUsername === undefined || RiotID === undefined) {
    console.log("RiotUsername or RiotID is undefined.");
    res.render("game.ejs", { tasks: tasks, gameError: "No Riot credentials linked to this account."});
    return;
  }
}

async function displayUserStats (res, RiotUsername, RiotID, tasks) {
  const PUUID = await getRiotPUUID(RiotUsername, RiotID);
  const summonerDetails = await getSummonerLevelAndID(PUUID);
  const summonerLevel = summonerDetails[1];
  const encryptedSummonerId = summonerDetails[0];
  const summonerRank = await getSummonerRank(encryptedSummonerId);
  if (summonerRank === null) {
    var rank = "Unranked";
  } else {
    var rank = summonerRank[0] + " " + summonerRank[1];
  }
  const match_ids = await getMatchHistory(PUUID);
  const winrateAndKD = await calculateWinLoss(match_ids, PUUID);
  const winrate = winrateAndKD[0];
  const kd = winrateAndKD[1];
  console.log("hello");
  res.render("game.ejs", { tasks: tasks, level: summonerLevel, rank: rank, winrate: winrate, kd: kd, gameError: "" });
  return;
};

//Exporting my API logic functions so they may be used in the index.js file.
module.exports = {
  getRiotPUUID,
  getSummonerLevelAndID,
  getSummonerRank,
  getMatchHistory,
  calculateWinLoss,
  validateSummonerCredentials,
  riotCredentialsExist,
  displayUserStats,
  // displaySummonerStats,
};
