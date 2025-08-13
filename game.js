// ==== CEGAH SCROLL DAN ZOOM ====
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.documentElement.style.overflow = "hidden";

// Mencegah zoom dengan pinch & double-tap
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());
document.addEventListener('touchmove', e => {
    if (e.scale !== 1) e.preventDefault();
}, { passive: false });

// ==== FULLSCREEN RESPONSIVE ====
const canvas = document.getElementById("gameCanvas"); 
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Grid
const gridSize = 40;
let cols = Math.floor(canvas.width / gridSize);
let rows = Math.floor(canvas.height / gridSize);

// Score & Waktu
let score = 0;
let timeLeft = 30;
let gameOver = false;
const scoreBoard = document.getElementById("scoreBoard");
scoreBoard.style.position = "absolute";
scoreBoard.style.top = "10px";
scoreBoard.style.left = "50%";
scoreBoard.style.transform = "translateX(-50%)";
scoreBoard.style.color = "#fff";
scoreBoard.style.fontSize = "24px";
scoreBoard.style.fontWeight = "bold";

// Kecepatan Mochil
let speed = 3;

// Karakter Mochil
let mochil = {
  x: 50,
  y: 50,
  dirX: 0,
  dirY: 0,
  size: gridSize - 4,
  angle: 0 // sudut rotasi
};

// Gambar
const imgMochil = new Image();
imgMochil.src = "MOCHIL1.png";

const imgLove = new Image();
imgLove.src = "LOVE.png";

const imgBG = new Image();
imgBG.src = "BG.png";

const imgHome = new Image();
imgHome.src = "GO_TO_HOME.png";

// Love array
let loves = [];

function spawnInitialLoves() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (!(i === Math.floor(mochil.x / gridSize) && j === Math.floor(mochil.y / gridSize)) && Math.random() < 0.15) {
        loves.push(spawnLove(i, j));
      }
    }
  }
}

function spawnLove(x, y) {
  let r = Math.random();
  if (r < 0.05) return { x: x * gridSize, y: y * gridSize, size: gridSize, type: "big" };
  if (r < 0.30) return { x: x * gridSize, y: y * gridSize, size: gridSize - 10, type: "medium" };
  return { x: x * gridSize, y: y * gridSize, size: gridSize - 18, type: "small" };
}

spawnInitialLoves();

let pulse = 0;
function drawLoves() {
  pulse += 0.05;
  loves.forEach(love => {
    let scale = 1 + Math.sin(pulse) * 0.1;
    let size = love.size * scale;
    ctx.drawImage(
      imgLove,
      love.x + (gridSize - size) / 2,
      love.y + (gridSize - size) / 2,
      size,
      size
    );
  });
}

function drawMochil() {
  ctx.save();
  ctx.translate(mochil.x + gridSize / 2, mochil.y + gridSize / 2);
  ctx.rotate(mochil.angle);
  ctx.drawImage(
    imgMochil,
    -mochil.size / 2,
    -mochil.size / 2,
    mochil.size,
    mochil.size
  );
  ctx.restore();
}

function updateMochilSize() {
  let maxSize = 150;
  let minSize = gridSize - 4;
  mochil.size = Math.min(minSize + (score / 200) * (maxSize - minSize), maxSize);
}

function update() {
  if (gameOver) return;

  mochil.x += mochil.dirX * speed;
  mochil.y += mochil.dirY * speed;

  // Cek tembok dan ubah sudut rotasi
  if (mochil.x <= 0) mochil.angle = Math.PI;            // Kiri → hadap kiri
  if (mochil.x >= canvas.width - gridSize) mochil.angle = 0; // Kanan → hadap kanan
  if (mochil.y <= 0) mochil.angle = Math.PI / 2 * 3;    // Atas → hadap atas
  if (mochil.y >= canvas.height - gridSize) mochil.angle = Math.PI / 2; // Bawah → hadap bawah

  mochil.x = Math.max(0, Math.min(canvas.width - gridSize, mochil.x));
  mochil.y = Math.max(0, Math.min(canvas.height - gridSize, mochil.y));

  for (let i = 0; i < loves.length; i++) {
    if (
      mochil.x < loves[i].x + gridSize &&
      mochil.x + mochil.size > loves[i].x &&
      mochil.y < loves[i].y + gridSize &&
      mochil.y + mochil.size > loves[i].y
    ) {
      loves.splice(i, 1);
      score++;
      updateMochilSize();

      let rx = Math.floor(Math.random() * cols);
      let ry = Math.floor(Math.random() * rows);
      loves.push(spawnLove(rx, ry));
      break;
    }
  }

  scoreBoard.innerText = `Score: ${score} | Time: ${timeLeft}s`;
}

let timer = setInterval(() => {
  if (!gameOver) {
    timeLeft--;
    if (timeLeft <= 0) {
      gameOver = true;
      clearInterval(timer);
      scoreBoard.innerText = `Game Over! Final Score: ${score}`;
      showHomeButton = true;
    }
  }
}, 1000);

let showHomeButton = false;
let homeButtonX, homeButtonY, homeButtonWidth = 300, homeButtonHeight = 100;
let pulseHome = 0;

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imgBG, 0, 0, canvas.width, canvas.height);

  drawLoves();
  drawMochil();
  update();

  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 72px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 100);

    if (showHomeButton) {
      pulseHome += 0.05;
      let beat = Math.sin(pulseHome * 2) * Math.sin(pulseHome) * 0.08; 
      let scale = 1 + beat;

      homeButtonWidth = 300 * scale;
      homeButtonHeight = 100 * scale;
      homeButtonX = (canvas.width - homeButtonWidth) / 2;
      homeButtonY = canvas.height / 2 + 20;

      ctx.drawImage(imgHome, homeButtonX, homeButtonY, homeButtonWidth, homeButtonHeight);
    }
  }

  requestAnimationFrame(gameLoop);
}
gameLoop();

canvas.addEventListener("click", e => {
  if (showHomeButton) {
    let mx = e.clientX;
    let my = e.clientY;
    if (mx >= homeButtonX && mx <= homeButtonX + homeButtonWidth &&
        my >= homeButtonY && my <= homeButtonY + homeButtonHeight) {
      window.location.href = "index.html";
    }
  }
});

document.addEventListener("keydown", e => {
  let key = e.key.toLowerCase();
  if (key === "arrowup" || key === "w") { mochil.dirX = 0; mochil.dirY = -1; mochil.angle = Math.PI * 1.5; }
  if (key === "arrowdown" || key === "s") { mochil.dirX = 0; mochil.dirY = 1; mochil.angle = Math.PI / 2; }
  if (key === "arrowleft" || key === "a") { mochil.dirX = -1; mochil.dirY = 0; mochil.angle = Math.PI; }
  if (key === "arrowright" || key === "d") { mochil.dirX = 1; mochil.dirY = 0; mochil.angle = 0; }
});

let startX, startY;
canvas.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
}, { passive: false });

canvas.addEventListener("touchend", e => {
  let dx = e.changedTouches[0].clientX - startX;
  let dy = e.changedTouches[0].clientY - startY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) { mochil.dirX = 1; mochil.dirY = 0; mochil.angle = 0; }
    else { mochil.dirX = -1; mochil.dirY = 0; mochil.angle = Math.PI; }
  } else {
    if (dy > 0) { mochil.dirX = 0; mochil.dirY = 1; mochil.angle = Math.PI / 2; }
    else { mochil.dirX = 0; mochil.dirY = -1; mochil.angle = Math.PI * 1.5; }
  }
}, { passive: false });
