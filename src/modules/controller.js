import { displayHandler } from "./displayModule";
import { format, isThisWeek, isThisMonth } from "date-fns";
import { allTasks, projectHandler, toDoHandler } from "./models";
import { storage } from "./storageloader";

const tasks = allTasks();
const displayObj = displayHandler();

const fetchedProjects = tasks.getProjects();

const init = function() {

}

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
  if (fetchedProjects.length > 0) {
    displayObj.projectNum.setNum(
      fetchedProjects[fetchedProjects.length - 1].getProject().numOfProject + 1,
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
  displayObj.addProjectsToDom(fetchedProjects);
};

const filterByDueDate = function (timeFrame) {
  switch (timeFrame) {
    case "all":
      displayObj.addProjectsToDom(fetchedProjects);
      break;
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
    let filteredList = fetchedProjects.filter(
      (project) => project.getProject().dueDate == today,
    );
    displayObj.addProjectsToDom(filteredList);
  }

  function filterThisWeek() {
    let filteredList = fetchedProjects.filter(
      (project) =>
        isThisWeek(new Date(project.getProject().dueDate), {
          weekStartsOn: 1,
        }) == true,
    );
    displayObj.addProjectsToDom(filteredList);
  }

  function filterThisMonth() {
    let filteredList = fetchedProjects.filter(
      (project) =>
        isThisMonth(new Date(project.getProject().dueDate)) == true,
    );
    displayObj.addProjectsToDom(filteredList);
  }
};

const addToDoToProject = function (inputvalue, selectedProject) {
  const toDo = toDoHandler(inputvalue);

  fetchedProjects[selectedProject].addToDos(toDo);
  let numOfToDos = fetchedProjects[selectedProject].getToDos().length
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

  displayObj.addProjectsToDom(fetchedProjects);

  function resetProjectsNums() {
    displayObj.domIndex.resetIndex();

    fetchedProjects.forEach((project) => {
      project.getProject().numOfProject = displayObj.domIndex.getIndex();
      displayObj.domIndex.increaseIndex();
    });
  }
};

function findProjectByNum(projectDom) {
  let index = projectDom.getAttribute("index-number");
  return fetchedProjects[index];
}

storage().dataGetter(displayObj);

export {
  init,
  fetchedProjects,
  createProject,
  restoreProject,
  modifyProject,
  filterByDueDate,
  addToDoToProject,
  getProjectToDos,
  toDoChecked,
  toDoRemove,
  toDoDoneOrNot,
  getValues,
  removeProject,
};
