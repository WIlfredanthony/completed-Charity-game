const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScore = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

let gameInterval, obstacleInterval, collectibleInterval;
let score, player, obstacles, collectibles, gameActive, lives;

function resetGame() {
  score = 0;
  player = { x: 200, y: 550, size: 30, fill: 0, splash: 0 };
  obstacles = [];
  collectibles = [];
  gameActive = true;
  lives = 3;
  scoreDisplay.textContent = 'Score: 0';
  updateLivesDisplay();
}

// Draw hearts for lives at the top right
function drawLives() {
  const heartSize = 18;
  for (let i = 0; i < lives; i++) {
    drawHeart(ctx, canvas.width - 20 - i * (heartSize + 8), 28, heartSize, "#e53935");
  }
}

// Helper to draw a heart shape
function drawHeart(ctx, x, y, size, color) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(
    x, y - size * 0.3,
    x - size, y - size * 0.3,
    x - size, y + size * 0.3
  );
  ctx.bezierCurveTo(
    x - size, y + size * 0.8,
    x, y + size * 0.9,
    x, y + size * 1.2
  );
  ctx.bezierCurveTo(
    x, y + size * 0.9,
    x + size, y + size * 0.8,
    x + size, y + size * 0.3
  );
  ctx.bezierCurveTo(
    x + size, y - size * 0.3,
    x, y - size * 0.3,
    x, y
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.shadowColor = "#b71c1c";
  ctx.shadowBlur = 6;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

// Update the lives display in the score area (optional, for accessibility)
function updateLivesDisplay() {
  // Optionally, you can append lives to the score text:
  // scoreDisplay.textContent = `Score: ${score}   Lives: ${lives}`;
}

// Helper to draw a detailed water droplet at (x, y) with given size and color
function drawDroplet(ctx, x, y, size, color) {
  ctx.save();

  // Make droplets bigger and more pointy
  size = size * 1.25;

  // Gradient for droplet body
  const grad = ctx.createRadialGradient(
    x, y - size * 0.55, size * 0.13,
    x, y + size * 0.2, size
  );
  grad.addColorStop(0, "#e3f6fd");
  grad.addColorStop(0.18, color);
  grad.addColorStop(0.7, color);
  grad.addColorStop(1, "#1976d2");

  ctx.beginPath();
  // Water drop shape: sharper, more pointy top
  ctx.moveTo(x, y - size * 1.05);
  ctx.bezierCurveTo(
    x + size * 0.55, y - size * 0.45,
    x + size * 0.85, y + size * 0.7,
    x, y + size
  );
  ctx.bezierCurveTo(
    x - size * 0.85, y + size * 0.7,
    x - size * 0.55, y - size * 0.45,
    x, y - size * 1.05
  );
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  ctx.fill();

  // Outline
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "rgba(30,30,60,0.22)";
  ctx.stroke();

  // Main highlight (top left)
  ctx.beginPath();
  ctx.ellipse(x - size * 0.18, y - size * 0.65, size * 0.13, size * 0.28, -0.9, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Secondary highlight (top right)
  ctx.beginPath();
  ctx.ellipse(x + size * 0.13, y - size * 0.38, size * 0.07, size * 0.13, 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.32)";
  ctx.fill();

  // Bottom reflection
  ctx.beginPath();
  ctx.ellipse(x + size * 0.10, y + size * 0.62, size * 0.11, size * 0.06, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fill();

  // Subtle blue rim at the bottom
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.95, size * 0.38, size * 0.09, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(33,150,243,0.22)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function drawPlayer() {
  ctx.save();

  // Draw water fill inside bucket
  if (player.fill > 0) {
    ctx.beginPath();
    ctx.ellipse(
      player.x,
      player.y + player.size * 0.55 - player.fill * player.size * 0.5,
      player.size * 0.75,
      player.size * 0.22,
      0,
      0,
      Math.PI * 2
    );
    // Water gradient
    let waterGrad = ctx.createLinearGradient(
      player.x, player.y, player.x, player.y + player.size * 1.2
    );
    waterGrad.addColorStop(0, "#b3e5fc");
    waterGrad.addColorStop(1, "#039be5");
    ctx.fillStyle = waterGrad;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Splash effect
  if (player.splash > 0) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const len = player.splash * 10 + Math.random() * 4;
      ctx.beginPath();
      ctx.arc(
        player.x + Math.cos(angle) * len,
        player.y + player.size * 0.1 + Math.sin(angle) * len,
        3 + Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "rgba(33,150,243," + (0.5 + Math.random() * 0.5) + ")";
      ctx.fill();
    }
    player.splash -= 0.08;
    if (player.splash < 0) player.splash = 0;
  }

  // Bucket shadow
  ctx.beginPath();
  ctx.ellipse(player.x, player.y + player.size * 0.65, player.size * 0.85, player.size * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(120,120,120,0.18)";
  ctx.fill();

  // Bucket body (main)
  ctx.beginPath();
  ctx.moveTo(player.x - player.size * 0.8, player.y);
  ctx.lineTo(player.x - player.size * 0.6, player.y + player.size * 1.1);
  ctx.quadraticCurveTo(
    player.x, player.y + player.size * 1.3,
    player.x + player.size * 0.6, player.y + player.size * 1.1
  );
  ctx.lineTo(player.x + player.size * 0.8, player.y);
  ctx.ellipse(player.x, player.y, player.size * 0.8, player.size * 0.32, 0, 0, Math.PI, true);
  ctx.closePath();
  // Gradient for metallic look
  let grad = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.size * 1.2);
  grad.addColorStop(0, "#e0e0e0");
  grad.addColorStop(0.7, "#bdbdbd");
  grad.addColorStop(1, "#9e9e9e");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#757575";
  ctx.stroke();

  // Bucket rim (top ellipse)
  ctx.beginPath();
  ctx.ellipse(player.x, player.y, player.size * 0.8, player.size * 0.32, 0, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#888";
  ctx.stroke();
  ctx.fillStyle = "#fafafa";
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Bucket handle
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size * 0.95, Math.PI * 0.85, Math.PI * 0.15, false);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#bdbdbd";
  ctx.stroke();

  ctx.restore();
}

function drawObstacles() {
  // Draw obstacles as brown water droplets
  obstacles.forEach(obs => {
    drawDroplet(ctx, obs.x + obs.size/2, obs.y + obs.size/2, obs.size/2, "#8d5524");
  });
}

function drawCollectibles() {
  // Draw collectibles: blue for clean water, brown for bad water
  collectibles.forEach(col => {
    if (col.bad) {
      // Bad water: brown droplet
      drawDroplet(ctx, col.x, col.y, col.size, "#8d5524");
    } else {
      // Clean water: blue droplet
      drawDroplet(ctx, col.x, col.y, col.size, "#4fc3f7");
    }
  });
}

function moveObstacles() {
  obstacles.forEach(obs => obs.y += 4);
  obstacles = obstacles.filter(obs => obs.y < canvas.height);
}

function moveCollectibles() {
  collectibles.forEach(col => col.y += 3);
  collectibles = collectibles.filter(col => col.y < canvas.height);
}

function checkCollisions() {
  // Obstacles
  obstacles = obstacles.filter(obs => {
    if (
      Math.abs(player.x - (obs.x + obs.size/2)) < player.size &&
      Math.abs(player.y - (obs.y + obs.size/2)) < player.size
    ) {
      lives--;
      updateLivesDisplay();
      if (lives <= 0) {
        gameActive = false;
      }
      return false; // Remove obstacle on collision
    }
    return true;
  });
  // Collectibles
  collectibles = collectibles.filter(col => {
    if (
      Math.abs(player.x - col.x) < player.size &&
      Math.abs(player.y - col.y) < player.size
    ) {
      if (col.bad) {
        lives--;
        updateLivesDisplay();
        if (lives <= 0) {
          gameActive = false;
        }
      } else {
        score += 10;
        scoreDisplay.textContent = 'Score: ' + score;
        // Fill the bucket, max 1.0
        player.fill = Math.min(1, player.fill + 0.18);
        player.splash = 1;
      }
      return false;
    }
    return true;
  });
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawObstacles();
  drawCollectibles();
  drawLives();
  moveObstacles();
  moveCollectibles();
  checkCollisions();
  if (gameActive) {
    requestAnimationFrame(gameLoop);
  } else {
    endGame();
  }
}

function spawnObstacle() {
  const size = 30;
  const x = Math.random() * (canvas.width - size);
  obstacles.push({ x, y: -size, size });
}

function spawnCollectible() {
  const size = 15;
  const x = Math.random() * (canvas.width - size);
  // 25% chance for bad water
  const isBad = Math.random() < 0.25;
  collectibles.push({ x, y: -size, size, bad: isBad });
}

function endGame() {
  clearInterval(obstacleInterval);
  clearInterval(collectibleInterval);
  gameOverScreen.style.display = 'flex';
  finalScore.textContent = 'Your Score: ' + score;
}

document.addEventListener('keydown', e => {
  if (!gameActive) return;
  if (e.key === 'ArrowLeft' && player.x - player.size > 0) player.x -= 20;
  if (e.key === 'ArrowRight' && player.x + player.size < canvas.width) player.x += 20;
});

startBtn.onclick = () => {
  startScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';
  resetGame();
  gameLoop();
  obstacleInterval = setInterval(spawnObstacle, 1200);
  collectibleInterval = setInterval(spawnCollectible, 1500);
};

restartBtn.onclick = () => {
  gameOverScreen.style.display = 'none';
  resetGame();
  gameLoop();
  obstacleInterval = setInterval(spawnObstacle, 1200);
  collectibleInterval = setInterval(spawnCollectible, 1500);
};