module.exports = { getTasksByCategory };

// Returns an array of task objects
async function getTasksByCategory(category, username, userCollection) {
    switch (category) {
        case 'fitness':
            user = await userCollection.findOne(
                { username: username },
                { projection: { fitnessTasks: 1 } });
            return user.fitnessTasks;
            
        case 'game':
            user = await userCollection.findOne(
                { username: username },
                { projection: { gameTasks: 1 } });
            return user.gameTasks;
        case 'diet':
            user = await userCollection.findOne(
                { username: username },
                { projection: { dietTasks: 1 } });
            return user.dietTasks;
        default:
            console.err("Category to add task to not found")
    }
}