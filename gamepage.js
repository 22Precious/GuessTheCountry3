// Global variables
let flagImgDiv = document.querySelector('.flag-img');
let flagImg = document.querySelector('.flag-img img');
let flagOptions = document.querySelector('.flag-options ul');
let flagList = document.querySelectorAll('.flag-options ul li');
let score = document.querySelector('h3 span');
let scoreDiv = document.querySelector('.score');
let correctAns = document.querySelector('.score .right span');
let incorrectAns = document.querySelector('.score .incorrect span');
let totalQuestions = 0;
let currentIndex = 0;
let rightAnswer = 0;


// Fetch questions
function getQuestions() {
    let myRequest = new XMLHttpRequest();
    myRequest.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let questions = JSON.parse(this.responseText);
            console.log(questions);

            // Number of Seconds per game
            let duration = 60;
            questions = questions.sort(() => Math.random() - Math.random()).slice(0, 85);
            addQuestionData(questions[currentIndex], duration);

            flagList.forEach(li => {
                li.addEventListener('click', () => {
                    let rightAnswer = questions[currentIndex].right_answer;
                    li.classList.add('active');
                    currentIndex++;

                    setTimeout(() => {
                        checkAnswer(rightAnswer);
                    }, 150);

                    setTimeout(() => {
                        flagImg.src = "";
                        li.classList.remove('active', 'success', 'wrong');
                        if (currentIndex < questions.length) {
                            addQuestionData(questions[currentIndex], duration);
                        } else {
                            showResults(); // End game if all questions are answered
                        }
                    }, 400);
                });
            });
        }
    };
    myRequest.open("GET", "flag-question.json", true);
    myRequest.send();
}

// Show results and handle game end
function showResults() {
    flagOptions.innerHTML = '';
    flagImgDiv.innerHTML = '';
    scoreDiv.style.display = 'block';
    correctAns.innerHTML = rightAnswer;
    incorrectAns.innerHTML = totalQuestions - rightAnswer;
    endGame(rightAnswer); // End the game and redirect to leaderboard
    
}

// Countdown timer
function startCountdown(duration, display) {
    let timer = duration;
    let countdown = setInterval(function() {
        let seconds = timer;
        display.innerHTML = seconds;
        if (timer <= 0) {
            clearInterval(countdown);
            showResults();
        }
        timer--;
    }, 1000);
}

// Start game on page load
window.onload = function() {
    if (window.location.pathname.includes('gamepage.html')) {
        getQuestions();
        timeSpan = document.querySelector('.time span');
        scoreDiv.style.display = 'none';
        let duration = 60; // Set to 60 seconds for the full game
        startCountdown(duration, timeSpan);
     
        
    }
}

// Start the game and store player name in local storage
function startGame() {
    const playerName = document.getElementById('playerName').value;
    if (playerName) {
        localStorage.setItem('currentPlayer', playerName);
        window.location.href = 'gamepage.html';
    }
}

// Add question data to UI
function addQuestionData(obj, count) {
    if (currentIndex < count) {
        flagImg.src = `${obj.img}`;
        console.log(flagImg.src);

        flagList.forEach((li, i) => {
            li.id = `answer_${i + 1}`;
            li.dataset.answer = obj['options'][i];
            li.innerHTML = obj['options'][i];
        });
    }
}

// Check answer
function checkAnswer(rAnswer) {
    let chosenAnswer;
    for (let i = 0; i < flagList.length; i++) {
        if (flagList[i].classList.contains('active')) {
            chosenAnswer = flagList[i].dataset.answer;
            if (rAnswer === chosenAnswer) {
                flagList[i].classList.add('success');
                rightAnswer++;
                score.innerHTML = rightAnswer;
            } else {
                flagList[i].classList.add('wrong');
            }
            totalQuestions++;
        }
    }
}

// End the game and store the player's score
function endGame(rightAnswer) {
    const playerName = localStorage.getItem('currentPlayer');

    if (playerName) {
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

        // Push new player score
        leaderboard.push({ name: playerName, score: rightAnswer,  incorrectAnswers: incorrectAns });

        // Sort leaderboard by score (descending order)
        leaderboard.sort((a, b) => {
            if (b.score === a.score) {
                return a.incorrectAnswers - b.incorrectAnswers; // Fewer incorrect answers rank higher
            }
            return b.score - a.score; // Higher score ranks higher
        });
           
        

        // Save updated leaderboard to local storage
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

        // Redirect to leaderboard page
        
    }
}
 

