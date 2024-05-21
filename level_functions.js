
module.exports = {checkForLevelUp, checkForEXPGain};

const MAX_LEVEL = 15;
const EXP_PER_LEVEL = 70;
const EXP_PER_TASK = 10;


async function incrementEXP(username, userCollection, taskCategory) {
    try {
        await userCollection.updateOne(
            { username: username },
            {
                $inc: { [`levels.${taskCategory}.exp`]: EXP_PER_TASK}
            });
    } catch (error) {
        console.error("Failed to increment exp");
    }
}

async function incrementLevel(username, userCollection, taskCategory) {
    try {
        await userCollection.updateOne(
            { username: username },
            {
                $inc: { [`levels.${taskCategory}.level`]: 1 }
            });
    } catch (error) {
        console.error("Failed to increment level");
    }
}

async function resetEXP(username, userCollection, taskCategory) {
    try {
        await userCollection.updateOne(
            { username: username },
            {
                $set: { [`levels.${taskCategory}.exp`]: 0}
            });
    } catch (error) {
        console.error("Failed to reset exp");
    }
}

// level up if exp is equal to or exceeds the max exp per level cap, and the user is not at max level
async function checkForLevelUp(username, userCollection, taskCategory) {
    try {
        user = await userCollection.findOne(
            { username: username },
            { projection: {
                [`levels.${taskCategory}.exp`]: 1,
                [`levels.${taskCategory}.level`]: 1
            }});
    } catch (error) {
        console.error("Failed to check for level up");
    }

    if(
        user.levels[taskCategory].exp >= EXP_PER_LEVEL &&
        user.levels[taskCategory].level < MAX_LEVEL
    ) {
        incrementLevel(username, userCollection, taskCategory);
        resetEXP(username, userCollection, taskCategory);
    }

}

// Add exp if the exp is below the exp per level cap
async function checkForEXPGain(username, userCollection, taskCategory) {
    try {
        user = await userCollection.findOne(
            { username: username },
            { projection: {
                [`levels.${taskCategory}.exp`]: 1,
                [`levels.${taskCategory}.level`]: 1
            }});
    } catch (error) {
        console.error("Failed to increment exp");
    }

    if(user.levels[taskCategory].exp < EXP_PER_LEVEL) {
        incrementEXP(username, userCollection, taskCategory);
    }    
}