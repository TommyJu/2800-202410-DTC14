// const { error } = require("console");
// const { response } = require("express");


// module.exports = {acceptFriend, rejectFriend};

function acceptFriend(requestedFriend) {
    fetch('/acceptFriend', {
        method: 'post',
        headers: {
            'Content-Type': 'json'
        },
        body: JSON.stringify({requestedFriend: requestedFriend})
    })
    .then(response =>{
        if (response.ok) {
            // redirect to reload page
            window.location.href = 'friendRequest'
        } else {
            console.error("Failed to accept firend request");
        }
    })
    .catch(error => {
        console.error("error, failed to accept friend request", error)
    })
}

function rejectFriend() {

}