// ================================
// HABITS TRACKER - CALENDAR HEATMAP MODULE
// ================================

/**
 * Render calendar heatmap showing habit completions
 */
function renderCalendarHeatmap() {
    const container = document.getElementById('calendar-heatmap');
    if (!container) return;
    
    const app = window.habitsApp;
    if (!app) return;
    
    // Clear existing heatmap
    container.innerHTML = '';
    
    // Get last 365 days of data
    const days = 365;
    const today = new Date();
    const heatmapData = [];
    
    // Calculate completion data for each day
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = app.formatDate(date);
        
        // Count completions for this day
        let completions = 0;
        app.state.habits.forEach(habit => {
            if (app.isHabitCompleted(habit.id, dateStr)) {
                completions++;
            }
        });
        
        // Calculate completion percentage
        const totalHabits = app.state.habits.length;
        const percentage = totalHabits > 0 ? (completions / totalHabits) * 100 : 0;
        
        heatmapData.push({
            date: dateStr,
            dateObj: new Date(date),
            completions: completions,
            total: totalHabits,
            percentage: percentage
        });
    }
    
    // Create heatmap structure
    const heatmapWrapper = document.createElement('div');
    heatmapWrapper.className = 'heatmap-wrapper';
    
    // Create month labels
    const monthsContainer = document.createElement('div');
    monthsContainer.className = 'heatmap-months';
    
    // Group data by weeks
    const weeks = [];
    let currentWeek = [];
    
    heatmapData.forEach((day, index) => {
        const dayOfWeek = day.dateObj.getDay();
        
        // Start new week on Sunday (0)
        if (dayOfWeek === 0 && currentWeek.length > 0) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
        
        currentWeek.push(day);
        
        // Last day
        if (index === heatmapData.length - 1) {
            weeks.push(currentWeek);
        }
    });
    
    // Create day labels (Mon, Wed, Fri)
    const daysLabelsContainer = document.createElement('div');
    daysLabelsContainer.className = 'heatmap-days-labels';
    const dayLabels = ['Pn', '', 'Śr', '', 'Pt', '', ''];
    dayLabels.forEach(label => {
        const dayLabel = document.createElement('div');
        dayLabel.className = 'heatmap-day-label';
        dayLabel.textContent = label;
        daysLabelsContainer.appendChild(dayLabel);
    });
    
    // Create grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'heatmap-grid';
    
    let lastMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
        const weekColumn = document.createElement('div');
        weekColumn.className = 'heatmap-week';
        
        // Fill empty days at start of first week
        if (weekIndex === 0 && week.length < 7) {
            const firstDayOfWeek = week[0].dateObj.getDay();
            for (let i = 0; i < firstDayOfWeek; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'heatmap-day heatmap-day-empty';
                weekColumn.appendChild(emptyDay);
            }
        }
        
        week.forEach((day) => {
            const dayCell = document.createElement('div');
            dayCell.className = 'heatmap-day';
            
            // Determine color based on completion level
            const level = getHeatmapLevel(day.percentage);
            dayCell.classList.add(`heatmap-level-${level}`);
            
            // Add tooltip
            const monthName = day.dateObj.toLocaleDateString('pl-PL', { month: 'long', day: 'numeric', year: 'numeric' });
            dayCell.setAttribute('data-tooltip', `${monthName}: ${day.completions}/${day.total} nawyków`);
            dayCell.setAttribute('data-date', day.date);
            
            // Add month label if it's the first day of a new month
            const currentMonth = day.dateObj.getMonth();
            if (currentMonth !== lastMonth && day.dateObj.getDate() <= 7) {
                const monthLabel = document.createElement('div');
                monthLabel.className = 'heatmap-month-label';
                monthLabel.textContent = day.dateObj.toLocaleDateString('pl-PL', { month: 'short' });
                monthLabel.style.left = `${weekIndex * 12}px`;
                monthsContainer.appendChild(monthLabel);
                lastMonth = currentMonth;
            }
            
            weekColumn.appendChild(dayCell);
        });
        
        // Fill empty days at end of last week
        if (weekIndex === weeks.length - 1 && week.length < 7) {
            const remainingDays = 7 - week.length;
            for (let i = 0; i < remainingDays; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'heatmap-day heatmap-day-empty';
                weekColumn.appendChild(emptyDay);
            }
        }
        
        gridContainer.appendChild(weekColumn);
    });
    
    // Create legend
    const legend = document.createElement('div');
    legend.className = 'heatmap-legend';
    legend.innerHTML = `
        <span class="heatmap-legend-label">Mniej</span>
        <div class="heatmap-legend-item heatmap-level-0"></div>
        <div class="heatmap-legend-item heatmap-level-1"></div>
        <div class="heatmap-legend-item heatmap-level-2"></div>
        <div class="heatmap-legend-item heatmap-level-3"></div>
        <div class="heatmap-legend-item heatmap-level-4"></div>
        <span class="heatmap-legend-label">Więcej</span>
    `;
    
    // Assemble heatmap
    heatmapWrapper.appendChild(monthsContainer);
    
    const mainGrid = document.createElement('div');
    mainGrid.className = 'heatmap-main';
    mainGrid.appendChild(daysLabelsContainer);
    mainGrid.appendChild(gridContainer);
    
    heatmapWrapper.appendChild(mainGrid);
    heatmapWrapper.appendChild(legend);
    
    container.appendChild(heatmapWrapper);
    
    // Add tooltip functionality
    addHeatmapTooltips();
}

/**
 * Get heatmap level (0-4) based on completion percentage
 */
function getHeatmapLevel(percentage) {
    if (percentage === 0) return 0;
    if (percentage <= 25) return 1;
    if (percentage <= 50) return 2;
    if (percentage <= 75) return 3;
    return 4;
}

/**
 * Add tooltip functionality to heatmap cells
 */
function addHeatmapTooltips() {
    const heatmapDays = document.querySelectorAll('.heatmap-day[data-tooltip]');
    
    heatmapDays.forEach(day => {
        day.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'heatmap-tooltip';
            tooltip.textContent = e.target.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
            tooltip.style.top = `${rect.top - 10}px`;
            
            e.target.tooltipElement = tooltip;
        });
        
        day.addEventListener('mouseleave', (e) => {
            if (e.target.tooltipElement) {
                e.target.tooltipElement.remove();
                delete e.target.tooltipElement;
            }
        });
    });
}

// Export function to window
window.renderCalendarHeatmap = renderCalendarHeatmap;
