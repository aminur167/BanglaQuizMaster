// বাংলা এসএসসি কোয়িজ অ্যাপ্লিকেশন - যোগাযোগ ফিচার সহ
class BanglaSSCQuiz {
    constructor() {
        this.currentScreen = 'home';
        this.selectedMode = null;
        this.selectedChapter = null;
        this.selectedTopic = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.timer = null;
        this.timeLeft = 20;
        this.questions = [];
        this.userAnswers = [];
        this.isDarkMode = false;
        this.questionsPerQuiz = 20;
        this.skippedQuestions = [];
        this.answeredQuestions = new Set();

        this.initializeElements();
        this.bindEvents();
        this.loadBestScores();
        this.applyTheme();
    }

    // DOM এলিমেন্ট ইনিশিয়ালাইজেশন
    initializeElements() {
        // স্ক্রিনস
        this.screens = {
            home: document.querySelector('.home-screen'),
            chapter: document.querySelector('.chapter-screen'),
            topic: document.querySelector('.topic-screen'),
            quiz: document.querySelector('.quiz-screen'),
            result: document.querySelector('.result-screen'),
            contact: document.querySelector('.contact-screen')
        };

        // বাটনস
        this.modeCards = document.querySelectorAll('.mode-card');
        this.chapterCards = document.querySelectorAll('.chapter-card');
        this.backToHomeBtn = document.getElementById('backToHome');
        this.backToChapterBtn = document.getElementById('backToChapter');
        this.backToHomeFromContactBtn = document.getElementById('backToHomeFromContact');
        this.quitQuizBtn = document.getElementById('quitQuiz');
        this.nextQuestionBtn = document.getElementById('nextQuestion');
        this.prevQuestionBtn = document.getElementById('prevQuestion');
        this.skipQuestionBtn = document.getElementById('skipQuestion');
        this.contactBtn = document.getElementById('contactBtn');
        this.newQuizBtn = document.getElementById('newQuiz');
        this.reviewAnswersBtn = document.getElementById('reviewAnswers');
        this.themeToggleBtn = document.getElementById('themeToggle');

        // কোয়িজ এলিমেন্টস
        this.timerElement = document.getElementById('timer');
        this.timeLine = document.getElementById('timeLine');
        this.timerContainer = document.getElementById('timerContainer');
        this.questionText = document.getElementById('questionText');
        this.optionsContainer = document.getElementById('optionsContainer');
        this.progressText = document.getElementById('progressText');
        this.progressPercent = document.getElementById('progressPercent');
        this.progressFill = document.getElementById('progressFill');
        this.explanationContainer = document.getElementById('explanationContainer');
        this.explanationText = document.getElementById('explanationText');
        this.currentChapterElement = document.getElementById('currentChapter');
        this.currentTopicElement = document.getElementById('currentTopic');
        this.currentModeElement = document.getElementById('currentMode');

        // রেজাল্ট এলিমেন্টস
        this.finalScore = document.getElementById('finalScore');
        this.scoreText = document.getElementById('scoreText');
        this.correctAnswers = document.getElementById('correctAnswers');
        this.wrongAnswers = document.getElementById('wrongAnswers');
        this.totalQuestions = document.getElementById('totalQuestions');
        this.bestScoreElement = document.getElementById('bestScore');
        this.resultTrophy = document.getElementById('resultTrophy');
        this.wrongAnswersList = document.getElementById('wrongAnswersList');

        // টপিক এলিমেন্টস
        this.topicCardsContainer = document.getElementById('topicCards');
        this.topicTitle = document.getElementById('topicTitle');

        // সাউন্ড
        this.correctSound = document.getElementById('correctSound');
        this.wrongSound = document.getElementById('wrongSound');
    }

