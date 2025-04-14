import { format } from "date-fns";
import { communicator } from "./controller";
import { storage } from "./storageloader";
import trashcan from "./images/trashcan.svg";

const viewer = (function () {
  const controller = communicator();

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

  const filters = document.querySelectorAll('input[type="radio"]');

  const returnButton = document.querySelector(".returnbutton");
  const projectHeader = document.querySelector("#header h3");

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
        controller.createProject(
          projectTitle.value,
          projectDescription.value,
          projectDueDate.value,
          projectNotes.value,
          projectPriority.value,
        );
        modalForm.reset();
        projectNum.increaseNum();

        // if modal is opened from existing project details-button and project info is then
        // edited and saved, modify the clicked project details to set the new entered values
      } else
        controller.modifyProject(
          setDetailsButtonProject.getButton(),
          projectTitle.value,
          projectDescription.value,
          projectDueDate.value,
          projectNotes.value,
          projectPriority.value,
        );

      returnButton.style.display = "none";
      projectHeader.style.display = "none";
      projectsToOptions(controller.getTasks());
      projectsaver.close();
      resetFilterSelection(filters);
    }
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
      controller.addToDoToProject(
        toDoInput.value,
        projectSelector.selectedIndex,
      );

      //when "Add" is clicked, also empty the selector from default value to being 'blank'
      addToDoForm.reset();
      projectSelector.selectedIndex = -1;

      if (!(clickedToDosParent.getParent() == undefined)) {
        controller.getProjectToDos(clickedToDosParent.getParent());
      }
      addToDoAnimate();
    }
  });

  filters.forEach((filter) => {
    filter.addEventListener("click", (e) => {
      filterColour(e, filters);
      controller.filterByDueDate(e.target.id);
      returnButton.style.display = "none";
      projectHeader.style.display = "none";
    });
  });

  returnButton.addEventListener("click", () => {
    clickedToDosParent.setParent(undefined);
    controller.getProjectsForDom(controller.getTasks());
    returnButton.style.display = "none";
    projectHeader.style.display = "none";
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
    if (toDoInput.validity.valueMissing) {
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

  const addProjectsToDom = function (tasks) {
    //first empty parent container from project-elements, before refreshing with up-to-date projects
    //also reset index-calculator of dom-project elements
    content.textContent = "";
    domIndex.resetIndex();

    //add "Add to-do" bar, if there are projects available
    updateToDoFooter(controller.getTasks());

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
      seeToDosButton.textContent = "Open To-Dos";

      const seeDetailsButton = document.createElement("button");
      seeDetailsButton.textContent = "Details & Edit";

      const deleteProjectButton = document.createElement("button");
      deleteProjectButton.textContent = "Delete";

      seeToDosButton.addEventListener("click", (e) => {
        //save which project's 'Open ToDos' was clicked
        clickedToDosParent.setParent(e.target.parentNode.parentNode);
        //empty parent container from project-elements, before refreshing with up-to-date to-dos
        content.textContent = "";
        controller.getProjectToDos(e.target.parentNode.parentNode);
      });

      seeDetailsButton.addEventListener("click", (e) => {
        let pressedButtonProject = e.target.parentNode.parentNode;

        setDetailsButtonProject.setButton(pressedButtonProject);

        projectsaver.showModal();
        minDateToday();

        let values = controller.getValues(pressedButtonProject);
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
          controller.removeProject(e.target.parentNode.parentNode);

          updateToDoFooter(controller.getTasks());
          projectsToOptions(controller.getTasks());
          filters[0].checked = true;
        }
      });

      options.append(seeToDosButton, seeDetailsButton, deleteProjectButton);

      projectDiv.append(titleDueDate, options);
      colorByPriority(projectDiv, project.getProject().priority);
      content.append(projectDiv);

      viewer.domIndex.increaseIndex();
    });
  };

  const addToDosToDom = function (projectToDos, projectTitle) {
    projectHeader.textContent = projectTitle;
    content.textContent = "";

    //add 'return to main page'-button, when user opens to-dos of project
    returnButton.style.display = "block";
    projectHeader.style.display = "block";
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
        controller.toDoRemove(
          clickedToDosParent.getParent(),
          e.target.parentNode.getAttribute("index-number"),
        );
      });

      toDoCheck.addEventListener("click", (e) => {
        controller.toDoChecked(
          clickedToDosParent.getParent(),
          e.target.parentNode.getAttribute("index-number"),
        );

        if (
          controller.toDoDoneOrNot(
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

      viewer.domIndex.increaseIndex();

      content.append(ulList);
    });

    function colorAndMarkIfDone(toDo, listItem, toDoCheck) {
      if (toDo.checkIfDone() == true) {
        listItem.style.backgroundColor = "yellowgreen";
        toDoCheck.checked = true;
      }
    }
  };

  return {
    projectsToOptions,
    projectNum,
    domIndex,
    addProjectsToDom,
    addToDosToDom,
  };
})();

export { viewer };

storage().dataGetter();
