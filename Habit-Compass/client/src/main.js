const STORAGE_KEY = 'habits-tracker-data';
const THEME_KEY = 'habits-tracker-theme';

let habits = [];
let completions = [];
let achievements = [];
let readOnly = false;
let barChart = null;
let lineChart = null;
let shareLoadError = false;
let activeCategory = 'all';

const CATEGORIES = [
  { id: 'health', name: 'Zdrowie', color: 'hsl(160, 100%, 36%)' },
  { id: 'work', name: 'Praca', color: 'hsl(203, 88%, 53%)' },
  { id: 'personal', name: 'Rozwój', color: 'hsl(280, 70%, 50%)' },
  { id: 'other', name: 'Inne', color: 'hsl(42, 93%, 56%)' }
];

var ICONS = {
  fire: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>',
  trophy: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>',
  zap: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
  crown: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
  medal: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"></path><path d="M11 12 5.12 2.2"></path><path d="m13 12 5.88-9.8"></path><path d="M8 7h8"></path><circle cx="12" cy="17" r="5"></circle><path d="M12 18v-2h-.5"></path></svg>',
  target: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
  chart: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>'
};

const BADGE_DEFINITIONS = [
  { id: 'streak-7', name: 'Tydzień z rzędu', description: '7 dni serii', icon: 'fire', condition: function(h, c) { return getHabitStreak(h.id, c) >= 7; } },
  { id: 'streak-30', name: 'Miesiąc mistrzowski', description: '30 dni serii', icon: 'trophy', condition: function(h, c) { return getHabitStreak(h.id, c) >= 30; } },
  { id: 'completions-50', name: 'Konsekwentny', description: '50 wykonań', icon: 'zap', condition: function(h, c) { return getTotalCompletions(h.id, c) >= 50; } },
  { id: 'completions-100', name: 'Mistrz nawyków', description: '100 wykonań', icon: 'crown', condition: function(h, c) { return getTotalCompletions(h.id, c) >= 100; } },
  { id: 'perfect-week', name: 'Idealny tydzień', description: '100% w tygodniu', icon: 'star', condition: function(h, c) { return getWeeklyCompletion(h.id, c) === 7; } }
];

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

function getLast30Days() {
  var days = [];
  for (var i = 29; i >= 0; i--) {
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
        completions: parsed.completions || [],
        achievements: parsed.achievements || []
      };
    }
  } catch (e) {
    console.error('Error reading from localStorage:', e);
  }
  return { habits: [], completions: [], achievements: [] };
}

function saveStorageData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      habits: habits, 
      completions: completions,
      achievements: achievements
    }));
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
        completions: parsed.completions || [],
        achievements: parsed.achievements || []
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
  var data = { habits: habits, completions: completions, achievements: achievements };
  var encoded = utf8ToBase64(JSON.stringify(data));
  return window.location.origin + window.location.pathname + '?shared=' + encodeURIComponent(encoded);
}

function isHabitCompletedOnDate(habitId, date) {
  if (typeof habitId === 'string' && habitId.startsWith('group-')) {
    var groupHabitId = parseInt(habitId.replace('group-', ''));
    var groupCompletion = myGroupHabitCompletions.find(function(c) {
      return c.groupHabitId === groupHabitId && c.date === date && c.completed;
    });
    return !!groupCompletion;
  }
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
    checkAndUpdateAchievements();
    return completions[existingIndex].completed;
  } else {
    completions.push({ habitId: habitId, date: date, completed: true });
    saveStorageData();
    checkAndUpdateAchievements();
    return true;
  }
}

async function toggleGroupHabitCompletion(habitId, groupId, date) {
  try {
    var response = await fetch('/api/groups/' + groupId + '/habits/' + habitId + '/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ date: date })
    });
    if (response.ok) {
      await fetchMyGroupHabits();
      return true;
    }
  } catch (e) {
    console.error('Error toggling group habit:', e);
  }
  return false;
}

