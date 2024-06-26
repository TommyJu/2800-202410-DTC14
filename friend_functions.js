const Joi = require('joi');
module.exports = { loadFriendsPage, loadFriendsPageWithRequestSearch, loadFriendsPageWithFriendSearch,searchFriendRequest , searchFriendDisplay, sendFriendRequest, searchFriendClear, acceptFriend, rejectFriend, deleteFriend}

async function loadFriendsPage(req, res, userCollection) {
    if (req.session.authenticated) {
        // if logged in
        // gets user from DB based on session username
        const userInfo = await userCollection.findOne({ username: req.session.username });

        let userFriends = await userCollection.find({ username: { $in: userInfo.friends } }).toArray();
        userFriends.sort((a, b) => {
            // Total level in descending order
            return (b.levels.game.level + b.levels.diet.level + b.levels.fitness.level)
                - (a.levels.game.level + a.levels.diet.level + a.levels.fitness.level)
        })

        res.render("friends.ejs", {
            friends: userFriends,
            requests: userInfo.friendRequests
        });
        return;
    } else {
        // not logged in
        res.render("home_logged_out.ejs");
    }
}

async function loadFriendsPageWithRequestSearch(req, res, userCollection, searched) {
    if (req.session.authenticated) {
        // if logged in
        // gets user from DB based on session username
        const userInfo = await userCollection.findOne({ username: req.session.username });

        let userFriends = await userCollection.find({ username: { $in: userInfo.friends } }).toArray();
        // create shallow copy of friendRequest to change array
        let userRequests = userInfo.friendRequests.slice();
        // filters the request user to only have the searched username
        userRequests = userRequests.filter((checkingUserName) => {return checkingUserName == searched});

        userFriends.sort((a, b) => {
            // Total level in descending order
            return (b.levels.game.level + b.levels.diet.level + b.levels.fitness.level)
                - (a.levels.game.level + a.levels.diet.level + a.levels.fitness.level)
        });

        res.render("friends.ejs", {
            friends: userFriends,
            requests: userRequests
        });
        return;
    } else {
        // not logged in
        res.render("home_logged_out.ejs");
    }
}
// when param is /display/someuser
async function loadFriendsPageWithFriendSearch(req, res, userCollection, searched) {
    if (req.session.authenticated) {
        // if logged in
        // gets user from DB based on session username
        const userInfo = await userCollection.findOne({ username: req.session.username });
        let userRequests = userInfo.friendRequests;
        let userFriendsList = userInfo.friends;
        // creates a copy to remove lements from
        let userFriendsSlice = userFriendsList.slice();
        // filters the friend array
        userFriendsSlice = userFriendsSlice.filter((checkingUserName) => {return checkingUserName == searched})
        let userFriends = await userCollection.find({ username: { $in: userFriendsSlice } }).toArray();

        res.render("friends.ejs", {
            friends: userFriends,
            requests: userRequests
        });
        return;
    } else {
        // not logged in
        res.render("home_logged_out.ejs");
    }
}

async function searchFriendRequest(req, res) {
    
    const searchedUsername = req.body.friendUsername.trim();

  // Verify that the input username is not a noSQL injection
  const usernameSchema = Joi.string().max(20).required();
  const usernameValidationResult = usernameSchema.validate(searchedUsername);
  if (usernameValidationResult.error != null) {
      res.render("./templates/friends/invalid_friend_request.ejs", { type: "Invalid username." });
      return;
  }
  const redirectLink = '/friends?type=requests&searched=' + searchedUsername;
  res.redirect( redirectLink);
}

async function searchFriendDisplay(req, res) {
    
    const searchedUsername = req.body.friendUsername.trim();

  // Verify that the input username is not a noSQL injection
  const usernameSchema = Joi.string().max(20).required();
  const usernameValidationResult = usernameSchema.validate(searchedUsername);
  if (usernameValidationResult.error != null) {
      res.render("./templates/friends/invalid_friend_request.ejs", { type: "Invalid username." });
      return;
  }
  const redirectLink = '/friends?type=display&searched=' + searchedUsername;
  res.redirect( redirectLink);
}

