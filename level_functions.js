
const MAX_LEVEL = 15;
const EXP_PER_LEVEL = 70;
const EXP_PER_TASK = 10;
const BRONZE_RANK_OVERALL_LEVEL = 15;
const SILVER_RANK_OVERALL_LEVEL = 30;
const GOLD_RANK_OVERALL_LEVEL = 45;

module.exports = {
    isLeveledUp, 
    isEXPGained, 
    isRankedUp,
    EXP_PER_LEVEL,
    MAX_LEVEL
};

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

async function setRank(username, userCollection, newRank) {
    try {
        await userCollection.updateOne(
            { username: username },
            { $set: { rank: newRank } });
    } catch (error) {
        console.error("Failed to set player rank");
    }
}

// level up if exp is equal to or exceeds the max exp per level cap, and the user is not at max level
async function isLeveledUp(username, userCollection, taskCategory) {
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
        await incrementLevel(username, userCollection, taskCategory);
        await resetEXP(username, userCollection, taskCategory);
        return true;
    }
    return false;
}

// Add exp if the exp is below the exp per level cap
async function isEXPGained(username, userCollection, taskCategory) {
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
        await incrementEXP(username, userCollection, taskCategory);
        return true;
    }
    return false;
}

async function isRankedUp(username, userCollection) {
    try {
        user = await userCollection.findOne(
            { username: username },
            { projection: {
                levels: 1,
                rank: 1
            }});
    } catch (error) {
        console.error("Failed to rank up");
    }
    let totalLevel = 
    user.levels.game.level
    + user.levels.fitness.level 
    + user.levels.diet.level;

    let currentRank = user.rank;

    // Rank up to bronze
    if(currentRank == "unranked" && totalLevel >= BRONZE_RANK_OVERALL_LEVEL) {
        setRank(username, userCollection, "bronze");
        return true;

    // Rank up to silver
    } else if (currentRank == "bronze" && totalLevel >= SILVER_RANK_OVERALL_LEVEL) {
        setRank(username, userCollection, "silver");
        return true;

    // Rank up to gold
    } else if (currentRank == "silver" && totalLevel >= GOLD_RANK_OVERALL_LEVEL) {
        setRank(username, userCollection, "gold");
        return true;
    }
    return false;
}