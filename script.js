const API = 'https://backenddesafio-fullstack.onrender.com/api';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW falhou', err));
}

const show = (id) => {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
};

// FEEDBACK TÁTICO: Som de Bip + Vibração QAP
const feedbackTatico = () => {
    // 1. Vibração (Padrão: dois pulsos)
    if ("vibrate" in navigator) {
        navigator.vibrate(); 
    }

    // 2. Sinal Sonoro (Bip Tático sintetizado)
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const osc = context.createOscillator();
        const gain = context.createGain();

        osc.type = "sine"; 
        osc.frequency.value = 800; // Frequência do bip (em Hz)
        osc.connect(gain);
        gain.connect(context.destination);

        osc.start();
        // Faz o som sumir suavemente em 0.2 segundos
        gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.2);
        osc.stop(context.currentTime + 0.2);
    } catch (e) {
        console.log("Áudio não suportado ou bloqueado pelo navegador.");
    }
};

const mostrarMissão = () => {
    const missõesElite = [
        "PMPE: História de Pernambuco. Revise a Revolução Praieira e a Confederação do Equador! ⚔️",
        "PMPE: Raciocínio Lógico. Domine as Proposições e Tabelas-Verdade agora! 🔢",
        "PMPE: Informática. Foco em Segurança da Informação e Navegadores! 💻",
        "PMPE: Direitos Humanos. Decore a Declaração Universal (DUDH)! ⚖️",
        "PMPE: Legislação. Revise o Estatuto dos Policiais Militares de PE! 📜",
        "PMPE: Direito Constitucional. Artigo 5º é o seu melhor amigo! 🏛️",
        "PCPE: Direito Penal. Foco total em Crimes contra a Pessoa e o Patrimônio! 🔍",
        "PCPE: Proc. Penal. Inquérito Policial e Prisões caem sempre. Domine! 📑",
        "PCPE: Dir. Administrativo. Revise o LIMPE e os Poderes da Administração! 🏢",
        "PCPE: Leg. Penal Extravagante. Lei Maria da Penha e Lei de Drogas na mente! 💊",
        "PCPE: Noções de Informática. Estude conceitos de Nuvem e Redes Sociais! ☁️",
        "MISSÃO GERAL: Língua Portuguesa. Já fez sua interpretação de texto hoje? ✍️",
        "MISSÃO GERAL: Direitos Humanos. Direitos Fundamentais são a base da prova! 🌍",
        "FOCO: Raciocínio Lógico. Treine diagramas lógicos até ficar automático! 🧠"
    ];
    const sorteio = missõesElite[Math.floor(Math.random() * missõesElite.length)];
    alert("⚡ DIRETRIZ OPERACIONAL ATUALIZADA:\n\n" + sorteio);
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

document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Verificando credenciais...";
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
            mostrarMissão();
        } else { 
            alert("Acesso negado: " + data.message); 
        }
    } catch (error) {
        alert("Erro de conexão.");
    } finally {
        btn.innerText = "Entrar";
    }
};

document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Enviando...";
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
        alert("Erro ao processar.");
    } finally {
        btn.innerText = "Cadastrar";
    }
};

async function loadDashboard() {
    show('dashboard-section');
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(!res.ok) throw new Error("Sessão expirada");
        const tasks = await res.json();
        const list = document.getElementById('task-list');
        list.innerHTML = tasks.map(t => `
            <li>
                <span>${t.title}</span> 
                <button onclick="del('${t._id}')" style="width:auto; background:red; padding: 5px 10px;">X</button>
            </li>
        `).join('');
    } catch (error) {
        localStorage.removeItem('token');
        show('login-section');
    }
}

document.getElementById('task-form').onsubmit = async (e) => {
    e.preventDefault();
    const input = document.getElementById('task-title');
    const btn = e.target.querySelector('button');
    if(!input.value) return;
    btn.innerText = "...";
    try {
        const res = await fetch(`${API}/tasks`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: JSON.stringify({ title: input.value })
        });
        if(res.ok) {
            feedbackTatico(); // SINAL SONORO E VIBRAÇÃO AQUI
            input.value = '';
            loadDashboard();
        }
    } catch (error) {
        alert("Erro ao salvar.");
    } finally {
        btn.innerText = "Adicionar";
    }
};

window.del = async (id) => {
    try {
        const res = await fetch(`${API}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if(res.ok) {
            feedbackTatico(); // SINAL SONORO E VIBRAÇÃO AO EXCLUIR
            loadDashboard();
        }
    } catch (error) {
        console.log("Erro ao excluir");
    }
};

document.getElementById('logout-btn').onclick = () => { 
    localStorage.clear();
    show('login-section');
    document.getElementById('login-form').reset();
};