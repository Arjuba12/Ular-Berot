const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
const toast = document.querySelector(".toast"),
      closeIcons = document.querySelector(".close"),
      progress = document.querySelector(".progress");
const highScoreScreen = document.querySelector(".score-screen");

 var container = document.querySelector(".wrapper");
 var myBgm = document.getElementById("bgm");
 var eatSfx = new Audio ('./asset/sfx-eat.wav');
 myBgm.volume = 0.4;


// ---Main-Menu---
document.getElementById('start-game').addEventListener('click', () => {
  document.querySelector('.main-menu').style.display = 'none';
  document.querySelector('.wrapper').style.display = 'flex';
  // Initialize the game
  startGame();
});
// -----High-Score Screen-----
document.getElementById('high-scores').addEventListener('click', () => {
  document.querySelector('.main-menu').style.display = 'none';
  document.querySelector('.high-scores-screen').style.display = 'block';
  // Load high scores
  loadHighScores();
});

document.getElementById('achievements').addEventListener('click', () => {
  document.querySelector('.main-menu').style.display = 'none';
  document.querySelector('.achievements-screen').style.display = 'block';
  // Load achievements
  loadAchievements();
});

document.getElementById('settings').addEventListener('click', () => {
  document.querySelector('.main-menu').style.display = 'none';
  document.querySelector('.settings-screen').style.display = 'block';
  // Load settings
});

document.getElementById('back-to-menu').addEventListener('click', () => {
  document.querySelector('.high-scores-screen').style.display = 'none';
  document.querySelector('.main-menu').style.display = 'flex';
});

document.getElementById('back-to-menu-achievements').addEventListener('click', () => {
  document.querySelector('.achievements-screen').style.display = 'none';
  document.querySelector('.main-menu').style.display = 'flex';
});

document.getElementById('back-to-menu-settings').addEventListener('click', () => {
  document.querySelector('.settings-screen').style.display = 'none';
  document.querySelector('.main-menu').style.display = 'flex';
  document.querySelector('.game-title').style.display = 'flex';
});

document.getElementById('exit-game').addEventListener('click', () => {
  window.close(); // Note: This will only work for desktop applications or browser extensions
});

function startGame() {
  // Your existing game initialization code here
  myBgm.play();
  
}

function loadHighScores() {
  // Load high scores from localStorage and display them
  const scoresList = document.getElementById('scores-list');
  const highScores = JSON.parse(localStorage.getItem('high-scores')) || [];
  scoresList.innerHTML = highScores.map(score => `<p>${score}</p>`).join('');
}

function loadAchievements() {
  // Load achievements from localStorage and display them
  const achievementsList = document.getElementById('achievements-list');
  const achievements = JSON.parse(localStorage.getItem('achievements')) || [];
  achievementsList.innerHTML = achievements.map(achievement => `<p>${achievement}</p>`).join('');
}

// Existing game logic here...
// ==================Main Game Code=======================

let gameOver = false;
let foodX, foodY;
let specialX, specialY;
let snakeX = 5,
  snakeY = 5;
let velocityX = 0,
  velocityY = 0;
let snakeBody = [];
let obstacles = [];
let animationFrameId;
let score = 0;
let highScore = localStorage.getItem("high-score") || 0;
let lastRenderTime = 0;
let baseSpeed = 110; // Base speed in ms
let gameSpeed = baseSpeed;
let specialItemExists = false;
let spanActive = false;

function pickupMsg(){
  document.getElementById("span1").innerHTML= "Destruct"
  document.getElementById("span2").innerHTML= "Obstacle Dihancurkan"
}

function speedUpMsg(){
  document.getElementById("span1").innerHTML= "Speed Up"
  document.getElementById("span2").innerHTML= "Kecepatan Bertambah"
}

//------------ code untuk touchscreen ---------------
container.addEventListener("touchstart", startTouch, false);
container.addEventListener("touchmove", moveTouch, false);

