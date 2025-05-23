const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// arkaplan + karakter görseli
const bgImage = new Image();
bgImage.src = "background.png";
const playerImage = new Image();
playerImage.src = "character.png";

// ses
const jumpSound = new Audio("jump.wav");

// background muzigi oyun boyunca calmasi icin    
const bgMusic = document.getElementById("bgMusic");

let showMessage = false;
let messageTimer = 0;             //mezarlik mesaji icin
let pendingReset = false;
let deliveredPeopleCount = 0;
let maxPeople = 3;

                //kontrol yeir

function enableMusic() {
  bgMusic.play().catch(e => console.log("Otomatik çalma engellendi."));
  window.removeEventListener("keydown", enableMusic);
  window.removeEventListener("click", enableMusic);
}
window.addEventListener("keydown", enableMusic);
window.addEventListener("click", enableMusic);

// platform
const platforms = [
    { x: 0, y: 360, width: 800, height: 40 },
    { x: 300, y: 280, width: 100, height: 20 },
    { x: 500, y: 200, width: 100, height: 20 },
    { x: 150, y: 320, width: 120, height: 20 },
    { x: 650, y: 250, width: 80, height: 20 },
    { x: 400, y: 150, width: 150, height: 20 }
  ];

// main char
const player = {
  x: 100,
  y: 0,
  width: 60,
  height: 60,
  velocityY: 0,
  speed: 4,
  jumpPower: -10,
  gravity: 0.5,
  grounded: false
};

// mezarlik alanı sinirlari +resim ekle
const graveyard = {
    x: 650,
    y: 280,   
    width: 300,
    height: 100 
  };
  

// pixel insan   rand kullan--
const people = [];

function createRandomPerson() {
    const width = 10; 
    const height = 20;
  
    let valid = false;
    let x, y;
  
    // gecerli konum bulunana kadar dene (sinir disina ciktiginda rand calismiyordu cunku:(ugrastirdi biraz.. )
    while (!valid) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      if (platform.width >= width) {
        x = platform.x + Math.random() * (platform.width - width);
        y = platform.y - height;
        if (x >= 0 && x + width <= canvas.width && y >= 0) {
          valid = true;
        }
      }
    }
  
    return { x, y, width, height, attached: false };
  }
  
for (let i = 0; i < 5; i++) {
  people.push(createRandomPerson());
}


let score = 0;


//  karakter kontrolleri  ???
const keys = {};
document.addEventListener("keydown", e => {
  keys[e.code] = true;
  if (e.code === "Space" && player.grounded) {
    player.velocityY = player.jumpPower;
    jumpSound.play();
    player.grounded = false;
  }
});
document.addEventListener("keyup", e => {
  keys[e.code] = false;
});

// cizim fonxlari
function drawBackground() {
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
}
function drawPlayer() {
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}
function drawPlatforms() {
    platforms.forEach(p => {

      ctx.fillStyle = "#3e2f1c";
      ctx.fillRect(p.x + 3, p.y + 3, p.width, p.height);
      // main platformm
      ctx.fillStyle = "#8b5a2b";
      ctx.fillRect(p.x, p.y, p.width, p.height);
      // ust sinir
      ctx.strokeStyle = "#deb887";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.width, p.y);
      ctx.stroke();
    });
  }
  