    // ইভেন্ট বাইন্ডিং
    bindEvents() {
        // মোড সিলেকশন
        this.modeCards.forEach(card => {
            card.addEventListener('click', () => this.selectMode(card.dataset.mode));
        });

        // অধ্যায় সিলেকশন
        this.chapterCards.forEach(card => {
            card.addEventListener('click', () => this.selectChapter(card.dataset.chapter));
        });

        // নেভিগেশন বাটন
        this.backToHomeBtn.addEventListener('click', () => this.showScreen('home'));
        this.backToChapterBtn.addEventListener('click', () => this.showScreen('chapter'));
        this.backToHomeFromContactBtn.addEventListener('click', () => this.showScreen('home'));
        this.quitQuizBtn.addEventListener('click', () => this.quitQuiz());
        this.nextQuestionBtn.addEventListener('click', () => this.nextQuestion());
        this.prevQuestionBtn.addEventListener('click', () => this.prevQuestion());
        this.skipQuestionBtn.addEventListener('click', () => this.skipQuestion());
        this.contactBtn.addEventListener('click', () => this.showScreen('contact'));
        this.newQuizBtn.addEventListener('click', () => this.startNewQuiz());
        this.reviewAnswersBtn.addEventListener('click', () => this.reviewAnswers());

        // থিম টগল
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

        // কিবোর্ড সাপোর্ট
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // কিবোর্ড নেভিগেশন
    handleKeyboard(e) {
        if (this.currentScreen === 'quiz') {
            if (e.key >= '1' && e.key <= '4') {
                const optionIndex = parseInt(e.key) - 1;
                const options = this.optionsContainer.querySelectorAll('.option');
                if (options[optionIndex] && !options[optionIndex].classList.contains('disabled')) {
                    this.selectOption(options[optionIndex]);
                }
            } else if (e.key === 'Enter' && !this.nextQuestionBtn.disabled) {
                this.nextQuestion();
            } else if (e.key === 'ArrowLeft' && !this.prevQuestionBtn.disabled) {
                this.prevQuestion();
            } else if (e.key === 's' || e.key === 'S') {
                this.skipQuestion();
            }
        }
    }

    // স্ক্রিন ম্যানেজমেন্ট
    showScreen(screenName) {
        this.currentScreen = screenName;
        
        // সব স্ক্রিন হাইড করুন
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });

        // নির্বাচিত স্ক্রিন দেখান
        this.screens[screenName].classList.add('active');

