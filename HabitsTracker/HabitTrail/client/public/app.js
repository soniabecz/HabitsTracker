// ================================
// HABITS TRACKER - MAIN APPLICATION
// ================================

// Storage Keys
const STORAGE_KEYS = {
    HABITS: 'habitsTracker_habits',
    COMPLETIONS: 'habitsTracker_completions',
    THEME: 'habitsTracker_theme'
};

// Categories Configuration
const CATEGORIES = {
    health: { name: 'Zdrowie', color: '#10b981', icon: 'heartbeat' },
    productivity: { name: 'Produktywność', color: '#3b82f6', icon: 'briefcase' },
    learning: { name: 'Nauka', color: '#8b5cf6', icon: 'book' },
    wellness: { name: 'Samopoczucie', color: '#ec4899', icon: 'spa' },
    other: { name: 'Inne', color: '#6b7280', icon: 'star' }
};

// State Management
const state = {
    habits: [],
    completions: {}, // { habitId: { 'YYYY-MM-DD': true } }
    currentView: 'daily',
    habitToDelete: null,
    theme: 'light', // 'light' or 'dark'
    filterCategory: 'all' // 'all' or category key
};

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate() {
    const today = new Date();
    return formatDate(today);
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format date to Polish locale string
 */
function formatDatePL(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('pl-PL', options);
}

/**
 * Get last N days including today
 */
function getLastNDays(n) {
    const dates = [];
    const today = new Date();
    
    for (let i = n - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(formatDate(date));
    }
    
    return dates;
}

/**
 * Calculate current streak for a habit
 */
function calculateStreak(habitId) {
    const habitCompletions = state.completions[habitId] || {};
    let streak = 0;
    const today = new Date();
    
    // Check backwards from today
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date);
        
        if (habitCompletions[dateStr]) {
            streak++;
        } else {
            // Stop counting if we hit a day that's not completed
            break;
        }
    }
    
    return streak;
}

/**
 * Get achievement badges for a habit
 */
function getAchievements(habitId) {
    const streak = calculateStreak(habitId);
    const achievements = [];
    
    if (streak >= 100) {
        achievements.push({ name: '100 dni', icon: 'trophy', color: 'gold' });
    }
    if (streak >= 30) {
        achievements.push({ name: '30 dni', icon: 'medal', color: 'silver' });
    }
    if (streak >= 7) {
        achievements.push({ name: '7 dni', icon: 'star', color: 'bronze' });
    }
    
    return achievements;
}

/**
 * Generate unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    toastMessage.textContent = message;
    
    // Update icon based on type
    if (type === 'success') {
        toastIcon.className = 'toast-icon fas fa-check-circle';
        toastIcon.style.color = 'var(--color-success)';
    } else if (type === 'error') {
        toastIcon.className = 'toast-icon fas fa-exclamation-circle';
        toastIcon.style.color = 'var(--color-danger)';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ================================
// LOCAL STORAGE FUNCTIONS
// ================================

/**
 * Load habits from localStorage
 */
function loadHabits() {
    const stored = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (stored) {
        try {
            state.habits = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading habits:', e);
            state.habits = getDefaultHabits();
            saveHabits(); // Persist default habits immediately
        }
    } else {
        // First time - initialize with defaults and save
        state.habits = getDefaultHabits();
        saveHabits();
    }
}

/**
 * Save habits to localStorage
 */
function saveHabits() {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(state.habits));
}

/**
 * Load completions from localStorage
 */
function loadCompletions() {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    if (stored) {
        try {
            state.completions = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading completions:', e);
            state.completions = {};
        }
    } else {
        state.completions = {};
    }
}

/**
 * Save completions to localStorage
 */
function saveCompletions() {
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(state.completions));
}

/**
 * Get default habits with stable IDs
 */
function getDefaultHabits() {
    return [
        { id: 'habit-default-1', name: 'Trening', icon: 'dumbbell', category: 'health' },
        { id: 'habit-default-2', name: 'Czytanie', icon: 'book', category: 'learning' },
        { id: 'habit-default-3', name: 'Nauka', icon: 'graduation-cap', category: 'learning' },
        { id: 'habit-default-4', name: 'Woda', icon: 'glass-water', category: 'health' }
    ];
}

