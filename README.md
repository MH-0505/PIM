# PIM - Aplikacja czatowa

Aplikacja mobilna czatowania z obsługą prostych gier, zbudowana przy użyciu React Native dla frontendu i Django dla backendu.

## Funkcjonalności

*   Rozmowy w czasie rzeczywistym z innymi użytkownikami.
*   Dodawanie i przeglądanie listy kontaktów.
*   Obsługa prostej gry typu kółko i krzyżyk.
*   Podstawowy panel profilu użytkownika.

## Mockupy widoków
![mockup1](https://github.com/MH-0505/PIM/blob/main/mockupy/1.log_in.jpg?raw=true)
![mockup2](https://github.com/MH-0505/PIM/blob/main/mockupy/5.chat.jpg?raw=true)
![mockup3](https://github.com/MH-0505/PIM/blob/main/mockupy/3.contacts.jpg?raw=true)
![mockup4](https://github.com/MH-0505/PIM/blob/main/mockupy/6.game.jpg?raw=true)


## Wykorzystane technologie

**Frontend:**
*   React Native
*   TypeScript
*   React Navigation

**Backend:**
*   Python
*   Django
*   Django REST Framework
*   PostgreSQL

## Schemat architektury aplikacji
![diagram C4 aplikacji](https://github.com/MH-0505/PIM/blob/main/diagram.png?raw=true)


## Uruchomienie Projektu

### Wymagania

*   Node.js (>= 18)
*   Python 3.13
*   Środowisko dla React Native (np. Android Studio)
*   Baza danych PostgreSQL

### Backend

1.  Przejdź do katalogu `backend`:
    ```bash
    cd backend
    ```

2.  Utwórz i aktywuj wirtualne środowisko:
    ```bash
    python -m venv venv
    source venv/bin/activate  # macOS/Linux
    .\venv\Scripts\activate   # Windows
    ```

3.  Zainstaluj zależności:
    ```bash
    pip install -r requirements.txt
    ```

4.  Skonfiguruj zmienne środowiskowe w pliku `.env` według wzoru:
    ```txt
    # Django
    SECRET_KEY={django secret key}
    DEBUG=True
    
    # Database
    DB_NAME={db name}
    DB_USER={db username}
    DB_PASSWORD={db password}
    DB_HOST={db host address}
    DB_PORT={db port}
    ```

5.  Jeśli korzystasz z nowej bazy danych, wykonaj migracje:
    ```bash
    python manage.py migrate
    ```

6.  Uruchom serwer deweloperski:
    ```bash
    python manage.py runserver
    ```

### Frontend

1.  W osobnym terminalu przejdź do katalogu `frontend/MyApp`:
    ```bash
    cd frontend/MyApp
    ```

2.  Zainstaluj zależności:
    ```bash
    npm install
    ```

3.  Skonfiguruj adres API w pliku `.env`. Przykładowo:
    ```txt
    API_URL=http://10.0.2.2:8000/api
    ```

4. Uruchom serwer deweloperski:
    ```bash
    npm start 
    ```

5. Uruchom aplikację na wybranym emulatorze lub urządzeniu:
    *   **Android:**
        ```bash
        npm run android
        ```
    *   **iOS:**
        ```bash
        npm run ios
        ```