        // বিশেষ একশন
        if (screenName === 'home') {
            this.resetQuiz();
        } else if (screenName === 'chapter') {
            this.updateChapterScreen();
        } else if (screenName === 'topic') {
            this.loadTopics();
        }
    }

    // মোড সিলেক্ট
    selectMode(mode) {
        this.selectedMode = mode;
        this.showScreen('chapter');
    }

    // অধ্যায় সিলেক্ট
    selectChapter(chapter) {
        this.selectedChapter = chapter;
        this.showScreen('topic');
    }

    // টপিক সিলেক্ট
    selectTopic(topic) {
        this.selectedTopic = topic;
        this.startQuiz();
    }

    // অধ্যায় স্ক্রিন আপডেট
    updateChapterScreen() {
        const modeTitle = document.getElementById('modeTitle');
        const modeText = this.selectedMode === 'practice' ? 'প্র্যাকটিস মোড' : 'পরীক্ষার মোড';
        modeTitle.textContent = `${modeText} - অধ্যায় নির্বাচন করুন`;
    }

    // টপিক লোড
    loadTopics() {
        if (!this.selectedChapter) return;

        const topics = QuestionManager.getAllTopics(this.selectedChapter);
        this.topicCardsContainer.innerHTML = '';

        // টপিক টাইটেল আপডেট
        const modeText = this.selectedMode === 'practice' ? 'প্র্যাকটিস মোড' : 'পরীক্ষার মোড';
        this.topicTitle.textContent = `${this.selectedChapter} - ${modeText}`;

        topics.forEach(topic => {
            const topicInfo = QuestionManager.getTopicInfo(this.selectedChapter, topic);
            const totalQuestions = QuestionManager.getTotalQuestions(this.selectedChapter, topic);
            
            const topicCard = document.createElement('div');
            topicCard.className = 'topic-card';
            topicCard.innerHTML = `
                <i class="fas fa-${this.selectedChapter === 'কবিতা' ? 'pen-fancy' : 'book'}"></i>
                <h3>${topic}</h3>
                <p>${this.selectedChapter === 'কবিতা' ? 'কবি: ' + topicInfo.poet : 'লেখক: ' + topicInfo.author}</p>
                <div class="topic-info">
                    <span class="question-count">${totalQuestions} প্রশ্ন</span>
                    <span class="topic-poet">${this.selectedChapter === 'কবিতা' ? topicInfo.poet : topicInfo.author}</span>
                </div>
            `;
            topicCard.addEventListener('click', () => this.selectTopic(topic));
            this.topicCardsContainer.appendChild(topicCard);
        });
    }

    // কোয়িজ শুরু
    startQuiz() {
        this.questions = QuestionManager.prepareQuizQuestions(
            this.selectedChapter, 
            this.selectedTopic, 
            this.questionsPerQuiz
        );
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.skippedQuestions = [];
        this.answeredQuestions.clear();
        
        this.showScreen('quiz');
        this.showQuestion();
        
        // টাইমার শুধু পরীক্ষার মোডে
        if (this.selectedMode === 'exam') {
            this.startTimer();
            this.timerContainer.style.display = 'flex';
        } else {
            this.timerContainer.style.display = 'none';
        }
    }

    // প্রশ্ন দেখান
    showQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            // যদি Skip করা প্রশ্ন থাকে, সেগুলো দেখান
            if (this.skippedQuestions.length > 0) {
                this.showSkippedQuestions();
                return;
            } else {
                this.showResults();
                return;
            }
        }

        const question = this.questions[this.currentQuestionIndex];
        
        // প্রশ্ন টেক্সট আপডেট
        this.questionText.textContent = question.question;
        
        // প্রোগ্রেস আপডেট
        this.updateProgress();
        
        // অপশন তৈরি
        this.createOptions(question.options);
        
        // UI স্টেট রিসেট
        this.nextQuestionBtn.disabled = true;
        this.skipQuestionBtn.disabled = false;
        this.prevQuestionBtn.disabled = this.currentQuestionIndex === 0;
        this.explanationContainer.classList.remove('show');
        
        // যদি আগেই উত্তর দেওয়া হয়ে থাকে, সেটা দেখান
        if (this.answeredQuestions.has(this.currentQuestionIndex)) {
            this.showPreviousAnswer();
        }
        
        // পরীক্ষার মোডে টাইমার রিসেট
        if (this.selectedMode === 'exam') {
            this.timeLeft = 20;
            this.timerElement.textContent = this.timeLeft;
            this.timerElement.className = 'timer-seconds';
            this.timeLine.className = 'time-line';
            this.startTimer();
            this.startTimeLine();
        }

        // কারেন্ট ইনফো আপডেট
        this.currentChapterElement.textContent = `${this.selectedChapter} অধ্যায়`;
        this.currentTopicElement.textContent = this.selectedTopic;
        this.currentModeElement.textContent = this.selectedMode === 'practice' ? 'প্র্যাকটিস মোড' : 'পরীক্ষার মোড';
    }

    // Skip করা প্রশ্নগুলো দেখান
    showSkippedQuestions() {
        // Skip করা প্রশ্নগুলোকে মূল প্রশ্ন লিস্টে যোগ করুন
        this.questions = [...this.skippedQuestions];
        this.skippedQuestions = [];
        this.currentQuestionIndex = 0;
        this.showQuestion();
    }

    // পূর্ববর্তী উত্তর দেখান
    showPreviousAnswer() {
        const userAnswer = this.userAnswers.find(answer => 
            answer.questionIndex === this.currentQuestionIndex
        );
        
        if (userAnswer) {
            const allOptions = this.optionsContainer.querySelectorAll('.option');
            
            // সব অপশন ডিজেবল করুন
            allOptions.forEach(option => option.classList.add('disabled'));
            
            // ইউজারের উত্তর হাইলাইট করুন
            allOptions.forEach(option => {
                const optionText = option.querySelector('span').textContent.replace(/^[A-D]\)\s/, '');
                if (optionText === userAnswer.userAnswer) {
                    if (userAnswer.isCorrect) {
                        option.classList.add('correct');
                    } else {
                        option.classList.add('incorrect');
                    }
                }
                
                // সঠিক উত্তর হাইলাইট করুন
                if (optionText === userAnswer.correctAnswer && !userAnswer.isCorrect) {
                    option.classList.add('correct');
                }
            });
            
            // প্র্যাকটিস মোডে ব্যাখ্যা দেখান
            if (this.selectedMode === 'practice') {
                this.explanationText.textContent = userAnswer.explanation;
                this.explanationContainer.classList.add('show');
            }
            
            this.nextQuestionBtn.disabled = false;
            this.skipQuestionBtn.disabled = true;
        }
    }

    // অপশন তৈরি
    createOptions(options) {
        this.optionsContainer.innerHTML = '';
        
        options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <span>${String.fromCharCode(65 + index)}) ${option}</span>
                <span class="option-icon">
                    <i class="fas fa-check"></i>
                </span>
            `;
            optionElement.addEventListener('click', () => this.selectOption(optionElement));
            this.optionsContainer.appendChild(optionElement);
        });
    }

    // অপশন সিলেক্ট
    selectOption(selectedOption) {
        if (selectedOption.classList.contains('disabled')) return;

        // সব অপশন ডিজেবল করুন
        const allOptions = this.optionsContainer.querySelectorAll('.option');
        allOptions.forEach(option => option.classList.add('disabled'));

        // Skip বাটন ডিজেবল করুন
        this.skipQuestionBtn.disabled = true;

        // সিলেক্টেড এবং সঠিক উত্তর
        const selectedAnswer = selectedOption.querySelector('span').textContent.replace(/^[A-D]\)\s/, '');
        const correctAnswer = this.questions[this.currentQuestionIndex].answer;

        // উত্তর দেওয়া প্রশ্ন হিসেবে মার্ক করুন
        this.answeredQuestions.add(this.currentQuestionIndex);

        // ইউজার উত্তর স্টোর করুন
        this.userAnswers.push({
            question: this.questions[this.currentQuestionIndex].question,
            userAnswer: selectedAnswer,
            correctAnswer: correctAnswer,
            isCorrect: selectedAnswer === correctAnswer,
            isSkipped: false,
            questionIndex: this.currentQuestionIndex,
            explanation: this.questions[this.currentQuestionIndex].explanation
        });

        // উত্তর চেক করুন
        if (selectedAnswer === correctAnswer) {
            selectedOption.classList.add('correct');
            this.score++;
            this.playSound('correct');
        } else {
            selectedOption.classList.add('incorrect');
            this.playSound('wrong');
            
            // সঠিক উত্তর হাইলাইট করুন
            allOptions.forEach(option => {
                const optionText = option.querySelector('span').textContent.replace(/^[A-D]\)\s/, '');
                if (optionText === correctAnswer) {
                    option.classList.add('correct');
                }
            });
        }

        // প্র্যাকটিস মোডে ব্যাখ্যা দেখান
        if (this.selectedMode === 'practice') {
            this.showExplanation();
        }

        // টাইমার বন্ধ করুন এবং নেক্সট বাটন এনাবল করুন
        this.stopTimer();
        this.stopTimeLine();
        this.nextQuestionBtn.disabled = false;
    }

    // প্রশ্ন Skip করুন
    skipQuestion() {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        
        // বর্তমান প্রশ্নটি Skip করা প্রশ্নের লিস্টে যোগ করুন
        this.skippedQuestions.push(currentQuestion);
        
        // উত্তর দেওয়া প্রশ্ন হিসেবে মার্ক করুন
        this.answeredQuestions.add(this.currentQuestionIndex);
        
        // ইউজার উত্তর স্টোর করুন (Skip হিসেবে)
        this.userAnswers.push({
            question: currentQuestion.question,
            userAnswer: null,
            correctAnswer: currentQuestion.answer,
            isCorrect: false,
            isSkipped: true,
            questionIndex: this.currentQuestionIndex,
            explanation: currentQuestion.explanation
        });

        // পরবর্তী প্রশ্নে যান
        this.currentQuestionIndex++;
        this.showQuestion();
        
        // টাইমার রিসেট করুন (পরীক্ষার মোডে)
        if (this.selectedMode === 'exam') {
            this.stopTimer();
            this.stopTimeLine();
        }
    }

    // পূর্ববর্তী প্রশ্নে যান
    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion();
            
            // টাইমার রিসেট করুন (পরীক্ষার মোডে)
            if (this.selectedMode === 'exam') {
                this.stopTimer();
                this.stopTimeLine();
            }
        }
    }

    // ব্যাখ্যা দেখান (প্র্যাকটিস মোড)
    showExplanation() {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        this.explanationText.textContent = currentQuestion.explanation;
        this.explanationContainer.classList.add('show');
    }

    // প্রোগ্রেস আপডেট
    updateProgress() {
        const totalQuestions = this.questions.length + this.skippedQuestions.length;
        const answeredQuestions = this.answeredQuestions.size;
        const progress = (answeredQuestions / totalQuestions) * 100;
        
        this.progressText.textContent = `প্রশ্ন ${answeredQuestions}/${totalQuestions}`;
        this.progressPercent.textContent = `${Math.round(progress)}%`;
        this.progressFill.style.width = `${progress}%`;
    }

    // পরবর্তী প্রশ্ন
    nextQuestion() {
        this.currentQuestionIndex++;
        this.showQuestion();
    }

    // টাইমার ফাংশন
    startTimer() {
        this.stopTimer();
        this.timeLeft = 20;
        this.timerElement.textContent = this.timeLeft;

        this.timer = setInterval(() => {
            this.timeLeft--;
            this.timerElement.textContent = this.timeLeft;

            // ওয়ার্নিং স্টেটস
            if (this.timeLeft <= 5) {
                this.timerElement.classList.add('danger');
                this.timeLine.classList.add('danger');
            } else if (this.timeLeft <= 10) {
                this.timerElement.classList.add('warning');
                this.timeLine.classList.add('warning');
            }

            // টাইম আপ
            if (this.timeLeft <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    startTimeLine() {
        this.timeLine.classList.add('running');
    }

    stopTimeLine() {
        this.timeLine.classList.remove('running');
    }

    // টাইম আপ হ্যান্ডলার
    handleTimeUp() {
        this.stopTimer();
        this.stopTimeLine();
        
        const allOptions = this.optionsContainer.querySelectorAll('.option');
        const correctAnswer = this.questions[this.currentQuestionIndex].answer;

        // সব অপশন ডিজেবল করুন এবং সঠিক উত্তর দেখান
        allOptions.forEach(option => {
            option.classList.add('disabled');
            const optionText = option.querySelector('span').textContent.replace(/^[A-D]\)\s/, '');
            if (optionText === correctAnswer) {
                option.classList.add('correct');
            }
        });

        // উত্তর দেওয়া প্রশ্ন হিসেবে মার্ক করুন
        this.answeredQuestions.add(this.currentQuestionIndex);

        // আনআনসার্ড প্রশ্ন স্টোর করুন
        this.userAnswers.push({
            question: this.questions[this.currentQuestionIndex].question,
            userAnswer: null,
            correctAnswer: correctAnswer,
            isCorrect: false,
            isSkipped: false,
            questionIndex: this.currentQuestionIndex,
            explanation: this.questions[this.currentQuestionIndex].explanation
        });

        this.nextQuestionBtn.disabled = false;
        this.skipQuestionBtn.disabled = true;
    }

    // রেজাল্ট দেখান
    showResults() {
        this.stopTimer();
        this.stopTimeLine();
        
        const totalAnswered = this.userAnswers.filter(answer => !answer.isSkipped).length;
        const percentage = totalAnswered > 0 ? Math.round((this.score / totalAnswered) * 100) : 0;
        
        // রেজাল্ট এলিমেন্টস আপডেট
        this.finalScore.textContent = `${percentage}%`;
        this.correctAnswers.textContent = this.score;
        this.wrongAnswers.textContent = totalAnswered - this.score;
        this.totalQuestions.textContent = totalAnswered;

        // স্কোর টেক্সট এবং আইকন সেট করুন
        this.setResultMessage(percentage);
        
        // বেস্ট স্কোর আপডেট
        this.updateBestScore(this.selectedChapter, this.selectedTopic, percentage);
        
        // উত্তরের বিশ্লেষণ দেখান
        this.showAnswersAnalysis();
        
        this.showScreen('result');
    }

    // রেজাল্ট মেসেজ সেট
    setResultMessage(percentage) {
        if (percentage >= 80) {
            this.scoreText.textContent = "অভিনন্দন! আপনি অসাধারণ!";
            this.resultTrophy.className = "fas fa-trophy";
        } else if (percentage >= 60) {
            this.scoreText.textContent = "ভালো করেছেন! আরও চর্চা করুন!";
            this.resultTrophy.className = "fas fa-award";
        } else if (percentage >= 40) {
            this.scoreText.textContent = "মোটামুটি হয়েছে, আরও পড়ুন!";
            this.resultTrophy.className = "fas fa-star";
        } else {
            this.scoreText.textContent = "আরও মনোযোগ দিন, চেষ্টা চালিয়ে যান!";
            this.resultTrophy.className = "fas fa-redo";
        }
    }

    // উত্তরের বিশ্লেষণ
    showAnswersAnalysis() {
        this.wrongAnswersList.innerHTML = '';
        
        const wrongAnswers = this.userAnswers.filter(answer => !answer.isCorrect && !answer.isSkipped);
        const skippedAnswers = this.userAnswers.filter(answer => answer.isSkipped);
        
        if (wrongAnswers.length === 0 && skippedAnswers.length === 0) {
            this.wrongAnswersList.innerHTML = '<p style="color: white; text-align: center;">আপনার সব উত্তর সঠিক!</p>';
            return;
        }

        // ভুল উত্তরের বিশ্লেষণ
        if (wrongAnswers.length > 0) {
            wrongAnswers.forEach((answer, index) => {
                const wrongAnswerItem = document.createElement('div');
                wrongAnswerItem.className = 'wrong-answer-item';
                wrongAnswerItem.innerHTML = `
                    <div class="wrong-question">${index + 1}. ${answer.question}</div>
                    <div class="wrong-answer">আপনার উত্তর: ${answer.userAnswer}</div>
                    <div class="correct-answer">সঠিক উত্তর: ${answer.correctAnswer}</div>
                    <div class="explanation" style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-top: 5px;">${answer.explanation}</div>
                `;
                this.wrongAnswersList.appendChild(wrongAnswerItem);
            });
        }

        // Skip করা প্রশ্নের বিশ্লেষণ
        if (skippedAnswers.length > 0) {
            const skippedHeader = document.createElement('h4');
            skippedHeader.textContent = 'Skip করা প্রশ্ন:';
            skippedHeader.style.color = '#ffa500';
            skippedHeader.style.marginTop = '20px';
            skippedHeader.style.marginBottom = '15px';
            this.wrongAnswersList.appendChild(skippedHeader);

            skippedAnswers.forEach((answer, index) => {
                const skippedItem = document.createElement('div');
                skippedItem.className = 'wrong-answer-item skipped-answer-item';
                skippedItem.innerHTML = `
                    <div class="wrong-question">${index + 1}. ${answer.question}</div>
                    <div class="skipped-text">আপনি এই প্রশ্নটি Skip করেছেন</div>
                    <div class="correct-answer">সঠিক উত্তর: ${answer.correctAnswer}</div>
                    <div class="explanation" style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-top: 5px;">${answer.explanation}</div>
                `;
                this.wrongAnswersList.appendChild(skippedItem);
            });
        }
    }

    // বেস্ট স্কোর ম্যানেজমেন্ট
    loadBestScores() {
        this.bestScores = JSON.parse(localStorage.getItem('banglaQuizBestScores')) || {};
    }

    updateBestScore(chapter, topic, newScore) {
        const key = `${chapter}_${topic}`;
        if (!this.bestScores[key] || newScore > this.bestScores[key]) {
            this.bestScores[key] = newScore;
            localStorage.setItem('banglaQuizBestScores', JSON.stringify(this.bestScores));
        }
        this.bestScoreElement.textContent = `${this.bestScores[key] || 0}%`;
    }

    // উত্তর রিভিউ
    reviewAnswers() {
        alert('উত্তর রিভিউ ফিচারটি শীঘ্রই আসছে! আপনি ভুল উত্তরের তালিকা থেকে সব উত্তর দেখতে পারবেন।');
    }

    // নতুন কোয়িজ শুরু
    startNewQuiz() {
        this.showScreen('topic');
    }

    // কোয়িজ ছাড়ুন
    quitQuiz() {
        if (confirm('আপনি কি নিশ্চিত যে কোয়িজ ছাড়তে চান? আপনার বর্তমান প্রগ্রেস হারিয়ে যাবে।')) {
            this.showScreen('home');
        }
    }

    // থিম ম্যানেজমেন্ট
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
    }

    applyTheme() {
        if (this.isDarkMode) {
            document.body.setAttribute('data-theme', 'dark');
            this.themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.removeAttribute('data-theme');
            this.themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    // সাউন্ড ইফেক্ট
    playSound(type) {
        if (type === 'correct') {
            this.correctSound.currentTime = 0;
            this.correctSound.play().catch(e => console.log('Audio play failed:', e));
        } else if (type === 'wrong') {
            this.wrongSound.currentTime = 0;
            this.wrongSound.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    // কোয়িজ রিসেট
    resetQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.skippedQuestions = [];
        this.answeredQuestions.clear();
        this.stopTimer();
        this.stopTimeLine();
        this.nextQuestionBtn.disabled = true;
        this.prevQuestionBtn.disabled = true;
        this.skipQuestionBtn.disabled = false;
    }
}

// অ্যাপ্লিকেশন ইনিশিয়ালাইজ
document.addEventListener('DOMContentLoaded', () => {
    new BanglaSSCQuiz();
});