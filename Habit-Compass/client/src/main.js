const STORAGE_KEY = 'habits-tracker-data';
const THEME_KEY = 'habits-tracker-theme';

let habits = [];
let completions = [];
let readOnly = false;
let barChart = null;
let lineChart = null;
let shareLoadError = false;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function getLast7Days() {
  var days = [];
  for (var i = 6; i >= 0; i--) {
    var date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

function formatDateShort(dateString) {
  var date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric' });
}

function formatTodayDate() {
  return new Date().toLocaleDateString('pl-PL', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function getStorageData() {
  try {
    var data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      var parsed = JSON.parse(data);
      return {
        habits: parsed.habits || [],
        completions: parsed.completions || []
      };
    }
  } catch (e) {
    console.error('Error reading from localStorage:', e);
  }
  return { habits: [], completions: [] };
}

function saveStorageData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ habits: habits, completions: completions }));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

function utf8ToBase64(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
    return String.fromCharCode(parseInt(p1, 16));
  }));
}

function base64ToUtf8(str) {
  return decodeURIComponent(
    atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')
  );
}

function loadFromShareableLink() {
  var urlParams = new URLSearchParams(window.location.search);
  var sharedData = urlParams.get('shared');
  shareLoadError = false;
  
  if (sharedData) {
    try {
      var decoded = base64ToUtf8(sharedData);
      var parsed = JSON.parse(decoded);
      return {
        habits: parsed.habits || [],
        completions: parsed.completions || []
      };
    } catch (e) {
      console.error('Error decoding shared data:', e);
      shareLoadError = true;
    }
  }
  return null;
}

function showShareLoadError() {
  if (!shareLoadError) return;
  
  var container = document.getElementById('habits-list');
  var emptyState = document.getElementById('empty-habits');
  
  if (container) container.classList.add('hidden');
  if (emptyState) {
    emptyState.classList.remove('hidden');
    var subtext = document.getElementById('empty-subtext');
    if (subtext) {
      subtext.textContent = 'Nie udało się załadować danych. Link może być uszkodzony.';
      subtext.style.color = 'hsl(0, 70%, 55%)';
    }
  }
}

function generateShareableLink() {
  var data = { habits: habits, completions: completions };
  var encoded = utf8ToBase64(JSON.stringify(data));
  return window.location.origin + window.location.pathname + '?shared=' + encodeURIComponent(encoded);
}

function isHabitCompletedOnDate(habitId, date) {
  var completion = completions.find(function(c) {
    return c.habitId === habitId && c.date === date;
  });
  return completion ? completion.completed : false;
}

function toggleHabitCompletion(habitId, date) {
  var existingIndex = completions.findIndex(function(c) {
    return c.habitId === habitId && c.date === date;
  });
  
  if (existingIndex >= 0) {
    completions[existingIndex].completed = !completions[existingIndex].completed;
    saveStorageData();
    return completions[existingIndex].completed;
  } else {
    completions.push({ habitId: habitId, date: date, completed: true });
    saveStorageData();
    return true;
  }
}

function getHabitStats(habitId) {
  var last7 = getLast7Days();
  var completedDays = last7.filter(function(date) {
    return isHabitCompletedOnDate(habitId, date);
  }).length;
  return {
    completedDays: completedDays,
    percentage: Math.round((completedDays / 7) * 100)
  };
}

function getAllHabitsStats() {
  return habits.map(function(habit) {
    var stats = getHabitStats(habit.id);
    return {
      habitName: habit.name,
      habitId: habit.id,
      completedDays: stats.completedDays,
      percentage: stats.percentage
    };
  });
}

function initTheme() {
  var savedTheme = localStorage.getItem(THEME_KEY);
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  updateThemeIcon();
}

function toggleTheme() {
  var isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  updateThemeIcon();
  updateCharts();
}

function updateThemeIcon() {
  var isDark = document.documentElement.classList.contains('dark');
  var moonIcon = document.getElementById('theme-icon-moon');
  var sunIcon = document.getElementById('theme-icon-sun');
  
  if (isDark) {
    if (moonIcon) moonIcon.classList.add('hidden');
    if (sunIcon) sunIcon.classList.remove('hidden');
  } else {
    if (moonIcon) moonIcon.classList.remove('hidden');
    if (sunIcon) sunIcon.classList.add('hidden');
  }
}

