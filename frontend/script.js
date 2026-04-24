const BASE_URL = 'https://backenddesafio-fullstack-.onrender.com/api';

const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const dashboardSection = document.getElementById('dashboard-section');
const taskList = document.getElementById('task-list');

// --- TROCA DE TELAS ---
document.getElementById('show-register').onclick = () => {
    loginSection.classList.add('hidden');
    registerSection.classList.remove('hidden');
};
document.getElementById('show-login').onclick = () => {
    registerSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
};

// --- CADASTRO ---
document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const response = await fetch(`${BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    alert(data.message);
    if (response.ok) document.getElementById('show-login').click();
};

// --- LOGIN ---
document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token);
        loadDashboard();
    } else {
        alert(data.message);
    }
};

// --- CARREGAR DASHBOARD E TAREFAS (READ) ---
async function loadDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    
    const token = localStorage.getItem('token');

    // Busca dados do usuário
    const resUser = await fetch(`${BASE_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const user = await resUser.json();
    document.getElementById('user-info').innerText = `Olá, ${user.name}! Gerencie seus estudos abaixo:`;

    renderTasks();
}

// --- RENDERIZAR LISTA (READ) ---
async function renderTasks() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const tasks = await response.json();
    
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.style = "background: #f9f9f9; padding: 10px; margin-bottom: 5px; border-radius: 5px; display: flex; justify-content: space-between; align-items: center; border-left: 5px solid #007bff;";
        li.innerHTML = `
            <span>${task.title}</span>
            <button onclick="deleteTask('${task._id}')" style="width: auto; background: none; color: red; cursor: pointer; border: none;">✖</button>
        `;
        taskList.appendChild(li);
    });
}

// --- ADICIONAR TAREFA (CREATE) ---
document.getElementById('task-form').onsubmit = async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const token = localStorage.getItem('token');

    const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title })
    });

    if (response.ok) {
        document.getElementById('task-title').value = '';
        renderTasks();
    }
};

// --- DELETAR TAREFA (DELETE) ---
window.deleteTask = async (id) => {
    const token = localStorage.getItem('token');
    if (confirm('Deseja remover essa matéria dos estudos?')) {
        await fetch(`${BASE_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        renderTasks();
    }
};

document.getElementById('logout-btn').onclick = () => {
    localStorage.removeItem('token');
    location.reload();
};

const BASE_URL = 'https://backenddesafio-fullstack-.onrender.com/api';

const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const dashboardSection = document.getElementById('dashboard-section');
const taskList = document.getElementById('task-list');

// FUNÇÃO QUE RODA AO ABRIR O SITE
window.onload = () => {
    const token = localStorage.getItem('token');
    if (token) {
        // Se tem token, tenta carregar o Dashboard direto
        loadDashboard();
    } else {
        // Se não tem, garante que a tela de login apareça
        loginSection.classList.remove('hidden');
        registerSection.classList.add('hidden');
        dashboardSection.classList.add('hidden');
    }
};

// ... (mantenha o restante das funções de login, register e renderTasks que passei antes)