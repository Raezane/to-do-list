import { parse, format } from "date-fns";
//import { storage } from "./storageloader";
import trashcan from "../images/trashcan.svg";
import { 
  getFetchedTasks,
  createProject, 
  modifyProject, 
  addToDoToProject, 
  getProjectToDos, 
  setFilter, 
  setSorter,
  getValues, 
  removeProject,
  toDoRemove, 
  toDoChecked,
  toDoDoneOrNot
} from "./controller";

const displayHandler = function () {

  const headerArea = document.querySelector('header');

  const returnButton = document.querySelector(".returnbutton");
  const currentHeader = document.querySelector('header h2');
  const headerImgs = document.querySelector('.headerimgs');

  const modalForm = document.querySelector("dialog form");

  const addproject = document.querySelector(".addproject");
  const projectsaver = document.querySelector("dialog");
  const datepicker = document.querySelector("#dueDate");

  const projectTitle = document.querySelector("#title");
  const projectDescription = document.querySelector("#description");
  const projectDueDate = document.querySelector("#dueDate");
  const projectNotes = document.querySelector("#notes");
  const projectPriority = document.querySelector("#priority");

  const modalHeader = document.querySelector(".addProjectHeader p");
  const cancelDialog = document.querySelector(".buttons > button:first-child");
  const addSaveProject = document.querySelector(".buttons > button:last-child");

  const addToDo = document.querySelector(".addToDo");
  const addToDoForm = document.querySelector("#toDoForm");
  const toDoInput = document.querySelector("#toDo");
  const projectSelector = document.querySelector("#chooseProject");
  const addToDoCancel = document.querySelector(
    ".addToDoButtons > button:first-child",
  );
  const addToDoAdd = document.querySelector(
    ".addToDoButtons > button:nth-child(2)",
  );
  const addedFloat = document.querySelector(".addToDoButtons span");

  const filterSortWrapper = document.querySelectorAll('.filterSortWrapper');

  const openFilter = document.querySelector('.filterSortWrapper:first-child button');
  const filtersParent = document.querySelector('.filterSortWrapper:first-child .radioselectors');
  const filters = document.querySelectorAll('.filterSortWrapper:first-child input[type="radio"]');

  const openSorter = document.querySelector('.filterSortWrapper:nth-child(2) button');
  const sortsParent = document.querySelector('.filterSortWrapper:nth-child(2) .radioselectors');
  const sorters = document.querySelectorAll('.filterSortWrapper:nth-child(2) input[type="radio"]');

  const content = document.querySelector("main");

  let addingNewProject = true;

  addproject.addEventListener("click", () => {
    addingNewProject = true;
    //reset modal form in case if modal is opened from "see details" from already existing project
    modalForm.reset();
    projectsaver.showModal();
    minDateToday();
    projectPriority.style.backgroundColor = "white";
    addSaveProject.textContent = "Add Project";
    modalHeader.textContent = "Add new project";
  });

  projectPriority.addEventListener("change", () => {
    if (projectPriority.value == "Medium") {
      projectPriority.style.backgroundColor = "orange";
    } else if (projectPriority.value == "High") {
      projectPriority.style.backgroundColor = "red";
    } else if (projectPriority.value == "Low") {
      projectPriority.style.backgroundColor = "white";
    }
  });

  cancelDialog.addEventListener("click", (e) => {
    e.preventDefault();
    projectsaver.close();
  });

  addSaveProject.addEventListener("click", (e) => {
    e.preventDefault();
    let validity = projectValidity()
    if (validity) {
      if (addingNewProject) {
          createProject(
            projectTitle.value,
            projectDescription.value,
            projectDueDate.value,
            projectNotes.value,
            projectPriority.value,
          );
          modalForm.reset();

          /* if modal is opened from existing project details-button and project info is then
          edited and saved, modify the clicked project details to set the new entered values */
        } else {
          modifyProject(
            projectIdSetter.getClickedProjectID(),
            projectTitle.value,
            projectDescription.value,
            projectDueDate.value,
            projectNotes.value,
            projectPriority.value,
          )};

        projectsaver.close();
    };
  });

  //hide the validator message in add project modal as soon as user starts typing again
  projectTitle.addEventListener('input', () => {
    projectTitle.setCustomValidity('');
    projectTitle.reportValidity();
  });

  addToDo.addEventListener("click", () => {
    toDoAdderViewManager('none', 'flex');
  });

  addToDoCancel.addEventListener("click", () => {
    addToDoForm.reset();
    toDoAdderViewManager('flex', 'none');
  });

  const toDoAdderViewManager = function(displayprop1, displayprop2) {
    addToDo.style.display = displayprop1;
    addToDoForm.style.display = displayprop2;
  };

  addToDoAdd.addEventListener("click", () => {
    if (toDoValidity()) {

      let selectedTaskId = projectSelector.options[projectSelector.selectedIndex].dataset.projectid;
      addToDoToProject(
        selectedTaskId,
        toDoInput.value
      );

      //when "Add" is clicked, also empty the selector from default value to being 'blank'
      addToDoForm.reset();
      projectSelector.selectedIndex = -1;

      //if view if currently in the projects' to-dos, update the view live
      if (!(toDosParent.getParent() == undefined)) {
        let projectId = toDosParent.getParent().dataset.projectid
        getProjectToDos(projectId);
      }
      addToDoAnimate();
    }
  });

  openFilter.addEventListener('click', () => {
    sorterAndFilterTextSetter(openFilter, filtersParent, 'Filter')
  });

  openSorter.addEventListener('click', () => {
    sorterAndFilterTextSetter(openSorter, sortsParent, 'Sort by')
  });

  filters.forEach((filter) => {
    filter.addEventListener("click", (e) => {
      filterAndSortColor(e, filters);
      setFilter(e.target.id);
    });
  });

  sorters.forEach((sorter) => {
    sorter.addEventListener("click", (e) => {
      filterAndSortColor(e, sorters);
      setSorter(e.target.id);
    });
  });

  returnButton.addEventListener("click", () => {
    toDosParent.setParent(undefined);
    addProjectsToDom(getFetchedTasks());
    headerStateTransformer('Projects');
  });

  function sorterAndFilterTextSetter(radioOpener, radiosParent, filterOrSorter) {
    if (radioOpener.textContent == `${filterOrSorter} +`) radioOpener.textContent = `${filterOrSorter} -`;
    else radioOpener.textContent = `${filterOrSorter} +`;
    radiosParent.classList.toggle('slideIntoView');
  }

  function projectValidity() {

    function validatorTexter(inputToInform, text) {
      inputToInform.setCustomValidity(text);
      inputToInform.reportValidity();
    }

    if (projectTitle.value == "") {
      validatorTexter(projectTitle, "Set Project name!");
      return false;
    }

    if (projectDueDate.value == "") {
      validatorTexter(projectDueDate, "Due date required.")
      return false;
    }

    return true;
  }

  function filterAndSortColor(e, filterButtons) {
    let clickedRadio = e.target.parentNode;
    emptyFilterColor(filterButtons);
    clickedRadio.style.backgroundColor = "rgba(155, 155, 155, 0.356)";
  }

  function emptyFilterColor(filterButtons) {
    for (const button of filterButtons) {
      button.parentNode.style.backgroundColor = "transparent";
    }
  }

  function toDoValidity() {
    if (toDoInput.validity.tooShort) {
      toDoInput.setCustomValidity("Write to-do description!");
      toDoInput.reportValidity();
      return false;
    }

    if (projectSelector.validity.valueMissing) {
      projectSelector.setCustomValidity("Select the project to add to-do!");
      projectSelector.reportValidity();
      return false;
    }

    return true;
  }

  function projectsToOptions(allprojects) {
    //first empty all existing option-elements from select-element
    projectSelector.textContent = "";

    for (const [key, value] of Object.entries(allprojects)) {
      const optionValue = document.createElement("option");
      optionValue.value = allprojects[key].getProject().title;
      optionValue.textContent = allprojects[key].getProject().title;
      optionValue.dataset.projectid = key

      projectSelector.append(optionValue);
    };
  }

  function changeViewToMain() {
    if (currentHeader.textContent !== 'Projects') {
      headerStateTransformer('Projects');
    };
  };

  function isMainPageCurrentlyInView() {
    return content.childNodes.length > 0 && content.childNodes[0].classList.contains('projectDiv')
  };

  function updateProjectDiv(selectedTaskId, numOfToDos) {
    if (isMainPageCurrentlyInView()) {

      let domProject = document.querySelector(`[data-projectid="${selectedTaskId}"]`)
      domProject.childNodes[1].childNodes[0].textContent = `Open To-Dos (${numOfToDos})`
    };
  };

  function minDateToday() {
    const today = format(new Date(), "yyyy-MM-dd");
    datepicker.min = today;
  };

  function addToDoAnimate() {
    addedFloat.classList.add("spanAnimate");
    setTimeout(() => {
      addedFloat.classList.remove("spanAnimate");
    }, 1500);
  };

  function colorByPriority(projectDiv, priorityValue) {
    if (priorityValue == "High") {
      projectDiv.style.backgroundColor = "#fecaca";
    } else if (priorityValue == "Medium") {
      projectDiv.style.backgroundColor = "#fef08a";
    };
  };

  const detailsToProjectConfigurer = function () {
    let pressedDetailsButtonProject;

    const setClickedProjectID = (detailsButton) =>
      (pressedDetailsButtonProject = detailsButton);
    const getClickedProjectID = () => pressedDetailsButtonProject;

    return { setClickedProjectID, getClickedProjectID };
  };

  const toDoIndexer = function () {
    let index = 0;

    const increaseIndex = () => index++;
    const resetIndex = () => (index = 0);

    const getIndex = () => index;

    return { increaseIndex, resetIndex, getIndex };
  }; 

  const toDosParentConfigurer = function () {
    let clickedProjectToDos;

    const setParent = (projectDiv) => (clickedProjectToDos = projectDiv);
    const getParent = () => clickedProjectToDos;

    return { setParent, getParent };
  };

  function updateToDoFooter(tasks) {
    if (Object.keys(tasks).length > 0) {
      if (
        addToDoForm.style.display == "none" ||
        addToDoForm.style.display == ""
      ) {
        addToDo.style.display = "flex";
      } else addToDo.style.display = "none";
    } else
      (addToDo.style.display = "none"), (addToDoForm.style.display = "none");
  }

  function setValuesToModal(values) {
    projectTitle.value = values.title;
    projectDescription.value = values.description;
    projectDueDate.value = values.dueDate;
    projectNotes.value = values.notes;
    projectPriority.value = values.priority;
  }

  const headerStateTransformer = function(header) {
    returnButton.classList.toggle('hide');
    headerImgs.classList.toggle('hide');
    currentHeader.textContent = header;
    currentHeader.classList.toggle('fontadjuster');
    headerArea.classList.toggle('headerspacer');
  }

  const addProjectsToDom = function (tasks) {
    //first empty parent container from project-elements, before refreshing with up-to-date projects
    content.textContent = "";

    filterSortWrapper.forEach((element) => element.classList.remove('hide2'))

    //add "Add to-do" bar, if there are projects available
    updateToDoFooter(tasks);

    for (const [key, value] of Object.entries(tasks)) {
      const projectDiv = document.createElement("div");
      projectDiv.classList.add("projectDiv");
      projectDiv.dataset.projectid = key

      const titleDueDate = document.createElement("div");

      const title = document.createElement("h3");
      title.textContent = tasks[key].getProject().title;

      const dueDate = document.createElement("h3");
      dueDate.textContent = `Due Date: ${tasks[key].getProject().dueDate}`;

      titleDueDate.append(title, dueDate);

      const options = document.createElement("div");

      const seeToDosButton = document.createElement("button");
      seeToDosButton.textContent = `Open To-Dos (${tasks[key].getToDos().length})`;

      const seeDetailsButton = document.createElement("button");
      seeDetailsButton.textContent = "Details & Edit";

      const deleteProjectButton = document.createElement("button");
      deleteProjectButton.textContent = "Delete";

      seeToDosButton.addEventListener("click", (e) => {
        //save which project's 'Open ToDos' was clicked
        toDosParent.setParent(e.target.parentNode.parentNode);
        //empty parent container from project-elements, before refreshing with up-to-date to-dos
        content.textContent = "";

        filterSortWrapper.forEach((element) => element.classList.add('hide2'))
        
        let projectHeader = toDosParent.getParent().querySelector('div:first-child h3').textContent;

        headerStateTransformer(projectHeader);
        getProjectToDos(key);
      });

      seeDetailsButton.addEventListener("click", (e) => {

        addingNewProject = false;

        let pressedButtonTaskId = e.target.closest('.projectDiv').dataset.projectid

        projectIdSetter.setClickedProjectID(pressedButtonTaskId);

        projectsaver.showModal();
        minDateToday();

        let values = getValues(pressedButtonTaskId);
        setValuesToModal(values);

        addSaveProject.textContent = "Save";
        modalHeader.textContent = "Edit project";
      });

      deleteProjectButton.addEventListener("click", (e) => {
        if (window.confirm("Confirm project deletion")) {
          removeProject(key);
        };
      });

      options.append(seeToDosButton, seeDetailsButton, deleteProjectButton);

      projectDiv.append(titleDueDate, options);
      colorByPriority(projectDiv, tasks[key].getProject().priority);
      content.append(projectDiv);
    };
  };

  const addToDosToDom = function (projectToDos) {
    content.textContent = "";
    
    toDoIndex.resetIndex();

    const ulList = document.createElement("ul");
    ulList.classList.add("toDoList");

    projectToDos.forEach((toDo) => {
      const listItem = document.createElement("li");
      listItem.classList.add("toDoItem");
      listItem.dataset.indexnum = toDoIndex.getIndex();

      const toDoText = document.createElement("label");
      const toDoCheck = document.createElement("input");
      const deleteIcon = new Image();
      deleteIcon.src = trashcan;

      colorAndMarkIfDone(toDo, listItem, toDoCheck);

      toDoText.textContent = toDo.getToDo();

      toDoText.setAttribute("for", `toDoItem${toDoIndex.getIndex()}`);

      toDoCheck.setAttribute("type", "checkbox");
      toDoCheck.setAttribute("id", `toDoItem${toDoIndex.getIndex()}`);
      toDoCheck.setAttribute("name", `toDoItem${toDoIndex.getIndex()}`);

      listItem.append(toDoText, deleteIcon, toDoCheck);

      ulList.append(listItem);

      deleteIcon.addEventListener("click", (e) => {
        toDoRemove(
          toDosParent.getParent().dataset.projectid,
          e.target.closest('.toDoItem').dataset.indexnum,
        );
      });

      toDoCheck.addEventListener("click", (e) => {
        toDoChecked(
          toDosParent.getParent().dataset.projectid,
          e.target.closest('.toDoItem').dataset.indexnum,
        );

        if (
          toDoDoneOrNot(
            toDosParent.getParent().dataset.projectid,
            e.target.closest('.toDoItem').dataset.indexnum,
          )
        ) {
          e.target.checked = true;
          e.target.parentNode.style.backgroundColor = "yellowgreen";
        } else
          e.target.parentNode.style.backgroundColor =
            "rgba(223, 223, 223, 0.706)";
      });

      toDoIndex.increaseIndex();

      content.append(ulList);
    });

    function colorAndMarkIfDone(toDo, listItem, toDoCheck) {
      if (toDo.checkIfDone() == true) {
        listItem.style.backgroundColor = "yellowgreen";
        toDoCheck.checked = true;
      }
    }
  };

  const toDoIndex = toDoIndexer();
  const projectIdSetter = detailsToProjectConfigurer();
  const toDosParent = toDosParentConfigurer();

  //hide the return button and filters when the page first loads
  returnButton.classList.add('hide');

  return {
    projectsToOptions,
    toDoIndex,
    changeViewToMain,
    isMainPageCurrentlyInView,
    updateProjectDiv,
    addProjectsToDom,
    addToDosToDom,
    
  };
};

export { displayHandler };
