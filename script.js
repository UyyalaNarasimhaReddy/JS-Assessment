document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const addTaskButton = document.getElementById("addTaskButton");
  const taskList = document.getElementById("taskList");
  const searchInput = document.getElementById("searchInput");
  const showAllButton = document.getElementById("showAll");
  const showCompletedButton = document.getElementById("showCompleted");
  const showIncompleteButton = document.getElementById("showIncomplete");
  const noTasksMessage = document.getElementById("noTasksMessage");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function renderTasks(filter = "all", searchTerm = "") {
    taskList.innerHTML = "";
    const filteredTasks = tasks.filter(task => {
      if (filter === "completed") return task.completed;
      if (filter === "incomplete") return !task.completed;
      return true;
    }).filter(task => task.name.toLowerCase().includes(searchTerm.toLowerCase()));

    filteredTasks.forEach(task => {
      const taskItem = document.createElement("li");
      taskItem.className = "task-item";
      taskItem.draggable = true;
      taskItem.dataset.id = task.id;

      const taskText = document.createElement("span");
      taskText.textContent = task.name;
      taskText.className = task.completed ? "completed" : "";
      taskText.addEventListener("dblclick", () => enterEditMode(task));

      const completeButton = document.createElement("button");
      completeButton.textContent = "Complete";
      completeButton.addEventListener("click", () => toggleComplete(task));

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => enterEditMode(task));

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deleteTask(task));

      taskItem.appendChild(taskText);
      taskItem.appendChild(completeButton);
      taskItem.appendChild(editButton);
      taskItem.appendChild(deleteButton);

      taskList.appendChild(taskItem);
    });

    noTasksMessage.style.display = filteredTasks.length ? "none" : "block";
    saveTasks();
  }

  function addTask() {
    const taskName = taskInput.value.trim();
    if (!taskName) return;
    tasks.push({ id: Date.now(), name: taskName, completed: false });
    taskInput.value = "";
    renderTasks();
  }

  function toggleComplete(task) {
    task.completed = !task.completed;
    renderTasks();
  }

  function enterEditMode(task) {
    const taskItem = taskList.querySelector(`[data-id='${task.id}']`);
    const taskText = taskItem.querySelector("span");
    const input = document.createElement("input");
    input.type = "text";
    input.value = task.name;
    taskText.replaceWith(input);
    input.focus();
    input.addEventListener("blur", () => saveEdit(task, input.value));
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") saveEdit(task, input.value);
    });
  }

  function saveEdit(task, newName) {
    task.name = newName.trim() || task.name;
    renderTasks();
  }

  function deleteTask(task) {
    tasks = tasks.filter(t => t.id !== task.id);
    renderTasks();
  }

  function searchTasks() {
    const searchTerm = searchInput.value;
    renderTasks("all", searchTerm);
  }

  function filterTasks(filter) {
    renderTasks(filter);
  }

  function setupDragAndDrop() {
    let draggedItem = null;

    taskList.addEventListener("dragstart", (e) => {
      draggedItem = e.target;
      e.target.style.opacity = "0.5";
    });

    taskList.addEventListener("dragend", (e) => {
      e.target.style.opacity = "1";
    });

    taskList.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    taskList.addEventListener("drop", (e) => {
      e.preventDefault();
      if (draggedItem && e.target.closest(".task-item") && e.target.closest(".task-item") !== draggedItem) {
        const allTasks = Array.from(taskList.children);
        const fromIndex = allTasks.indexOf(draggedItem);
        const toIndex = allTasks.indexOf(e.target.closest(".task-item"));
        [tasks[fromIndex], tasks[toIndex]] = [tasks[toIndex], tasks[fromIndex]];
        renderTasks();
      }
    });
  }

  addTaskButton.addEventListener("click", addTask);
  searchInput.addEventListener("input", searchTasks);
  showAllButton.addEventListener("click", () => filterTasks("all"));
  showCompletedButton.addEventListener("click", () => filterTasks("completed"));
  showIncompleteButton.addEventListener("click", () => filterTasks("incomplete"));

  renderTasks();
  setupDragAndDrop();
});
