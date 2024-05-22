const { ObjectId } = require("mongodb");
const levelFunctions = require("./level_functions.js");

module.exports = {
    addTask,
    getTasksByCategory,
    completeTask,
    deleteTask
}

async function addTask(title, description, category, username, userCollection) {
    newTaskId = new ObjectId();
    newTask = {
        _id: newTaskId,
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

async function completeTask(username, userCollection, taskCategory, taskIdToDelete) {
  deleteTask(username, userCollection, taskCategory, taskIdToDelete);
  await levelFunctions.checkForEXPGain(username, userCollection, taskCategory);
  await levelFunctions.checkForLevelUp(username, userCollection, taskCategory);
  await levelFunctions.checkForRankUp(username, userCollection);
}

async function deleteTask(username, userCollection, taskCategory, taskIdToDelete) {
  taskCategoryProperty = taskCategory + 'Tasks';
  const taskObjectId = new ObjectId(taskIdToDelete);
  
  try {
    await userCollection.updateOne(
      {username: username },
      {$pull: {[ taskCategoryProperty ]: {_id: taskObjectId}}})
  } catch (error){
    console.error("Failed to delete task");
  }
}