// 自动检测环境：开发环境用本地，生产环境用当前域名
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api/todos' 
    : '/api/todos';

const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const totalCount = document.getElementById('totalCount');
const doneCount = document.getElementById('doneCount');

async function fetchTodos() {
    try {
        const res = await fetch(API_URL);
        const todos = await res.json();
        renderTodos(todos);
    } catch (err) {
        console.error('获取失败:', err);
    }
}

function renderTodos(todos) {
    todoList.innerHTML = '';
    let done = 0;
    
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''} 
                onchange="toggleTodo(${todo.id}, this.checked)">
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">删除</button>
        `;
        
        todoList.appendChild(li);
        
        if (todo.completed) done++;
    });
    
    totalCount.textContent = todos.length;
    doneCount.textContent = done;
}

async function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        todoInput.value = '';
        fetchTodos();
    } catch (err) {
        console.error('添加失败:', err);
    }
}

async function toggleTodo(id, completed) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });
        fetchTodos();
    } catch (err) {
        console.error('更新失败:', err);
    }
}

async function deleteTodo(id) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        fetchTodos();
    } catch (err) {
        console.error('删除失败:', err);
    }
}

addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') addTodo();
});

fetchTodos();