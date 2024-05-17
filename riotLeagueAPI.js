//this stuff goes into env
const daily_api_key = process.env.DAILY_RIOT_API_KEY;

async function calculateWinLoss(match_ids, PUUID) {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  var wins = 0;
  var kills = 0;
  var deaths = 0;
  for (let match_id of match_ids) {
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
  let winrate = (wins/match_ids.length * 100).toFixed(decimal_places);
  let kd = (kills/deaths).toFixed(decimal_places);
  console.log("winrate: " + winrate + "%");
  console.log("KD:" + kd)
  return [winrate, kd];
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
      return dataJson;
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

//Exporting my API logic functions so they may be used in the index.js file.
module.exports = {
  getRiotPUUID,
  getSummonerLevelAndID,
  getSummonerRank,
  getMatchHistory,
  calculateWinLoss,
};
