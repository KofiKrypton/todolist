// Get references to HTML elements
const todoSubmit = document.getElementById("todo-submit");
const todoList = document.getElementById("todo-list");
const filterOptions = document.getElementsByName("filter");

// Initialize filterBy if not present
!localStorage.getItem("filterBy") ?? localStorage.setItem("filterBy", "all");

// Initial setup
buildTodoList();
filterTodos();

// Set initial checked state for filter options
filterOptions.forEach((item) => {
    item.value === localStorage.getItem("filterBy")
        ? (item.checked = true)
        : (item.checked = false);
});

// Event listeners
todoSubmit.addEventListener("click", addTodo);
todoList.addEventListener("click", handleTodoClickEvent);
filterOptions.forEach((option) => {
    option.addEventListener("click", filterTodos);
});

// Function to build the todo list from localStorage
function buildTodoList() {
    todoList.innerHTML = "";
    try {
        const currentList = JSON.parse(window.localStorage.getItem("localTodoList")) || [];
        currentList.forEach((todo) => buildTodoListItem(todo));
    } catch (error) {
        console.error("Error parsing local storage data:", error);
    }
}

// Function to build a single todo item
function buildTodoListItem(todo) {
    let todoItem = document.createElement("div");
    todoItem.classList.add("todo-item");
    todoItem.innerHTML = `<p class="todo-content" tabindex="0" contenteditable="true">${todo.todo}</p>
    <button class="button todo-completed" aria-label="mark complete">
      <svg class="icon">
        <use xlink:href="#icon-checked" />
      </svg>
    </button>
    <button class="button todo-edit" aria-label="edit">
      <object data="/img/edit-pen-icon.svg" type="image/svg+xml">
          Your browser does not support SVG
      </object>
    </button>
    <button class="button todo-delete" aria-label="delete">
      <svg class="icon">
        <use xlink:href="#icon-delete" />
      </svg>
    </button>`;
    todo.completed ? todoItem.classList.add("completed") : null;
    todoItem.dataset.id = todo.id;
    todoList.appendChild(todoItem);
}

// Function to add a new todo
function addTodo(e) {
    e.preventDefault();
    const todoInput = document.getElementById("todo-input");
    const newTodo = {
        todo: todoInput.value,
        completed: false,
        id: new Date().getTime(),
    };
    addTodoToLocalStorage(newTodo);
    buildTodoListItem(newTodo);
    todoInput.value = "";
}

// Function to handle click events on todo items
function handleTodoClickEvent(e) {
    const target = e.target;

    if (target.classList.contains("todo-delete")) {
        const todo = target.closest(".todo-item");
        deleteTodo(todo);
    } else if (target.classList.contains("todo-completed")) {
        const todo = target.closest(".todo-item");
        markTodoComplete(todo);
    } else if (target.classList.contains("todo-edit")) {
        // Do nothing when clicking the edit button
    } else if (target.classList.contains("todo-content")) {
        // Allow in-place editing of todo content
        target.focus();
    }
}

// Function to handle the editing of a todo
todoList.addEventListener("input", debounce(function (e) {
    const todo = e.target.closest(".todo-item");
    if (todo) {
        const todoContent = todo.querySelector(".todo-content");
        const updatedTodo = todoContent.textContent;

        // Update the todo in localStorage
        const localTodoList = JSON.parse(window.localStorage.getItem("localTodoList")) || [];
        localTodoList.forEach((item) => {
            if (item.id === parseInt(todo.dataset.id)) item.todo = updatedTodo;
        });
        window.localStorage.setItem("localTodoList", JSON.stringify(localTodoList));
    }
}, 300));

// Function to delete a todo
function deleteTodo(todo) {
    todo.classList.add("rotate-fade");
    todo.addEventListener("transitionend", () => {
        removeTodoFromLocalStorage(todo);
        todo.remove();
    });
}

// Function to mark a todo as complete or incomplete
function markTodoComplete(todo) {
    todo.children[0].focus();
    todo.classList.toggle("completed");
    const isComplete = todo.classList.contains("completed");
    const localTodoList = JSON.parse(window.localStorage.getItem("localTodoList")) || [];
    localTodoList.forEach((item) => {
        if (item.id === parseInt(todo.dataset.id)) item.completed = isComplete;
    });
    window.localStorage.setItem("localTodoList", JSON.stringify(localTodoList));
}

// Function to add a todo to localStorage
function addTodoToLocalStorage(todo) {
    const currentList = JSON.parse(window.localStorage.getItem("localTodoList")) || [];
    const newList = [...currentList, todo];
    window.localStorage.setItem("localTodoList", JSON.stringify(newList));
}

// Function to remove a todo from localStorage
function removeTodoFromLocalStorage(todo) {
    const currentList = JSON.parse(window.localStorage.getItem("localTodoList")) || [];
    const newList = currentList.filter((item) => item.id !== parseInt(todo.dataset.id));
    window.localStorage.setItem("localTodoList", JSON.stringify(newList)) || [];
}

// Function to filter todos based on selected filter option
function filterTodos() {
    const value = this.value || window.localStorage.getItem("filterBy");
    const todoListItems = document.querySelectorAll(".todo-item");

    todoListItems.forEach((item) => {
        switch (value) {
            case "all":
                item.style.display = "grid";
                break;
            case "completed":
                item.classList.contains("completed")
                    ? (item.style.display = "grid")
                    : (item.style.display = "none");
                break;
            case "uncompleted":
                !item.classList.contains("completed")
                    ? (item.style.display = "grid")
                    : (item.style.display = "none");
                break;
            default:
                item.style.display = "grid";
                break;
        }
    });
}

// Debounce function to limit the frequency of a function call
function debounce(func, delay) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}
