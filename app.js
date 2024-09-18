const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

// Registrar el Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker registrado', reg))
        .catch(err => console.log('Error al registrar el Service Worker', err));
}

// Cargar tareas desde IndexedDB
let db;
const request = indexedDB.open('TodoDB', 1);

request.onerror = event => {
    console.error("Error al abrir DB:", event.target.error);
};

request.onsuccess = event => {
    db = event.target.result;
    loadTodos();
};

request.onupgradeneeded = event => {
    const db = event.target.result;
    const objectStore = db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
};

function loadTodos() {
    const transaction = db.transaction(['todos'], 'readonly');
    const objectStore = transaction.objectStore('todos');
    const request = objectStore.getAll();

    request.onsuccess = event => {
        const todos = event.target.result;
        todoList.innerHTML = '';
        todos.forEach(todo => addTodoToList(todo));
    };
}

function addTodo(text) {
    const todo = { text, completed: false };
    const transaction = db.transaction(['todos'], 'readwrite');
    const objectStore = transaction.objectStore('todos');
    const request = objectStore.add(todo);

    request.onsuccess = event => {
        todo.id = event.target.result;
        addTodoToList(todo);
    };
}

function addTodoToList(todo) {
    const li = document.createElement('li');
    li.textContent = todo.text;
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.onclick = () => deleteTodo(todo.id);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
}

function deleteTodo(id) {
    const transaction = db.transaction(['todos'], 'readwrite');
    const objectStore = transaction.objectStore('todos');
    objectStore.delete(id);
    loadTodos();
}

todoForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
        addTodo(text);
        todoInput.value = '';
    }
});

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir que Chrome 67 y versiones anteriores muestren automáticamente el prompt
    e.preventDefault();
    // Guardar el evento para que se pueda activar más tarde
    deferredPrompt = e;
    // Actualizar la UI para notificar al usuario que puede instalar la PWA
    showInstallPromotion();
});

function showInstallPromotion() {
    const installButton = document.createElement('button');
    installButton.textContent = 'Instalar aplicación';
    installButton.addEventListener('click', installPWA);
    document.body.appendChild(installButton);
}

function installPWA() {
    // Ocultar el botón de instalación
    this.style.display = 'none';
    // Mostrar el prompt de instalación
    deferredPrompt.prompt();
    // Esperar por la respuesta del usuario
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('Usuario aceptó la instalación');
        } else {
            console.log('Usuario rechazó la instalación');
        }
        deferredPrompt = null;
    });
}

// Detectar si la app ya está instalada
window.addEventListener('appinstalled', (evt) => {
    console.log('Aplicación instalada');
});

// Función para verificar si la app está siendo ejecutada en modo standalone (instalada)
function isRunningStandalone() {
    return (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone) || document.referrer.includes('android-app://');
}

// Verificar al cargar la página
if (isRunningStandalone()) {
    console.log('La aplicación está instalada');
} else {
    console.log('La aplicación no está instalada');
}

console.log('La aplicación PWA está funcionando');

// Resto del código...