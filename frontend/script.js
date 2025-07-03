document.addEventListener('DOMContentLoaded', () => {

    // --- 全局状态 ---
    let tasks = [];
    let token = localStorage.getItem('token') || null;
    let isLoggedIn = !!token;
    
    // --- API 配置 ---
    // 动态检测主机地址，支持本地开发和公网部署
    const getCurrentHost = () => {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // 如果是localhost或127.0.0.1，使用localhost（本地开发）
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3001';
        }
        // 否则使用当前主机的3001端口（公网部署）
        return `${protocol}//${hostname}:3001`;
    };
    
    const API_BASE_URL = `${getCurrentHost()}/api`;

    // --- DOM 元素 ---
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
    let progressChart = null; // 用于存储Chart.js实例

    const authContainer = document.getElementById('auth-container');
    const userInfoContainer = document.getElementById('user-info');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userWelcome = document.getElementById('user-welcome');
    
    const authModal = document.getElementById('auth-modal');
    const authModalTitle = document.getElementById('auth-modal-title');
    const authForm = document.getElementById('auth-form');
    const authUsernameInput = document.getElementById('auth-username');
    const authPasswordInput = document.getElementById('auth-password');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const authCancelBtn = document.getElementById('auth-cancel-btn');

    // --- 辅助函数：API请求封装 ---
    const apiFetch = async (endpoint, method, body = null) => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const options = { method, headers };
        if (body) {
            options.body = JSON.stringify(body);
        }
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.message);
            }
            return response.status === 204 ? null : await response.json();
        } catch (error) {
            console.error('API Fetch Error:', error);
            alert(`请求失败: ${error.message}`);
            if (error.message.includes('token')) handleLogout(); // 如果是token问题，则登出
            throw error;
        }
    };

    // --- 认证功能 ---
    const showAuthModal = (mode) => {
        console.log('显示认证模态框:', mode); // 调试信息
        authModalTitle.textContent = mode === 'login' ? '登录' : '注册';
        authSubmitBtn.textContent = mode === 'login' ? '登录' : '注册';
        authForm.dataset.mode = mode;
        authModal.classList.add('visible');
        console.log('模态框类名:', authModal.className); // 调试信息
    };
    const hideAuthModal = () => {
        authModal.classList.remove('visible');
        authForm.reset();
    };
    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        const mode = authForm.dataset.mode;
        const username = authUsernameInput.value.trim();
        const password = authPasswordInput.value.trim();
        if (!username || !password) return alert('请输入用户名和密码');
        
        try {
            const endpoint = mode === 'login' ? '/login' : '/register';
            const data = await apiFetch(endpoint, 'POST', { username, password });
            if (mode === 'register') {
                alert('注册成功! 现在请登录。');
                showAuthModal('login');
            } else {
                token = data.token;
                localStorage.setItem('token', token);
                isLoggedIn = true;
                hideAuthModal();
                await syncLocalTasksAndFetch();
                updateUIForAuthState();
            }
        } catch (error) {}
    };
    const handleLogout = () => {
        token = null;
        localStorage.removeItem('token');
        isLoggedIn = false;
        tasks = getLocalTasks(); // 登出后加载本地任务
        updateUIForAuthState();
        renderAll();
    };
    const updateUIForAuthState = () => {
        if (isLoggedIn) {
            authContainer.classList.add('hidden');
            userInfoContainer.classList.remove('hidden');
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                userWelcome.textContent = `欢迎, ${payload.username}`;
            } catch (e) {
                userWelcome.textContent = `欢迎!`;
            }
        } else {
            authContainer.classList.remove('hidden');
            userInfoContainer.classList.add('hidden');
            userWelcome.textContent = '';
        }
    };

    // --- 数据同步与本地存储 ---
    const getLocalTasks = () => JSON.parse(localStorage.getItem('local_tasks')) || [];
    const saveLocalTasks = (localTasks) => localStorage.setItem('local_tasks', JSON.stringify(localTasks));
    const clearLocalTasks = () => localStorage.removeItem('local_tasks');
    const syncLocalTasksAndFetch = async () => {
        const localTasks = getLocalTasks();
        if (localTasks.length > 0) {
            try {
                await apiFetch('/tasks/sync', 'POST', { tasks: localTasks });
                clearLocalTasks();
                alert('本地任务已成功同步到您的账户！');
            } catch (error) {
                alert('同步本地任务失败，它们将保留在本地。');
            }
        }
        await fetchTasks();
    };

    // --- 任务管理 ---
    const fetchTasks = async () => {
        tasks = isLoggedIn ? await apiFetch('/tasks', 'GET') : getLocalTasks();
        renderAll();
    };
    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        const name = taskNameInput.value.trim();
        const dueDate = taskDateInput.value;
        const id = taskIdInput.value;
        if (!name || !dueDate) return;
        const taskData = { name, dueDate };

        if (isLoggedIn) {
            await apiFetch(id ? `/tasks/${id}` : '/tasks', id ? 'PUT' : 'POST', taskData);
        } else {
            if (id) {
                const index = tasks.findIndex(t => t.id == id);
                if (index !== -1) tasks[index] = { ...tasks[index], ...taskData };
            } else {
                tasks.push({ id: Date.now(), completed: false, ...taskData });
            }
            saveLocalTasks(tasks);
        }
        hideTaskModal();
        await fetchTasks();
    };
    const handleTaskDelete = async (taskId) => {
        if (isLoggedIn) {
            await apiFetch(`/tasks/${taskId}`, 'DELETE');
        } else {
            tasks = tasks.filter(t => t.id != taskId);
            saveLocalTasks(tasks);
        }
        await fetchTasks();
    };
    const handleTaskToggle = async (taskId, completed) => {
        if (isLoggedIn) {
            await apiFetch(`/tasks/${taskId}`, 'PUT', { completed });
        } else {
            const task = tasks.find(t => t.id == taskId);
            if(task) task.completed = completed;
            saveLocalTasks(tasks);
        }
        await fetchTasks();
    };

    // --- 任务模态框 ---
    const showTaskModal = (task = null) => {
        taskForm.reset();
        if (task) {
            modalTitle.textContent = '编辑任务';
            taskIdInput.value = task.id;
            taskNameInput.value = task.name;
            taskDateInput.value = task.dueDate;
        } else {
            modalTitle.textContent = '添加新任务';
            taskIdInput.value = '';
        }
        taskModal.classList.add('visible');
    };
    const hideTaskModal = () => taskModal.classList.remove('visible');

    // --- 日历日期点击功能 ---
    const showDayTasks = (dateStr, day, month, year) => {
        const dayTasks = tasks.filter(task => task.dueDate === dateStr);
        
        if (dayTasks.length === 0) {
            alert(`${year}年${month}月${day}日没有任务`);
        } else {
            const taskNames = dayTasks.map(task => 
                `• ${task.name} ${task.completed ? '(已完成)' : '(待完成)'}`
            ).join('\n');
            alert(`${year}年${month}月${day}日的任务：\n\n${taskNames}`);
        }
    };

    // --- 渲染逻辑 ---
    const renderTasks = () => {
        taskList.innerHTML = '';
        if (tasks.length === 0) {
            taskList.innerHTML = `<p class="text-gray-400 text-center">没有任务，点击"添加任务"开始吧！</p>`;
            return;
        }
        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        tasks.forEach(task => {
            const el = document.createElement('div');
            el.className = `task-item flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow duration-300 ${task.completed ? 'opacity-60' : ''}`;
            el.innerHTML = `
                <div class="flex items-center gap-4">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} class="task-checkbox h-5 w-5 rounded border-gray-300 text-blue-600 cursor-pointer">
                    <div>
                        <p class="font-semibold text-gray-800 ${task.completed ? 'line-through' : ''}">${task.name}</p>
                        <p class="text-sm text-gray-500"><i class="far fa-calendar-alt mr-1"></i> ${task.dueDate}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button class="edit-task-btn text-gray-400 hover:text-blue-500 p-2 rounded-full"><i class="fas fa-edit"></i></button>
                    <button class="delete-task-btn text-gray-400 hover:text-red-500 p-2 rounded-full"><i class="fas fa-trash-alt"></i></button>
                </div>`;
            
            el.querySelector('.task-checkbox').addEventListener('change', (e) => handleTaskToggle(task.id, e.target.checked));
            el.querySelector('.edit-task-btn').addEventListener('click', () => showTaskModal(task));
            el.querySelector('.delete-task-btn').addEventListener('click', () => {
                el.classList.add('removing');
                setTimeout(() => handleTaskDelete(task.id), 300);
            });
            
            taskList.appendChild(el);
        });
    };
    
    let currentDate = new Date();
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

            const dayElement = document.createElement('div');
            dayElement.className = dayClasses;
            dayElement.textContent = day;
            dayElement.addEventListener('click', () => showDayTasks(dateStr, day, month + 1, year));
            calendarGrid.appendChild(dayElement);
        }
    };
    
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

    const renderAll = () => {
        renderTasks();
        renderCalendar();
        renderChart();
    };

    // --- 初始化和事件监听 ---
    const init = () => {
        // 检查关键DOM元素是否存在
        console.log('DOM元素检查:');
        console.log('loginBtn:', loginBtn);
        console.log('registerBtn:', registerBtn);
        console.log('authModal:', authModal);
        
        // 认证
        loginBtn.addEventListener('click', () => {
            console.log('登录按钮被点击'); // 调试信息
            showAuthModal('login');
        });
        registerBtn.addEventListener('click', () => {
            console.log('注册按钮被点击'); // 调试信息
            showAuthModal('register');
        });
        logoutBtn.addEventListener('click', handleLogout);
        authForm.addEventListener('submit', handleAuthSubmit);
        authCancelBtn.addEventListener('click', hideAuthModal);
        authModal.addEventListener('click', (e) => e.target === authModal && hideAuthModal());

        // 任务
        addTaskBtn.addEventListener('click', () => showTaskModal());
        taskForm.addEventListener('submit', handleTaskSubmit);
        cancelBtn.addEventListener('click', hideTaskModal);
        taskModal.addEventListener('click', (e) => e.target === taskModal && hideTaskModal());

        // 日历导航
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        // 初始化
        updateUIForAuthState();
        fetchTasks();
    };

    init();
}); 