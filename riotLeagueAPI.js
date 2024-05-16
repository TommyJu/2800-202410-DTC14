//this stuff goes into env
const user_name = 'yehsu';
const user_tag = 'na1';
const daily_api_key = 'RGAPI-435df765-6b62-418a-ad22-7019d807a66e';

async function calculateWinLoss(match_ids, PUUID) {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  var wins = 0;
  var kills = 0;
  var deaths = 0;
  for (let match_id of match_ids) {
    // console.log(match_id);
    fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/${match_id}?api_key=${daily_api_key}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json(); // Parse the JSON from the response
    })
    .then(data => {
      // console.log(data.info.participants)
      for (let participant of data.info.participants) {
        if (participant.puuid === PUUID) {
          // console.log("win:" + participant.win);
          // console.log("participant kills: " + participant.kills);
          kills += participant.kills;
          deaths += participant.deaths;
          if (participant.win === true) {
            wins++;
          }
        }
      }});
      await delay(500);
  };
  let winrate = wins/match_ids.length * 100;
  let kd = kills/deaths;
  let decimal_places = 2;
  console.log("winrate: " + winrate.toFixed(decimal_places) + "%");
  console.log("KD:" + kd.toFixed(decimal_places))
}

function getMatchHistory(PUUID) {
  fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${PUUID}/ids?start=0&count=20&api_key=${daily_api_key}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json(); // Parse the JSON from the response
  })
  .then(data => {
    // console.log(data); // Handle the data from the API
    var match_ids = data;
    calculateWinLoss(match_ids, PUUID);
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });
}

function getSummonerRank(encryptedSummonerId) {
  fetch(`https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}?api_key=${daily_api_key}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json(); // Parse the JSON from the response
  })
  .then(data => {
    if (data.length === 0) {
      console.log("Currrent rank: unranked");
    }
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });
};

async function getSummonerDetails(PUUID) {
  // fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${PUUID}?api_key=${daily_api_key}`)
  // .then(response => {
  //   if (!response.ok) {
  //     throw new Error('Network response was not ok ' + response.statusText);
  //   }
  //   return response.json(); // Parse the JSON from the response
  // })
  // .then(data => {
  //   // console.log(data); // Handle the data from the API
  //   console.log("summoner level: " + data.summonerLevel);
  //   let encryptedSummonerId = data.id;
  //   getSummonerRank(encryptedSummonerId);
  // })
  // .catch(error => {
  //   console.error('There has been a problem with your fetch operation:', error);
  // });
  try {
    await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${PUUID}?api_key=${daily_api_key}`)
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}

async function getRiotPUUID() {
  // await await fetch(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${user_name}/${user_tag}?api_key=${daily_api_key}`)
  // .then(response => {
  //   if (!response.ok) {
  //     throw new Error('Network response was not ok ' + response.statusText);
  //   }
  //   return response.json(); // Parse the JSON from the response
  // })
  // .then(data => {
  //   // console.log("account_puuid =" + data.puuid); // Handle the data from the API
    
  //   // getSummonerDetails(PUUID);
  //   // getMatchHistory(PUUID);
  // })
  // .catch(error => {
  //   console.error('There has been a problem with your fetch operation:', error);
  // });
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
};