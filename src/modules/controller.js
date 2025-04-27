import { displayHandler } from "./displayModule";
import { allTasks, projectHandler, toDoHandler } from "./models";
import { storage } from "./storageloader";
import { format, isThisWeek, isThisMonth } from "date-fns";
import { cloneDeep } from "lodash";

let tasks;
let displayObj;

let fetchedProjects;
let currentlyOrderedProjects;

const getOriginalOrderOfProjects = () => fetchedProjects;
const getCurrentlyOrderedProjects = () => currentlyOrderedProjects;

function saveData() {
  storage().dataSaver(fetchedProjects);
}

const restoreProject = function (
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

  for (const toDo of toDos) {
    let toDoRestorer = toDoHandler(toDo[0]);
    toDoRestorer.restoreDoneStatus(toDo[1]);
    project.addToDos(toDoRestorer);
  }
  tasks.addToProjects(project);
};

const createProject = function (
  title,
  description,
  dueDate,
  notes,
  priority,
) {
  /* check if localstorage has loaded projects in tasks-array already
  and if it has, update the projectNum that will be used when creating
  new projects to be the num of latest project + 1. Otherwise new projects
  would be created from numOfProject = 0 all over again when page has been
  refreshed, and bugs would occur. */
  if (currentlyOrderedProjects.length > 0) {
    displayObj.projectNum.setNum(
      currentlyOrderedProjects[currentlyOrderedProjects.length - 1].getProject().numOfProject + 1,
    );
  }

  const project = projectHandler(
    title,
    description,
    dueDate,
    notes,
    priority,
    displayObj.projectNum.getNum(),
  );
  tasks.addToProjects(project);
  saveData();

  displayObj.addProjectsToDom(fetchedProjects);
  displayObj.changeViewToMain();

};

const modifyProject = function (
  projectDom,
  title,
  description,
  dueDate,
  notes,
  priority,
) {
  let foundProject = findProjectByNum(projectDom);

  foundProject.getProject().title = title;
  foundProject.getProject().description = description;
  foundProject.getProject().dueDate = dueDate;
  foundProject.getProject().notes = notes;
  foundProject.getProject().priority = priority;

  saveData();
  displayObj.addProjectsToDom(currentlyOrderedProjects);
};

const filterByDueDate = function (timeFrame) {

  let filteredList;

  switch (timeFrame) {
    case "all":
      displayObj.addProjectsToDom(currentlyOrderedProjects);
      return;
    case "today":
      filterToday();
      break;
    case "week":
      filterThisWeek();
      break;
    case "month":
      filterThisMonth();
      break;
  }

  function filterToday() {
    let today = format(new Date(), "yyyy-MM-dd");
    filteredList = currentlyOrderedProjects.filter(
      (project) => project.getProject().dueDate == today,
    );
  };

  function filterThisWeek() {
    filteredList = currentlyOrderedProjects.filter(
      (project) =>
        isThisWeek(new Date(project.getProject().dueDate), {
          weekStartsOn: 1,
        }) == true,
    );
  };

  function filterThisMonth() {
    filteredList = currentlyOrderedProjects.filter(
      (project) =>
        isThisMonth(new Date(project.getProject().dueDate)) == true,
    );
  };

  displayObj.addProjectsToDom(filteredList);
};

const sortProjects = function() {

  const sortByDate = (a, b) => 
    new Date(a.getProject().dueDate) - new Date(b.getProject().dueDate);

  const sortByname = (a, b) => {

    const loweredCaseTitle = (obj) => obj.getProject().title.toLowerCase();

    let nameA = loweredCaseTitle(a);
    let nameB = loweredCaseTitle(b);
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  };

  const sortByTodos = (a, b) => {

    const numOfTodos = (obj) => obj.getToDos().length;

    let aTodos = numOfTodos(a);
    let bTodos = numOfTodos(b);
    if (aTodos < bTodos) return -1;
    if (aTodos > bTodos) return 1;
    return 0;
  }

  const sortByPriority = (a, b) => {

    const getPriorityLevel = (obj) => obj.getProject().priority

    const priorityLevel = {
      'High': 1,
      'Medium': 2,
      'Low': 3
    };

    let projPriorityA = getPriorityLevel(a);
    let projPriorityB = getPriorityLevel(b);

    return priorityLevel[projPriorityA] - priorityLevel[projPriorityB]

  };

  currentlyOrderedProjects.sort(sortByPriority);
  resetProjectsNums();
  displayObj.projectsToOptions(currentlyOrderedProjects);
  displayObj.addProjectsToDom(currentlyOrderedProjects);
  //return {sortByDate, sortByname}
};

const addToDoToProject = function (inputvalue, selectedProject) {
  const toDo = toDoHandler(inputvalue);

  currentlyOrderedProjects[selectedProject].addToDos(toDo);
  let numOfToDos = currentlyOrderedProjects[selectedProject].getToDos().length
  saveData();

  displayObj.updateProjectDiv(selectedProject, numOfToDos);
};

const getProjectToDos = function (projectDom) {
  let foundProject = findProjectByNum(projectDom);
  displayObj.addToDosToDom(
    foundProject.getToDos(),
    foundProject.getProject().title,
  );
};

const toDoChecked = function (projectDom, toDoDomIndex) {
  let foundProject = findProjectByNum(projectDom);

  foundProject.getToDos()[toDoDomIndex].makeDoneOrUndone();

  saveData();
};

const toDoRemove = function (projectDom, toDoDomIndex) {
  let foundProject = findProjectByNum(projectDom);

  foundProject.deleteToDo(toDoDomIndex);

  saveData();

  displayObj.addToDosToDom(
    foundProject.getToDos(),
    foundProject.getProject().title,
  );
};

const toDoDoneOrNot = function (projectDom, toDoDomIndex) {
  let foundProject = findProjectByNum(projectDom);
  return foundProject.getToDos()[toDoDomIndex].checkIfDone();
};

const getValues = function (projectDom) {
  let foundProject = findProjectByNum(projectDom);
  return foundProject.getProject();
};

const removeProject = function (projectDom) {
  let foundProject = findProjectByNum(projectDom);

  tasks.deleteProject(foundProject);
  resetProjectsNums();

  saveData();
};

function resetProjectsNums() {
  displayObj.domIndex.resetIndex();

  currentlyOrderedProjects.forEach((project) => {
    project.getProject().numOfProject = displayObj.domIndex.getIndex();
    displayObj.domIndex.increaseIndex();
  });
}

function findProjectByNum(projectDom) {
  let index = projectDom.getAttribute("index-number");
  return currentlyOrderedProjects[index];
};

const init = function() {
  displayObj = displayHandler();
  tasks = allTasks();
  storage().dataGetter(displayObj);
  fetchedProjects = tasks.getProjects();

  /* we'll create a deep copy from fetchedProjects, which we'll use when user 
  sorts or filters the shown projects. We'll keep original fetchedProjects so 
  that when user returns from inspecting toDos or opens the app again after 
  closing it, the app shows the array of original order. */
  currentlyOrderedProjects = _.cloneDeep(fetchedProjects);
  console.log(currentlyOrderedProjects);
  sortProjects();
  //displayObj.projectsToOptions(fetchedProjects);
  //displayObj.addProjectsToDom(fetchedProjects);
}

export {
  init,
  getOriginalOrderOfProjects,
  getCurrentlyOrderedProjects,
  createProject,
  restoreProject,
  modifyProject,
  filterByDueDate,
  sortProjects,
  addToDoToProject,
  getProjectToDos,
  toDoChecked,
  toDoRemove,
  toDoDoneOrNot,
  getValues,
  removeProject,
};
