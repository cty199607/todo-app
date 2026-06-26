const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON文件存储（数据会保存到文件，重启服务器不会丢失）
const DATA_FILE = path.join(__dirname, 'todos.json');

function loadTodos() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        // 文件不存在时返回初始数据
        return [
            { id: 1, text: '欢迎使用待办清单！', completed: false },
            { id: 2, text: '添加新任务试试', completed: false }
        ];
    }
}

function saveTodos(todos) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

let todos = loadTodos();
let nextId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;

app.use(cors());
app.use(express.json());

// 获取所有待办
app.get('/api/todos', (req, res) => {
    res.json(todos);
});

// 创建新待办
app.post('/api/todos', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: '内容不能为空' });
    
    const newTodo = {
        id: nextId++,
        text: text,
        completed: false
    };
    
    todos.unshift(newTodo);
    saveTodos(todos);
    res.json(newTodo);
});

// 更新待办状态
app.put('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    
    const todo = todos.find(t => t.id === parseInt(id));
    if (!todo) return res.status(404).json({ error: '任务不存在' });
    
    todo.completed = completed;
    saveTodos(todos);
    res.json(todo);
});

// 删除待办
app.delete('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = todos.length;
    
    const initialLength = todos.length;
    todos = todos.filter(t => t.id !== parseInt(id));
    
    if (todos.length === initialLength) {
        return res.status(404).json({ error: '任务不存在' });
    }
    
    saveTodos(todos);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
});