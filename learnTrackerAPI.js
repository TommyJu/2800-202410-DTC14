const { match } = require("assert");
const { get } = require("http");

const user_name = 'yehsu';
const user_tag = 'na1';
const daily_api_key = 'RGAPI-d3940fab-ce91-4c3e-81ae-7b03bac1e1f2';


async function calculateWinLoss(match_ids) {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  for (let match_id of match_ids) {
    console.log(match_id);
    fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/NA1_4983533698?api_key=RGAPI-d3940fab-ce91-4c3e-81ae-7b03bac1e1f2`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json(); // Parse the JSON from the response
    })
    .then(data => {
      console.log(data.info.teams[0].win);
    })
    await delay(1000);
  };
}

function getMatchHistory(PUUID) {
  fetch('https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/tNPQYocszVA7d2xDsY-XPDkrKdOT4C3WO90u8D51p0EZEl5yBmu4jcg0h06m2ah3O22B3akYtrnylg/ids?start=0&count=20&api_key=RGAPI-d3940fab-ce91-4c3e-81ae-7b03bac1e1f2')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json(); // Parse the JSON from the response
  })
  .then(data => {
    console.log(data); // Handle the data from the API
    calculateWinLoss(data);
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });
}

function getRiotPUUID() {
  fetch('https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/yehsu/na1?api_key=RGAPI-d3940fab-ce91-4c3e-81ae-7b03bac1e1f2')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json(); // Parse the JSON from the response
  })
  .then(data => {
    console.log("account_puuid =" + data.puuid); // Handle the data from the API
    getMatchHistory(data.puuid);
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });
}

getRiotPUUID();