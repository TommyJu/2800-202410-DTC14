module.exports = {
    addTask: addTask
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