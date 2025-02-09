// Import MatterJS via CDN
import { Engine, Render, Runner, World, Bodies, Body, Composite, Events } from 'https://cdn.jsdelivr.net/npm/matter-js@0.19.0/+esm';

// Global Constants and Settings
const RACE_TIME = 20; // seconds
const canvas = document.getElementById('gameCanvas');
const engine = Engine.create();
const world = engine.world;

// Create renderer for visual debugging with Matter.Render (optional, hidden by default)
const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    wireframes: false,
    background: '#001122'
  }
});
Render.run(render);

// Runner for engine update
const runner = Runner.create();
Runner.run(runner, engine);

// Keep track of simulation generations
let generation = 1;
document.getElementById('generation').innerText = generation;

// Terrain configurations - procedural and varied
const terrains = [
  { name: 'Flat', options: { friction: 0.9, restitution: 0.1 }, y: 500 },
  { name: 'Hilly', options: { friction: 0.8, restitution: 0.2 }, y: 500 },
  { name: 'Icy', options: { friction: 0.1, restitution: 0.05 }, y: 500 },
  { name: 'Bouncy', options: { friction: 0.7, restitution: 0.9 }, y: 500 },
  { name: 'Zero-Gravity', options: { friction: 0.0, restitution: 0.1 }, y: 500 }
];
// Randomly pick a terrain for each race
function chooseTerrain() {
  return terrains[Math.floor(Math.random() * terrains.length)];
}
let currentTerrain = chooseTerrain();

// Build arena boundaries and ground based on current terrain
function setupArena() {
  // Clear world except for engine
  World.clear(world, false);
  Engine.clear(engine);
  
  // Arena boundaries
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const thickness = 50;
  
  // Create boundaries (walls)
  const walls = [
    Bodies.rectangle(width/2, -thickness/2, width, thickness, { isStatic: true }),
    Bodies.rectangle(width/2, height + thickness/2, width, thickness, { isStatic: true }),
    Bodies.rectangle(-thickness/2, height/2, thickness, height, { isStatic: true }),
    Bodies.rectangle(width + thickness/2, height/2, thickness, height, { isStatic: true })
  ];
  World.add(world, walls);
  
  // Create ground with terrain options
  const ground = Bodies.rectangle(width/2, currentTerrain.y, width, 40, { 
    isStatic: true,
    friction: currentTerrain.options.friction,
    restitution: currentTerrain.options.restitution,
    render: { fillStyle: '#0044aa' }
  });
  World.add(world, ground);
}
setupArena();

// Procedurally generated Creature class
class Creature {
  constructor(x, y, traits = null) {
    // Traits: bodySize, limbCount, musclePower, balance
    // If not provided, generate randomly.
    this.traits = traits || {
      bodySize: 20 + Math.random()*10, // radius size
      limbCount: 2 + Math.floor(Math.random()*3), // 2 to 4 limbs
      musclePower: 0.002 + Math.random()*0.003, // force magnitude scalar
      balance: 0.8 + Math.random()*0.4 // stability (affects friction)
    };
    // Create a circular body for the creature's main mass
    this.body = Bodies.circle(x, y, this.traits.bodySize, {
      friction: 0.05 * (2 - this.traits.balance),
      restitution: 0.3,
      render: { fillStyle: '#0ff' }
    });
    World.add(world, this.body);
    
    // Create "limbs" as small circles attached to the body (using constraints for advanced simulation possible)
    // For simplicity, limbs will be visual – neural network and mutation affect force application.
    this.limbs = [];
    let angleStep = (Math.PI * 2) / this.traits.limbCount;
    for(let i = 0; i < this.traits.limbCount; i++) {
      const angle = i * angleStep;
      const limb = {
        angle: angle,
        powerFactor: 0.5 + Math.random(), // individual limb performance
      };
      this.limbs.push(limb);
    }
    
    // Overall distance traveled, used as fitness
    this.distance = 0;
  }
  
  // Apply forces to simulate movement
  update() {
    // Neural adaptation: update limb power slightly randomly to simulate learning
    this.limbs.forEach(limb => {
      limb.powerFactor += (Math.random()-0.5)*0.01;
      limb.powerFactor = Math.max(0.3, Math.min( limb.powerFactor, 1.5 ));
      
      // Calculate force vector based on limb angle (could be evolved to change over time)
      let forceMagnitude = this.traits.musclePower * limb.powerFactor;
      const force = {
        x: Math.cos(limb.angle) * forceMagnitude,
        y: Math.sin(limb.angle) * forceMagnitude
      };
      Body.applyForce(this.body, this.body.position, force);
    });
    
    // Track distance traveled (x-axis displacement)
    this.distance = this.body.position.x;
  }
  
