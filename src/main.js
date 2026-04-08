const display = document.getElementById('display');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');
const modeBtns = document.querySelectorAll('.mode-btn');

let worker = new Worker('src/worker.js');
let currentSeconds = 25 * 60;

function updateDisplay(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    document.title = `${display.textContent} - Pomodoro Pro`;
}

function setTimer(minutes) {
    currentSeconds = minutes * 60;
    updateDisplay(currentSeconds);
    worker.postMessage({ command: 'setTime', value: currentSeconds });
}

worker.onmessage = function(e) {
    const { type, seconds } = e.data;
    if (type === 'tick') {
        currentSeconds = seconds;
        updateDisplay(currentSeconds);
    } else if (type === 'finished') {
        alert('Time is up!');
        startBtn.disabled = false;
    }
};

startBtn.onclick = () => {
    worker.postMessage({ command: 'start' });
    startBtn.disabled = true;
};

pauseBtn.onclick = () => {
    worker.postMessage({ command: 'pause' });
    startBtn.disabled = false;
};

resetBtn.onclick = () => {
    const activeMode = document.querySelector('.mode-btn.active');
    const minutes = parseInt(activeMode.dataset.time);
    setTimer(minutes);
    worker.postMessage({ command: 'reset' });
    startBtn.disabled = false;
};

modeBtns.forEach(btn => {
    btn.onclick = () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const minutes = parseInt(btn.dataset.time);
        setTimer(minutes);
        worker.postMessage({ command: 'reset' });
        startBtn.disabled = false;
    };
});

// Init
setTimer(25);
