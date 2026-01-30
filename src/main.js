import './style.css'

// ===================================
// Todo App - Full Implementation
// ===================================

class TodoApp {
    constructor() {
        this.todos = []
        this.currentFilter = 'all'
        this.init()
    }

    init() {
        this.loadTodos()
        this.bindElements()
        this.bindEvents()
        this.render()
        console.log('🚀 Todo App initialized!')
    }

    bindElements() {
        this.todoInput = document.getElementById('todo-input')
        this.addBtn = document.getElementById('add-btn')
        this.todoList = document.getElementById('todo-list')
        this.filterTabs = document.querySelectorAll('.filter-tab')
        this.statTotal = document.getElementById('stat-total')
        this.statCompleted = document.getElementById('stat-completed')
        this.statRemaining = document.getElementById('stat-remaining')
    }

    bindEvents() {
        // Add button click
        this.addBtn.addEventListener('click', () => this.addTodo())

        // Enter key in input
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo()
            }
        })

        // Filter tabs
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter)
            })
        })

        // Todo list event delegation
        this.todoList.addEventListener('click', (e) => {
            const todoItem = e.target.closest('.todo-item')
            if (!todoItem) return

            const id = parseInt(todoItem.dataset.id)

            if (e.target.closest('.delete-btn')) {
                this.deleteTodo(id)
            } else if (e.target.closest('.checkbox-container')) {
                this.toggleTodo(id)
            }
        })
    }

    // ===================================
    // CRUD Operations
    // ===================================

    addTodo() {
        const text = this.todoInput.value.trim()
        if (!text) {
            this.shakeInput()
            return
        }

        const todo = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        }

        this.todos.unshift(todo)
        this.saveTodos()
        this.render()
        this.todoInput.value = ''
        this.todoInput.focus()
    }

    deleteTodo(id) {
        const todoElement = this.todoList.querySelector(`[data-id="${id}"]`)
        if (todoElement) {
            todoElement.classList.add('removing')
            setTimeout(() => {
                this.todos = this.todos.filter(todo => todo.id !== id)
                this.saveTodos()
                this.render()
            }, 300)
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id)
        if (todo) {
            todo.completed = !todo.completed
            this.saveTodos()
            this.render()
        }
    }

    // ===================================
    // Filter
    // ===================================

    setFilter(filter) {
        this.currentFilter = filter
        this.filterTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter)
        })
        this.render()
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed)
            case 'completed':
                return this.todos.filter(todo => todo.completed)
            default:
                return this.todos
        }
    }

    // ===================================
    // Rendering
    // ===================================

    render() {
        const filteredTodos = this.getFilteredTodos()

        if (filteredTodos.length === 0) {
            this.todoList.innerHTML = this.renderEmptyState()
        } else {
            this.todoList.innerHTML = filteredTodos.map(todo => this.renderTodoItem(todo)).join('')
        }

        this.updateStats()
    }

    renderTodoItem(todo) {
        return `
      <li class="todo-item glass-card ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <label class="checkbox-container">
          <input type="checkbox" ${todo.completed ? 'checked' : ''} />
          <span class="checkmark"></span>
        </label>
        <span class="todo-text">${this.escapeHtml(todo.text)}</span>
        <button class="delete-btn" aria-label="削除">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </li>
    `
    }

    renderEmptyState() {
        const messages = {
            all: { emoji: '📝', text: 'タスクがありません', sub: '新しいタスクを追加してみましょう！' },
            active: { emoji: '🎉', text: 'すべて完了！', sub: '素晴らしい！未完了のタスクはありません' },
            completed: { emoji: '⏳', text: '完了したタスクはありません', sub: 'タスクを完了するとここに表示されます' }
        }
        const msg = messages[this.currentFilter]

        return `
      <li class="empty-state glass-card">
        <span class="empty-emoji">${msg.emoji}</span>
        <p class="empty-text">${msg.text}</p>
        <p class="empty-sub">${msg.sub}</p>
      </li>
    `
    }

    updateStats() {
        const total = this.todos.length
        const completed = this.todos.filter(t => t.completed).length
        const remaining = total - completed

        this.statTotal.textContent = total
        this.statCompleted.textContent = completed
        this.statRemaining.textContent = remaining
    }

    // ===================================
    // Storage
    // ===================================

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos))
    }

    loadTodos() {
        const saved = localStorage.getItem('todos')
        if (saved) {
            try {
                this.todos = JSON.parse(saved)
            } catch (e) {
                console.error('Failed to load todos:', e)
                this.todos = []
            }
        }
    }

    // ===================================
    // Utilities
    // ===================================

    escapeHtml(text) {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
    }

    shakeInput() {
        this.todoInput.classList.add('shake')
        setTimeout(() => {
            this.todoInput.classList.remove('shake')
        }, 500)
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp()
})
