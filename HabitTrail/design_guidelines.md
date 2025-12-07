# Habits Tracker Dashboard - Design Guidelines

## Design Approach

**System-Based Approach**: Drawing from Linear's clean dashboard aesthetics and Notion's productivity-focused design patterns. The interface prioritizes clarity, scannable information, and effortless daily interaction over visual flourishes.

**Core Principles**:
- Information hierarchy: Habits list takes priority, stats are secondary
- Immediate action: Checkboxes accessible without scrolling
- Data clarity: Statistics presented with clean charts and clear labels
- Minimal cognitive load: Consistent patterns, predictable interactions

---

## Typography System

**Font Stack**: Inter or DM Sans via Google Fonts
- **Dashboard Title**: 28px/32px, semibold (600)
- **Section Headers**: 20px/24px, semibold (600)
- **Habit Names**: 16px/24px, medium (500)
- **Body/Helper Text**: 14px/20px, regular (400)
- **Stat Numbers**: 32px/40px, bold (700)
- **Chart Labels**: 12px/16px, medium (500)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-4 to p-6
- Section gaps: gap-8 to gap-12
- Card spacing: p-6
- Form field spacing: space-y-4

**Container Structure**:
- Max-width: 1200px centered
- Side padding: px-4 (mobile), px-8 (desktop)
- Dashboard grid: Single column on mobile, 2-column on desktop (70/30 split for main content/sidebar stats)

---

## Component Library

### Dashboard Header
- Full-width bar with app title left-aligned
- "Add Habit" button right-aligned
- Bottom border separator
- Height: 64px with centered content

### Habit Card/Row
**Layout**: Horizontal flexbox with space-between
- Habit name (left): Medium weight, 16px
- Checkbox (right): 24px × 24px with rounded corners (4px)
- Card background: Subtle elevation with 1px border
- Padding: p-4 to p-6
- Gap between cards: gap-3
- Hover state: Slight shadow increase
- Delete icon: Small "×" button (16px) positioned top-right of card, appears on hover

### Add Habit Form
**Modal/Inline Form**:
- Input field: Height 44px, rounded corners (6px)
- Placeholder text: "Enter habit name..."
- Submit button: Height 44px, medium weight text
- Cancel/Close option if modal
- Form width: 100% on mobile, max 400px on desktop

### Statistics Section
**Chart Container**:
- Each chart in its own card with padding p-6
- Chart title above graph (16px, medium)
- Chart height: 300px on desktop, 240px on mobile
- Grid layout: 1 column mobile, 2 columns desktop for multiple charts
- Legend positioned at bottom of chart

**Stat Cards** (for quick metrics):
- Small cards showing "X days completed this week"
- Number large (32px, bold), label small (14px)
- Grid: 2 columns mobile, 4 columns desktop
- Padding: p-4

### Navigation/Tabs
**View Switcher**:
- Horizontal tab bar beneath header
- Tab items: Padding px-6 py-3
- Active tab: Underline indicator (2px thick)
- Tabs: "Daily View" | "Statistics" | "All Habits"

### Empty States
- Centered icon (48px) with text below
- Message: "No habits yet. Add your first habit to get started!"
- CTA button below message

---

## Responsive Behavior

**Mobile (< 768px)**:
- Single column layout
- Habits stacked vertically with full-width cards
- Statistics: Charts stack vertically, one per row
- Add button: Fixed bottom-right floating action button option OR inline at top
- Stat cards: 2-column grid maximum

**Desktop (≥ 768px)**:
- Two-column layout: Main habits list (70%) + Quick stats sidebar (30%)
- Statistics page: 2-column chart grid
- Habits: Card-based grid or list (user preference)
- Max 3 habits per row if grid view

---

## Interactive States

**Checkboxes**:
- Unchecked: Empty with border
- Checked: Filled with checkmark icon
- Smooth transition: 150ms ease
- Click target: Entire habit card, not just checkbox

**Buttons**:
- Default: Solid background
- Hover: Slight opacity change (0.9)
- Active: Scale down slightly (0.98)
- Focus: Outline ring (2px offset)

**Delete Action**:
- Icon button appears on card hover (desktop)
- Always visible on mobile
- Confirmation: Brief shake animation or confirmation modal for permanent delete

---

## Data Visualization (Chart.js)

**7-Day Completion Chart**:
- Line chart with points showing daily completion percentage
- X-axis: Day labels (Mon, Tue, Wed...)
- Y-axis: Percentage (0-100%)
- Grid lines: Subtle horizontal lines
- Point size: 4px, line width: 2px

**Habit Completion Bar Chart**:
- Vertical bars showing days completed per habit
- X-axis: Habit names (truncate if long)
- Y-axis: Number of days
- Bar width: 40px with 12px gap

**Chart Styling**:
- Clean, minimal axes
- Subtle grid lines
- Responsive font sizes
- Tooltips on hover with exact values

---

## Images

**No hero images needed** - This is a functional dashboard, not a marketing page.

**Optional Enhancement**: Small motivational icons (24-32px) next to habit names or in empty states can be sourced from Heroicons library.

---

## Accessibility

- Checkbox states announced to screen readers
- Form labels properly associated with inputs
- Keyboard navigation: Tab through habits, Enter/Space to toggle
- Focus indicators visible on all interactive elements
- Chart data available in text format for screen readers