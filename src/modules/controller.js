import { displayHandler } from "./displayModule";
import { allTasks, projectHandler, toDoHandler } from "./models";
import { storage } from "./storageloader";
import { isThisWeek, isThisMonth, isToday, isPast } from "date-fns";
import { v4 as v4uuid } from "uuid";

let tasks;
let displayObj;

//we'll create an object, which has currently applied filters and sorts applied to the list of projects created.
//By default when user opens the app or hasn't applied any filters or sorters, the values are true (returning tasks as default order and view)
const appliedSortersAndFilters = {
  filter: () => true,
  sorter: () => true,
};

const getFetchedTasks = () => tasks.getTasks();

function saveData() {
  storage().dataSaver(tasks.getTasks());
}

const restoreProject = function (
  id,
  title,
  description,
  dueDate,
  notes,
  priority,
  projectIndex,
  toDos,
) {
  const project = projectHandler(
    title,
    description,
    dueDate,
    notes,
    priority,
    projectIndex,
  );

  let taskID = id;

  for (const toDo of toDos) {
    let toDoRestorer = toDoHandler(toDo[0]);
    toDoRestorer.restoreDoneStatus(toDo[1]);
    project.addToDos(toDoRestorer);
  }

  tasks.addToTasks(taskID, project);
};

const createProject = function (title, description, dueDate, notes, priority) {
  //we'll create a unique ID for the task so we can access it with it later
  let taskID = v4uuid();

  const project = projectHandler(title, description, dueDate, notes, priority);
  tasks.addToTasks(taskID, project);
  saveData();

  runFilterAndSorter();
  displayObj.changeViewToMain();
};

const modifyProject = function (
  id,
  title,
  description,
  dueDate,
  notes,
  priority,
) {
  let foundProject = tasks.getTasks()[id].getProject();

  foundProject.title = title;
  foundProject.description = description;
  foundProject.dueDate = dueDate;
  foundProject.notes = notes;
  foundProject.priority = priority;

  saveData();
  runFilterAndSorter();
};

const searchByInput = function (e) {
  let inputLoweredCase = e.target.value;

  //convert the object to array first..
  let tasksToBeHandled = Object.entries(tasks.getTasks());

  let hits = tasksToBeHandled.filter((task) => {
    let projLoweredCase = task[1].getProject().title.toLowerCase();
    return projLoweredCase.startsWith(inputLoweredCase) == true;
  });

  //..then build the object back to handle it in DOM
  let hitsObject = Object.fromEntries(hits);
  displayObj.addProjectsToDom(hitsObject);
  displayObj.projectsToOptions(hitsObject);
};

const isProjectOverDue = function (dateString) {
  let splittedDate = dateString.split("-").map((dateStr) => parseInt(dateStr));

  //we need to substract one from month, because 0 is Jan, 1 is Feb, 2 is Mar and so on
  let result = isPast(
    new Date(splittedDate[0], splittedDate[1] - 1, splittedDate[2]),
  );
  /*we still need to make this double check that project isn't due today but tomorrow at the earliest, 
  because isPast() also returns true for today */
  let isDueToday = isToday(new Date(dateString));
  return result && isDueToday == false;
};

const areOverDueProjects = function (fetchedTasks) {
  for (let [key, value] of Object.entries(fetchedTasks)) {
    let dateStr = value.getProject().dueDate;
    if (isProjectOverDue(dateStr)) {
      appliedSortersAndFilters["sorter"] = sortByDueDate;
      return true;
    }
  }
};

const setFilter = function (chosenFilter) {
  appliedSortersAndFilters["filter"] = getCorrectFilter(chosenFilter);
  runFilterAndSorter();
};

const getCorrectFilter = function (chosenFilter) {
  if (chosenFilter == "all") return () => true;
  else if (chosenFilter == "today") return filterToday;
  else if (chosenFilter == "week") return filterThisWeek;
  else if (chosenFilter == "month") return filterThisMonth;
};

function filterToday([key, value]) {
  return isToday(new Date(value.getProject().dueDate)) == true;
}

function filterThisWeek([key, value]) {
  return (
    isThisWeek(new Date(value.getProject().dueDate), {
      weekStartsOn: 1,
    }) == true
  );
}

function filterThisMonth([key, value]) {
  return isThisMonth(new Date(value.getProject().dueDate)) == true;
}

const runFilterAndSorter = function () {
  //convert object to array for filtering and sorting
  let tasksToBeHandled = Object.entries(tasks.getTasks());

  tasksToBeHandled = tasksToBeHandled.filter(
    appliedSortersAndFilters["filter"],
  );
  tasksToBeHandled.sort(appliedSortersAndFilters["sorter"]);

  //covert filtered and sorted array back to object..
  tasksToBeHandled = Object.fromEntries(tasksToBeHandled);

  //..and send them to DOM for display
  displayObj.projectsToOptions(tasksToBeHandled);
  displayObj.addProjectsToDom(tasksToBeHandled);
};

