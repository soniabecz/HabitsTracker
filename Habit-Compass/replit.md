# Habits Tracker - Projekt dokumentacja

## Przegląd
Aplikacja Habits Tracker to kompletna aplikacja webowa do śledzenia codziennych nawyków z:
- Codziennym śledzeniem nawyków z wizualnym potwierdzeniem
- Wizualizacją statystyk za pomocą Chart.js (wykres słupkowy i liniowy)
- Przechowywaniem danych w localStorage (persystencja między sesjami)
- Responsywnym designem (mobile + desktop)
- Możliwością udostępniania linków do dashboardu w trybie tylko-do-odczytu
- Interfejsem w języku polskim

## Architektura projektu

### Frontend (Vanilla JavaScript + Vite)
- `client/index.html` - Główna strona HTML z całą strukturą UI
- `client/src/main.js` - Główna logika aplikacji w czystym JavaScript (bez TypeScript):
  - Zarządzanie stanem (habits, completions)
  - Renderowanie UI (renderHabitsList, renderDailyView, updateCharts)
  - Obsługa zdarzeń (delegacja zdarzeń dla wydajności)
  - Integracja z Chart.js dla wykresów
- `client/src/styles.css` - Style CSS z obsługą dark mode

### Przechowywanie danych
Funkcje w `client/src/main.js`:
- `getStorageData()` / `saveStorageData()` - Odczyt/zapis danych w localStorage
- `addHabit()` / `deleteHabit()` - Operacje CRUD na nawykach
- `toggleHabitCompletion()` - Przełączanie stanu wykonania
- `generateShareableLink()` / `loadFromShareableLink()` - Funkcje udostępniania

### Schema danych (localStorage key: "habits-tracker-data")
```javascript
// Habit object
{
  id: "abc123",      // unique identifier
  name: "Ćwiczenia"  // habit name (supports Polish characters)
}

// HabitCompletion object
{
  habitId: "abc123",
  date: "2025-12-07",  // format YYYY-MM-DD
  completed: true
}

// HabitsData structure
{
  habits: [],       // array of Habit objects
  completions: []   // array of HabitCompletion objects
}
```

## Kluczowe funkcjonalności

### Śledzenie nawyków
- Dodawanie nowych nawyków
- Usuwanie nawyków
- Oznaczanie nawyków jako wykonane/niewykonane dla danego dnia
- Wyświetlanie procentu wykonania (ostatnie 7 dni)

### Statystyki
- Wykres słupkowy - dni ukończone dla każdego nawyku
- Wykres liniowy - trend realizacji w czasie
- Chart.js załadowany przez ESM

### Udostępnianie
- Generowanie linków z zakodowanymi danymi (base64 + encodeURIComponent dla UTF-8)
- Tryb tylko-do-odczytu dla odbiorców linku
- Wizualne oznaczenie trybu udostępniania
- Obsługa błędów dla uszkodzonych linków

### Responsywność
- Layout siatki z breakpointami dla mobile/tablet/desktop
- Widok jedno-kolumnowy na małych ekranach
- Dwu-kolumnowy layout na większych ekranach

## Ostatnie zmiany
- 2025-12-07: Utworzenie aplikacji Habits Tracker z pełną funkcjonalnością MVP
- 2025-12-07: Naprawa ładowania Chart.js przez ESM zamiast CDN
- 2025-12-07: Implementacja trybu read-only dla udostępnionych linków
- 2025-12-07: Poprawka kodowania UTF-8 dla polskich znaków w linkach udostępniania
- 2025-12-07: Implementacja delegacji zdarzeń dla lepszej wydajności
- 2025-12-07: Dodanie obsługi błędów dla uszkodzonych linków udostępniania

## Preferencje użytkownika
- Interfejs w języku polskim
- Nowoczesny, profesjonalny design z niebiesko-szarą paletą kolorów
- Dark mode z odpowiednimi kontrastami

## Uruchamianie projektu
Workflow `Start application` uruchamia `npm run dev` który startuje serwer Express i Vite dev server na porcie 5000.
