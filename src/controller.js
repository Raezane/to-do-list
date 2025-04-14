import { viewer } from "./viewer";
import { format, isThisWeek, isThisMonth } from "date-fns";
import { allTasks, projectHandler, toDoHandler } from "./models";
import { storage } from "./storageloader";

const tasks = allTasks();

function communicator() {
  const getTasks = () => tasks.getTasks();

  function saveData() {
    storage().dataSaver(getTasks());
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
    tasks.addToTasks(project);
  };

  const createProject = function (
    title,
    description,
    dueDate,
    notes,
    priority,
  ) {
    //check if localstorage has loaded projects in tasks-array already
    //and if it has, update the projectNum that will be used when creating
    //new projects to be the num of latest project + 1. Otherwise new projects
    //would be created from numOfProject = 0 all over again when page has been
    //refreshed, and bugs would occur.
    if (getTasks().length > 0) {
      viewer.projectNum.setNum(
        getTasks()[getTasks().length - 1].getProject().numOfProject + 1,
      );
    }

    const project = projectHandler(
      title,
      description,
      dueDate,
      notes,
      priority,
      viewer.projectNum.getNum(),
    );
    tasks.addToTasks(project);
    saveData();
    getProjectsForDom(getTasks());
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
    getProjectsForDom(getTasks());
  };

  const filterByDueDate = function (timeFrame) {
    switch (timeFrame) {
      case "all":
        getProjectsForDom(getTasks());
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
      let filteredList = getTasks().filter(
        (project) => project.getProject().dueDate == today,
      );
      getProjectsForDom(filteredList);
    }

    function filterThisWeek() {
      let filteredList = getTasks().filter(
        (project) =>
          isThisWeek(new Date(project.getProject().dueDate), {
            weekStartsOn: 1,
          }) == true,
      );
      getProjectsForDom(filteredList);
    }

    function filterThisMonth() {
      let filteredList = getTasks().filter(
        (project) =>
          isThisMonth(new Date(project.getProject().dueDate)) == true,
      );
      getProjectsForDom(filteredList);
    }
  };

  const getProjectsForDom = function (fetchedTasks, filterOrNot) {
    viewer.addProjectsToDom(fetchedTasks, filterOrNot);
  };

  const addToDoToProject = function (inputvalue, selectedProject) {
    const toDo = toDoHandler(inputvalue);

    getTasks()[selectedProject].addToDos(toDo);

    saveData();
  };

  const getProjectToDos = function (projectDom) {
    let foundProject = findProjectByNum(projectDom);
    viewer.addToDosToDom(
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

    viewer.addToDosToDom(
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

    getProjectsForDom(getTasks());

    function resetProjectsNums() {
      viewer.domIndex.resetIndex();

      getTasks().forEach((project) => {
        project.getProject().numOfProject = viewer.domIndex.getIndex();
        viewer.domIndex.increaseIndex();
      });
    }
  };

  function findProjectByNum(projectDom) {
    let index = projectDom.getAttribute("index-number");
    return getTasks()[index];
  }

  return {
    getTasks,
    createProject,
    restoreProject,
    modifyProject,
    filterByDueDate,
    getProjectsForDom,
    addToDoToProject,
    getProjectToDos,
    toDoChecked,
    toDoRemove,
    toDoDoneOrNot,
    getValues,
    removeProject,
  };
}

export { communicator };