function addHabit(name) {
  var habit = { id: generateId(), name: name.trim() };
  habits.push(habit);
  saveStorageData();
  return habit;
}

function deleteHabit(habitId) {
  habits = habits.filter(function(h) { return h.id !== habitId; });
  completions = completions.filter(function(c) { return c.habitId !== habitId; });
  saveStorageData();
}

function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderHabitCard(habit, today) {
  var isCompleted = isHabitCompletedOnDate(habit.id, today);
  var stats = getHabitStats(habit.id);
  
  var checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  var deleteIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
  
  var html = '<div class="habit-card" data-testid="habit-card-' + habit.id + '">';
  html += '<div class="habit-checkbox ' + (isCompleted ? 'checked' : '') + ' ' + (readOnly ? 'disabled' : '') + '" ';
  html += 'data-habit-id="' + habit.id + '" data-testid="checkbox-habit-' + habit.id + '">';
  html += isCompleted ? checkIcon : '';
  html += '</div>';
  html += '<div class="habit-info">';
  html += '<div class="habit-name ' + (isCompleted ? 'completed' : '') + '">' + escapeHtml(habit.name) + '</div>';
  html += '<div class="habit-stats">';
  html += '<div class="habit-progress">';
  html += '<div class="habit-progress-bar" style="width: ' + stats.percentage + '%"></div>';
  html += '</div>';
  html += '<span class="habit-percentage">' + stats.percentage + '%</span>';
  html += '</div></div>';
  
  if (!readOnly) {
    html += '<div class="habit-actions">';
    html += '<button class="habit-delete-btn" data-habit-id="' + habit.id + '" data-testid="button-delete-' + habit.id + '" aria-label="Usuń nawyk">';
    html += deleteIcon;
    html += '</button></div>';
  }
  
  html += '</div>';
  return html;
}

function renderHabitsList() {
  var container = document.getElementById('habits-list');
  var emptyState = document.getElementById('empty-habits');
  var countEl = document.getElementById('habits-count');
  
  if (!container || !emptyState || !countEl) return;
  
  countEl.textContent = String(habits.length);
  
  if (habits.length === 0) {
    container.classList.add('hidden');
    emptyState.classList.remove('hidden');
    var subtext = document.getElementById('empty-subtext');
    if (subtext) {
      subtext.textContent = readOnly 
        ? 'Ten dashboard jest pusty' 
        : 'Dodaj swój pierwszy nawyk powyżej';
    }
    return;
  }
  
  container.classList.remove('hidden');
  emptyState.classList.add('hidden');
  
  var today = getTodayDateString();
  container.innerHTML = habits.map(function(habit) {
    return renderHabitCard(habit, today);
  }).join('');
}

function renderDailyView() {
  var grid = document.getElementById('daily-habits-grid');
  var todayDateEl = document.getElementById('today-date');
  if (!grid || !todayDateEl) return;
  
  var today = getTodayDateString();
  todayDateEl.textContent = formatTodayDate();
  
  if (habits.length === 0) {
    grid.innerHTML = '<p class="empty-text" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">Brak nawyków do wyświetlenia</p>';
    return;
  }
  
  var checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  
  grid.innerHTML = habits.map(function(habit) {
    var isCompleted = isHabitCompletedOnDate(habit.id, today);
    
    var html = '<div class="daily-habit-item ' + (isCompleted ? 'completed' : '') + ' ' + (readOnly ? 'disabled' : '') + '" ';
    html += 'data-habit-id="' + habit.id + '" data-testid="daily-habit-' + habit.id + '">';
    html += '<div class="habit-checkbox ' + (isCompleted ? 'checked' : '') + '" style="width: 1rem; height: 1rem;">';
    html += isCompleted ? checkIcon : '';
    html += '</div>';
    html += '<span class="daily-habit-name">' + escapeHtml(habit.name) + '</span>';
    html += '</div>';
    
    return html;
  }).join('');
}

