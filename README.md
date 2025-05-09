**TO-DO APP**

**Overview**

In this app you can create your projects, and for each project you may add individual to-dos, which you may tick to be 'done' individually. You may filter your projects depending on given time frames and sort them in many ways. You may also delete projects or their individual to-dos or edit the already created project in project editor.

**Features**

The app:
- create, delete or modify projects
- filter created projects which are due today, this week, this month or see all
- sort projects by its name, number of to-dos, priority level or due date
- filtering and sorting at the same time also works
- create individual to-dos to any created project
- check or uncheck a todo depending if it's done or not
- delete an individual todo altogether
  
General:
- responsive, app works on any screen size
- use localStorage to save created projects (and their respective to-dos) and display them and their previous status again when you re-open the app
- utilises UUID for reliable synchronisation between DOM and internal project objects

**Technologies Used**

Languages: JavaScript, HTML, CSS
Tools & Libraries: Webpack, Prettier, Eslint, Babel, NPM, Lodash, dateFns

**Challenges & Learnings**

- Purpose of this exercise project was to get more experience of programming object oriented. 
- One of the harder parts of the project was to get the localStorage API working as intended and save and fetch current projects status with JSON format each time some data is changed or app reopened.
- The other was about always successfully connceting the DOM projects to their internal counterparts - first I made functionality for indexing each project in DOM and internal tasks object, but learnt that it would be error-prone and hard to maintain as projects were sorted, filtered, deleted and added in random order. I found out there was a great third-party library for helping DOM elements and their internal counterparts keep sync - UUID (https://www.npmjs.com/package/uuid). This UUID creates a longish randomised string, which can then be used as a key to access a certain value in object - in this case, an internal project object.

**Future Improvements**

This current version only saves the current projects state to localStorage. This means that if user creates projects with their computer, they can't continue this same session on their mobile phone, because localStorage only saves to that particular device's internal memory from which the app was opened from. To counter this, the future improvement would be maybe to impelement a backend where to save projects and then a log in method to app which would fetch the logged in user's created projects from backend and thus the created project sessions would be accessible from any user's device.
