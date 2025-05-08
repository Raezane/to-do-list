import { restoreProject } from "./controller";

function storage() {
  const dataSaver = function (projects) {
    const copy = [];

    for (const [key, value] of Object.entries(projects)) {
      let projectObject = {};

      console.log(projects[key])
      projectObject["id"] = key;
      projectObject["project"] = projects[key].getProject();
      projectObject["toDos"] = projects[key]
        .getToDos()
        .map((todo) => [todo.getToDo(), todo.checkIfDone()]);

      copy.push(projectObject);
    };

    const tasksJSON = JSON.stringify(copy);

    localStorage.setItem("tasks", tasksJSON);
  };

  const dataGetter = function () {
    const parsedTasks = JSON.parse(localStorage.getItem("tasks"));

    for (const task of parsedTasks) {
      restoreProject(
        task.id,
        task.project.title,
        task.project.description,
        task.project.dueDate,
        task.project.notes,
        task.project.priority,
        task.project.numOfProject,
        task.toDos,
      );
    };
  };

  return { dataSaver, dataGetter };
}

export { storage };