// ================================
// HABIT OPERATIONS
// ================================

/**
 * Add a new habit
 */
function addHabit(name, category = 'other') {
    if (!name || name.trim() === '') {
        showToast('Nazwa nawyku nie może być pusta', 'error');
        return false;
    }
    
    const habit = {
        id: generateId(),
        name: name.trim(),
        icon: 'star',
        category: category
    };
    
    state.habits.push(habit);
    saveHabits();
    
    showToast(`Nawyk "${name}" został dodany!`, 'success');
    return true;
}

/**
 * Delete a habit
 */
function deleteHabit(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    state.habits = state.habits.filter(h => h.id !== habitId);
    
    // Remove all completions for this habit
    if (state.completions[habitId]) {
        delete state.completions[habitId];
        saveCompletions();
    }
    
    saveHabits();
    showToast(`Nawyk "${habit.name}" został usunięty`, 'success');
}

/**
 * Toggle habit completion for a specific date
 */
function toggleHabitCompletion(habitId, date) {
    if (!state.completions[habitId]) {
        state.completions[habitId] = {};
    }
    
    if (state.completions[habitId][date]) {
        delete state.completions[habitId][date];
    } else {
        state.completions[habitId][date] = true;
    }
    
    saveCompletions();
}

/**
 * Check if habit is completed on a specific date
 */
function isHabitCompleted(habitId, date) {
    return state.completions[habitId] && state.completions[habitId][date] === true;
}

/**
 * Get completion count for a habit in last N days
 */
function getCompletionCount(habitId, days = 7) {
    const dates = getLastNDays(days);
    let count = 0;
    
    dates.forEach(date => {
        if (isHabitCompleted(habitId, date)) {
            count++;
        }
    });
    
    return count;
}

/**
 * Get overall completion percentage for last N days
 */
function getOverallCompletionPercentage(days = 7) {
    if (state.habits.length === 0) return 0;
    
    const dates = getLastNDays(days);
    let totalPossible = state.habits.length * dates.length;
    let totalCompleted = 0;
    
    state.habits.forEach(habit => {
        dates.forEach(date => {
            if (isHabitCompleted(habit.id, date)) {
                totalCompleted++;
            }
        });
    });
    
    return Math.round((totalCompleted / totalPossible) * 100);
}

// ================================
// UI RENDERING FUNCTIONS
// ================================

/**
 * Render daily view
 */
