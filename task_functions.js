const { ObjectId } = require("mongodb");
const levelFunctions = require("./level_functions.js");

module.exports = {
  addTask,
  getTasksByCategory,
  completeTask,
  deleteTask,
  moveTask
}

async function addTask(title, description, category, username, userCollection) {
  newTaskId = new ObjectId();
  newTask = {
    _id: newTaskId,
    title: title,
    description: description,
    category: category,
    type: 'custom'
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
  task = await userCollection.findOne({ username: username }, { projection: { [taskCategory + 'Tasks']: { $elemMatch: { _id: new ObjectId(taskIdToDelete) } } } });
  categoryProperty = taskCategory + 'Tasks';
  taskGroup = task[categoryProperty];
  console.log(taskGroup[0].type)
  updateTaskType(username, userCollection, taskCategory, taskIdToDelete)
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

async function moveTask(username, userCollection, suggestedActivity, taskCategory, taskIdToMove, taskTitle, taskDescription, gamingActivity) {
  taskCategoryProperty = taskCategory + 'Tasks';
  const taskObjectId = new ObjectId(taskIdToMove);
  console.log(suggestedActivity[0])
  if (taskTitle) {
    try {
      await userCollection.updateOne(
        { username: username },
        { $push: { [taskCategoryProperty]: { _id: new ObjectId(), title: taskTitle, description: taskDescription, category: "diet", type: "custom" } } }
      )
    } catch (error) {
      console.error("Failed to copy recipe");
    }
    return;
  } else {
    if (suggestedActivity[0]) {
      selectedActivity = suggestedActivity[0];
    } else {
      selectedActivity = gamingActivity[0];
    }
    if (selectedActivity.rankToReach) {
      try {
        await userCollection.updateOne(
          { username: username },
          { $push: { [taskCategoryProperty]: { _id: new ObjectId(), title: selectedActivity.title, description: selectedActivity.description, category: selectedActivity.category, type: "custom", rankToReach: selectedActivity.rankToReach } } }
        )
      } catch (error) {
        console.error("Failed to copy suggestion");
      }
    } else {
      try {
        await userCollection.updateOne(
          { username: username },
          { $push: { [taskCategoryProperty]: { _id: new ObjectId(), title: selectedActivity.title, description: selectedActivity.description, category: selectedActivity.category, type: "custom" } } }
        )
      } catch (error) {
        console.error("Failed to copy suggestion");
      }
    }
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