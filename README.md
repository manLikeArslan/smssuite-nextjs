# 🛰️ SMS Suite Systems v1.0

A premium, high-performance SMS campaign management system built with **Next.js 15**, **Tailwind CSS**, and **SQLite**. Designed for speed, security, and visual excellence.

![Dashboard Preview](https://github.com/user-attachments/assets/...) <!-- Replace with actual screenshot path if available -->

---

## ✨ Key Features

- **🔐 Enterprise Security**: Password-protected login gateway and session-based middleware protection for all routes.
- **🗄️ SQLite Powered**: Robust data persistence using `better-sqlite3`. No more fragile JSON files.
- **🤖 Smart Automation**: 
  - Randomized wait intervals (15-25s) to avoid carrier rate limits.
  - **Visual Wait Bar**: Real-time progress tracking with pulsing countdown badges.
  - **Dry Run Mode**: Test your entire workflow without sending a single real text.
- **📊 Real-time Dashboard**: Live metrics for Total Managed, Cold Outreach, and Follow-up campaigns.
- **📁 Advanced List Management**: 
  - Effortless CSV uploads with automatic phone number extraction.
  - Relational mapping between lists and contacts.
- **📱 High-End UI**: Creamy minimalist aesthetic, fully responsive for desktop and mobile operation.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **CSV Parsing**: [PapaParse](https://www.papaparse.com/)
- **Typography**: [Outfit](https://fonts.google.com/specimen/Outfit)

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory (use `.env.example` as a template):
```env
# The URL for your Pushcut automation
PUSHCUT_URL=https://automation.pushcut.io/execute?identifier=...

# The secret password for app access
APP_PASSWORD=1234

# Secret for session signing
AUTH_SECRET=your_random_secret_here
```

### 3. Initialize the Database
Run the schema initialization script to create your SQLite database and default tables:
```bash
npm run init-db
```
*(Note: I added a script shortcut. If not available, run `node scripts/init-db.js`)*

### 4. Start the Engine
Run the development server:
```bash
npm run dev
```
Open [http://localhost:3002](http://localhost:3002) to access the system.

---

## 🐳 Docker Deployment (VPS)

For efficient deployment on a VPS, use Docker Compose:

1. **Configure Environment**: Ensure your `.env.local` is fully populated.
2. **Launch**:
   ```bash
   docker-compose up -d --build
   ```
3. **Access**: The system will be available at [http://localhost:3002](http://localhost:3002).
4. **Persistence**: The SQLite database is automatically persisted in the host directory as `sqlite.db`.

---

## 📖 User Guide

### 🔑 Authentication
The system is protected by a secure key protocol. Enter your `APP_PASSWORD` from your environment variables to gain access.

### 📋 Numbers (List Management)
1. Navigate to the **Numbers** page.
2. Click **Upload New List** (or the **+** button).
3. Select a `.csv` file. The system will automatically extract all valid phone numbers and save them to the database.

### 🛰️ Send (Campaign Hub)
1. Select an **Active List** from the dropdown.
2. Choose your campaign mode: **NEW** or **FOLLOW-UP**.
3. **Queue Control**: Click the large number in the Queue card to set your message limit for the session.
4. **Test Mode**: Toggle this ON to simulate the campaign without making real API calls.
5. Click **Start Session** and watch the **Session Monitor** for real-time logs and cooling period progress.

---

## 🏗️ Production Build

To create a production-optimized build:
```bash
npm run build
npm start
```

---

## 🛡️ Privacy & Reliability
- **Local First**: All your campaign lists and statistics are stored in a local `sqlite.db` file (ignored by Git).
- **Graceful Failures**: Real-time logging catches and displays carrier errors without crashing the automation loop.

&copy; 2024 SMSSUITE Systems. Optimized for Advanced Agentic Coding.