var initialX = null;
var initialY = null;

function startTouch(e) {
  initialX = e.touches[0].clientX;
  initialY = e.touches[0].clientY;
}

function moveTouch(e) {
  if (initialX === null) {
    return;
  }

  if (initialY === null) {
    return;
  }

  var currentX = e.touches[0].clientX;
  var currentY = e.touches[0].clientY;

  var diffX = initialX - currentX;
  var diffY = initialY - currentY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    // sliding horizontally
    if (diffX > 0 && velocityX !== 1) {
      // swiped left
      console.log("swiped left");
      velocityX = -1;
      velocityY = 0;
    } else if ((diffX = 1 && velocityX !== -1)) {
      // swiped right
      console.log("swiped right");
      velocityX = 1;
      velocityY = 0;
    }
  } else {
    // sliding vertically
    if (diffY > 0 && velocityY !== 1) {
      // swiped up
      console.log("swiped up");
      velocityX = 0;
      velocityY = -1;
    } else if ((diffY = 1 && velocityY !== -1)) {
      // swiped down
      console.log("swiped down");
      velocityX = 0;
      velocityY = 1;
    }
  }

  initialX = null;
  initialY = null;

  e.preventDefault();
}

// -----------------------------------------------------
highScoreElement.innerText = `High Score: ${highScore}`;
highScoreScreen.innerText = highScore;

// ----------------Item Position------------------------
const updateFoodPosition = () => {
  do {
    foodX = Math.floor(Math.random() * 25) + 1;
    foodY = Math.floor(Math.random() * 25) + 1;
  } while (isPositionOccupied(foodX, foodY));
};

const updateSpecialPosition = () => {
  do {
    specialX = Math.floor(Math.random() * 30) + 1;
    specialY = Math.floor(Math.random() * 30) + 1;
  } while (isPositionOccupied(specialX, specialY));
};

const isPositionOccupied = (x, y) => {
  return (
    snakeBody.some((part) => part[0] === x && part[1] === y) ||
    obstacles.some((obstacle) => obstacle[0] === x && obstacle[1] === y)
  );
};
// -------------------------------------------------------
const handleGameOver = () => {
  cancelAnimationFrame(animationFrameId);
  alert("Game Over! Press OK to replay...");
  location.reload();
};

// --------------Control--------------------
const changeDirection = (e) => {
  if (e.key === "ArrowUp" && velocityY !== 1) {
    velocityX = 0;
    velocityY = -1;
  } else if (e.key === "ArrowDown" && velocityY !== -1) {
    velocityX = 0;
    velocityY = 1;
  } else if (e.key === "ArrowLeft" && velocityX !== 1) {
    velocityX = -1;
    velocityY = 0;
  } else if (e.key === "ArrowRight" && velocityX !== -1) {
    velocityX = 1;
    velocityY = 0;
  }
};

// controls.forEach((button) =>
//   button.addEventListener("click", () =>
//     changeDirection({ key: button.dataset.key })
//   )
// );

const adjustSpeed = () => {
  // Increase speed for every 5 points scored
  if (score % 10 === 0) {
    gameSpeed = baseSpeed - score * 1.5; // Example speed increment logic
    gameSpeed = Math.max(gameSpeed, 80); // Minimum speed to avoid too fast gameplay
    spanActive = true;
    speedUpMsg();
  }
};
// ----NUM OF OBSTACLE----
const addObstacles = () => {
  let numObstacles;
  if (score >= 5 && score < 10) {
    numObstacles = 3;
  } else if (score >= 10 && score < 15) {
    numObstacles = 6;
  } else if (score >= 15 && score < 20) {
    numObstacles = 12;
  } else if (score >= 20 && score < 30) {
    numObstacles = 24;
  } else if (score >= 30 && score < 50) {
    numObstacles = 48;
  } else if (score >= 50 && score < 100) {
    numObstacles = 96;
  } else {
    numObstacles = 0; // No obstacles for score < 10
  }

  obstacles = []; // Clear existing obstacles
  for (let i = 0; i < numObstacles; i++) {
    let obstacleX, obstacleY;
    do {
      obstacleX = Math.floor(Math.random() * 30) + 2;
      obstacleY = Math.floor(Math.random() * 30) + 2;
    } while (
      isPositionOccupied(obstacleX, obstacleY) ||
      (Math.abs(obstacleX - snakeX) <= 1 && Math.abs(obstacleY - snakeY) <= 1)
    );
    obstacles.push([obstacleX, obstacleY]);
  }
};

