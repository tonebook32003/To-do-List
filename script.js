// console.log("This is the console of the To-do List App")
const inputBox = document.getElementById("input-box");
const taskTime = document.getElementById("task-time");
const listContainer = document.getElementById("list-container");
const taskCount = document.getElementById("task-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterBtns = document.querySelectorAll(".filter-btn");
const notification = document.getElementById("notification");
const notificationMessage = document.getElementById("notification-message");
const searchInput = document.getElementById("search-input");
const sortBtn = document.getElementById("sort-btn");
const sortOptions = document.getElementById("sort-options");
const progressBar = document.getElementById("progress-bar");
const themeToggle = document.querySelector(".theme-toggle");
const priorityBtns = document.querySelectorAll(".priority-btn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentSort = "date-desc";
let currentTheme = localStorage.getItem("theme") || "light";
let draggedItem = null;

// Theme handling
function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    themeToggle.innerHTML = theme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

themeToggle.addEventListener("click", () => {
    currentTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(currentTheme);
});

// Sort handling
sortBtn.addEventListener("click", () => {
    sortOptions.classList.toggle("show");
});

sortOptions.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
        currentSort = e.target.dataset.sort;
        sortOptions.classList.remove("show");
        renderTasks();
    }
});

// Search handling
searchInput.addEventListener("input", () => {
    renderTasks();
});

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

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
    const totalTasks = tasks.length;
    taskCount.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
    
    // Update progress bar
    const progress = totalTasks === 0 ? 0 : ((totalTasks - activeTasks) / totalTasks) * 100;
    progressBar.style.width = `${progress}%`;
}

function saveData() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateTaskCount();
}

function sortTasks(tasks) {
    switch (currentSort) {
        case "date-asc":
            return tasks.sort((a, b) => new Date(a.time || 0) - new Date(b.time || 0));
        case "date-desc":
            return tasks.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
        case "priority":
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        case "alphabetical":
            return tasks.sort((a, b) => a.text.localeCompare(b.text));
        default:
            return tasks;
    }
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
        li.draggable = true;
        li.dataset.index = index;
        
        // Add drag handle
        const dragHandle = document.createElement("div");
        dragHandle.className = "drag-handle";
        dragHandle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
        li.appendChild(dragHandle);
        
        // Create task content container
        const taskContent = document.createElement("div");
        taskContent.className = "task-content";
        
        // Create checkbox
        const checkbox = document.createElement("div");
        checkbox.className = "task-checkbox";
        taskContent.appendChild(checkbox);
        
        // Create text container
        const textContainer = document.createElement("div");
        textContainer.className = "task-text-container";
        
        // Add task text
        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.innerHTML = task.text;
        textContainer.appendChild(taskText);
        
        // Add time if exists
        if (task.time) {
            const timeSpan = document.createElement("span");
            timeSpan.className = "task-time";
            timeSpan.innerHTML = `<i class="far fa-clock"></i> ${formatDateTime(task.time)}`;
            textContainer.appendChild(timeSpan);
        }
        
        taskContent.appendChild(textContainer);
        li.appendChild(taskContent);
        
        if (task.completed) {
            li.classList.add("checked");
            checkbox.innerHTML = '<i class="fas fa-check"></i>';
        }
        
        // Add action buttons container
        const actionBtns = document.createElement("div");
        actionBtns.className = "action-buttons";
        
        // Add edit button
        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        actionBtns.appendChild(editBtn);
        
        // Add delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        actionBtns.appendChild(deleteBtn);
        
        li.appendChild(actionBtns);
        listContainer.appendChild(li);
    });

    // Add drag and drop event listeners
    const items = listContainer.querySelectorAll('li');
    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    items.forEach(item => item.classList.remove('over'));
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    e.stopPropagation();
    if (draggedItem !== this) {
        const allItems = [...listContainer.querySelectorAll('li')];
        const draggedIndex = allItems.indexOf(draggedItem);
        const droppedIndex = allItems.indexOf(this);
        
        // Update tasks array
        const [movedTask] = tasks.splice(draggedIndex, 1);
        tasks.splice(droppedIndex, 0, movedTask);
        
        // Save and re-render
        saveData();
        renderTasks();
    }
    return false;
}

