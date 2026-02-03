import './style.css'

// ===================================
// Todo App - Full Implementation with Calendar
// ===================================

class TodoApp {
    constructor() {
        this.todos = []
        this.currentFilter = 'all'
        this.selectedDate = this.getTodayString()
        this.currentMonth = new Date()
        this.init()
    }

    init() {
        this.loadTodos()
        this.bindElements()
        this.bindEvents()
        this.renderCalendar()
        this.render()
        console.log('🚀 Todo App with Calendar initialized!')
    }

    // ===================================
    // Date Utilities
    // ===================================

    getTodayString() {
        return this.formatDateString(new Date())
    }

    formatDateString(date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    parseDate(dateString) {
        const [year, month, day] = dateString.split('-').map(Number)
        return new Date(year, month - 1, day)
    }

    formatDisplayDate(dateString) {
        const date = this.parseDate(dateString)
        const month = date.getMonth() + 1
        const day = date.getDate()
        const weekdays = ['日', '月', '火', '水', '木', '金', '土']
        const weekday = weekdays[date.getDay()]
        return `${month}月${day}日（${weekday}）`
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
    }

    // ===================================
    // Element Binding
    // ===================================

    bindElements() {
        this.todoInput = document.getElementById('todo-input')
        this.addBtn = document.getElementById('add-btn')
        this.todoList = document.getElementById('todo-list')
        this.filterTabs = document.querySelectorAll('.filter-tab')
        this.statTotal = document.getElementById('stat-total')
        this.statCompleted = document.getElementById('stat-completed')
        this.statRemaining = document.getElementById('stat-remaining')

        // Calendar elements
        this.calendarGrid = document.getElementById('calendar-grid')
        this.calendarTitle = document.getElementById('calendar-title')
        this.prevMonthBtn = document.getElementById('prev-month')
        this.nextMonthBtn = document.getElementById('next-month')
        this.todayBtn = document.getElementById('today-btn')
        this.selectedDateDisplay = document.getElementById('selected-date-display')
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

        // Calendar navigation
        this.prevMonthBtn.addEventListener('click', () => this.navigateMonth(-1))
        this.nextMonthBtn.addEventListener('click', () => this.navigateMonth(1))
        this.todayBtn.addEventListener('click', () => this.goToToday())

        // Calendar day click
        this.calendarGrid.addEventListener('click', (e) => {
            const dayItem = e.target.closest('.day-item')
            if (dayItem && dayItem.dataset.date) {
                this.selectDate(dayItem.dataset.date)
            }
        })
    }

    // ===================================
    // Calendar Methods
    // ===================================

    navigateMonth(direction) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + direction)
        this.renderCalendar()
    }

    goToToday() {
        this.currentMonth = new Date()
        this.selectedDate = this.getTodayString()
        this.renderCalendar()
        this.render()
    }

    selectDate(dateString) {
        this.selectedDate = dateString
        this.renderCalendar()
        this.render()
    }

    getTaskCountByDate(dateString) {
        return this.todos.filter(todo => todo.date === dateString).length
    }

    renderCalendar() {
        const year = this.currentMonth.getFullYear()
        const month = this.currentMonth.getMonth()

        // Update title
        this.calendarTitle.textContent = `${year}年${month + 1}月`

        // Get first day and last day of month
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)

        // Get the day of week for the first day (0 = Sunday, adjust for Monday start)
        let startDayOfWeek = firstDay.getDay()
        startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1 // Adjust for Monday start

        const today = new Date()
        const todayString = this.getTodayString()

        let html = ''

        // Previous month days
        const prevMonth = new Date(year, month, 0)
        const prevMonthDays = prevMonth.getDate()
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthDays - i
            const dateString = this.formatDateString(new Date(year, month - 1, day))
            const hasTasksClass = this.getTaskCountByDate(dateString) > 0 ? 'has-tasks' : ''
            html += `
        <div class="day-item other-month ${hasTasksClass}" data-date="${dateString}">
          <span class="day-number">${day}</span>
          <span class="day-indicator"></span>
        </div>
      `
        }

        // Current month days
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateString = this.formatDateString(new Date(year, month, day))
            const isToday = dateString === todayString
            const isSelected = dateString === this.selectedDate
            const hasTasksClass = this.getTaskCountByDate(dateString) > 0 ? 'has-tasks' : ''

            const classes = [
                'day-item',
                isToday ? 'today' : '',
                isSelected ? 'selected' : '',
                hasTasksClass
            ].filter(Boolean).join(' ')

            html += `
        <div class="${classes}" data-date="${dateString}">
          <span class="day-number">${day}</span>
          <span class="day-indicator"></span>
        </div>
      `
        }

        // Next month days (fill remaining cells to complete the grid)
        const totalCells = Math.ceil((startDayOfWeek + lastDay.getDate()) / 7) * 7
        const nextMonthDays = totalCells - (startDayOfWeek + lastDay.getDate())
        for (let day = 1; day <= nextMonthDays; day++) {
            const dateString = this.formatDateString(new Date(year, month + 1, day))
            const hasTasksClass = this.getTaskCountByDate(dateString) > 0 ? 'has-tasks' : ''
            html += `
        <div class="day-item other-month ${hasTasksClass}" data-date="${dateString}">
          <span class="day-number">${day}</span>
          <span class="day-indicator"></span>
        </div>
      `
        }

        this.calendarGrid.innerHTML = html

        // Update selected date display
        this.selectedDateDisplay.innerHTML = `<strong>${this.formatDisplayDate(this.selectedDate)}</strong> のタスク`
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
            date: this.selectedDate,
            createdAt: new Date().toISOString()
        }

        this.todos.unshift(todo)
        this.saveTodos()
        this.renderCalendar()
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
                this.renderCalendar()
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
        // First filter by selected date
        let filtered = this.todos.filter(todo => todo.date === this.selectedDate)

        // Then apply status filter
        switch (this.currentFilter) {
            case 'active':
                return filtered.filter(todo => !todo.completed)
            case 'completed':
                return filtered.filter(todo => todo.completed)
            default:
                return filtered
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
        const todayString = this.getTodayString()
        let badgeClass = ''
        let badgeText = ''

        if (todo.date === todayString) {
            badgeClass = 'today-badge'
            badgeText = '今日'
        } else if (todo.date < todayString && !todo.completed) {
            badgeClass = 'overdue'
            badgeText = '期限切れ'
        } else {
            badgeText = this.formatDisplayDate(todo.date).replace('（', '').replace('）', '')
        }

        return `
      <li class="todo-item glass-card ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <label class="checkbox-container">
          <input type="checkbox" ${todo.completed ? 'checked' : ''} />
          <span class="checkmark"></span>
        </label>
        <span class="todo-text">${this.escapeHtml(todo.text)}</span>
        <span class="date-badge ${badgeClass}">${badgeText}</span>
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
            all: { emoji: '📝', text: 'この日のタスクはありません', sub: '新しいタスクを追加してみましょう！' },
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
        // Stats for selected date only
        const dateTodos = this.todos.filter(todo => todo.date === this.selectedDate)
        const total = dateTodos.length
        const completed = dateTodos.filter(t => t.completed).length
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
                // Migrate old todos without date
                this.todos = this.todos.map(todo => {
                    if (!todo.date) {
                        todo.date = todo.createdAt ? this.formatDateString(new Date(todo.createdAt)) : this.getTodayString()
                    }
                    return todo
                })
                this.saveTodos()
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