const initGame = (currentTime) => {
  if (gameOver) return handleGameOver();

  animationFrameId = requestAnimationFrame(initGame);

  if (currentTime - lastRenderTime < gameSpeed) {
    return;
  }
  lastRenderTime = currentTime;

  let fragment = document.createDocumentFragment();
  let foodElement = document.createElement("div");
  foodElement.classList.add("food");
  foodElement.style.gridArea = `${foodY} / ${foodX}`;
  fragment.appendChild(foodElement);

  // -------------SPECIAL ITEM----------------
  if (!specialItemExists && score == 15) {
    // Example: add special item if score is 15 or more
    updateSpecialPosition();
    specialItemExists = true;
  }

  if (specialItemExists) {
    let specialElement = document.createElement("div");
    specialElement.classList.add("special");
    specialElement.style.gridArea = `${specialY} / ${specialX}`;
    fragment.appendChild(specialElement);
  }

  if (specialItemExists && snakeX === specialX && snakeY === specialY) {
    specialItemExists = false;
    obstacles = []; // Clear all obstacles
    spanActive = true;
    pickupMsg();
  }
// -------------MAKANAN--------------
  if (snakeX === foodX && snakeY === foodY) {
    updateFoodPosition();
    snakeBody.push([foodY, foodX]);
    score++;
    highScore = score >= highScore ? score : highScore;
    localStorage.setItem("high-score", highScore);
    scoreElement.innerText = `Score: ${score}`;
    highScoreElement.innerText = `High Score: ${highScore}`;
    adjustSpeed();
    addObstacles(); // Add obstacles based on score
    eatSfx.play();
  }
// ---ARAH & PANJANG ULAR---
  snakeX += velocityX;
  snakeY += velocityY;

  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }
  snakeBody[0] = [snakeX, snakeY];

  if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
    gameOver = true;
    return;
  }

  for (let i = 0; i < snakeBody.length; i++) {
    let snakeElement = document.createElement("div");
    snakeElement.classList.add("head");
    snakeElement.style.gridArea = `${snakeBody[i][1]} / ${snakeBody[i][0]}`;
    fragment.appendChild(snakeElement);

    if (
      i !== 0 &&
      snakeBody[0][1] === snakeBody[i][1] &&
      snakeBody[0][0] === snakeBody[i][0]
    ) {
      gameOver = true;
    }
  }
// ----------OBSTACLE----------
  for (let i = 0; i < obstacles.length; i++) {
    let obstacleElement = document.createElement("div");
    obstacleElement.classList.add("obstacle");
    obstacleElement.style.gridArea = `${obstacles[i][1]} / ${obstacles[i][0]}`;
    fragment.appendChild(obstacleElement);

    if (snakeX === obstacles[i][0] && snakeY === obstacles[i][1]) {
      gameOver = true;
    }
  }
// ----------SPAN MSG-----------
  if (spanActive) {
    toast.classList.add("active");
    progress.classList.add("active");
    spanActive = false;

    setTimeout(() =>{
      toast.classList.remove("active");
      progress.classList.remove("active");
    }, 5000);
  }

  playBoard.innerHTML = "";
  playBoard.appendChild(fragment);
};
// -----------------------------
updateFoodPosition();
animationFrameId = requestAnimationFrame(initGame);
document.addEventListener("keydown", changeDirection);
// ==================Main Game Code End=======================