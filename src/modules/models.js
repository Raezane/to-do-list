/* the internal data models are divided into three parts: individual to-do handler when
to-do is created to a certain project, a project handler which contains created to-do-handlers 
and on top the tasks object, which contain all the projects. */

function allTasks() {
  const tasksObj = {};

  const getTasks = () => tasksObj;

  const addToTasks = function (projectID, project) {
    tasksObj[projectID] = project;
  };

  const deleteTask = function (taskID) {
    delete tasksObj[taskID];
  };

  return { getTasks, addToTasks, deleteTask };
}

function projectHandler(title, description, dueDate, notes, priority) {
  const project = {
    title,
    description,
    dueDate,
    notes,
    priority,
    done: false,
  };

  const toDos = [];

  const getProject = () => project;

  const addToDos = function (todo) {
    toDos.push(todo);
  };

  const getToDos = () => toDos;

  const deleteToDo = function (todoIndex) {
    toDos.splice(todoIndex, 1);
  };

  return { getProject, addToDos, getToDos, deleteToDo };
}

function toDoHandler(toDoDescription) {
  const toDo = {
    toDoDescription: toDoDescription,
    done: false,
  };

  const makeDoneOrUndone = function () {
    toDo.done == false ? (toDo.done = true) : (toDo.done = false);
  };

  const restoreDoneStatus = function (status) {
    toDo.done = status;
  };

  const getToDo = () => toDo.toDoDescription;
  const checkIfDone = () => toDo.done;

  return { makeDoneOrUndone, restoreDoneStatus, getToDo, checkIfDone };
}

export { allTasks, projectHandler, toDoHandler };
