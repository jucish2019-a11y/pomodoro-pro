const display = document.getElementById('display');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');
const modeBtns = document.querySelectorAll('.mode-btn');
const progressBar = document.getElementById('progress-bar');
const streakDisplay = document.getElementById('streak-counter');
const quoteDisplay = document.getElementById('quote-display');
const mainContainer = document.getElementById('main-container');

let worker = new Worker('src/worker.js');
let currentSeconds = 25 * 60;
let totalSecondsForMode = 25 * 60;
let streak = 0;

const QUOTES = [
    "Stay focused, you've got this!",
    "One step at a time.",
    "Deep work in progress...",
    "Your future self will thank you.",
    "Small progress is still progress.",
    "Focus on the process, not the result."
];

const THEMES = {
    pomodoro: { color: '#ba4a3a', label: 'Pomodoro' },
    shortBreak: { color: '#4caf50', label: 'Short Break' },
    longBreak: { color: '#2196f3', label: 'Long Break' }
};

function updateDisplay(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    document.title = `${display.textContent} - Pomodoro Pro`;

    // Update progress ring
    const offset = 691.15 * (seconds / totalSecondsForMode);
    progressBar.style.strokeDashoffset = 691.15 - offset;
}

function updateTheme(mode) {
    const theme = THEMES[mode];
    document.body.style.backgroundColor = theme.color;
    document.documentElement.style.setProperty('--bg-color', theme.color);
}

function saveState() {
    const state = {
        seconds: currentSeconds,
        mode: document.querySelector('.mode-btn.active').dataset.time,
        streak: streak
    };
    localStorage.setItem('pomodoro_pro_state', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('pomodoro_pro_state');
    if (saved) {
        const state = JSON.parse(saved);
        currentSeconds = state.seconds;
        streak = state.streak || 0;

        const activeBtn = document.querySelector(`.mode-btn[data-time="${state.mode}"]`);
        if (activeBtn) {
            modeBtns.forEach(b => b.classList.remove('active'));
            activeBtn.classList.add('active');
            updateTheme(state.mode === '25' ? 'pomodoro' : state.mode === '5' ? 'shortBreak' : 'longBreak');
        }

        updateDisplay(currentSeconds);
        worker.postMessage({ command: 'setTime', value: currentSeconds });
    }
}

function setTimer(minutes) {
    totalSecondsForMode = minutes * 60;
    currentSeconds = totalSecondsForMode;
    updateDisplay(currentSeconds);
    worker.postMessage({ command: 'setTime', value: currentSeconds });
}

worker.onmessage = function(e) {
    const { type, seconds } = e.data;
    if (type === 'tick') {
        currentSeconds = seconds;
        updateDisplay(currentSeconds);
        saveState();
    } else if (type === 'finished') {
        handleCompletion();
    }
};

function handleCompletion() {
    // Play sound
    const audio = new Audio('https://actions.google.com/sounds/r/notification_chiming_sounds.ogg');
    audio.play();

    // Animate container
    mainContainer.classList.add('celebrate');
    setTimeout(() => mainContainer.classList.remove('celebrate'), 2000);

    // Update streak if Pomodoro finished
    const activeMode = document.querySelector('.mode-btn.active');
    if (activeMode.dataset.time === '25') {
        streak++;
        streakDisplay.textContent = `🍅 ${streak}/4`;
    }

    alert('Time is up! Take a well-deserved break.');
    startBtn.disabled = false;
}

function toggleTimer() {
    if (startBtn.disabled) {
        worker.postMessage({ command: 'pause' });
        startBtn.textContent = 'Start';
        startBtn.disabled = false;
    } else {
        worker.postMessage({ command: 'start' });
        startBtn.textContent = 'Pause';
        startBtn.disabled = true;
    }
}

startBtn.onclick = toggleTimer;

pauseBtn.onclick = () => {
    worker.postMessage({ command: 'pause' });
    startBtn.textContent = 'Start';
    startBtn.disabled = false;
};

resetBtn.onclick = () => {
    const activeMode = document.querySelector('.mode-btn.active');
    const minutes = parseInt(activeMode.dataset.time);
    setTimer(minutes);
    worker.postMessage({ command: 'reset' });
    startBtn.textContent = 'Start';
    startBtn.disabled = false;
};

modeBtns.forEach(btn => {
    btn.onclick = () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const minutes = parseInt(btn.dataset.time);
        setTimer(minutes);

        // Update Theme
        const modeKey = minutes === 25 ? 'pomodoro' : minutes === 5 ? 'shortBreak' : 'longBreak';
        updateTheme(modeKey);

        worker.postMessage({ command: 'reset' });
        startBtn.textContent = 'Start';
        startBtn.disabled = false;
    };
});

// Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
    }
    if (e.code === 'KeyR') {
        e.preventDefault();
        resetBtn.onclick();
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth < 600) {
        display.style.fontSize = '3rem';
    }
});

// Init
loadState();
if (!localStorage.getItem('pomodoro_pro_state')) {
    setTimer(25);
    updateTheme('pomodoro');
}
// Random quote
quoteDisplay.textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];
