# Aplikacja Zarządzania Skrytkami

Prosta aplikacja webowa do zarządzania kodami dostępu do skrytek.

## Instalacja i uruchomienie

### 1. Przygotowanie bazy danych w Supabase

1. Zaloguj się do [Supabase](https://supabase.com)
2. Otwórz SQL Editor w swoim projekcie
3. Skopiuj i uruchom zawartość pliku `database-setup.sql`
4. Sprawdź, czy tabele zostały utworzone poprawnie

### 2. Konfiguracja zmiennych środowiskowych

1. Skopiuj plik `.env.example` do `.env`:
   ```bash
   cp .env.example .env
   ```

2. Uzupełnij plik `.env` danymi z Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL` - URL projektu (Settings → API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key (Settings → API)

### 3. Instalacja zależności

```bash
npm install
```

### 4. Uruchomienie aplikacji

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:3000

## Struktura projektu

```
├── app/
│   ├── layout.tsx       # Layout aplikacji
│   ├── page.tsx         # Strona główna z logiką
│   └── globals.css      # Style CSS
├── lib/
│   ├── supabase.ts      # Konfiguracja Supabase
│   └── types.ts         # Typy TypeScript
├── database-setup.sql   # Skrypt SQL dla bazy danych
└── .env.example         # Przykładowy plik zmiennych środowiskowych
```

## Funkcjonalności

- Wyświetlanie 4 skrytek z aktualnymi i poprzednimi kodami
- Zmiana kodu z wyborem pracownika
- Historia zmian zapisywana automatycznie
- Informacje o ostatniej zmianie i osobie, która ją wykonała
- Responsywny interfejs

## Wdrożenie

### Vercel (rekomendowane)

1. Zainstaluj Vercel CLI: `npm i -g vercel`
2. Uruchom: `vercel`
3. Postępuj zgodnie z instrukcjami
4. Dodaj zmienne środowiskowe w Vercel Dashboard

Alternatywnie możesz połączyć repozytorium GitHub z Vercel przez interfejs webowy.

## Struktura bazy danych

### Tabela `employees`
- `id` - UUID
- `imie` - Imię pracownika
- `nazwisko` - Nazwisko pracownika

### Tabela `skrytki_kody`
- `id` - UUID
- `skrytka_numer` - Numer skrytki (1-4)
- `kod_aktualny` - Aktualny kod dostępu
- `kod_poprzedni` - Poprzedni kod dostępu
- `zmienil_employee_id` - ID pracownika, który zmienił kod
- `data_zmiany` - Data i czas zmiany

### Tabela `historia_kodow`
- `id` - UUID
- `skrytka_numer` - Numer skrytki
- `kod` - Kod w momencie zmiany
- `zmienil_employee_id` - ID pracownika
- `data_zmiany` - Data i czas zmiany

Historia kodów jest zapisywana automatycznie przez trigger w bazie danych.
