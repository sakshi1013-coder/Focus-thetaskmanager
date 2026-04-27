# Task Manager Application

A distraction-free, soft-themed Task Manager built to satisfy the Full Stack Developer Technical Assignment.

## Features & Implementation
- **Frontend Dashboard**: Built with React (Vite) offering a comprehensive dashboard layout. Includes a sticky sidebar, an analytics side-panel, and a modern main view. Features a warm, neumorphic/soft design system custom-built from vanilla CSS variables. 
- **User Authentication**: Integrated a simple authentication and session management system (`/auth/login`, `/auth/register`). Users have their own encapsulated tasks and localized sessions using `localStorage`. Includes a secure "Welcome" gateway screen.
- **My Tasks & Calendar View**: A dedicated "My Tasks" screen that prominently features a dynamically generated interactive calendar emphasizing days where tasks were logged. It pairs with an exclusive "Previous Tasks Completed" historical record list.
- **Graph Analytics**: Integrated `recharts` to render a live Donut Chart (Completed vs Active ratios) and a beautiful Bar Chart for task evolution in the main dashboard view.
- **Customizable Themes**: The application ships with 4 unique color palettes constructed using native CSS variables (`data-theme`), allowing vibrant "Candy Brights" or earthy "Matcha" toggles with a single click.
- **Backend & Data Persistence**: Built with Node.js and Express. Exposes `GET`, `POST`, `PATCH`, `DELETE` endpoints for `/tasks` and auth routes on Port 3001. Handles simple JSON validation and persists data reliably to a local JSON file store (`tasks.json` and `users.json`).
- **Functionality**: Full task CRUD operations including filtering (All, Active, Completed), keyword searching, and quick double-click/button inline editing.

## Project Structure
```text
task-manager/
├── backend/
│   ├── server.js    # Express application with Auth & Tasks API
│   ├── tasks.json   # Simulated file-based DB for Tasks
│   ├── users.json   # Simulated file-based DB for Users
│   └── package.json
├── frontend/
│   ├── src/         # React application
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
└── README.md
```

## Setup and Run Instructions

### Prerequisites
- Node.js (v14 or above)
- npm or yarn

### 1. Start the Backend
Open a terminal and navigate to the `backend` directory:
```bash
cd backend
npm install
node server.js
```
The backend server will start running on `http://localhost:3001`.

### 2. Start the Frontend
Open a new terminal window and navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The frontend Vite server will be available (typically at `http://localhost:5173`). Click the link in your terminal to open the app.

## Assumptions & Trade-offs
1. **File-based Storage**: Rather than configuring a full database (PostgreSQL, MongoDB, or even SQLite), a simple JSON file read/write approach was used to meet the "in-memory or file-based storage is acceptable" criteria. This keeps setup time to near-zero for reviewers. 
2. **Simplified Authentication**: Authentication uses simple JSON file verification without deep encryption packages (like `bcrypt` or JWT generation) to prioritize keeping the core submission requirements intact and easily reviewable without massive dependencies.
3. **Standard CSS Over Tailwind**: Per instructions (or preferences), standard vanilla CSS was used to create the specific "calm, tactile neumorphic theme" with custom CSS variables rather than introducing a heavyweight CSS framework.
4. **No Redux / Context API**: Given the simplicity of the app, local component state (`useState`) handles the small amount of complexity efficiently without unnecessary boilerplate.
5. **Optimistic Updates**: For marking tasks as completed, the frontend updates the UI optimistically before the API responds to provide a snappy, tactile user experience. Rollback happens seamlessly if an error occurs.
