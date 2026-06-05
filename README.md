# QMAX SYSTEMS To-Do App — Full Stack

Node.js + Express + MySQL + REST API

---

## 📁 Project Structure

```
qmax-todo/
├── backend/
│   ├── server.js              ← Express app entry point
│   ├── db.js                  ← MySQL connection & table init
│   ├── routes/
│   │   ├── auth.js            ← Login API
│   │   └── tasks.js           ← Tasks CRUD API
│   └── middleware/
│       └── auth.js            ← JWT token verification
├── frontend/
│   ├── index.html             ← Login page
│   ├── todo.html              ← Main To-Do app
│   ├── style.css              ← Styles
│   └── script.js              ← API-connected JS
├── .env                       ← Config (DB, JWT, credentials)
├── package.json
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Install Node.js
Download from https://nodejs.org (LTS version recommended)

### 2. Install MySQL
Download from https://dev.mysql.com/downloads/installer/
- During setup, note your root password

### 3. Configure .env
Open `.env` and update:
```
DB_PASSWORD=your_actual_mysql_password
JWT_SECRET=any_long_random_string
APP_USERNAME=qmax
APP_PASSWORD=qmax123
```
Change APP_USERNAME and APP_PASSWORD to whatever you want users to log in with.

### 4. Install dependencies
Open terminal in the project folder:
```bash
npm install
```

### 5. Start the server
```bash
npm start
```
Or for auto-reload during development:
```bash
npm run dev
```

### 6. Open the app
Go to: http://localhost:3000

Login with the username and password from your .env file.

---

## 🔌 API Reference

All task routes require: `Authorization: Bearer <token>` header

| Method | Route | Body | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/login` | `{ username, password }` | Login, returns JWT token |
| GET | `/api/auth/verify` | — | Check if token is valid |
| GET | `/api/tasks` | — | Get all tasks |
| POST | `/api/tasks` | `{ text }` | Create a new task |
| PUT | `/api/tasks/:id` | — | Toggle task checked/unchecked |
| DELETE | `/api/tasks/:id` | — | Delete a task |
| DELETE | `/api/tasks/completed/clear` | — | Delete all completed tasks |
| GET | `/api/health` | — | Server health check |

---

## 🗄️ Database

The app auto-creates the database and table on first run.
No manual SQL needed.

Table: `tasks`
| Column | Type | Description |
|--------|------|-------------|
| id | INT AUTO_INCREMENT | Primary key |
| text | VARCHAR(500) | Task content |
| checked | BOOLEAN | Done status |
| created_at | TIMESTAMP | Creation time |

---

## 🔐 How Login Works

- All users share ONE username and password (set in .env)
- All users see the SAME shared task list
- Login returns a JWT token (valid 24 hours)
- Token is stored in browser localStorage
- All API calls send the token in the Authorization header
