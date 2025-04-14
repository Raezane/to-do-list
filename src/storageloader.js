import { parse } from "date-fns";
import { viewer } from "./viewer";
import { communicator } from "./controller";

let controller = communicator();

function storage() {
  const dataSaver = function (tasks) {
    const copy = [];

    tasks.forEach((item) => {
      let projectObject = {};

      projectObject["project"] = item.getProject();
      projectObject["toDos"] = item
        .getToDos()
        .map((todo) => [todo.getToDo(), todo.checkIfDone()]);

      copy.push(projectObject);
    });

    const tasksJSON = JSON.stringify(copy);

    localStorage.setItem("tasks", tasksJSON);
  };

  const dataGetter = function () {
    const parsedTasks = JSON.parse(localStorage.getItem("tasks"));

    for (const task of parsedTasks) {
      controller.restoreProject(
        task.project.title,
        task.project.description,
        task.project.dueDate,
        task.project.notes,
        task.project.priority,
        task.project.numOfProject,
        task.toDos,
      );
    }
    controller.getProjectsForDom(controller.getTasks());
    viewer.projectsToOptions(controller.getTasks());
  };

  return { dataSaver, dataGetter };
}

export { storage };
