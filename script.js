// console.log("This is the console of the To-do List App")
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const taskCount = document.getElementById("task-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterBtns = document.querySelectorAll(".filter-btn");
const notification = document.getElementById("notification");
const notificationMessage = document.getElementById("notification-message");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function showNotification(message, type = 'info') {
    notification.className = 'notification';
    notification.classList.add(type);
    notificationMessage.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function updateTaskCount() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    taskCount.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
}

function saveData() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateTaskCount();
}

function renderTasks(filter = 'all') {
    listContainer.innerHTML = '';
    const filteredTasks = tasks.filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
    });

    filteredTasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.innerHTML = task.text;
        if (task.completed) li.classList.add("checked");
        
        const span = document.createElement("span");
        span.innerHTML = "\u00d7";
        li.appendChild(span);
        
        listContainer.appendChild(li);
    });
}

function addTask() {
    if (inputBox.value.trim() === '') {
        showNotification('Please enter a task', 'error');
        return;
    }
    
    const newTask = {
        text: inputBox.value.trim(),
        completed: false
    };
    
    tasks.push(newTask);
    saveData();
    renderTasks();
    inputBox.value = "";
    showNotification('Task added successfully!', 'success');
}

listContainer.addEventListener("click", function(e) {
    if (e.target.tagName === "LI") {
        const index = Array.from(listContainer.children).indexOf(e.target);
        tasks[index].completed = !tasks[index].completed;
        e.target.classList.toggle("checked");
        saveData();
        showNotification(tasks[index].completed ? 'Task marked as completed!' : 'Task marked as active!', 'success');
    } else if (e.target.tagName === "SPAN") {
        const index = Array.from(listContainer.children).indexOf(e.target.parentElement);
        tasks.splice(index, 1);
        e.target.parentElement.remove();
        saveData();
        showNotification('Task deleted successfully!', 'success');
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderTasks(btn.dataset.filter);
    });
});

clearCompletedBtn.addEventListener("click", () => {
    const completedCount = tasks.filter(task => task.completed).length;
    tasks = tasks.filter(task => !task.completed);
    saveData();
    renderTasks();
    if (completedCount > 0) {
        showNotification(`${completedCount} task(s) cleared!`, 'success');
    }
});

// Initialize the app
renderTasks();
updateTaskCount();

// Add task when pressing Enter
inputBox.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        addTask();
    }
});