function renderDailyView() {
    const container = document.getElementById('daily-habits-list');
    const emptyState = document.getElementById('daily-empty-state');
    const dateElement = document.getElementById('current-date');
    
    const today = getTodayDate();
    dateElement.textContent = formatDatePL(today);
    
    if (state.habits.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    container.innerHTML = '';
    
    state.habits.forEach(habit => {
        const isCompleted = isHabitCompleted(habit.id, today);
        const streak = calculateStreak(habit.id);
        const achievements = getAchievements(habit.id);
        
        const card = document.createElement('div');
        card.className = `habit-card ${isCompleted ? 'completed' : ''}`;
        card.setAttribute('data-testid', `card-habit-${habit.id}`);
        
        const achievementsBadges = achievements.length > 0 
            ? `<div class="achievement-badges">
                ${achievements.map(ach => `
                    <span class="achievement-badge achievement-${ach.color}" title="${ach.name}">
                        <i class="fas fa-${ach.icon}"></i>
                    </span>
                `).join('')}
               </div>`
            : '';
        
        const categoryInfo = CATEGORIES[habit.category || 'other'];
        
        card.innerHTML = `
            <div class="habit-header">
                <div class="habit-title-section">
                    <div class="habit-name-with-category">
                        <h3 class="habit-name">${habit.name}</h3>
                        <span class="category-badge" style="--category-color: ${categoryInfo.color}" title="${categoryInfo.name}">
                            <i class="fas fa-${categoryInfo.icon}"></i> ${categoryInfo.name}
                        </span>
                    </div>
                    ${streak > 0 ? `<div class="streak-badge" title="Aktualna seria"><i class="fas fa-fire"></i> ${streak} ${streak === 1 ? 'dzień' : 'dni'}</div>` : ''}
                </div>
                <div class="habit-checkbox-container">
                    <div class="habit-checkbox ${isCompleted ? 'checked' : ''}" 
                         data-habit-id="${habit.id}"
                         data-testid="checkbox-habit-${habit.id}">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
            </div>
            ${achievementsBadges}
            <button class="delete-habit-btn" 
                    data-habit-id="${habit.id}"
                    data-testid="button-delete-${habit.id}"
                    title="Usuń nawyk">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        container.appendChild(card);
    });
    
    // Add event listeners for checkboxes
    document.querySelectorAll('.habit-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', handleCheckboxClick);
    });
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-habit-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteClick);
    });
}

/**
 * Render all habits view
 */
function renderAllHabitsView() {
    const container = document.getElementById('all-habits-list');
    const emptyState = document.getElementById('all-habits-empty-state');
    const emptyTitle = document.querySelector('#all-habits-empty-state .empty-title');
    const emptyMessage = document.querySelector('#all-habits-empty-state .empty-message');
    
    // Filter habits by category
    const filteredHabits = state.filterCategory === 'all' 
        ? state.habits 
        : state.habits.filter(h => (h.category || 'other') === state.filterCategory);
    
    // No habits at all
    if (state.habits.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        emptyTitle.textContent = 'Brak nawyków';
        emptyMessage.textContent = 'Dodaj swój pierwszy nawyk, aby zacząć budować lepsze rutyny!';
        return;
    }
    
    // No habits in selected category
    if (filteredHabits.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        emptyTitle.textContent = 'Brak nawyków w tej kategorii';
        emptyMessage.textContent = 'Wybierz inną kategorię lub dodaj nawyki do tej kategorii.';
        return;
    }
    
    // Has habits to show
    container.style.display = 'flex';
    emptyState.style.display = 'none';
    container.innerHTML = '';
    
    filteredHabits.forEach(habit => {
        const completionCount = getCompletionCount(habit.id, 7);
        const streak = calculateStreak(habit.id);
        const achievements = getAchievements(habit.id);
        const categoryInfo = CATEGORIES[habit.category || 'other'];
        
        const item = document.createElement('div');
        item.className = 'habit-list-item';
        item.setAttribute('data-testid', `item-habit-${habit.id}`);
        
        const achievementsBadges = achievements.length > 0 
            ? achievements.map(ach => `
                <span class="achievement-badge achievement-${ach.color}" title="${ach.name}">
                    <i class="fas fa-${ach.icon}"></i> ${ach.name}
                </span>
            `).join('')
            : '';
        
        item.innerHTML = `
            <div class="habit-list-info">
                <div class="habit-icon">
                    <i class="fas fa-${habit.icon}"></i>
                </div>
                <div class="habit-details">
                    <div class="habit-name-row">
                        <h3 class="habit-list-name">${habit.name}</h3>
                        <span class="category-badge-small" style="--category-color: ${categoryInfo.color}" title="${categoryInfo.name}">
                            <i class="fas fa-${categoryInfo.icon}"></i> ${categoryInfo.name}
                        </span>
                    </div>
                    <div class="habit-meta">
                        <p class="habit-stats">${completionCount} z 7 dni | ${streak > 0 ? `<i class="fas fa-fire"></i> ${streak} ${streak === 1 ? 'dzień' : 'dni'}` : 'Brak serii'}</p>
                        ${achievementsBadges ? `<div class="achievements-inline">${achievementsBadges}</div>` : ''}
                    </div>
                </div>
            </div>
            <button class="btn btn-danger btn-icon" 
                    data-habit-id="${habit.id}"
                    data-testid="button-delete-all-${habit.id}"
                    title="Usuń nawyk">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        container.appendChild(item);
    });
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.btn-danger').forEach(btn => {
        btn.addEventListener('click', handleDeleteClick);
    });
}

/**
 * Render statistics view
 */
