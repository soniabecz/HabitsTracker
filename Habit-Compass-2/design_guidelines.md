# Habits Tracker - Design Guidelines

## Design Approach

**Selected Approach:** Design System - Drawing inspiration from Linear, Notion, and Todoist for clean, data-focused productivity interfaces.

**Design Principles:**
- Clarity over decoration - every element serves a purpose
- Data-first hierarchy - statistics and tracking are primary
- Efficient interactions - minimal clicks to complete actions
- Scannable layouts - quick daily habit review

---

## Typography

**Font Family:** 
- Primary: Inter (via Google Fonts CDN)
- Fallback: system-ui, -apple-system, sans-serif

**Type Scale:**
- Page Title: text-3xl font-bold (Dashboard heading)
- Section Headers: text-xl font-semibold (Statistics, Daily View)
- Habit Names: text-base font-medium
- Body Text: text-sm
- Labels/Meta: text-xs text-gray-600

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, 8, 12** (e.g., p-4, gap-6, m-8)

**Container Structure:**
- Max width: max-w-6xl mx-auto
- Page padding: px-4 md:px-8
- Section spacing: space-y-8 between major sections
- Card padding: p-6

**Grid Systems:**
- Desktop: 2-column layout (habits list 60% / stats panel 40%)
- Mobile: Single column stack
- Habit cards: Grid gap-4

---

## Component Library

### 1. Dashboard Header
- Fixed top bar with app title
- Add Habit button (primary action, top-right)
- Padding: py-4
- Border bottom separator

### 2. Habit Cards
- Individual card per habit
- Layout: Checkbox (left) + Habit name (center) + Delete icon (right)
- Card structure: Rounded corners (rounded-lg), subtle border
- Spacing: p-4, gap-3 between elements
- Hover state: Subtle elevation increase

### 3. Add Habit Form
- Inline form with input field + submit button
- Input: Full width on mobile, constrained on desktop (max-w-md)
- Button: Compact, aligned right
- Form spacing: gap-3

### 4. Statistics Panel
- Card container with rounded-lg
- Chart.js canvas with aspect ratio 16:9
- Legend positioned below chart
- Section header: text-lg font-semibold mb-4

### 5. Daily View Table/Grid
- Grid layout: grid-cols-1 md:grid-cols-2 gap-4
- Each habit tile: p-4, rounded border
- Status indicator: Large checkbox or checkmark visual
- Habit completion rate: Displayed as small badge

### 6. Navigation Tabs (if multiple views)
- Horizontal tab bar
- Active state: Border-bottom indicator
- Tab spacing: px-4 py-2

---

## Icons

**Library:** Heroicons (via CDN)
- Checkbox states: check-circle (complete), circle (incomplete)
- Delete: trash
- Add: plus-circle
- Stats: chart-bar

---

## Animations

**Minimal Motion:**
- Checkbox toggle: Simple scale transform (0.95 → 1.0, 100ms)
- Card hover: Subtle shadow increase (150ms ease)
- Chart transitions: Use Chart.js default animations only
- NO scroll-triggered animations or complex motion

---

## Responsive Breakpoints

**Mobile (< 768px):**
- Single column layout
- Full-width cards
- Stacked statistics charts
- Larger touch targets (min-h-12 for checkboxes)

**Desktop (≥ 768px):**
- 2-column dashboard layout
- Side-by-side habit list + stats panel
- Compact habit cards (2-3 per row option)

---

## Accessibility

- All checkboxes: aria-label with habit name
- Keyboard navigation: Tab through all interactive elements
- Focus indicators: Ring utility (focus:ring-2)
- Color contrast: Text meets WCAG AA standards
- Form labels: Properly associated with inputs

---

## Page Structure

1. **Header Section** (fixed/sticky)
   - App title + primary CTA
   
2. **Main Dashboard** (2-column on desktop)
   - Left: Habits list with add form at top
   - Right: Statistics panel with Chart.js visualization
   
3. **Daily View Section** (below or tabbed)
   - Grid of today's habits with completion status
   
4. **Footer** (minimal)
   - Data stored locally message
   - Optional: Export/share link functionality

---

## Data Visualization

**Chart.js Implementation:**
- Use bar chart for 7-day habit completion
- Use line chart for percentage trends
- Consistent chart padding and spacing
- Tooltip enabled for detailed data
- Responsive: maintainAspectRatio: true

---

## Images

**No hero images required** - This is a utility dashboard focused on data and functionality, not marketing content.