  // Mutate the creature – slight variations based on performance
  mutate() {
    let newTraits = {
      bodySize: this.traits.bodySize + (Math.random()-0.5)*2,
      limbCount: this.traits.limbCount, // Keeping limb count same for simplicity
      musclePower: this.traits.musclePower + (Math.random()-0.5)*0.0005,
      balance: this.traits.balance + (Math.random()-0.5)*0.05
    };
    // Ensure rounded limits
    newTraits.bodySize = Math.max(10, newTraits.bodySize);
    newTraits.musclePower = Math.max(0.001, newTraits.musclePower);
    newTraits.balance = Math.max(0.5, Math.min(newTraits.balance, 1.5));
    return newTraits;
  }
  
  // Remove creature from world
  remove() {
    World.remove(world, this.body);
  }
  
  // Render extra details (like limbs as simple lines)
  renderExtras(context) {
    context.beginPath();
    this.limbs.forEach(limb => {
      let startX = this.body.position.x;
      let startY = this.body.position.y;
      let endX = startX + Math.cos(limb.angle)*this.traits.bodySize*2;
      let endY = startY + Math.sin(limb.angle)*this.traits.bodySize*2;
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
    });
    context.strokeStyle = '#0ff';
    context.stroke();
  }
}

// Race state variables
let creatures = [];
let raceTimer = RACE_TIME;
let raceInterval = null;
let raceRunning = false;

// Initialize two creatures at starting line (x=50)
function initRace() {
  // Clear previous race creatures
  creatures.forEach(c => c.remove());
  creatures = [];
  
  // Reset terrain for new race
  currentTerrain = chooseTerrain();
  setupArena();
  
  // Position creatures near left of the arena
  let startX = 50;
  let startY = canvas.clientHeight/2;
  
  // If it's not the first generation, use best performing creature traits to spawn the next generation with mutation
  let bestTraits = null;
  if(window.lastWinnerTraits) {
    bestTraits = window.lastWinnerTraits;
  }
  
  // Creature A
  let creatureA = new Creature(startX, startY - 30, bestTraits ? bestTraits : null);
  // Creature B with independent/random traits if no winner yet, else apply slight mutation difference
  let creatureB = new Creature(startX, startY + 30, bestTraits ? bestTraits : null);
  
  creatures.push(creatureA, creatureB);
  
  // Display genetic parameters of the best creature if available
  document.getElementById('genetics').innerText = bestTraits
    ? `Body: ${bestTraits.bodySize.toFixed(1)}, Muscles: ${bestTraits.musclePower.toFixed(4)}, Balance: ${bestTraits.balance.toFixed(2)}, Limbs: ${creatureA.traits.limbCount}`
    : 'Randomized';
  
  raceTimer = RACE_TIME;
  document.getElementById('timer').innerText = raceTimer.toFixed(1);
}

// Main update loop for creatures
Events.on(engine, 'beforeUpdate', function() {
  if(raceRunning) {
    creatures.forEach(creature => creature.update());
  }
});

// Custom rendering of extra creature details using MatterJS render context
Events.on(render, 'afterRender', function() {
  const context = render.context;
  creatures.forEach(creature => {
    creature.renderExtras(context);
  });
});

// Start race button event handler
document.getElementById('startRace').addEventListener('click', () => {
  if(raceRunning) return;
  initRace();
  raceRunning = true;
  
  // Timer countdown
  raceInterval = setInterval(() => {
    raceTimer -= 0.1;
    document.getElementById('timer').innerText = raceTimer.toFixed(1);
    if(raceTimer <= 0) {
      endRace();
    }
  }, 100);
});

// End race and perform evolutionary selection and mutation
function endRace() {
  clearInterval(raceInterval);
  raceRunning = false;
  
  // Determine winner based on furthermost x position
  const winner = creatures.reduce((prev, curr) => {
    return (prev.distance > curr.distance) ? prev : curr;
  });
  
  // Store winner traits for next generation mutation
  window.lastWinnerTraits = winner.mutate();
  
  // Flash winner info
  flashWinner(winner);
  
  // Increment generation counter and update sidebar
  generation++;
  document.getElementById('generation').innerText = generation;
}

// Visual flash for winner announcement
function flashWinner(winner) {
  const flash = document.createElement('div');
  flash.className = 'flash';
  flash.innerText = 'Winner!';
  flash.style.position = 'absolute';
  flash.style.top = winner.body.position.y + 'px';
  flash.style.left = winner.body.position.x + 'px';
  flash.style.color = '#ff0';
  flash.style.fontSize = '24px';
  flash.style.fontWeight = 'bold';
  flash.style.textShadow = '0 0 10px #ff0';
  document.getElementById('arena').appendChild(flash);
  
  setTimeout(() => {
    flash.remove();
  }, 1000);
}

// Resize canvas on window resize
function resizeCanvas() {
  const width = document.getElementById('arena').clientWidth;
  const height = document.getElementById('arena').clientHeight;
  render.bounds.max.x = width;
  render.bounds.max.y = height;
  render.options.width = width;
  render.options.height = height;
  render.canvas.width = width;
  render.canvas.height = height;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();