function editTask(index) {
    const task = tasks[index];
    const li = listContainer.children[index];
    const textContainer = li.querySelector('.task-text-container');
    const taskText = textContainer.querySelector('.task-text');
    const timeSpan = textContainer.querySelector('.task-time');
    
    // Create edit form
    const editForm = document.createElement('div');
    editForm.className = 'edit-form';
    
    // Text input
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.value = task.text;
    textInput.className = 'edit-text-input';
    
    // Time input
    const timeInput = document.createElement('input');
    timeInput.type = 'datetime-local';
    timeInput.value = task.time || '';
    timeInput.className = 'edit-time-input';
    
    // Buttons container
    const editActions = document.createElement('div');
    editActions.className = 'edit-actions';
    
    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.innerHTML = '<i class="fas fa-check"></i>';
    
    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
    
    editActions.appendChild(saveBtn);
    editActions.appendChild(cancelBtn);
    
    editForm.appendChild(textInput);
    editForm.appendChild(timeInput);
    editForm.appendChild(editActions);
    
    // Replace content with edit form
    textContainer.style.display = 'none';
    textContainer.parentNode.insertBefore(editForm, textContainer);
    
    // Focus text input
    textInput.focus();
    
    // Save changes
    saveBtn.onclick = () => {
        const newText = textInput.value.trim();
        if (newText === '') {
            showNotification('Task cannot be empty', 'error');
            return;
        }
        
        tasks[index].text = newText;
        tasks[index].time = timeInput.value || null;
        saveData();
        renderTasks();
        showNotification('Task updated successfully!', 'success');
    };
    
    // Cancel editing
    cancelBtn.onclick = () => {
        textContainer.style.display = 'flex';
        editForm.remove();
    };
    
    // Handle Enter key
    textInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
    };
}

function addTask() {
    if (inputBox.value.trim() === '') {
        showNotification('Please enter a task', 'error');
        return;
    }
    
    const newTask = {
        text: inputBox.value.trim(),
        completed: false,
        time: taskTime.value || null
    };
    
    tasks.push(newTask);
    saveData();
    renderTasks();
    inputBox.value = "";
    taskTime.value = "";
    showNotification('Task added successfully!', 'success');
}

listContainer.addEventListener("click", function(e) {
    const li = e.target.closest('li');
    if (!li) return;
    
    if (e.target.closest('.delete-btn')) {
        const index = Array.from(listContainer.children).indexOf(li);
        tasks.splice(index, 1);
        li.remove();
        saveData();
        showNotification('Task deleted successfully!', 'success');
    } else if (e.target.closest('.edit-btn')) {
        const index = Array.from(listContainer.children).indexOf(li);
        editTask(index);
    } else if (!e.target.closest('.edit-form')) {
        const index = Array.from(listContainer.children).indexOf(li);
        tasks[index].completed = !tasks[index].completed;
        li.classList.toggle("checked");
        const checkbox = li.querySelector('.task-checkbox');
        checkbox.innerHTML = tasks[index].completed ? '<i class="fas fa-check"></i>' : '';
        saveData();
        showNotification(tasks[index].completed ? 'Task marked as completed!' : 'Task marked as active!', 'success');
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
setTheme(currentTheme);
renderTasks();
updateTaskCount();

// Add task when pressing Enter
inputBox.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        addTask();
    }
});

// Close sort options when clicking outside
document.addEventListener("click", (e) => {
    if (!e.target.closest("#sort-btn") && !e.target.closest("#sort-options")) {
        sortOptions.classList.remove("show");
    }
});