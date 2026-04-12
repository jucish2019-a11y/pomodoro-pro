# Pomodoro Pro

A high-precision productivity timer that stays accurate even when your browser tab is backgrounded or throttled. Built with **Web Workers** and **timestamp delta logic** for drift-free timing, wrapped in a glassmorphism UI with dynamic theming.

![Pomodoro Pro](https://img.shields.io/badge/type-productivity-red) ![Web Worker](https://img.shields.io/badge/timing-drift--free-green) ![Zero Dependencies](https://img.shields.io/badge/deps-zero-brightgreen)

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Drift-Free Timing](#drift-free-timing)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [UI Walkthrough](#ui-walkthrough)
- [Worker Protocol](#worker-protocol)
- [State Persistence](#state-persistence)
- [Technology Stack](#technology-stack)
- [License](#license)

---

## Overview

Pomodoro Pro is a Pomodoro Technique timer that solves a real engineering problem: browser-based timers drift. Standard `setInterval(fn, 1000)` drifts when the browser throttles background tabs, leading to inaccurate countdowns. Pomodoro Pro runs the timer in a **dedicated Web Worker** that checks timestamps at 250ms intervals and self-corrects using a `while` loop — if the browser falls behind, multiple ticks fire in rapid succession until caught up.

The result: a timer that is **accurate to the second**, regardless of CPU load, tab visibility, or browser throttling.

Beyond precision, Pomodoro Pro features a glassmorphism design with dynamic theming (the entire color palette shifts based on the active mode), an SVG progress ring, streak tracking, keyboard shortcuts, audio notifications, and full state persistence across sessions.

---

## Live Demo

**URL:** [https://jucish2019-a11y.github.io/pomodoro-pro/](https://jucish2019-a11y.github.io/pomodoro-pro/)

> **Note:** GitHub Pages must be enabled in the repository settings. Go to **Settings → Pages → Branch → main → Save**. The site will be live within a few minutes.

---

## Features

### Timer Modes

| Mode | Duration | Theme Color | Semantic |
|------|----------|-------------|----------|
| Pomodoro | 25 min | `#ba4a3a` Deep Red | Deep focus |
| Short Break | 5 min | `#4caf50` Sage Green | Quick refresh |
| Long Break | 15 min | `#2196f3` Sky Blue | Deep recovery |

### Drift-Free Timing
- **Web Worker** — timer runs in a separate thread, not subject to the same aggressive throttling as main-thread intervals
- **250ms polling** — checks timestamps 4× per second instead of once, catching up quickly after any delay
- **Timestamp delta with while-loop** — if the browser was throttled and multiple seconds passed, the worker fires multiple ticks in rapid succession until `expectedNextTick` catches up to `Date.now()`
- **Result:** the timer never loses time, it just compresses missed ticks

### Visual Progress
- **SVG circular progress ring** — depletes in real-time as seconds count down, starts from 12 o'clock position
- **Circumference calculation**: `2 × π × 110 = 691.15` (the `stroke-dasharray` value), with `stroke-dashoffset` updated on every tick

### Dynamic Theming
- The entire background color transitions smoothly (0.5s ease) when switching modes
- CSS custom properties (`--bg-color`, `--accent-color`, `--text-color`, `--glass-bg`, `--glass-border`) cascade to all themed elements
- Button text color inverts to maintain contrast against the theme

### Glassmorphism UI
- **Backdrop blur** (15px) on the main container
- Semi-transparent background (`rgba(255,255,255,0.15)`)
- Subtle blue-tinted box shadow
- Rounded corners (30px) with glass border

### State Persistence
- Timer state is **saved to localStorage on every tick**
- Closing and reopening the browser restores: remaining seconds, active mode, and streak count
- No progress is ever lost

### Tab Title Countdown
- `document.title` is updated to `MM:SS - Pomodoro Pro` on every tick
- The countdown is visible in the browser tab even when the tab is backgrounded

### Gamification
- **Streak counter** — `N/4` tomato counter, increments only on 25-minute Pomodoro completion
- Complete 4 Pomodoros to earn your long break
- **Celebration animation** — pulsing container animation (scale 1.0 → 1.05 alternating every 0.5s) for 2 seconds on timer completion

### Audio Notification
- OGG chime from Google Actions sounds plays on timer completion
- Subtle and non-intrusive

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Toggle Start/Pause |
| `R` | Reset Timer |

### Responsive Layout
- Timer display font size drops from 4rem to 3rem when viewport width is under 600px
- `font-variant-numeric: tabular-nums` ensures digits don't shift width as numbers change

### Motivational Quotes
- Random quote displayed on session start from a curated set of 6 messages
- Rotating micro-copy to keep you encouraged during deep work

---

## Drift-Free Timing

The core innovation is how the Web Worker handles timekeeping. Here's the algorithm:

### Standard Approach (What Pomodoro Pro Does NOT Do)

```javascript
// This DRIFTS when the browser throttles background tabs
setInterval(() => {
    secondsRemaining--;
    updateDisplay(secondsRemaining);
}, 1000);
```

### Pomodoro Pro's Approach

```javascript
// In the Web Worker:

// 1. On start: record when the next whole-second tick SHOULD fire
expectedNextTick = Date.now() + 1000;

// 2. Poll at 250ms (4× per second) — not 1000ms
timerInterval = setInterval(() => {
    const now = Date.now();

    // 3. While-loop catches up if browser was throttled
    while (now >= expectedNextTick) {
        if (secondsRemaining > 0) {
            secondsRemaining--;
            self.postMessage({ type: 'tick', seconds: secondsRemaining });
        } else {
            self.postMessage({ type: 'finished' });
            clearInterval(timerInterval);
            return;
        }
        expectedNextTick += 1000;
    }
}, 250);
```

### Why This Works

| Scenario | Standard setInterval | Pomodoro Pro Worker |
|----------|---------------------|-------------------|
| Tab is active | Accurate | Accurate |
| Tab is backgrounded for 10s | Misses 10 ticks → 10s error | Fires 10 ticks rapidly → caught up |
| Tab is throttled (1 tick/min) | Loses 59s per minute | Catches up on next 250ms poll |
| CPU is under load | Interval delayed, drifts | While-loop compensates |

### Pause and Resume

When paused, the interval is cleared and `timerInterval` is set to null. When resumed, `expectedNextTick` is re-initialized to `Date.now() + 1000`, so there is no time jump — the countdown resumes from exactly where it left off.

---

## Getting Started

The app uses a **Web Worker**, which requires HTTP protocol. Opening `index.html` directly via `file://` will cause CORS errors and the timer will not start.

### Option 1: Python (Recommended)

```bash
cd pomodoro-pro
python -m http.server 8000
```

Open **http://localhost:8000** in your browser.

### Option 2: Node.js

```bash
npx serve pomodoro-pro
```

### Option 3: VS Code Live Server

Install the "Live Server" extension, right-click `index.html`, and select "Open with Live Server".

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                 index.html                   │
│  ┌─────────────────────────────────────────┐│
│  │          Main Thread (main.js)           ││
│  │                                         ││
│  │  ┌─────────┐  ┌──────────┐  ┌────────┐ ││
│  │  │ UI      │  │ State    │  │ Display │ ││
│  │  │ Events  │  │ Persist  │  │ Update  │ ││
│  │  └────┬────┘  └────┬─────┘  └────┬────┘ ││
│  │       │            │             │      ││
│  │       └────────────┼─────────────┘      ││
│  │                    │                    ││
│  │        postMessage │ onmessage          ││
│  │                    ↓                    ││
│  │  ┌─────────────────────────────────┐    ││
│  │  │    Web Worker (worker.js)       │    ││
│  │  │                                 │    ││
│  │  │  250ms setInterval poll        │    ││
│  │  │  Timestamp delta while-loop     │    ││
│  │  │  expectedNextTick tracking      │    ││
│  │  │                                 │    ││
│  │  │  Sends: tick / finished         │    ││
│  │  └─────────────────────────────────┘    ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

### Module Design

| Module | Thread | Responsibility |
|--------|--------|---------------|
| `main.js` | Main | UI controller, state management, worker orchestration, theme switching |
| `worker.js` | Web Worker | Drift-free timing with 250ms polling and timestamp delta correction |

### Data Flow

```
User Click ──→ main.js ──→ postMessage({ command }) ──→ worker.js
                                                          │
                                                    250ms poll loop
                                                    while (now >= expectedNextTick)
                                                          │
worker.js ──→ postMessage({ type: 'tick', seconds }) ──→ main.js
                                                          │
                                                    updateDisplay()
                                                    saveState()
                                                    update progress ring
                                                    update document.title
```

---

## File Structure

```
pomodoro-pro/
├── index.html           # UI structure, inline CSS, SVG progress ring, glassmorphism design
├── src/
│   ├── main.js          # UI controller: display, theme, state, worker comm, keyboard
│   └── worker.js        # Background timing thread with drift-correction algorithm
└── README.md
```

---

## UI Walkthrough

### Main Container (glassmorphism card, 380px wide)

From top to bottom:

1. **Title** — "Pomodoro Pro" in light-weight, letter-spaced type
2. **Quote** — Random motivational micro-copy (italic, faded)
3. **Streak Counter** — `N/4` tomato counter showing completed Pomodoros
4. **Mode Selector** — Three pill buttons: Pomodoro (25m), Short Break (5m), Long Break (15m)
   - Active mode gets white background with theme-color text
   - Inactive modes are semi-transparent with white text
5. **Timer Ring** — 250×250 SVG circle with:
   - Outer track ring at 20% opacity (static)
   - Inner progress bar (depletes clockwise from 12 o'clock)
   - Digital countdown `MM:SS` centered inside (tabular-nums for stable width)
6. **Controls** — Three buttons: Start, Pause, Reset
   - White-on-theme-color styling
   - Hover lifts button up 2px with shadow
   - Active press-down feedback
   - Disabled state at 50% opacity

### Theme Transitions

| Mode Switch | Background | Transition |
|-------------|-----------|------------|
| → Pomodoro | `#ba4a3a` Deep Red | 0.5s ease |
| → Short Break | `#4caf50` Sage Green | 0.5s ease |
| → Long Break | `#2196f3` Sky Blue | 0.5s ease |

The CSS custom property `--bg-color` is updated by JS, and the `<body>` has `transition: background-color 0.5s ease` for smooth color transitions.

### Celebration Animation

On timer completion:
1. Audio chime plays
2. Container gets `.celebrate` class for 2 seconds (pulsing scale animation)
3. Streak counter updates (if Pomodoro completed)
4. Browser alert: "Time is up! Take a well-deserved break."

---

## Worker Protocol

### Messages from Main Thread → Worker

| Command | Value | Effect |
|---------|-------|--------|
| `start` | (none) | Initialize `expectedNextTick`, start 250ms `setInterval` |
| `pause` | (none) | Clear interval, set `timerInterval = null` |
| `reset` | (none) | Clear interval, set `timerInterval = null` |
| `setTime` | Number of seconds | Set `secondsRemaining` without starting/stopping |

### Messages from Worker → Main Thread

| Type | Data | Effect |
|------|------|--------|
| `tick` | `{ seconds }` | Update display, save state, update progress ring |
| `finished` | (none) | Trigger completion: audio, animation, streak update, alert |

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Duplicate `start` | No-op (if `timerInterval` is already running) |
| Background drift | While-loop fires multiple ticks until caught up |
| Pause and resume | `expectedNextTick` re-initialized on resume — no time jump |
| Mid-session `setTime` | Updates `secondsRemaining` without affecting running interval |

---

## State Persistence

State is saved to `localStorage` under the key `pomodoro_pro_state` on every tick:

```javascript
{
    seconds: 1499,          // Remaining seconds
    mode: "25",             // Active mode duration (data-time attribute)
    streak: 3               // Completed Pomodoro count
}
```

On page load, `loadState()` restores:
- `currentSeconds` — exact remaining time
- `streak` — Pomodoro count
- Active mode button highlight
- Theme color matching the mode
- Sends `setTime` to the worker so it has the correct starting value

If no saved state exists, defaults are applied: 25-minute Pomodoro, streak 0, red theme.

---

## Technology Stack

| Technology | Purpose |
|-----------|---------|
| **Web Workers API** | Background timing thread immune to main-thread throttling |
| **SVG** | Circular progress ring with stroke-dashoffset animation |
| **Canvas 2D** | Not used — all rendering is DOM/SVG |
| **localStorage** | State persistence across browser sessions |
| **CSS Custom Properties** | Dynamic theming system |
| **backdrop-filter** | Glassmorphism blur effect |
| Vanilla HTML/CSS/JS | Zero dependencies, zero frameworks, zero build tools |

---

## License

MIT