function updateCharts() {
  var statsEmpty = document.getElementById('stats-empty');
  var statsCharts = document.getElementById('stats-charts');
  
  if (!statsEmpty || !statsCharts) return;
  
  if (habits.length === 0) {
    statsEmpty.classList.remove('hidden');
    statsCharts.classList.add('hidden');
    return;
  }
  
  statsEmpty.classList.add('hidden');
  statsCharts.classList.remove('hidden');
  
  var stats = getAllHabitsStats();
  var isDark = document.documentElement.classList.contains('dark');
  var textColor = isDark ? 'hsl(0, 0%, 70%)' : 'hsl(0, 0%, 50%)';
  var gridColor = isDark ? 'hsl(0, 0%, 25%)' : 'hsl(0, 0%, 90%)';
  
  var chartColors = [
    'hsl(203, 88%, 53%)',
    'hsl(160, 100%, 36%)',
    'hsl(42, 93%, 56%)',
    'hsl(147, 79%, 42%)',
    'hsl(341, 75%, 51%)'
  ];
  
  if (barChart) barChart.destroy();
  var barCanvas = document.getElementById('bar-chart');
  var barCtx = barCanvas ? barCanvas.getContext('2d') : null;
  if (barCtx) {
    barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: stats.map(function(s) { return s.habitName; }),
        datasets: [{
          label: 'Dni ukończone',
          data: stats.map(function(s) { return s.completedDays; }),
          backgroundColor: stats.map(function(_, i) { return chartColors[i % chartColors.length]; }),
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'hsl(0, 0%, 10%)',
            titleColor: 'hsl(0, 0%, 100%)',
            bodyColor: 'hsl(0, 0%, 100%)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function(context) { return context.parsed.y + ' dni z 7'; }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 7,
            ticks: { stepSize: 1, color: textColor },
            grid: { color: gridColor }
          },
          x: {
            ticks: { color: textColor },
            grid: { display: false }
          }
        }
      }
    });
  }
  
  var last7 = getLast7Days();
  var dayLabels = last7.map(formatDateShort);
  var averagePerDay = last7.map(function(date) {
    if (habits.length === 0) return 0;
    var completedOnDay = habits.filter(function(habit) {
      return isHabitCompletedOnDate(habit.id, date);
    }).length;
    return Math.round((completedOnDay / habits.length) * 100);
  });
  
  if (lineChart) lineChart.destroy();
  var lineCanvas = document.getElementById('line-chart');
  var lineCtx = lineCanvas ? lineCanvas.getContext('2d') : null;
  if (lineCtx) {
    lineChart = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: dayLabels,
        datasets: [{
          label: 'Średnia realizacja (%)',
          data: averagePerDay,
          borderColor: 'hsl(203, 88%, 53%)',
          backgroundColor: 'hsla(203, 88%, 53%, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'hsl(203, 88%, 53%)',
          pointBorderColor: isDark ? 'hsl(0, 0%, 10%)' : 'white',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'hsl(0, 0%, 10%)',
            titleColor: 'hsl(0, 0%, 100%)',
            bodyColor: 'hsl(0, 0%, 100%)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function(context) { return context.parsed.y + '% realizacji'; }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { 
              stepSize: 25, 
              color: textColor,
              callback: function(value) { return value + '%'; }
            },
            grid: { color: gridColor }
          },
          x: {
            ticks: { color: textColor },
            grid: { display: false }
          }
        }
      }
    });
  }
}

function handleAddHabit(e) {
  e.preventDefault();
  var input = document.getElementById('habit-input');
  var name = input ? input.value.trim() : '';
  
  if (name) {
    addHabit(name);
    input.value = '';
    renderAll();
  }
}

function handleToggleHabit(habitId) {
  if (readOnly) return;
  var today = getTodayDateString();
  toggleHabitCompletion(habitId, today);
  renderAll();
}

function handleDeleteHabit(habitId) {
  if (readOnly) return;
  deleteHabit(habitId);
  renderAll();
}

function openShareModal() {
  var modal = document.getElementById('share-modal');
  var linkInput = document.getElementById('share-link-input');
  var copySuccess = document.getElementById('copy-success');
  
  try {
    if (linkInput) linkInput.value = generateShareableLink();
    if (copySuccess) copySuccess.classList.add('hidden');
    if (modal) modal.classList.remove('hidden');
  } catch (e) {
    console.error('Error generating share link:', e);
    alert('Wystąpił błąd podczas generowania linku udostępniania.');
  }
}

