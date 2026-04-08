/*
  Precision Worker using timestamp delta to prevent drift.
*/
let timerInterval = null;
let secondsRemaining = 0;
let expectedNextTick = 0;

self.onmessage = function(e) {
    const { command, value } = e.data;

    switch (command) {
        case 'start':
            if (timerInterval) return;

            // Set the first expected tick to exactly 1 second from now
            expectedNextTick = Date.now() + 1000;

            timerInterval = setInterval(() => {
                const now = Date.now();

                // If we are slightly behind, we catch up by ticking multiple times
                // This prevents drift during browser backgrounding
                while (now >= expectedNextTick) {
                    if (secondsRemaining > 0) {
                        secondsRemaining--;
                        self.postMessage({ type: 'tick', seconds: secondsRemaining });
                    } else {
                        self.postMessage({ type: 'finished' });
                        clearInterval(timerInterval);
                        timerInterval = null;
                        return;
                    }
                    expectedNextTick += 1000;
                }
            }, 250); // Check more frequently than 1s to ensure precision
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
