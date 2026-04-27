const API = 'https://backenddesafio-fullstack.onrender.com/api';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW falhou no ambiente local', err));
}

const show = (id) => {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
};

window.onload = () => {
    if(localStorage.getItem('token')) {
        loadDashboard();
    } else {
        show('login-section');
    }
};

document.getElementById('show-register').onclick = () => show('register-section');
document.getElementById('show-login').onclick = () => show('login-section');

// LOGIN
document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Conectando ao servidor... (Aguarde até 50s)";
    
    try {
        const response = await fetch(`${API}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value
            })
        });
        const data = await response.json();
        
        if(response.ok) {
            localStorage.setItem('token', data.token);
            loadDashboard();
        } else { 
            alert("Erro: " + data.message); 
        }
    } catch (error) {
        alert("Falha na conexão. Você precisa publicar o site (Deploy) para o PWA e a API funcionarem corretamente.");
    } finally {
        btn.innerText = "Entrar";
    }
};

// CADASTRO
document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Cadastrando...";

    try {
        const response = await fetch(`${API}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById('reg-name').value,
                email: document.getElementById('reg-email').value,
                password: document.getElementById('reg-password').value
            })
        });
        const data = await response.json();
        alert(data.message);
        if(response.ok) show('login-section');
    } catch (error) {
        alert("Erro ao conectar com o servidor.");
    } finally {
        btn.innerText = "Cadastrar";
    }
};

// CARREGAR TAREFAS (READ)
async function loadDashboard() {
    show('dashboard-section');
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${API}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if(!res.ok) throw new Error("Token inválido");

        const tasks = await res.json();
        const list = document.getElementById('task-list');
        list.innerHTML = tasks.map(t => `<li><span>${t.title}</span> <button onclick="del('${t._id}')" style="width:auto; background:red; padding: 5px 10px;">X</button></li>`).join('');
    } catch (error) {
        localStorage.removeItem('token');
        show('login-section');
    }
}

// ADICIONAR TAREFA (CREATE)
document.getElementById('task-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "...";
    
    await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ title: document.getElementById('task-title').value })
    });
    
    document.getElementById('task-title').value = '';
    btn.innerText = "Adicionar";
    loadDashboard();
};

// DELETAR TAREFA (DELETE)
window.del = async (id) => {
    await fetch(`${API}/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    loadDashboard();
};

// SAIR
document.getElementById('logout-btn').onclick = () => { 
    localStorage.clear();
    show('login-section');
    document.getElementById('login-form').reset();
};