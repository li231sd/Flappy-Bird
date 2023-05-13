// Get the canvas element
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game variables
let birdX = 50;
let birdY = canvas.height / 2;
let birdDY = 0;
const gravity = 0.5;
const jumpHeight = -10;

let score = 0;
let pipes = [];

const pipeGap = 30;
const pipeWidth = 80;
const pipeHeight = 300;
const pipeSpeed = 2;
const pipeSpawnRate = 200;

let pipeTimer = 0;
let isGameOver = false;
let isGameStarted = false;

// Load bird image
const birdImage = new Image();
birdImage.src = "img/bird.png";

// Load pipe top image
const pipeTopImage = new Image();
pipeTopImage.src = "img/pipe-top.png";

// Load pipe bottom image
const pipeBottomImage = new Image();
pipeBottomImage.src = "img/pipe-bottom.png";

// Load base image
const baseImage = new Image();
baseImage.src = "img/base.png";

// Load background image
const backgroundImage = new Image();
backgroundImage.src = "img/background.png";

// Load message image
const messageImage = new Image();
messageImage.src = "img/message.png";

// Load game over image
const gameOverImage = new Image();
gameOverImage.src = "img/gameover.png";

// Floor variables
const floorSpeed = 1;
let floorX = 0;

// Event handling
document.addEventListener("click", handleJump);
document.getElementById("restartButton").addEventListener("click", resetGame);

function handleJump() {
    if (isGameOver) {
        resetGame();
    } else if (!isGameStarted) {
        isGameStarted = true;
    } else {
        birdDY = jumpHeight;
    }
}

function gameLoop() {
    if (isGameOver) {
        showGameOver();
        return;
    }

    if (!isGameStarted) {
        draw();
        requestAnimationFrame(gameLoop);
        return;
    }

    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Update bird position
    birdDY += gravity;
    birdY += birdDY;

    // Check if the bird is off the screen
    if (birdY > canvas.height || birdY + 20 < 0) {
        endGame();
    }

    // Update pipe positions
    if (!isGameOver) {
        if (pipeTimer === 0) {
            spawnPipe();
            pipeTimer = pipeSpawnRate;
        } else {
            pipeTimer--;
        }

        for (let i = 0; i < pipes.length; i++) {
            const pipe = pipes[i];
            pipe.x -= pipeSpeed;

            // Check for collision with bird
            if (
                birdX + 30 > pipe.x &&
                birdX < pipe.x + pipeWidth &&
                (birdY < pipe.y || birdY + 20 > pipe.y + pipeHeight + pipeGap)
            ) {
                endGame();
            }

            // Check if bird has passed the pipe
            if (birdX > pipe.x + pipeWidth && !pipe.passed) {
                pipe.passed = true;
                score++;
            }

            // Remove pipes that are off the screen
            if (pipe.x + pipeWidth < 0) {
                pipes.splice(i, 1);
                i--;
            }
        }
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    if (!isGameStarted) {
        // Draw start message
        const messageX = (canvas.width - messageImage.width) / 2;
        const messageY = (canvas.height - messageImage.height) / 2;
        ctx.drawImage(messageImage, messageX, messageY);
    } else {
        // Draw bird
        ctx.drawImage(birdImage, birdX, birdY, 30, 20);

        // Draw pipes
        for (let i = 0; i < pipes.length; i++) {
            const pipe = pipes[i];

            // Draw top pipe
            ctx.drawImage(pipeTopImage, pipe.x, pipe.y - pipeTopImage.height, pipeWidth, pipeTopImage.height);

            // Draw bottom pipe
            ctx.drawImage(pipeBottomImage, pipe.x, pipe.y + pipeHeight, pipeWidth, pipeBottomImage.height);
        }

        // Draw score
        ctx.fillStyle = "#FFD95A";
        ctx.font = "32px 'Press Start 2P'";
        const scoreText = score;
        const scoreWidth = ctx.measureText(scoreText).width;
        const scoreX = (canvas.width - scoreWidth) / 2;

        // Draw gold border
        ctx.strokeStyle = "#C07F00";
        ctx.lineWidth = 2;
        ctx.strokeText(scoreText, scoreX, 60);

        // Draw score text
        ctx.fillStyle = "#FFD95A";
        ctx.fillText(scoreText, scoreX, 60);

        // Draw floor
        const floorX = -((pipeTimer / pipeSpawnRate) * pipeWidth) % baseImage.width;
        ctx.drawImage(baseImage, floorX, canvas.height - baseImage.height);
        ctx.drawImage(baseImage, floorX + baseImage.width, canvas.height - baseImage.height);
    }
}

function spawnPipe() {
    const y = Math.floor(Math.random() * (canvas.height - pipeHeight - pipeGap));
    pipes.push({
        x: canvas.width,
        y: y
    });
}

// Reset the game
function resetGame() {
    birdY = canvas.height / 2 - 10;
    birdDY = 0;
    pipes = [];
    score = 0;
    isGameOver = false;
}

// End the game
function endGame() {
    isGameOver = true;
}

function showGameOver() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw game over image
    const gameOverX = canvas.width / 2 - gameOverImage.width / 2;
    const gameOverY = canvas.height / 2 - gameOverImage.height / 2;
    ctx.drawImage(gameOverImage, gameOverX, gameOverY);

    // Add event listener to restart button
    canvas.addEventListener("click", restartGame);
}

function restartGame() {
    // Remove event listener
    canvas.removeEventListener("click", restartGame);

    // Reset game variables
    birdX = 50;
    birdY = canvas.height / 2;
    birdDY = 0;
    score = 0;
    pipes = [];
    isGameOver = false;

    // Start the game loop
    gameLoop();
}

// Game initialization
resetGame();
gameLoop();
