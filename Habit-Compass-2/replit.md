# Habits Tracker - Projekt dokumentacja

## Przegląd
Aplikacja Habits Tracker to kompletna aplikacja webowa do śledzenia codziennych nawyków z:
- Codziennym śledzeniem nawyków z wizualnym potwierdzeniem
- System serii (streak) - śledzenie ile dni z rzędu wykonujesz nawyk
- Kategorie nawyków (Zdrowie, Praca, Rozwój, Inne) z filtrowaniem
- Cele tygodniowe z paskiem postępu
- System odznak motywacyjnych za osiągnięcia
- Wizualizacją statystyk za pomocą Chart.js (wykres słupkowy i liniowy)
- Panel insights z podsumowaniem (najlepszy nawyk, średnia tygodniowa, najdłuższa seria)
- Przechowywaniem danych w localStorage (persystencja między sesjami)
- Nawyki grupowe z uwierzytelnianiem (Replit Auth) i synchronizacją online
- Responsywnym designem (mobile + desktop)
- Możliwością udostępniania linków do dashboardu w trybie tylko-do-odczytu
- Interfejsem w języku polskim

## Architektura projektu

### Frontend (Vanilla JavaScript + Vite)
- `client/index.html` - Główna strona HTML z całą strukturą UI
- `client/src/main.js` - Główna logika aplikacji w czystym JavaScript (bez TypeScript):
  - Zarządzanie stanem (habits, completions, achievements)
  - Renderowanie UI (renderHabitsList, renderDailyView, updateCharts, renderInsights)
  - System kategorii z filtrowaniem (CATEGORIES, activeCategory)
  - System odznak (BADGE_DEFINITIONS, checkAndUpdateAchievements)
  - Obliczanie serii (getHabitStreak, getWeeklyCompletion)
  - Obsługa zdarzeń (delegacja zdarzeń dla wydajności)
  - Integracja z Chart.js dla wykresów
- `client/src/styles.css` - Style CSS z obsługą dark mode

### Przechowywanie danych
Funkcje w `client/src/main.js`:
- `getStorageData()` / `saveStorageData()` - Odczyt/zapis danych w localStorage
- `addHabit(name, category, weeklyGoal)` - Dodawanie nawyku z kategorią i celem
- `deleteHabit()` - Usuwanie nawyku wraz z achievements
- `toggleHabitCompletion()` - Przełączanie stanu wykonania
- `getHabitStreak()` - Obliczanie serii dni
- `checkAndUpdateAchievements()` - Sprawdzanie i przyznawanie odznak
- `generateShareableLink()` / `loadFromShareableLink()` - Funkcje udostępniania

### Schema danych (localStorage key: "habits-tracker-data")
```javascript
// Habit object
{
  id: "abc123",
  name: "Ćwiczenia",
  category: "health",       // health, work, personal, other
  weeklyGoal: 5,            // ile dni w tygodniu (1-7)
  createdAt: "2025-12-07T10:00:00.000Z"
}

// HabitCompletion object
{
  habitId: "abc123",
  date: "2025-12-07",
  completed: true
}

// Achievement object
{
  id: "abc123-streak-7",    // habitId + badgeId
  habitId: "abc123",
  badgeId: "streak-7",
  earnedAt: "2025-12-07T10:00:00.000Z"
}

// HabitsData structure
{
  habits: [],
  completions: [],
  achievements: []
}
```

### Kategorie nawyków
- `health` - Zdrowie (zielony)
- `work` - Praca (niebieski)
- `personal` - Rozwój (fioletowy)
- `other` - Inne (żółty)

### System odznak
- `streak-7` - Tydzień z rzędu (7 dni serii)
- `streak-30` - Miesiąc mistrzowski (30 dni serii)
- `completions-50` - Konsekwentny (50 wykonań)
- `completions-100` - Mistrz nawyków (100 wykonań)
- `perfect-week` - Idealny tydzień (100% w tygodniu)

## Kluczowe funkcjonalności

### Śledzenie nawyków
- Dodawanie nowych nawyków z kategorią i celem tygodniowym
- Usuwanie nawyków
- Oznaczanie nawyków jako wykonane/niewykonane dla danego dnia
- Wyświetlanie serii (streak) na kartach nawyków
- Pasek postępu celu tygodniowego

### Kategorie i filtrowanie
- Przypisywanie kategorii do nawyków
- Filtrowanie listy nawyków według kategorii
- Kolorowe oznaczenia kategorii

### Odznaki motywacyjne
- Automatyczne przyznawanie odznak za osiągnięcia
- Powiadomienia o nowych odznakach
- Wyświetlanie zdobytych odznak na kartach nawyków

### Insights (Podsumowanie)
- Najlepszy nawyk (najwyższy procent realizacji)
- Średnia tygodniowa
- Najdłuższa seria
- Liczba zdobytych odznak

### Statystyki
- Wykres słupkowy - dni ukończone dla każdego nawyku (kolory kategorii)
- Wykres liniowy - trend realizacji w czasie
- Chart.js załadowany przez CDN

### Udostępnianie
- Generowanie linków z zakodowanymi danymi (base64 + encodeURIComponent dla UTF-8)
- Tryb tylko-do-odczytu dla odbiorców linku
- Wizualne oznaczenie trybu udostępniania
- Obsługa błędów dla uszkodzonych linków

### Responsywność
- Layout siatki z breakpointami dla mobile/tablet/desktop
- Widok jedno-kolumnowy na małych ekranach
- Dwu-kolumnowy layout na większych ekranach

### Nawyki grupowe (Multi-user)
- Logowanie przez Replit Auth (OpenID Connect)
- Tworzenie i zarządzanie grupami
- Dołączanie do grup przez kod zaproszenia
- Wspólne nawyki z śledzeniem postępu każdego członka
- Synchronizacja online przez PostgreSQL
- Role: admin (twórca grupy) i member

## Ostatnie zmiany
- 2026-01-16: Nawyki grupowe z uwierzytelnianiem:
  - Integracja Replit Auth (OpenID Connect)
  - Schemat bazy danych dla grup (groups, groupMembers, groupHabits, groupHabitCompletions)
  - API dla grup i nawyków grupowych z weryfikacją autoryzacji
  - UI z zakładkami "Moje nawyki" / "Nawyki grupowe"
  - Tworzenie/dołączanie do grup, zarządzanie nawykami grupowymi
  - Śledzenie postępu każdego członka grupy
- 2026-01-16: Rozbudowa aplikacji o nowe funkcje:
  - System serii (streak) z wizualizacją
  - Kategorie nawyków z filtrowaniem
  - Cele tygodniowe z paskami postępu
  - System odznak motywacyjnych
  - Panel insights z podsumowaniem
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

## Budowanie produkcyjne
- `npm run build` - buduje aplikację do folderu `dist/`
- Format ESM z polyfill dla `import.meta.url` w CommonJS
- Plik wyjściowy: `dist/index.cjs`