function getHabitStreak(habitId, comps) {
  var isGroupHabit = typeof habitId === 'string' && habitId.startsWith('group-');
  if (isGroupHabit) {
    var groupHabitId = parseInt(habitId.replace('group-', ''));
    comps = myGroupHabitCompletions;
    var streak = 0;
    var today = new Date();
    
    for (var i = 0; i < 365; i++) {
      var checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      var dateStr = checkDate.toISOString().split('T')[0];
      
      var completed = comps.find(function(c) {
        return c.groupHabitId === groupHabitId && c.date === dateStr && c.completed;
      });
      
      if (completed) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }
  
  comps = comps || completions;
  var streak = 0;
  var today = new Date();
  
  for (var i = 0; i < 365; i++) {
    var checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    var dateStr = checkDate.toISOString().split('T')[0];
    
    var completed = comps.find(function(c) {
      return c.habitId === habitId && c.date === dateStr && c.completed;
    });
    
    if (completed) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function getWeeklyCompletion(habitId, comps) {
  var isGroupHabit = typeof habitId === 'string' && habitId.startsWith('group-');
  if (isGroupHabit) {
    var groupHabitId = parseInt(habitId.replace('group-', ''));
    comps = myGroupHabitCompletions;
    var last7 = getLast7Days();
    var count = 0;
    
    for (var i = 0; i < last7.length; i++) {
      var date = last7[i];
      var completed = comps.find(function(c) {
        return c.groupHabitId === groupHabitId && c.date === date && c.completed;
      });
      if (completed) count++;
    }
    return count;
  }
  
  comps = comps || completions;
  var last7 = getLast7Days();
  var count = 0;
  
  for (var i = 0; i < last7.length; i++) {
    var date = last7[i];
    var completed = comps.find(function(c) {
      return c.habitId === habitId && c.date === date && c.completed;
    });
    if (completed) count++;
  }
  
  return count;
}

function getTotalCompletions(habitId, comps) {
  var isGroupHabit = typeof habitId === 'string' && habitId.startsWith('group-');
  if (isGroupHabit) {
    var groupHabitId = parseInt(habitId.replace('group-', ''));
    return myGroupHabitCompletions.filter(function(c) {
      return c.groupHabitId === groupHabitId && c.completed;
    }).length;
  }
  
  comps = comps || completions;
  return comps.filter(function(c) {
    return c.habitId === habitId && c.completed;
  }).length;
}

function getHabitStats(habitId) {
  var last7 = getLast7Days();
  var allHabits = getAllHabits();
  var habit = allHabits.find(function(h) { return h.id === habitId; });
  
  var scheduledDaysInLast7 = last7.filter(function(date) {
    var dayOfWeek = new Date(date).getDay();
    return isHabitScheduledForDay(habit, dayOfWeek);
  });
  
  var completedDays = scheduledDaysInLast7.filter(function(date) {
    return isHabitCompletedOnDate(habitId, date);
  }).length;
  
  var totalScheduledDays = scheduledDaysInLast7.length;
  var weeklyGoal = habit ? (habit.weeklyGoal || 7) : 7;
  var streak = getHabitStreak(habitId);
  
  return {
    completedDays: completedDays,
    totalScheduledDays: totalScheduledDays,
    percentage: totalScheduledDays > 0 ? Math.round((completedDays / totalScheduledDays) * 100) : 0,
    weeklyGoal: weeklyGoal,
    goalProgress: Math.min(100, Math.round((completedDays / weeklyGoal) * 100)),
    streak: streak,
    totalCompletions: getTotalCompletions(habitId)
  };
}

function getAllHabitsStats() {
  var allHabits = getAllHabits();
  return allHabits.map(function(habit) {
    var stats = getHabitStats(habit.id);
    return {
      habitName: habit.name,
      habitId: habit.id,
      category: habit.category || 'other',
      completedDays: stats.completedDays,
      totalScheduledDays: stats.totalScheduledDays,
      percentage: stats.percentage,
      streak: stats.streak,
      weeklyGoal: stats.weeklyGoal,
      goalProgress: stats.goalProgress,
      isGroupHabit: habit.isGroupHabit || false
    };
  });
}

function checkAndUpdateAchievements() {
  var newAchievements = [];
  
  habits.forEach(function(habit) {
    BADGE_DEFINITIONS.forEach(function(badge) {
      var achievementId = habit.id + '-' + badge.id;
      var alreadyHas = achievements.find(function(a) { return a.id === achievementId; });
      
      if (!alreadyHas && badge.condition(habit, completions)) {
        var newAchievement = {
          id: achievementId,
          habitId: habit.id,
          badgeId: badge.id,
          earnedAt: new Date().toISOString()
        };
        achievements.push(newAchievement);
        newAchievements.push({ badge: badge, habit: habit });
      }
    });
  });
  
  if (newAchievements.length > 0) {
    saveStorageData();
    newAchievements.forEach(function(item) {
      showAchievementNotification(item.badge, item.habit);
    });
  }
}

function showAchievementNotification(badge, habit) {
  var notification = document.createElement('div');
  notification.className = 'achievement-notification';
  var iconSvg = ICONS[badge.icon] || ICONS.star;
  notification.innerHTML = '<div class="achievement-icon">' + iconSvg + '</div>' +
    '<div class="achievement-text">' +
    '<strong>Nowa odznaka!</strong>' +
    '<span>' + badge.name + ' - ' + habit.name + '</span>' +
    '</div>';
  
  document.body.appendChild(notification);
  
  setTimeout(function() {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(function() {
    notification.classList.remove('show');
    setTimeout(function() {
      notification.remove();
    }, 300);
  }, 3000);
}

function getHabitBadges(habitId) {
  return achievements
    .filter(function(a) { return a.habitId === habitId; })
    .map(function(a) {
      return BADGE_DEFINITIONS.find(function(b) { return b.id === a.badgeId; });
    })
    .filter(function(b) { return b; });
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

function addHabit(name, category, weeklyGoal, daysOfWeek) {
  category = category || 'other';
  weeklyGoal = weeklyGoal || 7;
  daysOfWeek = daysOfWeek || [0, 1, 2, 3, 4, 5, 6];
  
  var habit = { 
    id: generateId(), 
    name: name.trim(),
    category: category,
    weeklyGoal: parseInt(weeklyGoal, 10),
    daysOfWeek: daysOfWeek,
    createdAt: new Date().toISOString()
  };
  habits.push(habit);
  saveStorageData();
  return habit;
}

function deleteHabit(habitId) {
  habits = habits.filter(function(h) { return h.id !== habitId; });
  completions = completions.filter(function(c) { return c.habitId !== habitId; });
  achievements = achievements.filter(function(a) { return a.habitId !== habitId; });
  saveStorageData();
}

function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getCategoryInfo(categoryId) {
  return CATEGORIES.find(function(c) { return c.id === categoryId; }) || CATEGORIES[3];
}

var DAY_NAMES_SHORT = ['Nd', 'Pn', 'Wt', 'Sr', 'Cz', 'Pt', 'Sb'];

function formatDaysOfWeek(daysOfWeek) {
  if (!daysOfWeek || daysOfWeek.length === 0 || daysOfWeek.length === 7) {
    return null;
  }
  var sortedDays = daysOfWeek.slice().sort(function(a, b) {
    var orderA = a === 0 ? 7 : a;
    var orderB = b === 0 ? 7 : b;
    return orderA - orderB;
  });
  return sortedDays.map(function(d) { return DAY_NAMES_SHORT[d]; }).join(', ');
}

function renderHabitCard(habit, today) {
  var isCompleted = isHabitCompletedOnDate(habit.id, today);
  var stats = getHabitStats(habit.id);
  var category = getCategoryInfo(habit.category);
  var badges = getHabitBadges(habit.id);
  
  var checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  var deleteIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
  var fireIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>';
  
  var html = '<div class="habit-card" data-testid="habit-card-' + habit.id + '">';
  
  html += '<div class="habit-main-row">';
  html += '<div class="habit-checkbox ' + (isCompleted ? 'checked' : '') + ' ' + (readOnly ? 'disabled' : '') + '" ';
  html += 'data-habit-id="' + habit.id + '" ';
  if (habit.isGroupHabit) {
    html += 'data-group-habit-id="' + habit.groupHabitId + '" data-group-id="' + habit.groupId + '" ';
  }
  html += 'data-testid="checkbox-habit-' + habit.id + '">';
  html += isCompleted ? checkIcon : '';
  html += '</div>';
  
  html += '<div class="habit-info">';
  html += '<div class="habit-name-row">';
  html += '<span class="habit-name ' + (isCompleted ? 'completed' : '') + '">' + escapeHtml(habit.name) + '</span>';
  html += '<span class="habit-category-badge" style="background-color: ' + category.color + '20; color: ' + category.color + '">' + category.name + '</span>';
  if (habit.isGroupHabit) {
    html += '<span class="habit-group-badge" title="Nawyk grupowy: ' + escapeHtml(habit.groupName) + '">';
    html += '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
    html += ' ' + escapeHtml(habit.groupName);
    html += '</span>';
  }
  var daysText = formatDaysOfWeek(habit.daysOfWeek);
  if (daysText) {
    html += '<span class="habit-days-badge" title="Zaplanowane dni">';
    html += '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
    html += ' ' + daysText;
    html += '</span>';
  }
  html += '</div>';
  
  html += '<div class="habit-meta">';
  if (stats.streak > 0) {
    html += '<span class="habit-streak" data-testid="streak-' + habit.id + '">' + fireIcon + ' ' + stats.streak + ' dni</span>';
  }
  if (badges.length > 0) {
    html += '<span class="habit-badges">';
    badges.forEach(function(badge) {
      var iconSvg = ICONS[badge.icon] || ICONS.star;
      html += '<span class="badge-icon" title="' + badge.name + '">' + iconSvg + '</span>';
    });
    html += '</span>';
  }
  html += '</div>';
  
  html += '<div class="habit-goal-progress">';
  html += '<div class="goal-label">Cel: ' + stats.completedDays + '/' + stats.weeklyGoal + ' dni</div>';
  html += '<div class="goal-bar">';
  html += '<div class="goal-bar-fill" style="width: ' + stats.goalProgress + '%; background-color: ' + (stats.goalProgress >= 100 ? 'hsl(160, 100%, 36%)' : category.color) + '"></div>';
  html += '</div>';
  html += '</div>';
  
  html += '</div>';
  
  if (!readOnly && !habit.isGroupHabit) {
    html += '<div class="habit-actions">';
    html += '<button class="habit-delete-btn" data-habit-id="' + habit.id + '" data-testid="button-delete-' + habit.id + '" aria-label="Usuń nawyk">';
    html += deleteIcon;
    html += '</button></div>';
  }
  
  html += '</div>';
  html += '</div>';
  return html;
}

function renderCategoryFilter() {
  var container = document.getElementById('category-filter');
  if (!container) return;
  
  var allHabits = getAllHabits();
  var html = '<button class="category-btn ' + (activeCategory === 'all' ? 'active' : '') + '" data-category="all" data-testid="filter-all">Wszystkie</button>';
  
  CATEGORIES.forEach(function(cat) {
    var count = allHabits.filter(function(h) { return h.category === cat.id; }).length;
    html += '<button class="category-btn ' + (activeCategory === cat.id ? 'active' : '') + '" data-category="' + cat.id + '" data-testid="filter-' + cat.id + '">';
    html += cat.name + ' (' + count + ')';
    html += '</button>';
  });
  
  container.innerHTML = html;
}

function getAllHabits() {
  var allHabits = habits.slice();
  myGroupHabits.forEach(function(gh) {
    allHabits.push({
      id: 'group-' + gh.id,
      name: gh.name,
      category: gh.category,
      weeklyGoal: gh.weeklyGoal,
      daysOfWeek: gh.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
      createdAt: gh.createdAt,
      isGroupHabit: true,
      groupHabitId: gh.id,
      groupId: gh.groupId,
      groupName: gh.groupName
    });
  });
  return allHabits;
}

function getFilteredHabits() {
  var allHabits = getAllHabits();
  if (activeCategory === 'all') return allHabits;
  return allHabits.filter(function(h) { return h.category === activeCategory; });
}

function renderHabitsList() {
  var container = document.getElementById('habits-list');
  var emptyState = document.getElementById('empty-habits');
  var countEl = document.getElementById('habits-count');
  
  if (!container || !emptyState || !countEl) return;
  
  var allHabits = getAllHabits();
  countEl.textContent = String(allHabits.length);
  renderCategoryFilter();
  
  var filteredHabits = getFilteredHabits();
  
  if (filteredHabits.length === 0) {
    container.classList.add('hidden');
    emptyState.classList.remove('hidden');
    var subtext = document.getElementById('empty-subtext');
    if (subtext) {
      if (allHabits.length === 0) {
        subtext.textContent = readOnly 
          ? 'Ten dashboard jest pusty' 
          : 'Dodaj swój pierwszy nawyk powyżej';
      } else {
        subtext.textContent = 'Brak nawyków w tej kategorii';
      }
    }
    return;
  }
  
  container.classList.remove('hidden');
  emptyState.classList.add('hidden');
  
  var today = getTodayDateString();
  container.innerHTML = filteredHabits.map(function(habit) {
    return renderHabitCard(habit, today);
  }).join('');
}

function isHabitScheduledForDay(habit, dayOfWeek) {
  if (!habit.daysOfWeek || habit.daysOfWeek.length === 0) {
    return true;
  }
  return habit.daysOfWeek.indexOf(dayOfWeek) !== -1;
}

function renderDailyView() {
  var grid = document.getElementById('daily-habits-grid');
  var todayDateEl = document.getElementById('today-date');
  if (!grid || !todayDateEl) return;
  
  var today = getTodayDateString();
  todayDateEl.textContent = formatTodayDate();
  
  var allHabits = getAllHabits();
  var todayDayOfWeek = new Date().getDay();
  
  var todaysHabits = allHabits.filter(function(habit) {
    return isHabitScheduledForDay(habit, todayDayOfWeek);
  });
  
  if (todaysHabits.length === 0) {
    grid.innerHTML = '<p class="empty-text" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">Brak nawyków zaplanowanych na dziś</p>';
    return;
  }
  
  var checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  var fireIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>';
  
  grid.innerHTML = todaysHabits.map(function(habit) {
    var isCompleted = isHabitCompletedOnDate(habit.id, today);
    var category = getCategoryInfo(habit.category);
    var streak = getHabitStreak(habit.id);
    
    var html = '<div class="daily-habit-item ' + (isCompleted ? 'completed' : '') + ' ' + (readOnly ? 'disabled' : '') + '" ';
    html += 'data-habit-id="' + habit.id + '" ';
    if (habit.isGroupHabit) {
      html += 'data-group-habit-id="' + habit.groupHabitId + '" data-group-id="' + habit.groupId + '" ';
    }
    html += 'data-testid="daily-habit-' + habit.id + '" style="border-left: 3px solid ' + category.color + '">';
    html += '<div class="habit-checkbox ' + (isCompleted ? 'checked' : '') + '" style="width: 1rem; height: 1rem;">';
    html += isCompleted ? checkIcon : '';
    html += '</div>';
    html += '<span class="daily-habit-name">' + escapeHtml(habit.name) + '</span>';
    if (streak > 0) {
      html += '<span class="daily-streak">' + fireIcon + ' ' + streak + '</span>';
    }
    if (habit.isGroupHabit) {
      html += '<span class="daily-group-indicator" title="' + escapeHtml(habit.groupName) + '">';
      html += '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
      html += '</span>';
    }
    html += '</div>';
    
    return html;
  }).join('');
}

function renderInsights() {
  var container = document.getElementById('insights-panel');
  if (!container) return;
  
  var allHabits = getAllHabits();
  if (allHabits.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  var stats = getAllHabitsStats();
  
  var bestHabit = stats.reduce(function(best, current) {
    return current.percentage > best.percentage ? current : best;
  }, stats[0]);
  
  var totalCompletionsThisWeek = stats.reduce(function(sum, s) { return sum + s.completedDays; }, 0);
  var totalScheduledThisWeek = stats.reduce(function(sum, s) { return sum + (s.totalScheduledDays || 7); }, 0);
  var weeklyAverage = totalScheduledThisWeek > 0 ? Math.round((totalCompletionsThisWeek / totalScheduledThisWeek) * 100) : 0;
  
  var longestStreak = stats.reduce(function(max, s) { return s.streak > max ? s.streak : max; }, 0);
  
  var totalBadges = achievements.length;
  
  var html = '<div class="insights-grid">';
  
  html += '<div class="insight-card">';
  html += '<div class="insight-icon">' + ICONS.medal + '</div>';
  html += '<div class="insight-content">';
  html += '<div class="insight-value">' + bestHabit.habitName + '</div>';
  html += '<div class="insight-label">Najlepszy nawyk (' + bestHabit.percentage + '%)</div>';
  html += '</div></div>';
  
  html += '<div class="insight-card">';
  html += '<div class="insight-icon">' + ICONS.chart + '</div>';
  html += '<div class="insight-content">';
  html += '<div class="insight-value">' + weeklyAverage + '%</div>';
  html += '<div class="insight-label">Średnia tygodniowa</div>';
  html += '</div></div>';
  
  html += '<div class="insight-card">';
  html += '<div class="insight-icon">' + ICONS.fire + '</div>';
  html += '<div class="insight-content">';
  html += '<div class="insight-value">' + longestStreak + ' dni</div>';
  html += '<div class="insight-label">Najdłuższa seria</div>';
  html += '</div></div>';
  
  html += '<div class="insight-card">';
  html += '<div class="insight-icon">' + ICONS.trophy + '</div>';
  html += '<div class="insight-content">';
  html += '<div class="insight-value">' + totalBadges + '</div>';
  html += '<div class="insight-label">Zdobyte odznaki</div>';
  html += '</div></div>';
  
  html += '</div>';
  
  container.innerHTML = html;
}

function updateCharts() {
  var statsEmpty = document.getElementById('stats-empty');
  var statsCharts = document.getElementById('stats-charts');
  
  if (!statsEmpty || !statsCharts) return;
  
  var allHabits = getAllHabits();
  if (allHabits.length === 0) {
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
          backgroundColor: stats.map(function(s) { 
            var cat = getCategoryInfo(s.category);
            return cat.color;
          }),
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
    var dayOfWeek = new Date(date).getDay();
    var scheduledHabits = allHabits.filter(function(habit) {
      return isHabitScheduledForDay(habit, dayOfWeek);
    });
    if (scheduledHabits.length === 0) return 0;
    var completedOnDay = scheduledHabits.filter(function(habit) {
      return isHabitCompletedOnDate(habit.id, date);
    }).length;
    return Math.round((completedOnDay / scheduledHabits.length) * 100);
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
  
  renderInsights();
}

function getSelectedDays(checkboxName) {
  var checkboxes = document.querySelectorAll('input[name="' + checkboxName + '"]:checked');
  var days = [];
  checkboxes.forEach(function(cb) {
    days.push(parseInt(cb.value, 10));
  });
  return days.length > 0 ? days : [0, 1, 2, 3, 4, 5, 6];
}

function resetDayCheckboxes(checkboxName) {
  var checkboxes = document.querySelectorAll('input[name="' + checkboxName + '"]');
  checkboxes.forEach(function(cb) {
    cb.checked = true;
  });
}

function handleAddHabit(e) {
  e.preventDefault();
  var input = document.getElementById('habit-input');
  var categorySelect = document.getElementById('habit-category');
  
  var name = input ? input.value.trim() : '';
  var category = categorySelect ? categorySelect.value : 'other';
  var daysOfWeek = getSelectedDays('habit-day');
  var weeklyGoal = daysOfWeek.length;
  
  if (name) {
    addHabit(name, category, weeklyGoal, daysOfWeek);
    input.value = '';
    if (categorySelect) categorySelect.value = 'other';
    resetDayCheckboxes('habit-day');
    renderAll();
  }
}

async function handleToggleHabit(habitId, groupHabitId, groupId) {
  if (readOnly) return;
  var today = getTodayDateString();
  
  if (groupHabitId && groupId) {
    await toggleGroupHabitCompletion(groupHabitId, groupId, today);
    renderAll();
  } else {
    toggleHabitCompletion(habitId, today);
    renderAll();
  }
}

function handleDeleteHabit(habitId) {
  if (readOnly) return;
  deleteHabit(habitId);
  renderAll();
}

function handleCategoryFilter(categoryId) {
  activeCategory = categoryId;
  renderHabitsList();
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
        var groupHabitId = checkbox.dataset.groupHabitId;
        var groupId = checkbox.dataset.groupId;
        if (habitId) handleToggleHabit(habitId, groupHabitId, groupId);
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
        var groupHabitId = habitItem.dataset.groupHabitId;
        var groupId = habitItem.dataset.groupId;
        if (habitId) handleToggleHabit(habitId, groupHabitId, groupId);
      }
    });
  }
  
  var categoryFilter = document.getElementById('category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('click', function(e) {
      var btn = e.target.closest('.category-btn');
      if (btn) {
        var category = btn.dataset.category;
        if (category) handleCategoryFilter(category);
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
      achievements = sharedData.achievements || [];
    } else {
      habits = [];
      completions = [];
      achievements = [];
    }
  } else {
    readOnly = false;
    var data = getStorageData();
    habits = data.habits || [];
    completions = data.completions || [];
    achievements = data.achievements || [];
    
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
  
  checkAndUpdateAchievements();
  renderAll();
  
  if (shareLoadError) {
    showShareLoadError();
  }
  
  initGroups();
}

var currentUser = null;
var groups = [];
var currentGroup = null;
var groupCompletions = [];
var myGroupHabits = [];
var myGroupHabitCompletions = [];

async function checkAuthStatus() {
  try {
    var response = await fetch('/api/auth/user', { credentials: 'include' });
    if (response.ok) {
      currentUser = await response.json();
      return true;
    }
  } catch (e) {
    console.log('Not authenticated');
  }
  currentUser = null;
  return false;
}

function updateAuthUI() {
  var loginBtn = document.getElementById('login-btn');
  var userInfo = document.getElementById('user-info');
  var userAvatar = document.getElementById('user-avatar');
  var userName = document.getElementById('user-name');
  var groupsLoginPrompt = document.getElementById('groups-login-prompt');
  var groupsPanel = document.getElementById('groups-panel');
  
  if (currentUser) {
    if (loginBtn) loginBtn.classList.add('hidden');
    if (userInfo) userInfo.classList.remove('hidden');
    if (userAvatar) userAvatar.src = currentUser.profileImageUrl || '';
    if (userName) {
      var displayName = currentUser.firstName || currentUser.email || 'Użytkownik';
      userName.textContent = displayName;
    }
    if (groupsLoginPrompt) groupsLoginPrompt.classList.add('hidden');
    if (groupsPanel) groupsPanel.classList.remove('hidden');
  } else {
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (userInfo) userInfo.classList.add('hidden');
    if (groupsLoginPrompt) groupsLoginPrompt.classList.remove('hidden');
    if (groupsPanel) groupsPanel.classList.add('hidden');
  }
}

async function fetchGroups() {
  if (!currentUser) return;
  try {
    var response = await fetch('/api/groups', { credentials: 'include' });
    if (response.ok) {
      groups = await response.json();
      renderGroupsList();
    }
  } catch (e) {
    console.error('Error fetching groups:', e);
  }
}

async function fetchMyGroupHabits() {
  if (!currentUser) return;
  try {
    var response = await fetch('/api/my-group-habits', { credentials: 'include' });
    if (response.ok) {
      var data = await response.json();
      myGroupHabits = data.habits;
      myGroupHabitCompletions = data.completions;
      renderHabitsList();
      renderDailyView();
      updateCharts();
      renderInsights();
    }
  } catch (e) {
    console.error('Error fetching group habits:', e);
  }
}

function renderGroupsList() {
  var groupsList = document.getElementById('groups-list');
  var groupsEmpty = document.getElementById('groups-empty');
  
  if (!groupsList) return;
  
  if (groups.length === 0) {
    groupsList.innerHTML = '';
    if (groupsEmpty) groupsEmpty.classList.remove('hidden');
    return;
  }
  
  if (groupsEmpty) groupsEmpty.classList.add('hidden');
  
  var html = '';
  groups.forEach(function(group) {
    var isActive = currentGroup && currentGroup.id === group.id;
    html += '<div class="group-item' + (isActive ? ' active' : '') + '" data-group-id="' + group.id + '" data-testid="group-item-' + group.id + '">';
    html += '<div class="group-item-icon">';
    html += '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
    html += '</div>';
    html += '<div class="group-item-info">';
    html += '<div class="group-item-name">' + escapeHtml(group.name) + '</div>';
    html += '</div>';
    html += '</div>';
  });
  
  groupsList.innerHTML = html;
}

async function selectGroup(groupId) {
  try {
    var response = await fetch('/api/groups/' + groupId, { credentials: 'include' });
    if (response.ok) {
      currentGroup = await response.json();
      await fetchGroupCompletions(groupId);
      renderGroupDetail();
      renderGroupsList();
    }
  } catch (e) {
    console.error('Error fetching group:', e);
  }
}

async function fetchGroupCompletions(groupId) {
  try {
    var response = await fetch('/api/groups/' + groupId + '/completions', { credentials: 'include' });
    if (response.ok) {
      groupCompletions = await response.json();
    }
  } catch (e) {
    console.error('Error fetching completions:', e);
  }
}

function renderGroupDetail() {
  var groupDetail = document.getElementById('group-detail');
  var groupNameEl = document.getElementById('group-name');
  var groupMembersEl = document.getElementById('group-members');
  var groupHabitsList = document.getElementById('group-habits-list');
  
  if (!currentGroup) {
    if (groupDetail) groupDetail.classList.add('hidden');
    return;
  }
  
  if (groupDetail) groupDetail.classList.remove('hidden');
  if (groupNameEl) groupNameEl.textContent = currentGroup.name;
  
  if (groupMembersEl && currentGroup.members) {
    var membersHtml = '';
    currentGroup.members.forEach(function(member) {
      var user = member.user;
      var name = user ? (user.firstName || user.email || 'Użytkownik') : 'Użytkownik';
      var avatar = user && user.profileImageUrl ? user.profileImageUrl : '';
      membersHtml += '<div class="member-badge">';
      if (avatar) {
        membersHtml += '<img class="member-avatar" src="' + avatar + '" alt="">';
      }
      membersHtml += '<span>' + escapeHtml(name) + '</span>';
      membersHtml += '</div>';
    });
    groupMembersEl.innerHTML = membersHtml;
  }
  
  if (groupHabitsList && currentGroup.habits) {
    var todayStr = getTodayDateString();
    var habitsHtml = '';
    
    if (currentGroup.habits.length === 0) {
      habitsHtml = '<div class="empty-state"><p class="empty-text">Brak nawyków w tej grupie</p></div>';
    } else {
      currentGroup.habits.forEach(function(habit) {
        var category = CATEGORIES.find(function(c) { return c.id === habit.category; }) || CATEGORIES[3];
        
        habitsHtml += '<div class="group-habit-card" style="border-left: 3px solid ' + category.color + '">';
        habitsHtml += '<div class="group-habit-header">';
        habitsHtml += '<span class="group-habit-name">' + escapeHtml(habit.name) + '</span>';
        habitsHtml += '<button class="btn btn-icon btn-sm" data-delete-group-habit="' + habit.id + '" title="Usuń">';
        habitsHtml += '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>';
        habitsHtml += '</button>';
        habitsHtml += '</div>';
        habitsHtml += '<div class="group-habit-completions">';
        
        if (currentGroup.members) {
          currentGroup.members.forEach(function(member) {
            var user = member.user;
            var name = user ? (user.firstName || user.email || '?') : '?';
            var avatar = user && user.profileImageUrl ? user.profileImageUrl : '';
            var isCompleted = groupCompletions.some(function(c) {
              return c.groupHabitId === habit.id && c.userId === member.userId && c.date === todayStr && c.completed;
            });
            var isCurrentUser = currentUser && member.userId === currentUser.id;
            
            habitsHtml += '<div class="member-completion' + (isCompleted ? ' completed' : '') + '"';
            if (isCurrentUser) {
              habitsHtml += ' data-toggle-group-habit="' + habit.id + '" style="cursor: pointer"';
            }
            habitsHtml += '>';
            if (avatar) {
              habitsHtml += '<img class="member-completion-avatar" src="' + avatar + '" alt="">';
            }
            habitsHtml += '<span>' + escapeHtml(name.charAt(0).toUpperCase()) + '</span>';
            if (isCompleted) {
              habitsHtml += '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            }
            habitsHtml += '</div>';
          });
        }
        
        habitsHtml += '</div>';
        habitsHtml += '</div>';
      });
    }
    
    groupHabitsList.innerHTML = habitsHtml;
  }
}

async function createGroup(name, description) {
  try {
    var response = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: name, description: description })
    });
    if (response.ok) {
      var group = await response.json();
      groups.push(group);
      currentGroup = group;
      currentGroup.members = [{ userId: currentUser.id, role: 'admin', user: currentUser }];
      currentGroup.habits = [];
      renderGroupsList();
      renderGroupDetail();
      return true;
    }
  } catch (e) {
    console.error('Error creating group:', e);
  }
  return false;
}

async function joinGroup(inviteCode) {
  try {
    var response = await fetch('/api/groups/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ inviteCode: inviteCode })
    });
    if (response.ok) {
      var group = await response.json();
      groups.push(group);
      await selectGroup(group.id);
      return true;
    } else {
      var error = await response.json();
      alert(error.message || 'Nie udało się dołączyć do grupy');
    }
  } catch (e) {
    console.error('Error joining group:', e);
  }
  return false;
}

async function addGroupHabit(name, category, weeklyGoal, daysOfWeek) {
  if (!currentGroup) return;
  try {
    var response = await fetch('/api/groups/' + currentGroup.id + '/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: name, category: category, weeklyGoal: weeklyGoal, daysOfWeek: daysOfWeek })
    });
    if (response.ok) {
      var habit = await response.json();
      currentGroup.habits.push(habit);
      renderGroupDetail();
      await fetchMyGroupHabits();
    }
  } catch (e) {
    console.error('Error adding habit:', e);
  }
}