function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Puan: " + score, 10, 30);
}
function drawGraveyard() {
    const x = 600; // mezarlık sinir baslangıc X buna gore ayarlaniyor
    const y = canvas.height - 80; 
    const width = 200; 
    const height = 40; 
  
    // mezarlık zemin (toprak) zeminin zemini yani
    ctx.fillStyle = "#444"; 
    ctx.fillRect(x, y, width, height);
  
    // demir cit cizimi
    ctx.strokeStyle = "#222"; 
    ctx.lineWidth = 3;
  
    // dikey cit direkleri mezarlik bicimi icin
    for (let i = x + 5; i < x + width; i += 25) {
      ctx.beginPath();
      ctx.moveTo(i, y);
      ctx.lineTo(i, y - 10); 
      ctx.stroke();
  
      //direk üstü sivrilik icin
      ctx.beginPath();
      ctx.moveTo(i - 4, y - 10);
      ctx.lineTo(i, y - 20);
      ctx.lineTo(i + 4, y - 10);
      ctx.fillStyle = "#222";
      ctx.fill();
    }
  
    // ust yatay cubuk 
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x + width, y - 20);
    ctx.stroke();
        
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX = graveyard.x + graveyard.width / 2;
    const centerY = graveyard.y + graveyard.height / 2;

    ctx.fillText("MEZARLIK", centerX, centerY);
  }
  
  function drawPeople() {
    const attachedCount = getAttachedCount();
  
    people.forEach((p, index) => {
      const headSize = 6;
      const bodyHeight = 10;
      const armWidth = 10;
  
      // renklkeri yapisma oncesi ve sonrasina gore ayarlamaya yariyor
      if (p.attached) {
        ctx.fillStyle = "rgba(128,128,128,0.5)"; // soluk gri olu yani
      } else {
        ctx.fillStyle = "#ffe0bd"; // normal kafa
      }
  
      // head sizei
      ctx.fillRect(p.x + p.width / 2 - headSize / 2, p.y, headSize, headSize);
  
      // sirasiyla govde bacak kol renkeleri
      ctx.fillStyle = p.attached ? "rgba(128,128,128,0.5)" : "blue";
      ctx.fillRect(p.x + p.width / 2 - 2, p.y + headSize, 4, bodyHeight);
      ctx.fillRect(p.x + p.width / 2 - armWidth / 2, p.y + headSize + 2, armWidth, 2);
      ctx.fillStyle = p.attached ? "rgba(128,128,128,0.5)" : "black";
      ctx.fillRect(p.x + p.width / 2 - 3, p.y + headSize + bodyHeight, 2, 5);
      ctx.fillRect(p.x + p.width / 2 + 1, p.y + headSize + bodyHeight, 2, 5);
  
      //  yapisan insan sayssini gosterme (her insanin ustune)
      if (p.attached) {
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(attachedCount, p.x + p.width / 2, p.y - 5);
      }
    });
  }
  
  // sticky jonun yapisma ozelligi
  function checkPersonCollision() {
    const deliveredPeople = [];
  
    for (let i = 0; i < people.length; i++) {
      const p = people[i];
  
      // Eğer yapışmadıysa ve çarpışma varsa, yapıştır
      if (!p.attached &&
        player.x < p.x + p.width &&
        player.x + player.width > p.x &&
        player.y < p.y + p.height &&
        player.y + player.height > p.y) {
        p.attached = true;
      }
  
      // Yapıştıysa, karakterin üstüne taşınsın
      if (p.attached) {
        p.x = player.x + player.width / 2 - p.width / 2;
        p.y = player.y - p.height;
  
        // Mezarlık bölgesine girerse teslim olmuş say
        if (
          p.x < graveyard.x + graveyard.width &&
          p.x + p.width > graveyard.x &&
          p.y < graveyard.y + graveyard.height &&
          p.y + p.height > graveyard.y
        ) {
          deliveredPeople.push(i);
        }
      }
    }
  
    // Teslim edilen insanları sil ve yerine yenisini ekle
    if (deliveredPeople.length > 0) {
      // Yüksekten düşmeyecek şekilde sırayla sil
      for (let i = deliveredPeople.length - 1; i >= 0; i--) {
        people.splice(deliveredPeople[i], 1);
        people.push(createRandomPerson());
        score += 10;
      }
  
      // Mesaj göster
      showMessage = true;
      messageTimer = Date.now();
    }
  }
  
  
// ana karakterin yapistigi insan saysini vermesi icin
function getAttachedCount() {
    return people.filter(p => p.attached).length;
  }


function update() {
    // sag sol harekt
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;
  
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    player.grounded = false;
  
    for (let p of platforms) {
      const isWithinX = player.x + player.width > p.x && player.x < p.x + p.width;
  
      // platform durumuna
      if (
        isWithinX &&
        player.velocityY >= 0 && 
        player.y + player.height > p.y && 
        player.y + player.height - player.velocityY <= p.y 
      ) {
        player.y = p.y - player.height; 
        player.velocityY = 0;           // platformun ustune cikabilmesini ve oranin da bir zemin olmasini saglayan kisim!!!!
        player.grounded = true;
      }
    }
  
    // zemin kontrolu yercekimi
    const groundLevel = canvas.height - 40;
    if (player.y + player.height > groundLevel) {
      player.y = groundLevel - player.height;
      player.velocityY = 0;
      player.grounded = true;
    }
  
    // ekran tasimi soronu yatay sınır ile.
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawPlatforms();
    drawPlayer();
    drawScore();
    checkPersonCollision();
    drawGraveyard();
    drawPeople();

     // mezarlik mesaj gösterimi yeniruhlarr..
     if (showMessage && Date.now() - messageTimer < 2000) {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("Yeni ruhlar!", canvas.width / 2 - 80, 50);
    } else {
        showMessage = false;
    }

    if (pendingReset) {
        resetGame();
        pendingReset = false;
      }
      
      
    requestAnimationFrame(update);
  }
  
bgImage.onload = () => {
  update();
};
