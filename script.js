const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
var container = document.querySelector(".wrapper");

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
    } else if (diffX = 1 && velocityX !== -1){
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
    } else if(diffY = 1 && velocityY !== -1) {
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

const handleGameOver = () => {
  cancelAnimationFrame(animationFrameId);
  alert("Game Over! Press OK to replay...");
  location.reload();
};

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
  if (score % 20 === 0) {
    gameSpeed = baseSpeed - score * 1.5; // Example speed increment logic
    gameSpeed = Math.max(gameSpeed, 80); // Minimum speed to avoid too fast gameplay
  }
};

const addObstacles = () => {
  let numObstacles;
  if (score >= 5 && score < 10) {
    numObstacles = 3;
  } else if (score >= 10 && score < 15) {
    numObstacles = 5;
  } else if (score >= 15 && score < 20) {
    numObstacles = 6;
  } else if (score >= 20 && score < 30) {
    numObstacles = 7;
  } else if (score >= 30 && score < 50) {
    numObstacles = 8;
  } else if (score >= 50 && score < 100) {
    numObstacles = 10;
  } else if (score >= 100) {
    numObstacles = 12;
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

  if (!specialItemExists && score == 20) {
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
  }

  if (specialItemExists && snakeX === specialX && snakeY === specialY) {
    specialItemExists = false;
    obstacles = []; // Clear all obstacles
  }

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

  for (let i = 0; i < obstacles.length; i++) {
    let obstacleElement = document.createElement("div");
    obstacleElement.classList.add("obstacle");
    obstacleElement.style.gridArea = `${obstacles[i][1]} / ${obstacles[i][0]}`;
    fragment.appendChild(obstacleElement);

    if (snakeX === obstacles[i][0] && snakeY === obstacles[i][1]) {
      gameOver = true;
    }
  }

  playBoard.innerHTML = "";
  playBoard.appendChild(fragment);
};

updateFoodPosition();
animationFrameId = requestAnimationFrame(initGame);
document.addEventListener("keydown", changeDirection);