const setSorter = function (chosenSorter) {
  appliedSortersAndFilters["sorter"] = getCorrectSorter(chosenSorter);
  runFilterAndSorter();
};

const getCorrectSorter = function (chosenSorter) {
  /* if sorting option 'default' is selected empty the currently applied sort by providing an empty 
  function to object (appliedSortersAndFilters), whose functions we run each time when sorter or filters are applied */
  if (chosenSorter == "default") return function () {};
  else if (chosenSorter == "duedate") return sortByDueDate;
  else if (chosenSorter == "name") return sortByname;
  else if (chosenSorter == "to-dos") return sortByTodos;
  else if (chosenSorter == "prioritylevel") return sortByPriority;
};

const sortByDueDate = (a, b) =>
  new Date(a[1].getProject().dueDate) - new Date(b[1].getProject().dueDate);

const sortByname = (a, b) => {
  const loweredCaseTitle = (obj) => obj.getProject().title.toLowerCase();

  let nameA = loweredCaseTitle(a[1]);
  let nameB = loweredCaseTitle(b[1]);
  if (nameA < nameB) return -1;
  if (nameA > nameB) return 1;
  return 0;
};

const sortByTodos = (a, b) => {
  const numOfTodos = (obj) => obj.getToDos().length;

  let aTodos = numOfTodos(a[1]);
  let bTodos = numOfTodos(b[1]);
  if (aTodos > bTodos) return -1;
  if (aTodos < bTodos) return 1;
  return 0;
};

const sortByPriority = (a, b) => {
  const getPriorityLevel = (obj) => obj.getProject().priority;

  const priorityLevel = {
    High: 1,
    Medium: 2,
    Low: 3,
  };

  let projPriorityA = getPriorityLevel(a[1]);
  let projPriorityB = getPriorityLevel(b[1]);

  return priorityLevel[projPriorityA] - priorityLevel[projPriorityB];
};

const addToDoToProject = function (selectedTaskId, inputvalue) {
  const toDo = toDoHandler(inputvalue);

  let projectToAddTo = tasks.getTasks()[selectedTaskId];

  projectToAddTo.addToDos(toDo);

  //this saves the just updated tasks object to local storage
  saveData();
  let numOfToDos = projectToAddTo.getToDos().length;

  displayObj.updateProjectDiv(selectedTaskId, numOfToDos);
};

const getProjectToDos = function (taskID) {
  let foundProject = tasks.getTasks()[taskID];
  displayObj.addToDosToDom(foundProject.getToDos());
};

const toDoChecked = function (taskID, toDoDomIndex) {
  let foundProject = tasks.getTasks()[taskID];

  foundProject.getToDos()[toDoDomIndex].makeDoneOrUndone();

  saveData();
};

const toDoRemove = function (taskID, toDoDomIndex) {
  let foundProject = tasks.getTasks()[taskID];

  foundProject.deleteToDo(toDoDomIndex);

  //this saves the just updated tasks object to local storage
  saveData();

  displayObj.addToDosToDom(
    foundProject.getToDos(),
    foundProject.getProject().title,
  );
};

const toDoDoneOrNot = function (taskID, toDoDomIndex) {
  let foundProject = tasks.getTasks()[taskID];
  return foundProject.getToDos()[toDoDomIndex].checkIfDone();
};

const getValues = function (taskID) {
  let foundProject = tasks.getTasks()[taskID];
  return foundProject.getProject();
};

const removeProject = function (taskID) {
  tasks.deleteTask(taskID);
  saveData();
  runFilterAndSorter();
};

//app starts here
const init = function () {
  displayObj = displayHandler();
  tasks = allTasks();
  //first check from local storage, if there are any saved projects
  storage().dataGetter();
  let fetchedTasks = tasks.getTasks();
  /*if there are projects which are now overdue and late, add the visual overdue animation
  to that specific project */
  if (areOverDueProjects(fetchedTasks)) runFilterAndSorter();
  else {
    displayObj.projectsToOptions(fetchedTasks);
    displayObj.addProjectsToDom(fetchedTasks);
  }
};

export {
  init,
  getFetchedTasks,
  createProject,
  restoreProject,
  modifyProject,
  setFilter,
  setSorter,
  addToDoToProject,
  getProjectToDos,
  searchByInput,
  isProjectOverDue,
  toDoChecked,
  toDoRemove,
  toDoDoneOrNot,
  getValues,
  removeProject,
};
