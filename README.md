# 🍅 Pomodoro Pro

Pomodoro Pro is a high-precision productivity timer designed to help you maintain deep focus and manage your breaks effectively. Unlike standard browser timers, it leverages **Web Workers** and **Timestamp Delta Logic** to ensure that your timer remains 100% accurate, even when the browser tab is backgrounded or throttled by the system.

## 🚀 Live Demo
**Demo URL:** [https://jucish2019-a11y.github.io/pomodoro-pro/](https://jucish2019-a11y.github.io/pomodoro-pro/)

> **⚠️ Important Note on Live Demo:**
> If you see a 404 or a blank page, it is because GitHub Pages needs to be enabled in the repository settings. 
> **How to enable it:** 
> `Settings` $\rightarrow$ `Pages` $\rightarrow$ Under `Branch`, select `main` $\rightarrow$ `Save`.
> The site will be live within a few minutes.

## ✨ Key Features

### 🎨 Modern UI/UX
- **Glassmorphism Design**: A sleek, semi-transparent interface with backdrop blur for a professional, modern feel.
- **Dynamic Theming**: The entire app's color palette shifts based on the active mode:
  - 🔴 **Pomodoro**: Deep Red for focus.
  - 🟢 **Short Break**: Sage Green for a quick refresh.
  - 🔵 **Long Break**: Sky Blue for deep recovery.
- **Visual Progress**: A circular SVG progress ring that depletes in real-time, providing an intuitive visual cue of remaining time.

### 🛠️ Engineering Excellence
- **Drift-Free Timing**: Instead of relying on a simple `setInterval` (which drifts over time), the app uses a **Web Worker** that compares `Date.now()` timestamps. This ensures millisecond precision regardless of CPU load or browser throttling.
- **State Persistence**: Your progress is never lost. The app uses `localStorage` to save your remaining seconds, active mode, and focus streak.
- **Low Overhead**: Built with **100% Vanilla JavaScript, HTML, and CSS**. Zero dependencies, zero frameworks, maximum performance.

### 🎮 Gamification & Accessibility
- **Focus Streaks**: Track your progress with the 🍅 streak counter. Complete 4 Pomodoros to earn your long break!
- **Motivational Micro-copy**: Dynamic quotes to keep you encouraged during deep work.
- **Keyboard Shortcuts**: 
  - `Space`: Toggle Start/Pause.
  - `R`: Reset Timer.
- **Audio Notifications**: A subtle chime triggers upon completion to alert you without being intrusive.

## 🛠️ Local Setup & Installation

### Prerequisites
Since the app uses **Web Workers**, it must be served over an HTTP protocol. Opening the `index.html` file directly in a browser (via `file://` protocol) will cause **CORS security errors** and the timer will not start.

### Option 1: Using Python (Recommended)
If you have Python installed, this is the fastest way to run the app locally.
1. Open your terminal/command prompt.
2. Navigate to the project folder:
   ```bash
   cd "C:/Users/ishaa/OneDrive/Desktop/sandbox/sandbox/pomodoro-pro"
   ```
3. Start the server:
   ```bash
   python -m http.server 8000
   ```
4. Open your browser to: **`http://localhost:8000`**

### Option 2: Using Node.js (`serve` package)
1. Install the `serve` package globally:
   ```bash
   npm install -g serve
   ```
2. Navigate to the project folder and run:
   ```bash
   serve .
   ```
3. Open the URL provided in the terminal (usually `http://localhost:3000`).

## 📂 Project Structure
```text
pomodoro-pro/
├── index.html       # UI structure, Glassmorphism CSS, and SVG Progress Ring
├── README.md        # Documentation
└── src/
    ├── main.js      # UI Controller, State Management, and Worker Orchestration
    └── worker.js    # Background timing thread with drift-correction logic
```

## 🤝 Contributing
This project is part of a portfolio showcase. Feel free to fork it and add your own "secret sauce" features!