function closeShareModal() {
  var modal = document.getElementById('share-modal');
  if (modal) modal.classList.add('hidden');
}

function copyShareLink() {
  var linkInput = document.getElementById('share-link-input');
  var copySuccess = document.getElementById('copy-success');
  
  if (linkInput) {
    navigator.clipboard.writeText(linkInput.value).then(function() {
      if (copySuccess) copySuccess.classList.remove('hidden');
      setTimeout(function() {
        if (copySuccess) copySuccess.classList.add('hidden');
      }, 3000);
    });
  }
}

function renderAll() {
  renderHabitsList();
  renderDailyView();
  updateCharts();
}

function setupEventDelegation() {
  var habitsContainer = document.getElementById('habits-list');
  if (habitsContainer) {
    habitsContainer.addEventListener('click', function(e) {
      if (readOnly) return;
      
      var target = e.target;
      
      var checkbox = target.closest('.habit-checkbox');
      if (checkbox && !checkbox.classList.contains('disabled')) {
        var habitId = checkbox.dataset.habitId;
        if (habitId) handleToggleHabit(habitId);
        return;
      }
      
      var deleteBtn = target.closest('.habit-delete-btn');
      if (deleteBtn) {
        var habitId = deleteBtn.dataset.habitId;
        if (habitId) handleDeleteHabit(habitId);
        return;
      }
    });
  }
  
  var dailyGrid = document.getElementById('daily-habits-grid');
  if (dailyGrid) {
    dailyGrid.addEventListener('click', function(e) {
      if (readOnly) return;
      
      var target = e.target;
      var habitItem = target.closest('.daily-habit-item');
      if (habitItem && !habitItem.classList.contains('disabled')) {
        var habitId = habitItem.dataset.habitId;
        if (habitId) handleToggleHabit(habitId);
      }
    });
  }
}

function init() {
  initTheme();
  
  var urlParams = new URLSearchParams(window.location.search);
  var hasSharedParam = urlParams.has('shared');
  var sharedData = loadFromShareableLink();
  
  if (hasSharedParam) {
    readOnly = true;
    var addSection = document.getElementById('add-habit-section');
    var readOnlyBadge = document.getElementById('read-only-badge');
    var shareBtn = document.getElementById('share-btn');
    
    if (addSection) addSection.classList.add('hidden');
    if (readOnlyBadge) readOnlyBadge.classList.remove('hidden');
    if (shareBtn) shareBtn.classList.add('hidden');
    
    if (sharedData) {
      habits = sharedData.habits || [];
      completions = sharedData.completions || [];
    } else {
      habits = [];
      completions = [];
    }
  } else {
    readOnly = false;
    var data = getStorageData();
    habits = data.habits || [];
    completions = data.completions || [];
    
    var addSection = document.getElementById('add-habit-section');
    var readOnlyBadge = document.getElementById('read-only-badge');
    var shareBtn = document.getElementById('share-btn');
    
    if (addSection) addSection.classList.remove('hidden');
    if (readOnlyBadge) readOnlyBadge.classList.add('hidden');
    if (shareBtn) shareBtn.classList.remove('hidden');
  }
  
  var addForm = document.getElementById('add-habit-form');
  var themeToggle = document.getElementById('theme-toggle');
  var shareBtnEl = document.getElementById('share-btn');
  var modalClose = document.getElementById('modal-close');
  var copyLinkBtn = document.getElementById('copy-link-btn');
  var modalBackdrop = document.querySelector('.modal-backdrop');
  
  if (addForm) addForm.addEventListener('submit', handleAddHabit);
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (shareBtnEl) shareBtnEl.addEventListener('click', openShareModal);
  if (modalClose) modalClose.addEventListener('click', closeShareModal);
  if (copyLinkBtn) copyLinkBtn.addEventListener('click', copyShareLink);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeShareModal);
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeShareModal();
  });
  
  setupEventDelegation();
  
  renderAll();
  
  if (shareLoadError) {
    showShareLoadError();
  }
}

document.addEventListener('DOMContentLoaded', init);
