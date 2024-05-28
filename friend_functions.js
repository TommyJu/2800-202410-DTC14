
module.exports = {loadFriendsPage}

async function loadFriendsPage(req, res, userCollection) {
    if (req.session.authenticated) {
        // if logged in
        // gets user from DB based on session username
        const userInfo = await userCollection.findOne({ username: req.session.username });
        
        let userFriends = await userCollection.find({username: { $in: userInfo.friends } }).toArray();
        userFriends.sort((a, b) => {
          // Total level in descending order
          return (b.levels.game.level + b.levels.diet.level + b.levels.fitness.level) 
          - (a.levels.game.level + a.levels.diet.level + a.levels.fitness.level)
        })
    
        res.render("friends.ejs", {
          friends: userFriends,
          requests: userInfo.friendRequest
        });
        return;
      } else {
        // not logged in
        res.render("home_logged_out.ejs");
      }
}