function renderStatisticsView() {
    const statsContainer = document.getElementById('stats-cards-container');
    const emptyState = document.getElementById('stats-empty-state');
    const chartsGrid = document.querySelector('.charts-grid');
    const achievementsSection = document.getElementById('achievements-section');
    const achievementsGrid = document.getElementById('achievements-grid');
    const heatmapSection = document.querySelector('.heatmap-section');
    const shareSection = document.querySelector('.share-section');
    
    if (state.habits.length === 0) {
        statsContainer.style.display = 'none';
        chartsGrid.style.display = 'none';
        achievementsSection.style.display = 'none';
        if (heatmapSection) heatmapSection.style.display = 'none';
        if (shareSection) shareSection.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    statsContainer.style.display = 'grid';
    chartsGrid.style.display = 'grid';
    achievementsSection.style.display = 'block';
    if (heatmapSection) heatmapSection.style.display = 'block';
    if (shareSection) shareSection.style.display = 'flex';
    emptyState.style.display = 'none';
    
    // Calculate statistics
    const today = getTodayDate();
    const completedToday = state.habits.filter(h => isHabitCompleted(h.id, today)).length;
    const overallPercentage = getOverallCompletionPercentage(7);
    
    let totalCompleted7Days = 0;
    state.habits.forEach(habit => {
        totalCompleted7Days += getCompletionCount(habit.id, 7);
    });
    
    const bestStreak = calculateBestStreak();
    
    // Render stats cards
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${completedToday}</div>
            <div class="stat-label">Zrealizowane dziś</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${overallPercentage}%</div>
            <div class="stat-label">Realizacja (7 dni)</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${totalCompleted7Days}</div>
            <div class="stat-label">Łącznie (7 dni)</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${bestStreak}</div>
            <div class="stat-label">Najdłuższa seria</div>
        </div>
    `;
    
    // Render achievements
    renderAchievementsSection();
    
    // Render charts
    renderCharts();
    
    // Render calendar heatmap
    if (window.renderCalendarHeatmap) {
        window.renderCalendarHeatmap();
    }
}

/**
 * Render achievements section in statistics view
 */
function renderAchievementsSection() {
    const achievementsGrid = document.getElementById('achievements-grid');
    achievementsGrid.innerHTML = '';
    
    // Get all habits with their streaks and achievements
    const habitsWithAchievements = state.habits.map(habit => {
        const streak = calculateStreak(habit.id);
        const achievements = getAchievements(habit.id);
        return { habit, streak, achievements };
    }).filter(item => item.streak > 0 || item.achievements.length > 0);
    
    // Sort by streak descending
    habitsWithAchievements.sort((a, b) => b.streak - a.streak);
    
    if (habitsWithAchievements.length === 0) {
        achievementsGrid.innerHTML = `
            <div class="no-achievements">
                <i class="fas fa-trophy"></i>
                <p>Zacznij budować serie, aby zdobyć pierwsze osiągnięcia!</p>
            </div>
        `;
        return;
    }
    
    // Render top habits with achievements
    habitsWithAchievements.forEach(({ habit, streak, achievements }) => {
        const card = document.createElement('div');
        card.className = 'achievement-card';
        
        const achievementBadges = achievements.map(ach => `
            <span class="achievement-badge achievement-${ach.color}" title="${ach.name}">
                <i class="fas fa-${ach.icon}"></i> ${ach.name}
            </span>
        `).join('');
        
        card.innerHTML = `
            <div class="achievement-card-header">
                <h4 class="achievement-habit-name">${habit.name}</h4>
                <div class="achievement-streak">
                    <i class="fas fa-fire"></i> ${streak} ${streak === 1 ? 'dzień' : 'dni'}
                </div>
            </div>
            ${achievements.length > 0 ? `<div class="achievement-card-badges">${achievementBadges}</div>` : ''}
        `;
        
        achievementsGrid.appendChild(card);
    });
}

/**
 * Calculate best streak
 */
function calculateBestStreak() {
    let bestStreak = 0;
    
    state.habits.forEach(habit => {
        let currentStreak = 0;
        let maxStreak = 0;
        
        // Check last 30 days
        const dates = getLastNDays(30);
        
        dates.forEach(date => {
            if (isHabitCompleted(habit.id, date)) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        });
        
        bestStreak = Math.max(bestStreak, maxStreak);
    });
    
    return bestStreak;
}

/**
 * Render charts
 */
function renderCharts() {
    // This function calls the charts.js functions
    if (window.renderCompletionChart) {
        window.renderCompletionChart();
    }
    
    if (window.renderHabitsBarChart) {
        window.renderHabitsBarChart();
    }
}

// ================================
// EVENT HANDLERS
// ================================

/**
 * Handle checkbox click
 */
function handleCheckboxClick(e) {
    const habitId = e.currentTarget.getAttribute('data-habit-id');
    const today = getTodayDate();
    
    toggleHabitCompletion(habitId, today);
    renderCurrentView();
}

/**
 * Handle delete button click
 */
function handleDeleteClick(e) {
    e.stopPropagation();
    const habitId = e.currentTarget.getAttribute('data-habit-id');
    const habit = state.habits.find(h => h.id === habitId);
    
    if (habit) {
        state.habitToDelete = habitId;
        document.getElementById('delete-habit-name').textContent = habit.name;
        openModal('delete-modal');
    }
}

/**
 * Handle tab click
 */
function handleTabClick(e) {
    const viewName = e.currentTarget.getAttribute('data-view');
    switchView(viewName);
}

/**
 * Switch view
 */
function switchView(viewName) {
    // Update tabs
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-view') === viewName) {
            tab.classList.add('active');
        }
    });
    
    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    state.currentView = viewName;
    renderCurrentView();
}

/**
 * Render current view
 */
function renderCurrentView() {
    switch (state.currentView) {
        case 'daily':
            renderDailyView();
            break;
        case 'statistics':
            renderStatisticsView();
            break;
        case 'all-habits':
            renderAllHabitsView();
            break;
    }
}

// ================================
// MODAL FUNCTIONS
// ================================

/**
 * Open modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form if it's the add habit modal
        if (modalId === 'add-habit-modal') {
            document.getElementById('add-habit-form').reset();
        }
    }
}

/**
 * Handle add habit form submit
 */
function handleAddHabitSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('habit-name');
    const categorySelect = document.getElementById('habit-category');
    const name = nameInput.value.trim();
    const category = categorySelect.value;
    
    if (addHabit(name, category)) {
        closeModal('add-habit-modal');
        renderCurrentView();
        nameInput.value = '';
        categorySelect.value = 'other';
    }
}

/**
 * Handle delete confirmation
 */
function handleDeleteConfirm() {
    if (state.habitToDelete) {
        deleteHabit(state.habitToDelete);
        state.habitToDelete = null;
        closeModal('delete-modal');
        renderCurrentView();
    }
}

/**
 * Handle category filter click
 */
function handleCategoryFilterClick(e) {
    const btn = e.currentTarget;
    const category = btn.dataset.category;
    
    // Update state
    state.filterCategory = category;
    
    // Update UI
    document.querySelectorAll('.category-filter-btn').forEach(b => {
        b.classList.remove('active');
    });
    btn.classList.add('active');
    
    // Re-render
    renderAllHabitsView();
}

// ================================
// SHARE FUNCTIONALITY
// ================================

/**
 * Export data as JSON file
 */
function exportDataAsJSON() {
    const data = {
        habits: state.habits,
        completions: state.completions,
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `nawyki-dashboard-${getTodayDate()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Dane wyeksportowane pomyślnie!', 'success');
}

/**
 * Generate shareable link
 */
function generateShareLink() {
    const data = {
        habits: state.habits,
        completions: state.completions
    };
    
    // Encode data to base64
    const jsonString = JSON.stringify(data);
    const base64Data = btoa(encodeURIComponent(jsonString));
    
    // Create shareable URL
    const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${base64Data}`;
    
    // Display the link
    const linkContainer = document.getElementById('share-link-container');
    const linkInput = document.getElementById('share-link-input');
    
    linkInput.value = shareUrl;
    linkContainer.style.display = 'flex';
    
    showToast('Link wygenerowany! Skopiuj i udostępnij.', 'success');
}

/**
 * Copy share link to clipboard
 */
async function copyShareLink() {
    const linkInput = document.getElementById('share-link-input');
    const copyMessage = document.getElementById('copy-message');
    
    try {
        await navigator.clipboard.writeText(linkInput.value);
        copyMessage.classList.add('show');
        showToast('Link skopiowany do schowka!', 'success');
        
        setTimeout(() => {
            copyMessage.classList.remove('show');
        }, 3000);
    } catch (err) {
        // Fallback for older browsers
        linkInput.select();
        document.execCommand('copy');
        copyMessage.classList.add('show');
        showToast('Link skopiowany do schowka!', 'success');
        
        setTimeout(() => {
            copyMessage.classList.remove('show');
        }, 3000);
    }
}

/**
 * Load shared data from URL
 */
function loadSharedData() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('shared');
    
    if (sharedData) {
        try {
            const jsonString = decodeURIComponent(atob(sharedData));
            const data = JSON.parse(jsonString);
            
            if (data.habits && data.completions) {
                // Ask user if they want to load shared data
                if (confirm('Czy chcesz załadować udostępnione dane nawyków? To zastąpi Twoje obecne dane.')) {
                    state.habits = data.habits;
                    state.completions = data.completions;
                    saveHabits();
                    saveCompletions();
                    renderCurrentView();
                    showToast('Udostępnione dane zostały załadowane!', 'success');
                    
                    // Remove the shared parameter from URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        } catch (e) {
            console.error('Error loading shared data:', e);
        }
    }
}

// ================================
// INITIALIZATION
// ================================

// ================================
// THEME MANAGEMENT
// ================================

/**
 * Load theme from localStorage
 */
function loadTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    state.theme = saved || 'light';
    applyTheme(state.theme);
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (theme === 'dark') {
        body.classList.add('dark-mode');
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
        }
    } else {
        body.classList.remove('dark-mode');
        if (themeIcon) {
            themeIcon.className = 'fas fa-moon';
        }
    }
    
    state.theme = theme;
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    
    // Update charts if they exist
    if (state.currentView === 'statistics' && window.updateCharts) {
        setTimeout(() => window.updateCharts(), 100);
    }
}

/**
 * Toggle theme
 */
function toggleTheme() {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    showToast(`Tryb ${newTheme === 'dark' ? 'ciemny' : 'jasny'} aktywowany`, 'success');
}

/**
 * Initialize the application
 */
function init() {
    // Load data and theme
    loadTheme();
    loadHabits();
    loadCompletions();
    
    // Check for shared data in URL
    loadSharedData();
    
    // Render initial view
    renderDailyView();
    
    // Setup event listeners
    setupEventListeners();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', handleTabClick);
    });
    
    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    
    // Add habit buttons
    document.getElementById('add-habit-btn').addEventListener('click', () => {
        openModal('add-habit-modal');
    });
    
    document.getElementById('add-habit-empty')?.addEventListener('click', () => {
        openModal('add-habit-modal');
    });
    
    document.getElementById('add-habit-all-empty')?.addEventListener('click', () => {
        openModal('add-habit-modal');
    });
    
    // Add habit form
    document.getElementById('add-habit-form').addEventListener('submit', handleAddHabitSubmit);
    
    // Modal close buttons
    document.getElementById('close-modal-btn').addEventListener('click', () => {
        closeModal('add-habit-modal');
    });
    
    document.getElementById('cancel-add-btn').addEventListener('click', () => {
        closeModal('add-habit-modal');
    });
    
    // Delete modal
    document.getElementById('close-delete-modal').addEventListener('click', () => {
        closeModal('delete-modal');
    });
    
    document.getElementById('cancel-delete-btn').addEventListener('click', () => {
        closeModal('delete-modal');
    });
    
    document.getElementById('confirm-delete-btn').addEventListener('click', handleDeleteConfirm);
    
    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('add-habit-modal');
            closeModal('delete-modal');
        }
    });
    
    // Category filters
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.addEventListener('click', handleCategoryFilterClick);
    });
    
    // Share functionality
    const exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportDataAsJSON);
    }
    
    const shareBtn = document.getElementById('generate-share-link-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', generateShareLink);
    }
    
    const copyBtn = document.getElementById('copy-link-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyShareLink);
    }
}

// ================================
// START APPLICATION
// ================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export functions for charts.js and heatmap.js to use
window.habitsApp = {
    state,
    getLastNDays,
    isHabitCompleted,
    getCompletionCount,
    formatDate
};
