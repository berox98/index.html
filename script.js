// Configuration
const DEFAULT_DURATION = 1; // 1 day duration
const SYMBOLS = ['@', '#', '$', '%', '&', '*', '!', '?', '<', '>', '=', '+', '^'];
const GLITCH_CHANCE = 0.1;
const GLITCH_DURATION = 150; // ms
const PARTICLES_COUNT = 75;

// Global variables
let targetDate;
let startDate;
let totalDuration;
let loadingInterval;
let glitchInterval;
let originalText = "Lulu is Loading";
let letterElements = [];
let particlesContainer;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeLoading();
    createParticles();
    setupGlitchEffect();
});

// Main initialization
function initializeLoading() {
    // Set a fixed global end time - This example uses noon tomorrow
    // You would replace this with your actual launch date
    const now = new Date();
    
    // Create a target date 8 hours from now
    targetDate = new Date();
    targetDate.setTime(now.getTime() + (4 * 60 * 60 * 1000)); // 8 hours from now
    
    // Set start time to now
    // This defines the total duration of the countdown
    startDate = new Date(now); // Current time as start
    
    // Total duration in milliseconds
    totalDuration = targetDate - startDate;
    
    // Display the countdown
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('countdown').textContent = `Target: ${targetDate.toLocaleDateString(undefined, options)}`;
    
    // Start the loading progress - update every 30 seconds
    loadingInterval = setInterval(updateProgress, 30000); // Update every 30 seconds
    
    // Call once immediately to show initial state
    updateProgress();
}

// Update the progress bar
function updateProgress() {
    const now = new Date();
    
    // Calculate how far we are between start and target
    let elapsed = now - startDate;
    let percentage = (elapsed / totalDuration) * 100;
    
    // Constrain percentage between 0 and 100
    percentage = Math.min(100, Math.max(0, percentage));
    
    // Update the DOM
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    
    progressBar.style.width = percentage + '%';
    progressPercent.textContent = Math.floor(percentage);
    
    // If loading is complete, trigger completion
    if (percentage >= 100) {
        clearInterval(loadingInterval);
        loadingComplete();
    }
}

// Setup the glitch effect for the loading text
function setupGlitchEffect() {
    const loadingText = document.getElementById('loadingText');
    
    // Empty the heading
    loadingText.innerHTML = '';
    
    // Add each letter as a span
    originalText.split('').forEach(letter => {
        const span = document.createElement('span');
        span.className = 'glitch-letter';
        span.textContent = letter;
        letterElements.push(span);
        loadingText.appendChild(span);
    });
    
    // Start the glitch effect
    glitchInterval = setInterval(glitchLetters, 100);
}

// Create random glitch effects on letters
function glitchLetters() {
    letterElements.forEach((element, index) => {
        // Randomly decide to glitch this letter
        if (Math.random() < GLITCH_CHANCE) {
            const originalLetter = originalText[index];
            const randomSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            
            // Change to symbol
            element.textContent = randomSymbol;
            element.style.color = '#0ff';
            
            // Change back after a short time
            setTimeout(() => {
                element.textContent = originalLetter;
                element.style.color = '#0af';
            }, GLITCH_DURATION);
        }
    });
}

// Create and animate particles for the background
function createParticles() {
    particlesContainer = document.getElementById('particles');
    
    for (let i = 0; i < PARTICLES_COUNT; i++) {
        setTimeout(() => {
            createParticle();
        }, i * 100);
    }
    
    // Continue creating particles on an interval
    setInterval(createParticle, 1000);
}

// Create a single particle
function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Bigger size
    const size = Math.random() * 15 + 5; // 5-20px instead of 2-7px
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random position
    const posX = Math.random() * window.innerWidth;
    const posY = Math.random() * window.innerHeight;
    particle.style.left = `${posX}px`;
    particle.style.top = `${posY}px`;
    
    // Random movement
    const moveX = Math.random() * 150 - 75; // Increased range of movement
    const moveY = Math.random() * 150 - 75;
    particle.style.animation = `float ${Math.random() * 5 + 3}s infinite ease-in-out`;
    particle.style.transform = `translate(${moveX}px, ${moveY}px)`;
    
    // Add to container
    particlesContainer.appendChild(particle);
    
    // Remove after animation
    setTimeout(() => {
        particle.remove();
    }, 8000);
}

// When loading reaches 100%
function loadingComplete() {
    // Clear intervals
    clearInterval(glitchInterval);
    
    // Add glow effect to title
    document.getElementById('loadingText').classList.add('glow');
    
    // Show completion message
    document.getElementById('countdown').textContent = "Loading Complete!";
    
    // For now, we'll just show a message
    // In a real implementation, you would redirect or reveal the main content
    console.log("Loading complete! Ready to show the main content.");
    
    // After 3 seconds, we could redirect or show the main content
    // setTimeout(() => {
    //     window.location.href = "main.html";
    // }, 3000);
}
