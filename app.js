// Calendar TODO Application
const CalendarApp = {
    displayDate: new Date(),
    taskData: {},
    categories: {},
    defaultColors: ['#667eea', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'],
    
    initialize() {
        this.taskData = this.retrieveStoredTasks();
        this.categories = this.retrieveCategories();
        this.ensureDefaultCategories();
        this.buildCalendarView();
        this.setupInteractions();
    },
    
    retrieveCategories() {
        const stored = localStorage.getItem('calendarCategories');
        return stored ? JSON.parse(stored) : {};
    },
    
    persistCategories() {
        localStorage.setItem('calendarCategories', JSON.stringify(this.categories));
    },
    
    ensureDefaultCategories() {
        if (Object.keys(this.categories).length === 0) {
            this.categories = {
                'work': { name: 'Work', color: '#667eea' },
                'personal': { name: 'Personal', color: '#2ecc71' },
                'health': { name: 'Health', color: '#e74c3c' },
                'errands': { name: 'Errands', color: '#f39c12' },
                'social': { name: 'Social', color: '#9b59b6' }
            };
            this.persistCategories();
        }
    },
    
    getCategoryColor(categoryId) {
        return this.categories[categoryId]?.color || '#667eea';
    },
    
    retrieveStoredTasks() {
        const stored = localStorage.getItem('calendarTasks');
        return stored ? JSON.parse(stored) : {};
    },
    
    persistTasks() {
        localStorage.setItem('calendarTasks', JSON.stringify(this.taskData));
    },
    
    formatDateKey(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    },
    
    retrieveDayTasks(dateKey) {
        return this.taskData[dateKey] || {};
    },
    
    updateHourTask(dateKey, hourNum, taskText, duration = 1, category = null) {
        if (!this.taskData[dateKey]) {
            this.taskData[dateKey] = {};
        }
        // Store task as object with text, duration, and category
        if (taskText && taskText.trim()) {
            this.taskData[dateKey][hourNum] = { text: taskText, duration: duration, category: category };
        } else {
            this.taskData[dateKey][hourNum] = null;
        }
        this.persistTasks();
    },
    
    getTaskAt(dateKey, hourNum) {
        const hourData = this.taskData[dateKey]?.[hourNum];
        if (!hourData) return null;
        // Handle legacy string format
        if (typeof hourData === 'string') {
            return { text: hourData, duration: 1, category: null };
        }
        return hourData;
    },
    
    isHourCoveredByPreviousTask(dateKey, hourNum) {
        // Check if this hour is covered by a multi-hour task starting earlier
        for (let h = hourNum - 1; h >= Math.max(0, hourNum - 7); h--) {
            const task = this.getTaskAt(dateKey, h);
            if (task && task.text && h + task.duration > hourNum) {
                return { coveredBy: h, task: task };
            }
        }
        return null;
    },
    
    buildCalendarView() {
        const grid = document.getElementById('calendar');
        grid.innerHTML = '';
        
        const monthLabels = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const yearNum = this.displayDate.getFullYear();
        const monthNum = this.displayDate.getMonth();
        
        document.getElementById('currentMonth').textContent = 
            `${monthLabels[monthNum]} ${yearNum}`;
        
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(label => {
            const headerCell = document.createElement('div');
            headerCell.className = 'day-header';
            headerCell.textContent = label;
            grid.appendChild(headerCell);
        });
        
        const monthStart = new Date(yearNum, monthNum, 1);
        const monthEnd = new Date(yearNum, monthNum + 1, 0);
        const totalDays = monthEnd.getDate();
        const startWeekday = monthStart.getDay();
        
        const prevMonthEnd = new Date(yearNum, monthNum, 0).getDate();
        const prevMonthNum = monthNum === 0 ? 11 : monthNum - 1;
        const prevYearNum = monthNum === 0 ? yearNum - 1 : yearNum;
        
        for (let i = startWeekday - 1; i >= 0; i--) {
            const dayValue = prevMonthEnd - i;
            const cellDate = new Date(prevYearNum, prevMonthNum, dayValue);
            this.buildDayCell(grid, cellDate, dayValue, true);
        }
        
        for (let dayValue = 1; dayValue <= totalDays; dayValue++) {
            const cellDate = new Date(yearNum, monthNum, dayValue);
            this.buildDayCell(grid, cellDate, dayValue, false);
        }
        
        const filledCells = grid.children.length - 7;
        const remainingSlots = 42 - filledCells;
        const nextMonthNum = monthNum === 11 ? 0 : monthNum + 1;
        const nextYearNum = monthNum === 11 ? yearNum + 1 : yearNum;
        
        for (let dayValue = 1; dayValue <= remainingSlots; dayValue++) {
            const cellDate = new Date(nextYearNum, nextMonthNum, dayValue);
            this.buildDayCell(grid, cellDate, dayValue, true);
        }
    },
    
    buildDayCell(container, dateObj, dayLabel, isExtraMonth) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        
        if (isExtraMonth) {
            cell.classList.add('other-month');
        }
        
        const now = new Date();
        if (dateObj.toDateString() === now.toDateString()) {
            cell.classList.add('today');
        }
        
        const numDiv = document.createElement('div');
        numDiv.className = 'day-number';
        numDiv.textContent = dayLabel;
        cell.appendChild(numDiv);
        
        const dateKey = this.formatDateKey(dateObj);
        const hourlyTasks = this.retrieveDayTasks(dateKey);
        const filledTasks = Object.values(hourlyTasks).filter(t => {
            if (!t) return false;
            if (typeof t === 'string') return t.trim();
            return t.text && t.text.trim();
        }).length;
        
        if (filledTasks > 0) {
            const badge = document.createElement('div');
            badge.className = 'task-count';
            badge.textContent = filledTasks;
            cell.appendChild(badge);
            
            const allTasks = Object.values(hourlyTasks).filter(t => {
                if (!t) return false;
                if (typeof t === 'string') return t.trim();
                return t.text && t.text.trim();
            });
            
            const maxPreview = 3;
            allTasks.slice(0, maxPreview).forEach(task => {
                const previewDiv = document.createElement('div');
                previewDiv.className = 'task-preview';
                previewDiv.textContent = typeof task === 'string' ? task : task.text;
                const taskCategory = typeof task === 'string' ? null : task.category;
                if (taskCategory && this.categories[taskCategory]) {
                    previewDiv.style.borderLeftColor = this.categories[taskCategory].color;
                }
                cell.appendChild(previewDiv);
            });
            
            if (allTasks.length > maxPreview) {
                const moreDiv = document.createElement('div');
                moreDiv.className = 'task-more';
                moreDiv.textContent = '...';
                cell.appendChild(moreDiv);
            }
        }
        
        if (!isExtraMonth) {
            cell.addEventListener('click', () => this.showDayDetails(dateObj));
        }
        
        container.appendChild(cell);
    },
    
    showDayDetails(dateObj) {
        const overlay = document.getElementById('dayModal');
        const dateKey = this.formatDateKey(dateObj);
        
        const formatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('modalDate').textContent = 
            dateObj.toLocaleDateString('en-US', formatOptions);
        
        const scheduleContainer = document.getElementById('hourlySchedule');
        scheduleContainer.innerHTML = '';
        
        for (let h = 0; h < 24; h++) {
            // Check if this hour is covered by a previous multi-hour task
            const covered = this.isHourCoveredByPreviousTask(dateKey, h);
            if (covered) {
                continue; // Skip rendering, the hour slot is part of a longer task
            }
            
            const task = this.getTaskAt(dateKey, h);
            const slot = document.createElement('div');
            slot.className = 'hour-slot';
            
            // Calculate how tall this slot should be based on duration
            const duration = task?.duration || 1;
            if (duration > 1) {
                slot.style.minHeight = `${duration * 60}px`;
                slot.classList.add('multi-hour');
            }
            
            const timeLabel = document.createElement('div');
            timeLabel.className = 'hour-label';
            const hourDisplay = h === 0 ? '12 AM' : 
                               h < 12 ? `${h} AM` :
                               h === 12 ? '12 PM' :
                               `${h - 12} PM`;
            
            if (duration > 1) {
                const endHour = Math.min(h + duration, 24);
                const endDisplay = endHour === 24 ? '12 AM' :
                                   endHour === 0 ? '12 AM' : 
                                   endHour < 12 ? `${endHour} AM` :
                                   endHour === 12 ? '12 PM' :
                                   `${endHour - 12} PM`;
                timeLabel.innerHTML = `${hourDisplay}<br><span class="duration-indicator">to ${endDisplay}</span>`;
            } else {
                timeLabel.textContent = hourDisplay;
            }
            
            const taskArea = document.createElement('div');
            taskArea.className = 'hour-content';
            
            const inputRow = document.createElement('div');
            inputRow.className = 'input-row';
            
            const categorySelect = document.createElement('select');
            categorySelect.className = 'category-select';
            const noneOption = document.createElement('option');
            noneOption.value = '';
            noneOption.textContent = 'No category';
            categorySelect.appendChild(noneOption);
            Object.entries(this.categories).forEach(([id, cat]) => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = cat.name;
                option.style.color = cat.color;
                if (id === task?.category) {
                    option.selected = true;
                }
                categorySelect.appendChild(option);
            });
            
            // Apply color indicator to slot based on category
            if (task?.category && this.categories[task.category]) {
                slot.style.borderLeftColor = this.categories[task.category].color;
                slot.style.borderLeftWidth = '4px';
            }
            
            const textField = document.createElement('input');
            textField.type = 'text';
            textField.className = 'hour-input';
            textField.placeholder = 'Add task...';
            textField.value = task?.text || '';
            
            const durationSelect = document.createElement('select');
            durationSelect.className = 'duration-select';
            const maxDuration = Math.min(8, 24 - h);
            for (let d = 1; d <= maxDuration; d++) {
                const option = document.createElement('option');
                option.value = d;
                option.textContent = d === 1 ? '1 hr' : `${d} hrs`;
                if (d === (task?.duration || 1)) {
                    option.selected = true;
                }
                durationSelect.appendChild(option);
            }
            
            const saveTask = () => {
                const dur = parseInt(durationSelect.value, 10);
                const cat = categorySelect.value || null;
                this.updateHourTask(dateKey, h, textField.value, dur, cat);
                this.buildCalendarView();
                this.showDayDetails(dateObj);
            };
            
            textField.addEventListener('change', saveTask);
            durationSelect.addEventListener('change', saveTask);
            categorySelect.addEventListener('change', saveTask);
            
            inputRow.appendChild(categorySelect);
            inputRow.appendChild(textField);
            inputRow.appendChild(durationSelect);
            taskArea.appendChild(inputRow);
            slot.appendChild(timeLabel);
            slot.appendChild(taskArea);
            scheduleContainer.appendChild(slot);
        }
        
        overlay.classList.add('active');
    },
    
    showCategoryManager() {
        const modal = document.getElementById('categoryModal');
        this.renderCategoryList();
        modal.classList.add('active');
    },
    
    hideCategoryManager() {
        document.getElementById('categoryModal').classList.remove('active');
    },
    
    renderCategoryList() {
        const list = document.getElementById('categoryList');
        list.innerHTML = '';
        
        Object.entries(this.categories).forEach(([id, cat]) => {
            const item = document.createElement('div');
            item.className = 'category-item';
            
            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.className = 'category-color-picker';
            colorInput.value = cat.color;
            colorInput.addEventListener('change', () => {
                this.categories[id].color = colorInput.value;
                this.persistCategories();
            });
            
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'category-name-input';
            nameInput.value = cat.name;
            nameInput.addEventListener('change', () => {
                this.categories[id].name = nameInput.value;
                this.persistCategories();
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'category-delete-btn';
            deleteBtn.textContent = '×';
            deleteBtn.addEventListener('click', () => {
                delete this.categories[id];
                this.persistCategories();
                this.renderCategoryList();
            });
            
            item.appendChild(colorInput);
            item.appendChild(nameInput);
            item.appendChild(deleteBtn);
            list.appendChild(item);
        });
    },
    
    addNewCategory() {
        const id = 'cat_' + Date.now();
        const colorIndex = Object.keys(this.categories).length % this.defaultColors.length;
        this.categories[id] = {
            name: 'New Category',
            color: this.defaultColors[colorIndex]
        };
        this.persistCategories();
        this.renderCategoryList();
    },
    
    hideDayDetails() {
        document.getElementById('dayModal').classList.remove('active');
    },
    
    navigatePrevMonth() {
        this.displayDate.setMonth(this.displayDate.getMonth() - 1);
        this.buildCalendarView();
    },
    
    navigateNextMonth() {
        this.displayDate.setMonth(this.displayDate.getMonth() + 1);
        this.buildCalendarView();
    },
    
    setupInteractions() {
        document.getElementById('prevMonth').addEventListener('click', 
            () => this.navigatePrevMonth());
        document.getElementById('nextMonth').addEventListener('click', 
            () => this.navigateNextMonth());
        document.getElementById('closeModal').addEventListener('click', 
            () => this.hideDayDetails());
        document.getElementById('settingsBtn').addEventListener('click',
            () => this.showCategoryManager());
        document.getElementById('closeCategoryModal').addEventListener('click',
            () => this.hideCategoryManager());
        document.getElementById('addCategoryBtn').addEventListener('click',
            () => this.addNewCategory());
        
        document.getElementById('dayModal').addEventListener('click', (evt) => {
            if (evt.target.id === 'dayModal') {
                this.hideDayDetails();
            }
        });
        
        document.getElementById('categoryModal').addEventListener('click', (evt) => {
            if (evt.target.id === 'categoryModal') {
                this.hideCategoryManager();
            }
        });
        
        document.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape') {
                this.hideDayDetails();
                this.hideCategoryManager();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    CalendarApp.initialize();
});