function searchFriendClear(req, res) {
    res.redirect('/friends');
}

async function sendFriendRequest(req, res, userCollection) {
    const senderUsername = req.session.username;
    const recipientUsername = req.body.friendUsername.trim();
    
    // Verify that the recipient username is not a noSQL injection
    const usernameSchema = Joi.string().max(20).required();
    const usernameValidationResult = usernameSchema.validate(recipientUsername);
    if (usernameValidationResult.error != null) {
        res.render("./templates/friends/invalid_friend_request.ejs", { type: "Invalid username." });
        return;
    }
    const recipientInfo = await userCollection.findOne({ username: recipientUsername });
    // Verify that the recipient username exists
    if (recipientInfo == null) {
    res.render("./templates/friends/invalid_friend_request.ejs", { type: "User not found." });
    return;
  }
    const senderInfo = await userCollection.findOne({ username: senderUsername });
    if (!canFriendRequestBeSent(recipientInfo, senderInfo)) {
        res.render("./templates/friends/invalid_friend_request.ejs", { type: "Friend request cannot be sent to this user." });
    return;
    }


    try {
        if (recipientInfo) {
            // If recipient user exists, push the current user's username to their friendRequest array
            recipientInfo.friendRequests.push(req.session.username);
            // Update the recipient user document in the database
            await userCollection.updateOne(
                { username: recipientUsername },
                { $set: { friendRequests: recipientInfo.friendRequests } }
            );
            // Redirect to the friends page
            res.redirect('/friends');
        } else {
            res.status(100).send("user not found")
        }
    } catch { console.error(error); res.status(500).send('error sending friends') }
}

function canFriendRequestBeSent(recipientInfo, senderInfo) {
    // Cannot add a friend that is already a friend
    if (senderInfo.friends.includes(recipientInfo.username)) { return false; }
    // Cannot add a friend that is already in friend request
    if (senderInfo.friendRequests.includes(recipientInfo.username)) { return false; }
    // Cannot add yourself
    if (senderInfo.username == recipientInfo.username) { return false; }
    
    return true;
}

async function acceptFriend(req, res, userCollection) {
    const requester = req.params.friendName;
    const accepter = req.session.username;
    try {
        // adds the accepter to the requester's friends
        await userCollection.updateOne(
            { username: requester },
            { $push: { friends: accepter } }
        );
        // updates the friend requests of requester
        await userCollection.updateOne(
            { username: requester },
            { $pull: { friendRequests: accepter } }
        );
        // adds the requester to the accepter's friends
        await userCollection.updateOne(
            { username: accepter },
            { $push: { friends: requester } }
        );
        // updates the friend requests of accepter
        await userCollection.updateOne(
            { username: accepter },
            { $pull: { friendRequests: requester } }
        );
    } catch (error) {
        console.error("could not accept request(server side)", error)
    }
    res.redirect("/friends");
}

async function rejectFriend(req, res, userCollection) {
    const requester = req.params.friendName;
    const accepter = req.session.username;
    try {
        // removes the friend request of accepter
        await userCollection.updateOne(
            { username: accepter },
            { $pull: { friendRequests: requester } }
        );
    } catch (error) {
        console.error("could not reject request(server side)", error)
    }
    res.redirect("/friends");
}

async function deleteFriend(req, res, userCollection) {
    const toDelete = req.params.friendName;
    const currentUser = req.session.username;
    try {
        // removes friend toDelete from current user
        await userCollection.updateOne(
            { username: currentUser },
            { $pull: { friends: toDelete } }
        );
        // removes friend currentUser from toDelete
        await userCollection.updateOne(
            { username: toDelete },
            { $pull: { friends: currentUser } }
        );
    } catch (error) {
        console.error("could not delete friend(server side)", error)
    }
    res.redirect("/friends");
}

