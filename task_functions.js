module.exports = {
    addTask,
    getTasksByCategory
}

async function addTask(title, description, category, username, userCollection) {
    newTask = {
        title: title,
        description: description,
        category: category
      }
    
      switch(category) {
        case 'game':
          await userCollection.updateOne(
            { username: username },
            { $push: { gameTasks: newTask } }
          );
          break;
        case 'fitness':
          await userCollection.updateOne(
            { username: username },
            { $push: { fitnessTasks: newTask } }
          );
          break;
      case 'diet':
          await userCollection.updateOne(
            { username: username },
            { $push: { dietTasks: newTask } }
          );
          break;
      default:
        console.log("Unknown category to add task to");
    
      }
}

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