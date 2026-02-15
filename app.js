// Calendar TODO Application
const CalendarApp = {
    displayDate: new Date(),
    taskData: {},
    
    initialize() {
        this.taskData = this.retrieveStoredTasks();
        this.buildCalendarView();
        this.setupInteractions();
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
    
    updateHourTask(dateKey, hourNum, taskText) {
        if (!this.taskData[dateKey]) {
            this.taskData[dateKey] = {};
        }
        this.taskData[dateKey][hourNum] = taskText;
        this.persistTasks();
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
        const filledTasks = Object.values(hourlyTasks).filter(t => t && t.trim()).length;
        
        if (filledTasks > 0) {
            const badge = document.createElement('div');
            badge.className = 'task-count';
            badge.textContent = filledTasks;
            cell.appendChild(badge);
            
            const firstFilledTask = Object.values(hourlyTasks).find(t => t && t.trim());
            if (firstFilledTask) {
                const previewDiv = document.createElement('div');
                previewDiv.className = 'task-preview';
                previewDiv.textContent = firstFilledTask;
                cell.appendChild(previewDiv);
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
            const slot = document.createElement('div');
            slot.className = 'hour-slot';
            
            const timeLabel = document.createElement('div');
            timeLabel.className = 'hour-label';
            const hourDisplay = h === 0 ? '12 AM' : 
                               h < 12 ? `${h} AM` :
                               h === 12 ? '12 PM' :
                               `${h - 12} PM`;
            timeLabel.textContent = hourDisplay;
            
            const taskArea = document.createElement('div');
            taskArea.className = 'hour-content';
            
            const textField = document.createElement('input');
            textField.type = 'text';
            textField.className = 'hour-input';
            textField.placeholder = 'Add task...';
            textField.value = this.retrieveDayTasks(dateKey)[h] || '';
            
            textField.addEventListener('change', (evt) => {
                this.updateHourTask(dateKey, h, evt.target.value);
                this.buildCalendarView();
            });
            
            taskArea.appendChild(textField);
            slot.appendChild(timeLabel);
            slot.appendChild(taskArea);
            scheduleContainer.appendChild(slot);
        }
        
        overlay.classList.add('active');
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
        
        document.getElementById('dayModal').addEventListener('click', (evt) => {
            if (evt.target.id === 'dayModal') {
                this.hideDayDetails();
            }
        });
        
        document.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape') {
                this.hideDayDetails();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    CalendarApp.initialize();
});
