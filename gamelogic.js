let gameoverw = 1360
let gameoverh = 800
let gameoverb
let board;
let boardWidth = 1360;
let boardHeight = 800;
let context;
let cameraX = 0;
let scrollSpeed = 4;
let score = 0;
let MaxScore = 0;
let gameover = false;
let playerImage = new Image();
playerImage.src = "jamal.png";
let imageLoaded = false;
playerImage.onload = function () {
  imageLoaded = true;
};
let platforms = [
  { x: 0, y: 750, width: boardWidth, height: 50, color: "#444", spikes: [] },   
];

let platforms2 = [
  { x: 0, y: 300, width: boardWidth, height: 50, color: "#666", spikes: [] },  
];
let player = {
  x: 200,
  y: platforms[0].y - 26, 
  radius: 25,
  color: "#7c34dbff",
  angle: 0,
  velocityY: 0,
  isJumping: false
};


let keys = {};
document.addEventListener("keydown", function (e) {
  keys[e.key.toLowerCase()] = true;
  if (gameover && e.key.toLowerCase() === "r") {
    resetGame();
}
});

document.addEventListener("keyup", function (e) {
  keys[e.key.toLowerCase()] = false;
});



window.onload = function () {
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d");
  const music = document.getElementById("music");
  if (music) {
    music.play().catch(e => console.warn("Audio playback failed:", e));
  }
  
  requestAnimationFrame(drawScene);
};

function drawScene() {
  if (gameover) {
    drawGameOver();
    return;
  }
  movement();
  context.clearRect(0, 0, boardWidth, boardHeight);
  score = Math.floor(cameraX / 10); 
  let screenX = 200; 
  context.fillStyle = "#fff";
  context.font = "30px Arial";
  context.textAlign = "left";
  context.fillText(`Score: ${score}`, 20, 40);
  context.beginPath();
  context.fillStyle = player.color;
  context.arc(screenX, player.y, player.radius, 0, Math.PI * 2);
  context.fill();
  context.closePath();


if (imageLoaded) {
  context.save();
  context.translate(screenX, player.y);          
  context.rotate(player.angle);                  
  context.translate(0, 0);                        
  
  const size = player.radius * 3.4; 
  context.drawImage(playerImage, -size/2, -size/2, size, size);

  context.restore();
}

player.angle += 0.1;
  platforms.forEach(p => {
  context.fillStyle = p.color;
  context.fillRect(p.x - cameraX, p.y, p.width, p.height);
  context.fillStyle = "#e74c3c";
  
  p.spikes.forEach(spike => {
    context.beginPath();
    context.moveTo(spike.x - cameraX, spike.y); 
    context.lineTo(spike.x + spike.width / 2 - cameraX, spike.y - spike.height);
    context.lineTo(spike.x + spike.width - cameraX, spike.y); 
    context.closePath();
    context.fill();
  });
});

// Draw top platforms and bottom-facing spikes
platforms2.forEach(p => {
  context.fillStyle = p.color;
  context.fillRect(p.x - cameraX, p.y, p.width, p.height);

  context.fillStyle = "#c0392b";
  p.spikes.forEach(spike => {
    context.beginPath();
    context.moveTo(spike.x - cameraX, spike.y); 
    context.lineTo(spike.x + spike.width / 2 - cameraX, spike.y + spike.height); 
    context.lineTo(spike.x + spike.width - cameraX, spike.y); 
    context.closePath();
    context.fill();
  });
});
  requestAnimationFrame(drawScene);
}
let gravity = 0.8;
function movement() {

  if (keys["w"] && !player.isJumping) {
    if (gravity == 0.8){
      player.velocityY = -20;
    }else {
      player.velocityY = 20;
    }
    player.isJumping = true;
    
    
  }
  if (keys["q"] && !player.isJumping){
    player.isJumping = true;
    gravity *= -1; 
    
  }

  

  console.log("gravity = ", gravity,"vel = ", player.velocityY)

  player.velocityY += gravity;
  player.y += player.velocityY;
  cameraX += scrollSpeed;
  detectCollision();
  extendPlatforms();
}
let isFlipped = false;
function drawGameOver(){

  const deathsound = document.getElementById("death-sound");
  deathsound.play().catch(e => {
    console.warn("Audio play failed:", e);
  });
  const container = document.getElementById("game-container");
  container.classList.add("flipped");
  context.clearRect(0, 0, boardWidth, boardHeight);
    isFlipped = !isFlipped;
  
  if (isFlipped) {
    container.classList.add("flipped");
  } else {
    container.classList.remove("flipped");
  }
  context.fillStyle = "#111";
  context.fillRect(0, 0, boardWidth, boardHeight);
  context.fillStyle = "#fff";
  context.font = "bold 72px Arial";
  context.textAlign = "center";
  context.fillText("Game Over", boardWidth / 2, boardHeight / 2 - 50);
  context.font = "36px Arial";
  context.fillText("Press R to Restart", boardWidth / 2, boardHeight / 2 + 30);
  context.fillStyle = "#fff";
  context.font = "30px Arial";
  context.textAlign = "left";
  context.fillText(`Score: ${score}`, 20, 40);

}

