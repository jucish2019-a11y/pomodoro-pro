/*
  Worker script to handle timing.
  By running the interval in a Worker, we avoid the main thread's
  throttling during background tabs.
*/
let timerInterval = null;
let secondsRemaining = 0;

self.onmessage = function(e) {
    const { command, value } = e.data;

    switch (command) {
        case 'start':
            if (timerInterval) return;
            timerInterval = setInterval(() => {
                if (secondsRemaining > 0) {
                    secondsRemaining--;
                    self.postMessage({ type: 'tick', seconds: secondsRemaining });
                } else {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    self.postMessage({ type: 'finished' });
                }
            }, 1000);
            break;

        case 'pause':
            clearInterval(timerInterval);
            timerInterval = null;
            break;

        case 'reset':
            clearInterval(timerInterval);
            timerInterval = null;
            break;

        case 'setTime':
            secondsRemaining = value;
            break;
    }
};
