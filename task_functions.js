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

  switch (category) {
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

// Returns true if the task has caused the user to level up
// Used to redirect to the level up page
async function completeTask(username, userCollection, suggestedActivity, taskCategory, taskIdToDelete) {
  if (taskIdToDelete.type === 'custom') {
    updateTaskType(username, userCollection, taskCategory, taskIdToDelete)
  } else {
    copySuggestion(username, userCollection, suggestedActivity, taskCategory, taskIdToDelete);
  }
  await levelFunctions.isEXPGained(username, userCollection, taskCategory);
  let isLeveledUp = await levelFunctions.isLeveledUp(username, userCollection, taskCategory);
  await levelFunctions.isRankedUp(username, userCollection);

  return isLeveledUp;
}

async function updateTaskType(username, userCollection, taskCategory, taskIdToDelete) {
  taskCategoryProperty = taskCategory + 'Tasks';
  const taskObjectId = new ObjectId(taskIdToDelete);

  try {
    await userCollection.updateOne(
      { username: username, [`${taskCategoryProperty}._id`]: taskObjectId },
      { $set: { [`${taskCategoryProperty}.$.type`]: 'completed' } })
  } catch (error) {
    console.error("Failed to update task");
  }
}

async function copySuggestion(username, userCollection, suggestedActivity, taskCategory, taskIdToDelete) {
  taskCategoryProperty = taskCategory + 'Tasks';
  const taskObjectId = new ObjectId(taskIdToDelete);
  console.log(suggestedActivity[0])
  try {
    await userCollection.updateOne(
      { username: username },
      { $push: { [taskCategoryProperty]: { _id: taskObjectId, title: suggestedActivity[0].title, description: suggestedActivity[0].description, category: suggestedActivity[0].category, type: "completed" } } }
    )
  } catch (error) {
    console.error("Failed to copy suggestion");
  }
}

async function deleteTask(username, userCollection, taskCategory, taskIdToDelete) {
  taskCategoryProperty = taskCategory + 'Tasks';
  const taskObjectId = new ObjectId(taskIdToDelete);

  try {
    await userCollection.updateOne(
      { username: username },
      { $pull: { [taskCategoryProperty]: { _id: taskObjectId } } })
  } catch (error) {
    console.error("Failed to delete task");
  }
}