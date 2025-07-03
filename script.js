document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const taskList = document.getElementById('task-list');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskModal = document.getElementById('task-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const taskForm = document.getElementById('task-form');
    const modalTitle = document.getElementById('modal-title');
    const taskIdInput = document.getElementById('task-id');
    const taskNameInput = document.getElementById('task-name');
    const taskDateInput = document.getElementById('task-date');

    const calendarGrid = document.getElementById('calendar-grid');
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    const progressChartCanvas = document.getElementById('progress-chart');

    // --- State Management ---
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentTask = null;
    let currentDate = new Date();
    let progressChart = null;

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // --- Modal Functions ---
    const showModal = (task = null) => {
        currentTask = task;
        if (task) {
            modalTitle.textContent = '编辑任务';
            taskIdInput.value = task.id;
            taskNameInput.value = task.name;
            taskDateInput.value = task.dueDate;
        } else {
            modalTitle.textContent = '添加新任务';
            taskForm.reset();
            taskIdInput.value = '';
        }
        taskModal.classList.add('visible');
    };

    const hideModal = () => {
        taskModal.classList.remove('visible');
        currentTask = null;
    };
    
    // --- Task Functions ---
    const renderTasks = () => {
        taskList.innerHTML = '';
        if (tasks.length === 0) {
            taskList.innerHTML = `<p class="text-gray-400 text-center col-span-full">还没有任何任务，点击右上角添加一个吧！</p>`;
            return;
        }

        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.classList.add('task-item', 'flex', 'items-center', 'justify-between', 'p-4', 'bg-gray-50', 'rounded-xl', 'hover:shadow-md', 'transition-shadow', 'duration-300');
            taskElement.dataset.id = task.id;
            if (task.completed) {
                taskElement.classList.add('opacity-60');
            }

            taskElement.innerHTML = `
                <div class="flex items-center gap-4">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} class="task-checkbox h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer">
                    <div>
                        <p class="font-semibold text-gray-800 ${task.completed ? 'line-through' : ''}">${task.name}</p>
                        <p class="text-sm text-gray-500"><i class="far fa-calendar-alt mr-1"></i> ${task.dueDate}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button class="edit-task-btn text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-full"><i class="fas fa-edit"></i></button>
                    <button class="delete-task-btn text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            
            const addedElement = taskList.appendChild(taskElement);
            addedElement.classList.add('adding');
            setTimeout(() => addedElement.classList.remove('adding'), 10);
        });
    };

    const handleTaskSubmit = (e) => {
        e.preventDefault();
        const name = taskNameInput.value.trim();
        const dueDate = taskDateInput.value;

        if (name && dueDate) {
            if (currentTask) {
                // Edit existing task
                const taskIndex = tasks.findIndex(t => t.id == currentTask.id);
                tasks[taskIndex] = { ...tasks[taskIndex], name, dueDate };
            } else {
                // Add new task
                const newTask = {
                    id: Date.now(),
                    name,
                    dueDate,
                    completed: false
                };
                tasks.push(newTask);
            }
            saveTasks();
            renderAll();
            hideModal();
        }
    };
    
    const handleTaskListClick = (e) => {
        const taskElement = e.target.closest('.task-item');
        if (!taskElement) return;
        const taskId = taskElement.dataset.id;
        
        // Delete task
        if (e.target.closest('.delete-task-btn')) {
            taskElement.classList.add('removing');
            setTimeout(() => {
                tasks = tasks.filter(t => t.id != taskId);
                saveTasks();
                renderAll();
            }, 300);
        }

        // Edit task
        if (e.target.closest('.edit-task-btn')) {
            const taskToEdit = tasks.find(t => t.id == taskId);
            showModal(taskToEdit);
        }

        // Toggle complete
        if (e.target.classList.contains('task-checkbox')) {
            const taskIndex = tasks.findIndex(t => t.id == taskId);
            tasks[taskIndex].completed = e.target.checked;
            saveTasks();
            renderAll();
        }
    };
    
    // --- Calendar Functions ---
    const renderCalendar = () => {
        calendarGrid.innerHTML = '';
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        
        calendarMonthYear.textContent = `${year}年 ${month + 1}月`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const tasksByDate = tasks.reduce((acc, task) => {
            (acc[task.dueDate] = acc[task.dueDate] || []).push(task);
            return acc;
        }, {});

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarGrid.innerHTML += `<div class="p-2"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const today = new Date();
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

            let dayClasses = 'day-cell flex items-center justify-center h-10 w-10 rounded-full cursor-pointer transition-colors ';
            if (isToday) {
                dayClasses += 'bg-blue-500 text-white font-bold ';
            } else {
                dayClasses += 'hover:bg-gray-100 ';
            }
            if (tasksByDate[dateStr]) {
                 dayClasses += 'has-tasks';
            }

            calendarGrid.innerHTML += `<div class="${dayClasses}">${day}</div>`;
        }
    };
    
    // --- Chart Functions ---
    const renderChart = () => {
        const completedTasks = tasks.filter(t => t.completed).length;
        const pendingTasks = tasks.length - completedTasks;

        const data = {
            labels: ['已完成', '待办'],
            datasets: [{
                data: [completedTasks, pendingTasks],
                backgroundColor: ['#3b82f6', '#e5e7eb'],
                borderColor: '#ffffff',
                borderWidth: 4,
                hoverOffset: 8
            }]
        };

        if (progressChart) {
            progressChart.data = data;
            progressChart.update();
        } else {
            progressChart = new Chart(progressChartCanvas, {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: true,
                        }
                    }
                }
            });
        }
    };
    
    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', () => showModal());
    cancelBtn.addEventListener('click', hideModal);
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) hideModal();
    });
    taskForm.addEventListener('submit', handleTaskSubmit);
    taskList.addEventListener('click', handleTaskListClick);
    
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // --- Initial Render ---
    const renderAll = () => {
        renderTasks();
        renderCalendar();
        renderChart();
    };

    renderAll();
}); 