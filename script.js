// Configuration
const DEFAULT_DURATION = 1; // 1 week in days
const SYMBOLS = ['@', '#', '$', '%', '&', '*', '!', '?', '<', '>', '=', '+', '^'];
const GLITCH_CHANCE = 0.1;
const GLITCH_DURATION = 150; // ms
const PARTICLES_COUNT = 75;

// Global variables
let targetDate;
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
    // Get duration from URL parameter or use default
    const urlParams = new URLSearchParams(window.location.search);
    const durationParam = urlParams.get('duration');
    
    let durationInDays = DEFAULT_DURATION;
    let durationText = "Lulu Release";
    
    if (durationParam) {
        if (durationParam.includes('day')) {
            durationInDays = parseInt(durationParam);
            durationText = `${durationInDays} days`;
        } else if (durationParam.includes('week')) {
            const weeks = parseInt(durationParam);
            durationInDays = weeks * 7;
            durationText = `${weeks} weeks`;
        } else if (durationParam.includes('month')) {
            const months = parseInt(durationParam);
            durationInDays = months * 30;
            durationText = `${months} months`;
        } else if (durationParam.includes('hour')) {
            const hours = parseInt(durationParam);
            durationInDays = hours / 24;
            durationText = `${hours} hours`;
        } else if (durationParam.includes('minute')) {
            const minutes = parseInt(durationParam);
            durationInDays = minutes / (24 * 60);
            durationText = `${minutes} minutes`;
        } else {
            // If just a number is provided, assume it's days
            durationInDays = parseInt(durationParam) || DEFAULT_DURATION;
            durationText = `${durationInDays} days`;
        }
    }
    
    // Set up the duration in milliseconds (real time)
    // 1 day = 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
    const scaledDuration = durationInDays * 12 * 60 * 60 * 1000;
    
    // Set up the target date
    const now = new Date();
    totalDuration = scaledDuration;
    targetDate = new Date(now.getTime() + scaledDuration);
    
    // Display the countdown
    document.getElementById('countdown').textContent = `Target: ${durationText}`;
    
    // Start the loading progress - update every minute instead of every 100ms
    loadingInterval = setInterval(updateProgress, 60000); // Update every minute
    
    // Call once immediately to show initial state
    updateProgress();
}

// Update the progress bar
function updateProgress() {
    const now = new Date();
    const elapsed = now - (targetDate - totalDuration);
    const remaining = targetDate - now;
    
    // Calculate percentage
    let percentage = (elapsed / totalDuration) * 100;
    percentage = Math.min(100, percentage);
    percentage = Math.max(0, percentage);
    
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
            element.style.color = '#e18c31';
            
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