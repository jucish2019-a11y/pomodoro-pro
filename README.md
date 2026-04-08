# Pomodoro Pro

A precision productivity timer that uses Web Workers to ensure timing accuracy even when the tab is in the background.

## 🚀 Live Demo
[Visit the Live Demo](https://jucish2019-a11y.github.io/pomodoro-pro/) *(Enable GitHub Pages in repository settings to activate this)*

## 🛠️ Local Setup

Because this app uses Web Workers, it must be served over HTTP (opening the file directly in a browser will trigger CORS security errors).

### Using Python (Simplest)
If you have Python installed, run:
```bash
python -m http.server 8000
```
Then open your browser to: `http://localhost:8000`

### Using Node.js (serve)
```bash
npm install -g serve
serve .
```
Then open the URL provided in the terminal.

## ⚙️ How it Works
- **Web Workers**: The timing logic is offloaded to a separate thread (`src/worker.js`) to prevent the browser from throttling the interval when the page is inactive.
- **Responsive UI**: Built with vanilla CSS and JS for maximum performance and zero dependencies.
