document.addEventListener('DOMContentLoaded', () => {
    const aksaraData = [
        { aksara: 'ᬳ', latin: 'ha' },
        { aksara: 'ᬦ', latin: 'na' },
        { aksara: 'ᬘ', latin: 'ca' },
        { aksara: 'ᬭ', latin: 'ra' },
        { aksara: 'ᬓ', latin: 'ka' },
        { aksara: 'ᬤ', latin: 'da' },
        { aksara: 'ᬢ', latin: 'ta' },
        { aksara: 'ᬲ', latin: 'sa' },
        { aksara: 'ᬯ', latin: 'wa' },
        { aksara: 'ᬮ', latin: 'la' },
        { aksara: 'ᬫ', latin: 'ma' },
        { aksara: 'ᬕ', latin: 'ga' },
        { aksara: 'ᬩ', latin: 'ba' },
        { aksara: 'ᬗ', latin: 'nga' },
        { aksara: 'ᬧ', latin: 'pa' },
        { aksara: 'ᬚ', latin: 'ja' },
        { aksara: 'ᬜ', latin: 'nya' },
        { aksara: 'ᬬ', latin: 'ya' }
    ];

    const totalSessions = aksaraData.length;
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;

    const aksaraDisplay = document.getElementById('aksara-display');
    const choicesContainer = document.getElementById('choices-container');
    const feedbackMessage = document.getElementById('feedback-message');
    const currentSessionSpan = document.getElementById('current-session');
    const totalSessionsSpan = document.getElementById('total-sessions');

    const gameScreen = document.getElementById('game-screen');
    const scoreScreen = document.getElementById('score-screen');
    const finalScoreSpan = document.getElementById('final-score');
    const maxScoreSpan = document.getElementById('max-score');
    const scorePercentageSpan = document.getElementById('score-percentage');
    const scoreMessage = document.getElementById('score-message');
    const restartButton = document.getElementById('restart-button');

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    function playSound(frequency, duration, type = 'sine') {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration / 1000);
    }

    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function prepareQuestions() {
        questions = shuffleArray(aksaraData); // Pastikan semua 18 muncul, tapi acak
    }

    function loadQuestion() {
        if (currentQuestionIndex < totalSessions) {
            const currentQuestion = questions[currentQuestionIndex];
            aksaraDisplay.textContent = currentQuestion.aksara;
            feedbackMessage.textContent = '';
            feedbackMessage.classList.remove('correct', 'incorrect');
            currentSessionSpan.textContent = currentQuestionIndex + 1;
            totalSessionsSpan.textContent = totalSessions;
            renderChoices(currentQuestion);
        } else {
            endGame();
        }
    }

    function renderChoices(currentQuestion) {
        choicesContainer.innerHTML = '';

        let choices = [currentQuestion.latin];
        const wrongChoicesPool = aksaraData.filter(item => item.latin !== currentQuestion.latin);
        const shuffledWrongChoices = shuffleArray(wrongChoicesPool).slice(0, 3);

        shuffledWrongChoices.forEach(item => choices.push(item.latin));
        choices = shuffleArray(choices);

        choices.forEach(choice => {
            const button = document.createElement('button');
            button.classList.add('choice-button');
            button.textContent = choice.charAt(0).toUpperCase() + choice.slice(1);
            button.dataset.answer = choice.toLowerCase();
            button.addEventListener('click', () => checkAnswer(button, currentQuestion.latin));
            choicesContainer.appendChild(button);
        });
    }

    function disableChoices() {
        Array.from(choicesContainer.children).forEach(button => button.disabled = true);
    }

    function enableChoices() {
        Array.from(choicesContainer.children).forEach(button => {
            button.disabled = false;
            button.classList.remove('correct-answer', 'incorrect-answer');
        });
    }

    function checkAnswer(clickedButton, correctAnswer) {
        disableChoices();
        const userAnswer = clickedButton.dataset.answer;

        if (userAnswer === correctAnswer.toLowerCase()) {
            feedbackMessage.textContent = 'Benar!';
            feedbackMessage.classList.add('correct');
            clickedButton.classList.add('correct-answer');
            score++;
            playSound(880, 150, 'sine');
        } else {
            feedbackMessage.textContent = `Salah. Jawaban: "${correctAnswer}"`;
            feedbackMessage.classList.add('incorrect');
            clickedButton.classList.add('incorrect-answer');
            playSound(220, 200, 'triangle');

            Array.from(choicesContainer.children).forEach(button => {
                if (button.dataset.answer === correctAnswer.toLowerCase()) {
                    button.classList.add('correct-answer');
                }
            });
        }

        setTimeout(() => {
            currentQuestionIndex++;
            enableChoices();
            loadQuestion();
        }, 1500);
    }

    function endGame() {
        gameScreen.classList.add('hidden');
        scoreScreen.classList.remove('hidden');
        finalScoreSpan.textContent = score;
        maxScoreSpan.textContent = totalSessions;

        const percentage = (score / totalSessions) * 100;
        scorePercentageSpan.textContent = `${percentage.toFixed(0)}%`;

        if (score === totalSessions) {
            scoreMessage.textContent = 'Luar Biasa! Anda menguasai semua Aksara Bali!';
            scoreMessage.style.color = '#28a745';
        } else if (percentage >= 70) {
            scoreMessage.textContent = 'Kerja bagus! Anda sudah sangat mahir. Terus berlatih!';
            scoreMessage.style.color = '#007bff';
        } else if (percentage >= 50) {
            scoreMessage.textContent = 'Lumayan! Terus tingkatkan kemampuan Anda dalam Aksara Bali.';
            scoreMessage.style.color = '#ffc107';
        } else {
            scoreMessage.textContent = 'Jangan menyerah! Terus berlatih untuk menguasai Aksara Bali.';
            scoreMessage.style.color = '#dc3545';
        }
    }

    function resetGame() {
        score = 0;
        currentQuestionIndex = 0;
        prepareQuestions();
        gameScreen.classList.remove('hidden');
        scoreScreen.classList.add('hidden');
        loadQuestion();
    }

    restartButton.addEventListener('click', resetGame);

    // Start game on load
    prepareQuestions();
    loadQuestion();
});
