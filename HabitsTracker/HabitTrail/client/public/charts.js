// ================================
// HABITS TRACKER - CHARTS MODULE
// ================================

// Chart instances
let completionChart = null;
let habitsBarChart = null;

// Get current chart colors based on theme
function getChartColors() {
    const isDark = document.body.classList.contains('dark-mode');
    
    if (isDark) {
        return {
            primary: '#60a5fa',
            success: '#34d399',
            warning: '#fbbf24',
            purple: '#a78bfa',
            pink: '#f472b6',
            grid: '#475569',
            text: '#cbd5e1'
        };
    } else {
        return {
            primary: '#3b82f6',
            success: '#10b981',
            warning: '#f59e0b',
            purple: '#8b5cf6',
            pink: '#ec4899',
            grid: '#e5e7eb',
            text: '#6b7280'
        };
    }
}

/**
 * Get completion data for last 7 days
 */
function getCompletionDataForChart() {
    const app = window.habitsApp;
    if (!app) return { labels: [], data: [] };
    
    const dates = app.getLastNDays(7);
    const labels = [];
    const data = [];
    
    dates.forEach(date => {
        // Format date to day name (Mon, Tue, etc.)
        const dateObj = new Date(date + 'T00:00:00');
        const dayName = dateObj.toLocaleDateString('pl-PL', { weekday: 'short' });
        labels.push(dayName.charAt(0).toUpperCase() + dayName.slice(1));
        
        // Calculate completion percentage for this day
        if (app.state.habits.length === 0) {
            data.push(0);
        } else {
            let completed = 0;
            app.state.habits.forEach(habit => {
                if (app.isHabitCompleted(habit.id, date)) {
                    completed++;
                }
            });
            const percentage = Math.round((completed / app.state.habits.length) * 100);
            data.push(percentage);
        }
    });
    
    return { labels, data };
}

/**
 * Get habits completion data for bar chart
 */
function getHabitsCompletionData() {
    const app = window.habitsApp;
    if (!app) return { labels: [], data: [] };
    
    const labels = [];
    const data = [];
    const chartColors = getChartColors();
    const colors = [
        chartColors.primary,
        chartColors.success,
        chartColors.warning,
        chartColors.purple,
        chartColors.pink
    ];
    
    app.state.habits.forEach(habit => {
        labels.push(habit.name);
        const count = app.getCompletionCount(habit.id, 7);
        data.push(count);
    });
    
    return { labels, data, colors };
}

/**
 * Render 7-day completion chart
 */
function renderCompletionChart() {
    const canvas = document.getElementById('completion-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const chartData = getCompletionDataForChart();
    const colors = getChartColors();
    
    // Destroy existing chart if it exists
    if (completionChart) {
        completionChart.destroy();
    }
    
    completionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Realizacja (%)',
                data: chartData.data,
                borderColor: colors.primary,
                backgroundColor: colors.primary + '20',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: colors.primary,
                pointBorderColor: document.body.classList.contains('dark-mode') ? '#1e293b' : '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        size: 13
                    },
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + '% zrealizowane';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        color: colors.text,
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: colors.grid,
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: colors.text,
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            }
        }
    });
}

/**
 * Render habits completion bar chart
 */
function renderHabitsBarChart() {
    const canvas = document.getElementById('habits-bar-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const chartData = getHabitsCompletionData();
    const colors = getChartColors();
    
    // Destroy existing chart if it exists
    if (habitsBarChart) {
        habitsBarChart.destroy();
    }
    
    // Create gradient colors for bars
    const backgroundColors = chartData.data.map((value, index) => {
        const colorIndex = index % chartData.colors.length;
        return chartData.colors[colorIndex];
    });
    
    habitsBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Dni zrealizowane',
                data: chartData.data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 0,
                borderRadius: 6,
                barThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        size: 13
                    },
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' z 7 dni';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 7,
                    ticks: {
                        stepSize: 1,
                        color: colors.text,
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: colors.grid,
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: colors.text,
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        maxRotation: 45,
                        minRotation: 0
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            }
        }
    });
}

/**
 * Update all charts
 */
function updateCharts() {
    renderCompletionChart();
    renderHabitsBarChart();
}

// Export functions to window
window.renderCompletionChart = renderCompletionChart;
window.renderHabitsBarChart = renderHabitsBarChart;
window.updateCharts = updateCharts;
