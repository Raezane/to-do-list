import { format } from "date-fns";
//import { storage } from "./storageloader";
import trashcan from "../images/trashcan.svg";
import { 
  fetchedProjects, 
  createProject, 
  modifyProject, 
  addToDoToProject, 
  getProjectToDos, 
  filterByDueDate, 
  getValues, 
  removeProject,
  toDoRemove, 
  toDoChecked,
  toDoDoneOrNot
} from "./controller";

const displayHandler = function () {

  const headerArea = document.querySelector('header');

  const returnButton = document.querySelector(".returnbutton");
  const currentHeader = document.querySelector('header span h2');
  const headerImg = document.querySelector('header span img');

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

  const filtersWrapper = document.querySelector('.filterWrapper')
  const openFilter = document.querySelector('.filterWrapper button');
  const filtersParent = document.querySelector('#radioselectors')
  const filters = document.querySelectorAll('input[type="radio"]');

  const content = document.querySelector("main");

  addproject.addEventListener("click", () => {
    //reset modal form, if modal is opened from "see details" fron already existing project
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
    if (projectValidity()) {
      if (addSaveProject.textContent === "Add Project") {
        createProject(
          projectTitle.value,
          projectDescription.value,
          projectDueDate.value,
          projectNotes.value,
          projectPriority.value,
        );
        modalForm.reset();
        projectNum.increaseNum();
        /* if modal is opened from existing project details-button and project info is then
        edited and saved, modify the clicked project details to set the new entered values */
      } else
        modifyProject(
          setDetailsButtonProject.getButton(),
          projectTitle.value,
          projectDescription.value,
          projectDueDate.value,
          projectNotes.value,
          projectPriority.value,
        );

      projectsToOptions(fetchedProjects);
      projectsaver.close();
      resetFilterSelection(filters);
    };
  });

  addToDo.addEventListener("click", () => {
    addToDo.style.display = "none";
    addToDoForm.style.display = "flex";
  });

  addToDoCancel.addEventListener("click", () => {
    addToDoForm.reset();
    addToDo.style.display = "flex";
    addToDoForm.style.display = "none";
  });

  addToDoAdd.addEventListener("click", () => {
    if (toDoValidity()) {
      addToDoToProject(
        toDoInput.value,
        projectSelector.selectedIndex,
      );

      //when "Add" is clicked, also empty the selector from default value to being 'blank'
      addToDoForm.reset();
      projectSelector.selectedIndex = -1;

      if (!(clickedToDosParent.getParent() == undefined)) {
        getProjectToDos(clickedToDosParent.getParent());
      }
      addToDoAnimate();
    }
  });

  openFilter.addEventListener('click', () => {
    filtersParent.classList.toggle('hide2')
    if (openFilter.textContent == 'Filter +') openFilter.textContent = 'Filter -';
    else openFilter.textContent = 'Filter +';
  });

  filters.forEach((filter) => {
    filter.addEventListener("click", (e) => {
      filterColour(e, filters);
      filterByDueDate(e.target.id);
    });
  });

  returnButton.addEventListener("click", () => {
    clickedToDosParent.setParent(undefined);
    addProjectsToDom(fetchedProjects);
    headerStateTransformer('Projects');
    resetFilterSelection(filters);
  });

  function projectValidity() {
    if (projectTitle.value == "") {
      projectTitle.setCustomValidity("Set Project name!");
      projectTitle.reportValidity();
      return false;
    }
    if (projectDueDate.value == "") {
      projectDueDate.setCustomValidity("Due date required.");
      projectDueDate.reportValidity();
      return false;
    }
    return true;
  }

  function filterColour(e, filterButtons) {
    let clickedRadio = e.target.parentNode;
    emptyFilterColor(filterButtons);
    clickedRadio.style.backgroundColor = "rgba(155, 155, 155, 0.356)";
  }

  function resetFilterSelection(filters) {
    filters[0].checked = true;
    emptyFilterColor(filters);
    filters[0].parentElement.style.backgroundColor =
      "rgba(155, 155, 155, 0.356)";
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

    allprojects.forEach((project) => {
      const optionValue = document.createElement("option");
      optionValue.value = project.getProject().title;
      optionValue.textContent = project.getProject().title;

      projectSelector.append(optionValue);
    });
  }

  function changeViewToMain() {
    if (currentHeader.textContent !== 'Projects') {
      headerStateTransformer('Projects');
    };
  };

  function isMainPageCurrentlyInView() {
    return content.childNodes.length > 0 && content.childNodes[0].classList.contains('projectDiv')
  }

  function updateProjectDiv(selectedProject, numOfToDos) {
    if (isMainPageCurrentlyInView()) {
      content.childNodes[selectedProject].childNodes[1].childNodes[0].textContent = `Open To-Dos (${numOfToDos})`
    };
  };

  function minDateToday() {
    const today = format(new Date(), "yyyy-MM-dd");
    datepicker.min = today;
  }

  function addToDoAnimate() {
    addedFloat.classList.add("spanAnimate");
    setTimeout(() => {
      addedFloat.classList.remove("spanAnimate");
    }, 1500);
  }

  function colorByPriority(projectDiv, priorityValue) {
    if (priorityValue == "High") {
      projectDiv.style.backgroundColor = "#fecaca";
    } else if (priorityValue == "Medium") {
      projectDiv.style.backgroundColor = "#fef08a";
    }
  }

  const setDetailsButtonProject = (function (detailsButton) {
    let pressedDetailsButtonProject;

    const setButton = (detailsButton) =>
      (pressedDetailsButtonProject = detailsButton);
    const getButton = () => pressedDetailsButtonProject;

    return { setButton, getButton };
  })();

  const projectNum = (function () {
    let num = 0;

    const setNum = (givenNum) => (num = givenNum);
    const increaseNum = () => num++;
    const decreaseNum = () => num--;

    const getNum = () => num;

    return { setNum, increaseNum, decreaseNum, getNum };
  })();

  const domIndex = (function () {
    let index = 0;

    const increaseIndex = () => index++;
    const resetIndex = () => (index = 0);

    const getIndex = () => index;

    return { increaseIndex, resetIndex, getIndex };
  })();

  const clickedToDosParent = (function () {
    let clickedProjectToDos;

    const setParent = (projectDiv) => (clickedProjectToDos = projectDiv);
    const getParent = () => clickedProjectToDos;

    return { setParent, getParent };
  })();

  function updateToDoFooter(tasks) {
    if (tasks.length > 0) {
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
    headerImg.classList.toggle('hide');
    currentHeader.textContent = header;
    currentHeader.classList.toggle('fontadjuster');
    headerArea.classList.toggle('headerspacer');
  }

  const addProjectsToDom = function (tasks) {
    //first empty parent container from project-elements, before refreshing with up-to-date projects
    //also reset index-calculator of dom-project elements
    content.textContent = "";
    domIndex.resetIndex();

    filtersWrapper.classList.remove('hide2');

    //add "Add to-do" bar, if there are projects available
    updateToDoFooter(fetchedProjects);

    tasks.forEach((project) => {
      const projectDiv = document.createElement("div");
      projectDiv.classList.add("projectDiv");
      projectDiv.setAttribute(
        "index-number",
        project.getProject().numOfProject,
      );

      const titleDueDate = document.createElement("div");

      const title = document.createElement("h3");
      title.textContent = project.getProject().title;

      const dueDate = document.createElement("p");
      dueDate.textContent = `Due Date: ${project.getProject().dueDate}`;

      titleDueDate.append(title, dueDate);

      const options = document.createElement("div");

      const seeToDosButton = document.createElement("button");
      seeToDosButton.textContent = `Open To-Dos (${project.getToDos().length})`;

      const seeDetailsButton = document.createElement("button");
      seeDetailsButton.textContent = "Details & Edit";

      const deleteProjectButton = document.createElement("button");
      deleteProjectButton.textContent = "Delete";

      seeToDosButton.addEventListener("click", (e) => {
        //save which project's 'Open ToDos' was clicked
        clickedToDosParent.setParent(e.target.parentNode.parentNode);
        //empty parent container from project-elements, before refreshing with up-to-date to-dos
        content.textContent = "";

        let projectHeader = clickedToDosParent.getParent().querySelector('div:first-child h3').textContent

        headerStateTransformer(projectHeader);

        getProjectToDos(e.target.parentNode.parentNode);
      });

      seeDetailsButton.addEventListener("click", (e) => {
        let pressedButtonProject = e.target.parentNode.parentNode;

        setDetailsButtonProject.setButton(pressedButtonProject);

        projectsaver.showModal();
        minDateToday();

        let values = getValues(pressedButtonProject);
        setValuesToModal(values);

        addSaveProject.textContent = "Save";
        modalHeader.textContent = "Edit project";
      });

      deleteProjectButton.addEventListener("click", (e) => {
        if (window.confirm("Confirm project deletion")) {
          // with e.target.parentNode.parentNode we are accessing
          // the grandparent-node of the delete-button,
          // which is the projectDiv element
          if (projectNum.getNum() !== 0) {
            projectNum.decreaseNum();
          }
          removeProject(e.target.parentNode.parentNode);

          updateToDoFooter(fetchedProjects);
          projectsToOptions(fetchedProjects);
          filters[0].checked = true;
        }
      });

      options.append(seeToDosButton, seeDetailsButton, deleteProjectButton);

      projectDiv.append(titleDueDate, options);
      colorByPriority(projectDiv, project.getProject().priority);
      content.append(projectDiv);

      domIndex.increaseIndex();
    });
  };

  const addToDosToDom = function (projectToDos) {
    content.textContent = "";
    filtersWrapper.classList.add('hide2');

    domIndex.resetIndex();

    const ulList = document.createElement("ul");
    ulList.classList.add("toDoList");

    projectToDos.forEach((toDo) => {
      const listItem = document.createElement("li");
      listItem.classList.add("toDoItem");
      listItem.setAttribute("index-number", domIndex.getIndex());

      const toDoText = document.createElement("label");
      const toDoCheck = document.createElement("input");
      const deleteIcon = new Image();
      deleteIcon.src = trashcan;

      colorAndMarkIfDone(toDo, listItem, toDoCheck);

      toDoText.textContent = toDo.getToDo();

      toDoText.setAttribute("for", `toDoItem${domIndex.getIndex()}`);

      toDoCheck.setAttribute("type", "checkbox");
      toDoCheck.setAttribute("id", `toDoItem${domIndex.getIndex()}`);
      toDoCheck.setAttribute("name", `toDoItem${domIndex.getIndex()}`);

      listItem.append(toDoText, deleteIcon, toDoCheck);

      ulList.append(listItem);

      deleteIcon.addEventListener("click", (e) => {
        toDoRemove(
          clickedToDosParent.getParent(),
          e.target.parentNode.getAttribute("index-number"),
        );
      });

      toDoCheck.addEventListener("click", (e) => {
        toDoChecked(
          clickedToDosParent.getParent(),
          e.target.parentNode.getAttribute("index-number"),
        );

        if (
          toDoDoneOrNot(
            clickedToDosParent.getParent(),
            e.target.parentNode.getAttribute("index-number"),
          )
        ) {
          e.target.checked = true;
          e.target.parentNode.style.backgroundColor = "yellowgreen";
        } else
          e.target.parentNode.style.backgroundColor =
            "rgba(223, 223, 223, 0.706)";
      });

      domIndex.increaseIndex();

      content.append(ulList);
    });

    function colorAndMarkIfDone(toDo, listItem, toDoCheck) {
      if (toDo.checkIfDone() == true) {
        listItem.style.backgroundColor = "yellowgreen";
        toDoCheck.checked = true;
      }
    }
  };

  //hide the return button when the page first loads
  returnButton.classList.add('hide');

  return {
    projectsToOptions,
    projectNum,
    domIndex,
    changeViewToMain,
    isMainPageCurrentlyInView,
    updateProjectDiv,
    addProjectsToDom,
    addToDosToDom,
    
  };
};

export { displayHandler };