function detectCollision() {

 if (gravity === 0.8) {
    for (let p of platforms) {
      if (
        player.y + player.radius >= p.y &&
        player.y + player.radius <= p.y + p.height &&
        player.x + cameraX >= p.x &&
        player.x + cameraX <= p.x + p.width
      ) {
        player.y = p.y - player.radius;
        player.velocityY = 0;
        player.isJumping = false;
        break;
      }
    }
  }
  else {
    for (let p of platforms2) {
      if (
        player.y - player.radius <= p.y + p.height &&
        player.y - player.radius >= p.y &&
        player.x + cameraX >= p.x &&
        player.x + cameraX <= p.x + p.width
      ) {
        player.y = p.y + p.height + player.radius;
        player.velocityY = 0;
        player.isJumping = false;
        break;
      }
    }
  
  }
  const allSpikes = platforms.flatMap(p => p.spikes).concat(platforms2.flatMap(p => p.spikes));

  for (let spike of allSpikes) {
    if (
      player.x + cameraX + player.radius > spike.x &&
      player.x + cameraX - player.radius < spike.x + spike.width &&
      player.y + player.radius > spike.y - spike.height &&
      player.y - player.radius < spike.y + spike.height
    ) {
      gameover = true;
      console.log("Hit a spike!");
      music.pause()
      return;
    }


  }


 
}
function generateSpikes(startX, y, position = "top") {
  let spikes = [];
  music.play()
  const slots = 14;
  const spacing = boardWidth / slots;
  const minGap = 300;  

  let lastSpikeRightEdge = -Infinity;

  for (let i = 0; i < slots; i++) {
    if (Math.random() < 0.75) continue;

    let spikeWidth = Math.random() * 10 + 20;
    let spikeHeight = Math.random() * 75 + 35;

    let slotX = startX + i * spacing;
    let offset = Math.random() * (spacing - spikeWidth);
    let x = slotX + offset;

    // Ensure this spike doesn't overlap or get too close to previous spike
    if (x < lastSpikeRightEdge + minGap) {
      x = lastSpikeRightEdge + minGap;
      if (x + spikeWidth > slotX + spacing) {
        continue; 
      }
    }

    spikes.push({ x, y, width: spikeWidth, height: spikeHeight });
    lastSpikeRightEdge = x + spikeWidth;
  }

  return spikes;
}

function resetGame() {
  gameover = false;
  cameraX = 0;
  score = 0;
  player.x = 200;
  player.y = platforms[0].y - 26;
  player.velocityY = 0;
  player.isJumping = false;
  player.angle = 0;
  gravity = 0.8;
  platforms = [
    { x: 0, y: 750, width: boardWidth, height: 50, color: "#444", spikes: [] },
  ];
  platforms2 = [
    { x: 0, y: 300, width: boardWidth, height: 50, color: "#666", spikes: [] },
  ];
  requestAnimationFrame(drawScene);
}

function extendPlatforms() {
  const extensionThreshold = cameraX + boardWidth;

  // Extend bottom platforms
  let lastBottom = platforms[platforms.length - 1];
  if (lastBottom.x + lastBottom.width < extensionThreshold) {
    let newX = lastBottom.x + lastBottom.width;
    platforms.push({
      x: newX,
      y: 750,
      width: boardWidth,
      height: 50,
      color: "#444",
      spikes: generateSpikes(newX, 750, "top")
    });
  }
  // Extend top platforms
  let lastTop = platforms2[platforms2.length - 1];
  if (lastTop.x + lastTop.width < extensionThreshold) {
    let newX = lastTop.x + lastTop.width;
    platforms2.push({
      x: newX,
      y: 300,
      width: boardWidth,
      height: 50,
      color: "#666",
      spikes: generateSpikes(newX, 300 + 50, "bottom")
    });
  }
  if (platforms[0].x + platforms[0].width < cameraX - 200) platforms.shift();
  if (platforms2[0].x + platforms2[0].width < cameraX - 200) platforms2.shift();
}