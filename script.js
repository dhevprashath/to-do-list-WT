document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    // --- DOM Elements ---
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const taskCount = document.getElementById('task-count');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const dateDisplay = document.getElementById('date-display');

    // --- Initialization ---
    init();

    function init() {
        setDate();
        renderTasks();

        // Event Listeners
        addBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active class
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update filter and render
                currentFilter = btn.dataset.filter;
                renderTasks();
            });
        });

        clearCompletedBtn.addEventListener('click', clearCompleted);
    }

    // --- Core Functions ---
    function setDate() {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateCount();
    }

    function updateCount() {
        const activeCount = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} left`;
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now().toString(),
            text: text,
            completed: false
        };

        tasks.unshift(newTask); // Add to the beginning
        taskInput.value = '';
        saveTasks();
        renderTasks();
    }

    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }

    function deleteTask(id, liElement) {
        // Add slide out animation
        liElement.classList.add('removing');
        
        // Wait for animation to finish before actual removal
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        }, 300); // 300ms matches css animation duration
    }

    function clearCompleted() {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
    }

    function renderTasks() {
        // Filter tasks
        let displayTasks = tasks;
        if (currentFilter === 'active') {
            displayTasks = tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            displayTasks = tasks.filter(t => t.completed);
        }

        // Clean current list
        taskList.innerHTML = '';
        
        if (displayTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-clipboard-list"></i>
                    <p>No ${currentFilter !== 'all' ? currentFilter : ''} tasks found.</p>
                </div>
            `;
            updateCount();
            return;
        }
        
        displayTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''} aria-label="Toggle task completion">
                <span class="task-text">${escapeHTML(task.text)}</span>
                <button class="delete-btn" aria-label="Delete Task" title="Delete Task">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;

            // Setup listeners for newly created elements
            const checkbox = li.querySelector('.checkbox');
            checkbox.addEventListener('change', () => toggleTask(task.id));

            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(task.id, li));

            taskList.appendChild(li);
        });

        updateCount();
    }

    // Utility to prevent XSS vulnerability
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
