# Budgeting Game

This is a full-stack, real-time multiplayer game built with Next.js, designed to run on serverless platforms like Vercel or Netlify without a traditional database.

## Architecture Overview

The project follows a modern serverless architecture, leveraging the strengths of Next.js for both frontend and backend.

-   **Frontend**: A responsive single-page application built with **React** and **TypeScript** using the Next.js App Router (`/app`). The UI is broken down into modular components located in the `/components` directory.

-   **Backend**: The backend is a set of serverless functions implemented as **Next.js API Routes** within the `/app/api` directory. Each API endpoint handles a specific game action (e.g., creating a player, starting a round).

-   **State Management (No Database)**: As requested, the application does not use a database. Instead, it persists the entire game state in a single JSON file (`coin-game-state.json`) located in the server's temporary directory (`/tmp`).
    -   A custom module (`/lib/gameState.ts`) manages all state interactions.
    -   To prevent race conditions from concurrent function invocations, a **file-locking mechanism** (`proper-lockfile`) is used to ensure that all writes to the state file are atomic. This makes the file-based system safe for multiple simultaneous requests.

-   **Client-Server Communication**: The frontend polls the backend for state updates.
    -   The main page (`/app/page.tsx`) sends a `GET` request to `/api/get-state` every 2 seconds.
    -   The backend returns the complete `GameState` object, and the frontend re-renders with the new data. This approach avoids WebSockets while providing a near real-time experience.

## Project Structure

```
coin-game-app/
├── app/
│   ├── api/                  # Backend serverless functions
│   │   ├── gm/               # Game Master specific actions
│   │   ├── player/           # Player specific actions
│   │   ├── create-player/
│   │   ├── get-state/
│   │   └── ...
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main frontend component (controller)
├── components/               # Reusable React components
│   ├── GMDashboard.tsx
│   ├── PlayerView.tsx
│   └── ...
├── lib/                      # Shared backend/frontend logic
│   ├── gameState.ts          # Core state management (read/write/lock)
│   ├── gameLogic.ts          # Game rules and event card definitions
│   ├── roundCalculator.ts    # Logic for calculating round results
│   └── types.ts              # TypeScript type definitions
└── README.md
```

## How to Run Locally

1.  **Navigate into the project folder**:
    ```bash
    cd coin-game-app
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Set GM Password (Optional)**:
    You can set a custom Game Master password by creating a `.env.local` file in the `coin-game-app` directory:
    ```
    GM_PASSWORD=your_secret_password
    ```
    If not set, the default password is `password123`.

4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

5.  **Access the Game**:
    -   Open your browser to `http://localhost:3000`.
    -   Open multiple tabs or browsers to simulate multiple players and a Game Master.

## How to Deploy

This project is optimized for one-click deployment on **Vercel**.

1.  **Push to GitHub**: Create a repository on GitHub and push your code.

2.  **Import to Vercel**:
    -   Sign up for a Vercel account.
    -   Click "Add New..." -> "Project".
    -   Import the repository from GitHub.
    -   Vercel will automatically detect that it is a Next.js project. No configuration is needed.

3.  **Add Environment Variable (Optional)**:
    -   In the Vercel project settings, go to "Environment Variables".
    -   Add a variable named `GM_PASSWORD` with your desired GM password.

4.  **Deploy**: Click the "Deploy" button. Your game will be live!