import { restoreProject, fetchedProjects } from "./controller";

function storage() {
  const dataSaver = function (projects) {
    const copy = [];

    projects.forEach((item) => {
      let projectObject = {};

      projectObject["project"] = item.getProject();
      projectObject["toDos"] = item
        .getToDos()
        .map((todo) => [todo.getToDo(), todo.checkIfDone()]);

      copy.push(projectObject);
    });

    const tasksJSON = JSON.stringify(copy);

    localStorage.setItem("projects", tasksJSON);
  };

  const dataGetter = function (displayObj) {
    const parsedTasks = JSON.parse(localStorage.getItem("projects"));

    for (const task of parsedTasks) {
      restoreProject(
        task.project.title,
        task.project.description,
        task.project.dueDate,
        task.project.notes,
        task.project.priority,
        task.project.numOfProject,
        task.toDos,
      );
    }
    displayObj.addProjectsToDom(fetchedProjects);
    displayObj.projectsToOptions(fetchedProjects);
  };

  return { dataSaver, dataGetter };
}

export { storage };
