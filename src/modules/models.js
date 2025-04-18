function allTasks() {
  const projects = [];

  const getProjects = () => projects;

  const addToProjects = function (project) {
    projects.push(project);
  };

  const deleteProject = function (project) {
    let projectToDelete = projects.indexOf(project);
    projects.splice(projectToDelete, 1);
  };

  return { getProjects, addToProjects, deleteProject };
}

function projectHandler(
  title,
  description,
  dueDate,
  notes,
  priority,
  numOfProject,
) {
  const project = {
    title: title,
    description: description,
    dueDate: dueDate,
    notes: notes,
    priority: priority,
    numOfProject: numOfProject,
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