async function deleteGroupHabit(habitId) {
  if (!currentGroup) return;
  try {
    var response = await fetch('/api/groups/' + currentGroup.id + '/habits/' + habitId, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (response.ok) {
      currentGroup.habits = currentGroup.habits.filter(function(h) { return h.id !== habitId; });
      renderGroupDetail();
    }
  } catch (e) {
    console.error('Error deleting habit:', e);
  }
}

async function toggleGroupHabit(habitId) {
  if (!currentGroup || !currentUser) return;
  try {
    var todayStr = getTodayDateString();
    var response = await fetch('/api/groups/' + currentGroup.id + '/habits/' + habitId + '/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ date: todayStr })
    });
    if (response.ok) {
      await fetchGroupCompletions(currentGroup.id);
      renderGroupDetail();
    }
  } catch (e) {
    console.error('Error toggling habit:', e);
  }
}

function openModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

function setupGroupsEventDelegation() {
  var groupsList = document.getElementById('groups-list');
  if (groupsList) {
    groupsList.addEventListener('click', function(e) {
      var groupItem = e.target.closest('[data-group-id]');
      if (groupItem) {
        var groupId = parseInt(groupItem.dataset.groupId);
        selectGroup(groupId);
      }
    });
  }
  
  var groupHabitsList = document.getElementById('group-habits-list');
  if (groupHabitsList) {
    groupHabitsList.addEventListener('click', function(e) {
      var toggleBtn = e.target.closest('[data-toggle-group-habit]');
      if (toggleBtn) {
        var habitId = parseInt(toggleBtn.dataset.toggleGroupHabit);
        toggleGroupHabit(habitId);
        return;
      }
      
      var deleteBtn = e.target.closest('[data-delete-group-habit]');
      if (deleteBtn) {
        var habitId = parseInt(deleteBtn.dataset.deleteGroupHabit);
        if (confirm('Czy na pewno chcesz usunąć ten nawyk?')) {
          deleteGroupHabit(habitId);
        }
      }
    });
  }
  
  var createGroupBtn = document.getElementById('create-group-btn');
  if (createGroupBtn) {
    createGroupBtn.addEventListener('click', function() {
      openModal('create-group-modal');
    });
  }
  
  var joinGroupBtn = document.getElementById('join-group-btn');
  if (joinGroupBtn) {
    joinGroupBtn.addEventListener('click', function() {
      openModal('join-group-modal');
    });
  }
  
  var showInviteBtn = document.getElementById('show-invite-btn');
  if (showInviteBtn) {
    showInviteBtn.addEventListener('click', function() {
      if (currentGroup) {
        var inviteCodeDisplay = document.getElementById('invite-code-display');
        if (inviteCodeDisplay) inviteCodeDisplay.value = currentGroup.inviteCode;
        openModal('invite-modal');
      }
    });
  }
  
  var createGroupForm = document.getElementById('create-group-form');
  if (createGroupForm) {
    createGroupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var nameInput = document.getElementById('new-group-name');
      var descInput = document.getElementById('new-group-description');
      var name = nameInput.value.trim();
      var desc = descInput.value.trim();
      if (name) {
        var success = await createGroup(name, desc);
        if (success) {
          closeModal('create-group-modal');
          nameInput.value = '';
          descInput.value = '';
        }
      }
    });
  }
  
  var joinGroupForm = document.getElementById('join-group-form');
  if (joinGroupForm) {
    joinGroupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var codeInput = document.getElementById('invite-code-input');
      var code = codeInput.value.trim();
      if (code) {
        var success = await joinGroup(code);
        if (success) {
          closeModal('join-group-modal');
          codeInput.value = '';
        }
      }
    });
  }
  
  var addGroupHabitForm = document.getElementById('add-group-habit-form');
  if (addGroupHabitForm) {
    addGroupHabitForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var nameInput = document.getElementById('group-habit-input');
      var categorySelect = document.getElementById('group-habit-category');
      var name = nameInput.value.trim();
      var category = categorySelect.value;
      var daysOfWeek = getSelectedDays('group-habit-day');
      var goal = daysOfWeek.length;
      if (name) {
        addGroupHabit(name, category, goal, daysOfWeek);
        nameInput.value = '';
        resetDayCheckboxes('group-habit-day');
      }
    });
  }
  
  var copyInviteBtn = document.getElementById('copy-invite-btn');
  if (copyInviteBtn) {
    copyInviteBtn.addEventListener('click', function() {
      var inviteCodeDisplay = document.getElementById('invite-code-display');
      if (inviteCodeDisplay) {
        navigator.clipboard.writeText(inviteCodeDisplay.value);
        var successMsg = document.getElementById('invite-copy-success');
        if (successMsg) {
          successMsg.classList.remove('hidden');
          setTimeout(function() { successMsg.classList.add('hidden'); }, 2000);
        }
      }
    });
  }
  
  document.querySelectorAll('.modal-close-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var modal = btn.closest('.modal');
      if (modal) modal.classList.add('hidden');
    });
  });
  
  document.querySelectorAll('.modal-backdrop').forEach(function(backdrop) {
    backdrop.addEventListener('click', function() {
      var modal = backdrop.closest('.modal');
      if (modal) modal.classList.add('hidden');
    });
  });
  
  var tabPersonal = document.getElementById('tab-personal');
  var tabGroups = document.getElementById('tab-groups');
  var personalContent = document.getElementById('personal-content');
  var groupsContent = document.getElementById('groups-content');
  
  if (tabPersonal) {
    tabPersonal.addEventListener('click', async function() {
      tabPersonal.classList.add('active');
      if (tabGroups) tabGroups.classList.remove('active');
      if (personalContent) {
        personalContent.classList.add('active');
        personalContent.classList.remove('hidden');
      }
      if (groupsContent) {
        groupsContent.classList.remove('active');
        groupsContent.classList.add('hidden');
      }
      if (currentUser) {
        await fetchMyGroupHabits();
      }
    });
  }
  
  if (tabGroups) {
    tabGroups.addEventListener('click', function() {
      tabGroups.classList.add('active');
      if (tabPersonal) tabPersonal.classList.remove('active');
      if (groupsContent) {
        groupsContent.classList.add('active');
        groupsContent.classList.remove('hidden');
      }
      if (personalContent) {
        personalContent.classList.remove('active');
        personalContent.classList.add('hidden');
      }
    });
  }
}

async function initGroups() {
  var isAuth = await checkAuthStatus();
  updateAuthUI();
  setupGroupsEventDelegation();
  
  if (isAuth) {
    await fetchGroups();
    await fetchMyGroupHabits();
  }
}

document.addEventListener('DOMContentLoaded', init);
