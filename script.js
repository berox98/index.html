document.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById('burger');
    const ingredientButtons = document.querySelectorAll('.ingredients-list button');
    const serveButton = document.getElementById('serve-button');
    const orderIngredientsElement = document.getElementById('order-ingredients');
    const messageElement = document.getElementById('message');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const progressElement = document.getElementById('progress');
    const friesContainer = document.getElementById('fries-container');
    const colaContainer = document.getElementById('cola-container');
    const burgerContainer = document.querySelector('.burger-container');

    // Game state
    let currentOrder = [];
    let score = 0;
    let level = 1;
    let correctOrders = 0;
    let orderHasFries = false;
    let orderHasCola = false;
    let orderHasNuggets = false;
    let autoMode = false;
    let savedGameState = null;
    let autoModeInterval = null;
    let ttsEnabled = false;
    let hasTriplePatty = false;
    let hasTriggeredMeatRain = false;
    let speedrunMode = false;
    let startTime = null;
    let timerInterval = null;
    let timerElement = null;

    // Speech synthesis setup
    const speechSynthesis = window.speechSynthesis;

    // Available ingredients
    const allIngredients = [
        {id: 'patty', name: 'Beef Patty'},
        {id: 'cheese', name: 'Cheese'},
        {id: 'lettuce', name: 'Lettuce'},
        {id: 'tomato', name: 'Tomato'},
        {id: 'onion', name: 'Onion'},
        {id: 'pickle', name: 'Pickle'},
        {id: 'mayo', name: 'Mayo'},
        {id: 'ketchup', name: 'Ketchup'},
        {id: 'bacon', name: 'Bacon'},
        {id: 'double-patty', name: 'Double Patty'},
        {id: 'triple-patty', name: 'Triple Patty'},
        {id: 'egg', name: 'Fried Egg'},
        {id: 'jalapeno', name: 'Jalapeño'},
        {id: 'guacamole', name: 'Guacamole'},
        {id: 'mustard', name: 'Mustard'}
    ];

    // SVG for the lettuce
    const lettuceSVG = `
    <svg viewBox="0 0 200 45" class="lettuce-svg">
        <path class="lettuce-path" d="M10,5 C30,25 40,0 60,18 C80,25 90,0 110,15 C130,25 150,0 170,18 C190,25 195,5 200,20 L200,45 L0,45 L0,20 C5,25 10,10 20,5" />
    </svg>`;

    // SVG for the onion
    const onionSVG = `
    <svg viewBox="0 0 200 25" class="onion-svg">
        <path d="M20,5 C40,20 60,0 80,15 C100,20 120,5 140,15 C160,20 180,5 190,15" fill="none" stroke="#9e4784" stroke-width="3" />
        <path d="M30,10 C50,25 70,5 90,20 C110,25 130,10 150,20 C170,25 180,10 190,20" fill="none" stroke="#9e4784" stroke-width="3" />
    </svg>`;

    // SVG for the jalapeño
    const jalapenoDots = `
    <svg viewBox="0 0 200 25" class="jalapeno-svg">
        <rect x="20" y="5" width="160" height="15" rx="5" fill="#2a8000" />
        <ellipse cx="40" cy="12" rx="2" ry="2" fill="#1a5000" />
        <ellipse cx="60" cy="10" rx="2" ry="2" fill="#1a5000" />
        <ellipse cx="80" cy="14" rx="2" ry="2" fill="#1a5000" />
        <ellipse cx="100" cy="11" rx="2" ry="2" fill="#1a5000" />
        <ellipse cx="120" cy="13" rx="2" ry="2" fill="#1a5000" />
        <ellipse cx="140" cy="10" rx="2" ry="2" fill="#1a5000" />
        <ellipse cx="160" cy="12" rx="2" ry="2" fill="#1a5000" />
    </svg>`;

    // Initialize the game
    generateNewOrder();
    updateUI();
    
    // Hide triple patty button initially
    const triplePattyButton = document.querySelector('button[data-ingredient="triple-patty"]');
    if (triplePattyButton) {
        triplePattyButton.style.display = 'none';
    }

    // Add event listeners to ingredients buttons
    ingredientButtons.forEach(button => {
        button.addEventListener('click', () => {
            const ingredient = button.dataset.ingredient;

            // Toggle ingredient
            if (button.classList.contains('selected')) {
                button.classList.remove('selected');
                removeIngredient(ingredient);
            } else {
                button.classList.add('selected');
                addIngredient(ingredient);
            }
        });
    });

    // Add event listener to serve button
    serveButton.addEventListener('click', checkOrder);

    // Add event listeners for fries and cola
    document.getElementById('add-fries-button')?.addEventListener('click', toggleFries);
    document.getElementById('add-cola-button')?.addEventListener('click', toggleCola);
    document.getElementById('add-nuggets-button')?.addEventListener('click', toggleNuggets);

    // Function to add ingredient to the burger
    function addIngredient(ingredient) {
        if (document.querySelector(`.${ingredient}`)) return;

        const ingredientElem = document.createElement('div');
        ingredientElem.classList.add('ingredient', ingredient);

        // Different HTML based on ingredient type
        if (ingredient === 'lettuce') {
            ingredientElem.innerHTML = lettuceSVG;
        } else if (ingredient === 'onion') {
            ingredientElem.innerHTML = onionSVG;
        } else if (ingredient === 'jalapeno') {
            ingredientElem.innerHTML = jalapenoDots;
        } else if (ingredient === 'double-patty') {
            // Add the patty divider for double patty
            const divider = document.createElement('div');
            divider.classList.add('patty-divider');
            ingredientElem.appendChild(divider);
        } else if (ingredient === 'triple-patty') {
            // Add the patty dividers for triple patty
            const dividerTop = document.createElement('div');
            dividerTop.classList.add('patty-divider-top');
            ingredientElem.appendChild(dividerTop);
            
            const dividerBottom = document.createElement('div');
            dividerBottom.classList.add('patty-divider-bottom');
            ingredientElem.appendChild(dividerBottom);
        } else if (ingredient === 'mixed-piece') {
            // Create a rainbow-styled mixed piece
            ingredientElem.style.background = 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)';
            ingredientElem.style.height = '20px';
            ingredientElem.style.width = '90%';
            ingredientElem.style.borderRadius = '5px';
            ingredientElem.style.zIndex = '8';
            ingredientElem.style.margin = '-5px 0';
            ingredientElem.textContent = 'Mixed Piece';
            ingredientElem.style.display = 'flex';
            ingredientElem.style.justifyContent = 'center';
            ingredientElem.style.alignItems = 'center';
            ingredientElem.style.fontWeight = 'bold';
            ingredientElem.style.color = 'white';
            ingredientElem.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
        }

        // Insert before the bottom bun
        const bottomBun = document.querySelector('.bun-bottom');
        burger.insertBefore(ingredientElem, bottomBun);

        // Add animation
        ingredientElem.classList.add('burger-drop');
        setTimeout(() => {
            ingredientElem.classList.remove('burger-drop');
        }, 500);
    }

    // Function to remove ingredient from the burger
    function removeIngredient(ingredient) {
        const elem = document.querySelector(`.${ingredient}`);
        if (elem) {
            elem.addEventListener('animationend', () => {
                elem.remove();
                // Reset triple patty flag when it's removed
                if (ingredient === 'triple-patty') {
                    hasTriplePatty = false;
                }
            });
            elem.style.animation = 'drop 0.5s ease-in-out reverse';
        }
    }

    // Function to toggle fries
    function toggleFries() {
        const friesButton = document.getElementById('add-fries-button');
        if (friesButton.classList.contains('selected')) {
            friesButton.classList.remove('selected');
            friesContainer.style.opacity = '0';
        } else {
            friesButton.classList.add('selected');
            friesContainer.style.opacity = '1';
        }
    }

    // Function to toggle cola
    function toggleCola() {
        const colaButton = document.getElementById('add-cola-button');
        if (colaButton.classList.contains('selected')) {
            colaButton.classList.remove('selected');
            colaContainer.style.opacity = '0';
        } else {
            colaButton.classList.add('selected');
            colaContainer.style.opacity = '1';
        }
    }

    // Function to toggle nuggets
    function toggleNuggets() {
        const nuggetsButton = document.getElementById('add-nuggets-button');
        if (nuggetsButton.classList.contains('selected')) {
            nuggetsButton.classList.remove('selected');
            document.getElementById('nuggets-container').style.opacity = '0';
        } else {
            nuggetsButton.classList.add('selected');
            document.getElementById('nuggets-container').style.opacity = '1';
        }
    }

    // Add auto mode button after all existing eventListeners
    const autoModeButton = document.getElementById('auto-mode-button');
    autoModeButton.addEventListener('click', toggleAutoMode);

    // Function to toggle auto mode
    function toggleAutoMode() {
        if (!autoMode) {
            // Save current game state
            savedGameState = {
                score: score,
                level: level,
                correctOrders: correctOrders
            };
            
            // Enable auto mode
            autoMode = true;
            autoModeButton.textContent = "Turn Off Auto Mode";
            autoModeButton.classList.add('selected');
            
            // Start auto mode interval
            autoModeInterval = setInterval(() => {
                // Clear current burger
                clearBurger();
                
                // Auto add all ingredients from the order
                currentOrder.forEach(ingredient => {
                    const button = document.querySelector(`button[data-ingredient="${ingredient}"]`);
                    if (button && !button.classList.contains('selected')) {
                        button.classList.add('selected');
                        addIngredient(ingredient);
                    }
                });
                
                // Auto add fries if needed
                const friesButton = document.getElementById('add-fries-button');
                if (friesButton && orderHasFries && !friesButton.classList.contains('selected')) {
                    friesButton.classList.add('selected');
                    friesContainer.style.opacity = '1';
                } else if (friesButton && !orderHasFries && friesButton.classList.contains('selected')) {
                    friesButton.classList.remove('selected');
                    friesContainer.style.opacity = '0';
                }
                
                // Auto add cola if needed
                const colaButton = document.getElementById('add-cola-button');
                if (colaButton && orderHasCola && !colaButton.classList.contains('selected')) {
                    colaButton.classList.add('selected');
                    colaContainer.style.opacity = '1';
                } else if (colaButton && !orderHasCola && colaButton.classList.contains('selected')) {
                    colaButton.classList.remove('selected');
                    colaContainer.style.opacity = '0';
                }

                // Auto add nuggets if needed
                const nuggetsButton = document.getElementById('add-nuggets-button');
                if (nuggetsButton && orderHasNuggets && !nuggetsButton.classList.contains('selected')) {
                    nuggetsButton.classList.add('selected');
                    document.getElementById('nuggets-container').style.opacity = '1';
                } else if (nuggetsButton && !orderHasNuggets && nuggetsButton.classList.contains('selected')) {
                    nuggetsButton.classList.remove('selected');
                    document.getElementById('nuggets-container').style.opacity = '0';
                }
                
                // Serve burger after short delay
                setTimeout(() => {
                    if (autoMode) {
                        // Auto mode should always serve a correct order
                        score += level * 10;
                        correctOrders++;

                        // Level up every 3 correct orders
                        if (correctOrders >= 3) {
                            level++;
                            correctOrders = 0;
                            showMessage(`Level up! Now at level ${level}!`);
                        } else {
                            showMessage("Perfect! Order served correctly!");
                        }

                        setTimeout(() => {
                            generateNewOrder();
                            updateUI();
                        }, 1500);
                    } else {
                        checkOrder();
                    }
                }, 1000);
            }, 2500);
            
            showMessage("Auto Mode Activated!");
        } else {
            // Disable auto mode
            autoMode = false;
            autoModeButton.textContent = "Turn On Auto Mode";
            autoModeButton.classList.remove('selected');
            clearInterval(autoModeInterval);
            
            // Restore previous game state
            if (savedGameState) {
                score = savedGameState.score;
                level = savedGameState.level;
                correctOrders = savedGameState.correctOrders;
                savedGameState = null;
                
                generateNewOrder();
                updateUI();
            }
            
            showMessage("Auto Mode Deactivated!");
        }
    }

    // Function to clear current burger
    function clearBurger() {
        ingredientButtons.forEach(button => {
            if (button.classList.contains('selected')) {
                button.classList.remove('selected');
                removeIngredient(button.dataset.ingredient);
            }
        });
        
        // Remove triple patty if it exists
        if (hasTriplePatty) {
            const triplePatty = document.querySelector('.triple-patty');
            if (triplePatty) {
                triplePatty.remove();
            }
            hasTriplePatty = false;
        }
        
        // Reset fries and cola
        const friesButton = document.getElementById('add-fries-button');
        const colaButton = document.getElementById('add-cola-button');
        const nuggetsButton = document.getElementById('add-nuggets-button');
        
        if (friesButton && friesButton.classList.contains('selected')) {
            friesButton.classList.remove('selected');
            friesContainer.style.opacity = '0';
        }
        
        if (colaButton && colaButton.classList.contains('selected')) {
            colaButton.classList.remove('selected');
            colaContainer.style.opacity = '0';
        }

        if (nuggetsButton && nuggetsButton.classList.contains('selected')) {
            nuggetsButton.classList.remove('selected');
            document.getElementById('nuggets-container').style.opacity = '0';
        }
    }

    // Generate a new random order
    function generateNewOrder() {
        // Clear the current burger
        clearBurger();

        currentOrder = [];
        orderHasFries = false;
        orderHasCola = false;
        orderHasNuggets = false;

        // Always include patty
        currentOrder.push('patty');

        // Generate random ingredients based on level
        const numIngredients = Math.min(2 + level, allIngredients.length - 1);

        // Create a pool of ingredients excluding patty and triple-patty
        const ingredientPool = allIngredients.filter(ing => ing.id !== 'patty' && ing.id !== 'triple-patty');

        // Shuffle the pool
        const shuffledIngredients = [...ingredientPool].sort(() => 0.5 - Math.random());
        
        // Add random ingredients from the shuffled pool
        for (let i = 0; i < numIngredients; i++) {
            if (shuffledIngredients[i]) {
                currentOrder.push(shuffledIngredients[i].id);
            }
        }

        displayOrder();
    }

    // Display the current order
    function displayOrder() {
        orderIngredientsElement.innerHTML = '';
        
        let orderText = "New order: ";
        
        currentOrder.forEach(ingredientId => {
            const ingredient = allIngredients.find(ing => ing.id === ingredientId);
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item');
            orderItem.textContent = ingredient.name;
            orderIngredientsElement.appendChild(orderItem);
            orderText += ingredient.name + ", ";
        });
        
        if (orderHasFries) {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item', 'side-item');
            orderItem.textContent = 'Fries';
            orderIngredientsElement.appendChild(orderItem);
            orderText += "Fries, ";
        }
        
        if (orderHasCola) {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item', 'side-item');
            orderItem.textContent = 'Cola';
            orderIngredientsElement.appendChild(orderItem);
            orderText += "Cola, ";
        }
        
        if (orderHasNuggets) {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item', 'side-item');
            orderItem.textContent = 'Nuggets';
            orderIngredientsElement.appendChild(orderItem);
            orderText += "Nuggets, ";
        }
        
        // Remove trailing comma and space
        orderText = orderText.replace(/, $/, "");
        
        // Speak the order
        speak(orderText);
    }

    // Check if the burger matches the order
    function checkOrder() {
        const currentBurger = Array.from(burger.querySelectorAll('.ingredient'))
            .filter(ing => !ing.classList.contains('bun-top') && !ing.classList.contains('bun-bottom'))
            .map(ing => {
                for (const className of ing.classList) {
                    if (className !== 'ingredient' && className !== 'burger-drop') {
                        return className;
                    }
                }
                return null;
            })
            .filter(ing => ing !== null);

        // Check if fries match
        const hasFries = document.getElementById('add-fries-button')?.classList.contains('selected') || false;

        // Check if cola matches
        const hasCola = document.getElementById('add-cola-button')?.classList.contains('selected') || false;

        // Check if nuggets match
        const hasNuggets = document.getElementById('add-nuggets-button')?.classList.contains('selected') || false;

        // Check if burger is empty (just buns)
        if (currentBurger.length === 0) {
            showMessage("WHERE THE FILLINGS AT?");
            score = Math.max(0, score - 5);
            updateUI();
            return;
        }

        // Replace triple-patty with patty and double-patty for order checking
        const normalizedBurger = [...currentBurger];
        const triplePattyIndex = normalizedBurger.indexOf('triple-patty');
        if (triplePattyIndex !== -1) {
            normalizedBurger.splice(triplePattyIndex, 1, 'patty', 'double-patty');
        }

        // Check for secret meat rain - only patty and double patty
        if (currentBurger.length === 2 && 
            currentBurger.includes('patty') && 
            currentBurger.includes('double-patty') &&
            !hasFries && !hasCola && !hasNuggets) {
            triggerMeatRain();
            return;
        }

        // Check if arrays have the same elements (order doesn't matter)
        const isCorrect = 
            normalizedBurger.length === currentOrder.length && 
            currentOrder.every(ing => normalizedBurger.includes(ing)) &&
            hasFries === orderHasFries &&
            hasCola === orderHasCola &&
            hasNuggets === orderHasNuggets;
            
        // Check if ingredients are in the same order as the order
        const isPerfectOrder = isCorrect && 
            normalizedBurger.every((ing, idx) => ing === currentOrder[idx]);

        if (isCorrect) {
            if (isPerfectOrder) {
                showMessage("Absolutely perfect! Order's not THAT important though");
            } else {
                showMessage("Perfect! Order served correctly!");
            }
            
            score += level * 10;
            correctOrders++;

            // Level up every 3 correct orders
            if (correctOrders >= 3) {
                level++;
                correctOrders = 0;
                showMessage(`Level up! Now at level ${level}!`);
            }

            setTimeout(() => {
                generateNewOrder();
                updateUI();
            }, 1500);
        } else {
            showMessage("Wrong order! Try again!");
            score = Math.max(0, score - 5);
            updateUI();
        }
        checkAchievements();
    }

    // Function to trigger the meat rain effect
    function triggerMeatRain() {
        hasTriggeredMeatRain = true;
        showMessage("IT'S RAINING MEAT! HALLELUJAH!");
        speak("IT'S RAINING MEAT! HALLELUJAH!");
        
        // Increase score for finding the secret
        score += 50;
        
        // Create meat rain container if it doesn't exist
        let meatRain = document.querySelector('.meat-rain');
        if (!meatRain) {
            meatRain = document.createElement('div');
            meatRain.classList.add('meat-rain');
            burgerContainer.appendChild(meatRain);
        } else {
            meatRain.innerHTML = '';
        }
        
        // Add meat particles - increased quantity for more dramatic effect
        for (let i = 0; i < 50; i++) {
            const meatParticle = document.createElement('div');
            meatParticle.classList.add('meat-particle');
            meatParticle.style.left = `${Math.random() * 100}%`;
            meatParticle.style.animationDelay = `${Math.random() * 1.5}s`;
            
            // Randomize meat particle sizes for more visual variety
            const size = 10 + Math.random() * 20;
            meatParticle.style.width = `${size}px`;
            meatParticle.style.height = `${size/3}px`;
            
            meatRain.appendChild(meatParticle);
        }
        
        // Add some sound effects
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-cinematic-impact-explosion-1793.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play failed: ", e));
        
        // Shake the burger container
        burgerContainer.style.animation = 'shake 0.5s ease-in-out';
        
        // Make triple patty button visible
        const triplePattyButton = document.querySelector('button[data-ingredient="triple-patty"]');
        if (triplePattyButton) {
            triplePattyButton.style.display = 'inline-block';
            triplePattyButton.style.backgroundColor = '#d62300';
            triplePattyButton.style.color = 'white';
            triplePattyButton.style.border = '2px solid gold';
            triplePattyButton.style.boxShadow = '0 0 10px gold';
            triplePattyButton.classList.add('burger-drop');
        }
        
        // Clear current burger
        setTimeout(() => {
            clearBurger();
            
            // Add triple patty
            const triplePatty = document.createElement('div');
            triplePatty.classList.add('ingredient', 'triple-patty', 'burger-drop');
            
            // Add the patty dividers for triple patty
            const dividerTop = document.createElement('div');
            dividerTop.classList.add('patty-divider-top');
            triplePatty.appendChild(dividerTop);
            
            const dividerBottom = document.createElement('div');
            dividerBottom.classList.add('patty-divider-bottom');
            triplePatty.appendChild(dividerBottom);
            
            // Insert before the bottom bun
            const bottomBun = document.querySelector('.bun-bottom');
            burger.insertBefore(triplePatty, bottomBun);
            
            hasTriplePatty = true;
            
            showMessage("The legendary TRIPLE PATTY has appeared!");
            
            // Reset burger container animation
            setTimeout(() => {
                burgerContainer.style.animation = '';
            }, 500);
            
            // Remove meat rain after animation completes
            setTimeout(() => {
                meatRain.innerHTML = '';
            }, 3000);
        }, 2000);
        checkAchievements();
    }

    // Add TTS mode button event listener
    const ttsModeButton = document.getElementById('tts-mode-button');
    ttsModeButton.addEventListener('click', toggleTTSMode);

    // Function to toggle TTS mode
    function toggleTTSMode() {
        ttsEnabled = !ttsEnabled;
        
        if (ttsEnabled) {
            ttsModeButton.textContent = "Turn Off TTS";
            ttsModeButton.classList.add('selected');
            speak("TTS Mode Activated. I will read the orders and messages for you.");
        } else {
            ttsModeButton.textContent = "Turn On TTS";
            ttsModeButton.classList.remove('selected');
            
            // Cancel any current speech
            speechSynthesis.cancel();
        }
    }

    // Function to speak text using TTS
    function speak(text) {
        if (!ttsEnabled) return;
        
        // Cancel any current speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        speechSynthesis.speak(utterance);
    }

    // Show a message
    function showMessage(text) {
        messageElement.textContent = text;
        messageElement.classList.add('show');
        
        // Speak the message
        speak(text);
        
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 2000);
    }

    // Update UI elements
    function updateUI() {
        scoreElement.textContent = score;
        levelElement.textContent = level;

        // Show/hide fries button based on level
        const friesButton = document.getElementById('add-fries-button');
        if (friesButton) {
            if (level >= 5) {
                friesButton.parentElement.style.display = 'block';
            } else {
                friesButton.parentElement.style.display = 'none';
            }
        }

        // Show/hide cola button based on level
        const colaButton = document.getElementById('add-cola-button');
        if (colaButton) {
            if (level >= 10) {
                colaButton.parentElement.style.display = 'block';
            } else {
                colaButton.parentElement.style.display = 'none';
            }
        }

        // Show/hide nuggets button based on level
        const nuggetsButton = document.getElementById('add-nuggets-button');
        if (nuggetsButton) {
            if (level >= 15) {
                nuggetsButton.parentElement.style.display = 'block';
            } else {
                nuggetsButton.parentElement.style.display = 'none';
            }
        }

        // Update progress bar
        const progressPercentage = (correctOrders / 3) * 100;
        progressElement.style.width = `${progressPercentage}%`;
    }

    // Achievements System
    const achievements = {
        meatRain: {
            name: "Meat Rain Master",
            description: "Trigger the legendary meat rain",
            unlocked: false,
            icon: "🌧️"
        },
        perfectLevel: {
            name: "Culinary Perfectionist", 
            description: "Complete a full level without mistakes",
            unlocked: false,
            icon: "🏅"
        },
        highScore: {
            name: "Burger Billionaire",
            description: "Reach a score of 1000 without auto mode",
            unlocked: false,
            icon: "💰"
        },
        triplePatty: {
            name: "Triple Threat",
            description: "Create and serve a triple patty burger",
            unlocked: false,
            icon: "🍔"
        },
        theRainbow: {
            name: "The Rainbow!",
            description: "Create a burger with ALL ingredients, including the triple patty",
            unlocked: false,
            icon: "🌈"
        },
        sauceMaster: {
            name: "SAAAAAAAUCE",
            description: "Serve a burger with ONLY sauces",
            unlocked: false,
            icon: "🥫"
        }
    };

    // Enhanced achievements tracking
    function checkAchievements() {
        // Check each achievement
        Object.keys(achievements).forEach(key => {
            switch(key) {
                case 'meatRain':
                    if (!achievements[key].unlocked && hasTriggeredMeatRain) {
                        unlockAchievement(key);
                    }
                    break;
                case 'highScore':
                    if (!achievements[key].unlocked && score >= 1000 && !autoMode) {
                        unlockAchievement(key);
                    }
                    break;
                case 'triplePatty':
                    if (!achievements[key].unlocked && hasTriplePatty) {
                        unlockAchievement(key);
                    }
                    break;
                case 'theRainbow':
                    checkRainbowAchievement();
                    break;
                case 'sauceMaster':
                    checkSauceMasterAchievement();
                    break;
            }
        });

        updateAchievementsUI();
        
        // Check if all achievements are unlocked in speedrun mode
        if (speedrunMode) {
            const allUnlocked = Object.values(achievements).every(a => a.unlocked);
            
            if (allUnlocked) {
                clearInterval(timerInterval);
                const finalTime = timerElement.textContent;
                document.getElementById('final-time').textContent = finalTime;
                document.getElementById('victory-modal').style.display = 'block';
                
                // Play victory sound
                const victorySound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-medieval-show-fanfare-announcement-226.mp3');
                victorySound.volume = 0.5;
                victorySound.play().catch(e => console.log("Audio play failed: ", e));
                
                // Speak victory message
                speak(`Congratulations! You've completed the speedrun in ${finalTime}!`);
            }
        }
    }

    function unlockAchievement(key) {
        achievements[key].unlocked = true;
        showAchievementPopup(achievements[key]);
        
        // Check for speedrun victory after each achievement
        if (speedrunMode) {
            checkAchievements();
        }
    }

    function updateAchievementsUI() {
        const achievementItems = document.querySelectorAll('.achievement-item');

        achievementItems.forEach((item, index) => {
            const achievementKey = Object.keys(achievements)[index];
            if (achievements[achievementKey].unlocked) {
                item.classList.remove('locked');
                item.classList.add('unlocked');
                item.querySelector('.achievement-details').classList.add('unlocked-details');
            } else {
                item.classList.remove('unlocked');
                item.classList.add('locked');
                item.querySelector('.achievement-details').classList.remove('unlocked-details');
            }
        });
    }

    function showAchievementPopup(achievement) {
        // Existing popup code...
        const achievementPopup = document.createElement('div');
        achievementPopup.classList.add('achievement-popup');
        achievementPopup.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-content">
                <h3>Achievement Unlocked!</h3>
                <p>${achievement.name}</p>
                <small>${achievement.description}</small>
            </div>
        `;
        document.body.appendChild(achievementPopup);

        // Play sound
        const achievementSound = new Audio('https://www.soundjay.com/button/sounds/button-09.mp3');
        achievementSound.play();

        // Remove popup after 3 seconds
        setTimeout(() => {
            achievementPopup.classList.add('fade-out');
            setTimeout(() => {
                achievementPopup.remove();
            }, 1000);
        }, 3000);

        // Speak achievement
        speak(`Achievement Unlocked: ${achievement.name}`);
    }

    function checkRainbowAchievement() {
        const storedAchievements = {};
        
        if (storedAchievements.theRainbow) return;

        const currentBurger = Array.from(burger.querySelectorAll('.ingredient'))
            .filter(ing => !ing.classList.contains('bun-top') && !ing.classList.contains('bun-bottom'))
            .map(ing => {
                for (const className of ing.classList) {
                    if (className !== 'ingredient' && className !== 'burger-drop') {
                        return className;
                    }
                }
                return null;
            })
            .filter(ing => ing !== null);

        const allIngredientsExceptTriple = allIngredients
            .filter(ing => ing.id !== 'triple-patty')
            .map(ing => ing.id);

        const hasAllIngredients = allIngredientsExceptTriple.every(ing => currentBurger.includes(ing));
        const hasTriplePatty = currentBurger.includes('triple-patty');

        if (hasAllIngredients && hasTriplePatty) {
            unlockAchievement('theRainbow');
            addMixedPieceIngredient();
        }
    }

    function checkSauceMasterAchievement() {
        const currentBurger = Array.from(burger.querySelectorAll('.ingredient'))
            .filter(ing => !ing.classList.contains('bun-top') && !ing.classList.contains('bun-bottom'))
            .map(ing => {
                for (const className of ing.classList) {
                    if (className !== 'ingredient' && className !== 'burger-drop') {
                        return className;
                    }
                }
                return null;
            })
            .filter(ing => ing !== null);

        const sauceIngredients = ['mayo', 'ketchup', 'mustard', 'guacamole'];
        const isSauceOnly = currentBurger.length > 0 && 
            currentBurger.every(ing => sauceIngredients.includes(ing));

        if (isSauceOnly) {
            unlockAchievement('sauceMaster');
        }
    }

    // Function to add Mixed Piece ingredient button
    function addMixedPieceIngredient() {
        // Check if Mixed Piece button already exists
        if (document.querySelector('button[data-ingredient="mixed-piece"]')) return;

        // Create Mixed Piece button
        const mixedPieceButton = document.createElement('button');
        mixedPieceButton.dataset.ingredient = 'mixed-piece';
        mixedPieceButton.textContent = 'Mixed Piece';
        
        // Get ingredients list
        const ingredientsList = document.querySelector('.ingredients-list');
        ingredientsList.appendChild(mixedPieceButton);

        // Add event listener for Mixed Piece (similar to other ingredients)
        mixedPieceButton.addEventListener('click', () => {
            if (mixedPieceButton.classList.contains('selected')) {
                mixedPieceButton.classList.remove('selected');
                removeIngredient('mixed-piece');
            } else {
                mixedPieceButton.classList.add('selected');
                addIngredient('mixed-piece');
            }
        });

        // Highlight the new ingredient with rainbow effect
        mixedPieceButton.style.background = 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)';
        mixedPieceButton.style.color = 'white';
        mixedPieceButton.style.border = '2px solid gold';
        mixedPieceButton.style.fontWeight = 'bold';
    }

    // Add speedrun mode button after other mode buttons
    const speedrunButton = document.createElement('button');
    speedrunButton.id = 'speedrun-mode-button';
    speedrunButton.textContent = 'Speedrun Mode';
    speedrunButton.classList.add('speedrun-button');
    document.querySelector('.stats').appendChild(speedrunButton);

    // Add timer element
    timerElement = document.createElement('div');
    timerElement.classList.add('timer');
    timerElement.style.display = 'none';
    document.querySelector('.burger-container').insertBefore(timerElement, document.querySelector('.stats'));

    // Create victory modal
    const victoryModal = document.createElement('div');
    victoryModal.id = 'victory-modal';
    victoryModal.classList.add('victory-modal');
    victoryModal.innerHTML = `
        <div class="victory-modal-content">
            <h2 class="victory-title">🏆 SPEEDRUN COMPLETE! 🏆</h2>
            <p class="victory-time">Your time: <span id="final-time">00:00:00</span></p>
            <button class="victory-button">Play Again</button>
        </div>
    `;
    document.body.appendChild(victoryModal);

    // Add event listener for speedrun button
    speedrunButton.addEventListener('click', toggleSpeedrunMode);

    // Add event listener for victory modal button
    victoryModal.querySelector('.victory-button').addEventListener('click', () => {
        victoryModal.style.display = 'none';
        toggleSpeedrunMode(); // Reset and restart speedrun mode
    });

    // Function to toggle speedrun mode
    function toggleSpeedrunMode() {
        if (!speedrunMode) {
            // Enable speedrun mode
            speedrunMode = true;
            speedrunButton.textContent = "Exit Speedrun Mode";
            speedrunButton.classList.add('selected');
            
            // Reset game state
            score = 0;
            level = 1;
            correctOrders = 0;
            
            // Reset achievements
            Object.keys(achievements).forEach(key => {
                achievements[key].unlocked = false;
            });
            updateAchievementsUI();
            
            // Start the timer
            startTime = new Date();
            timerElement.style.display = 'block';
            timerInterval = setInterval(updateTimer, 1000);
            
            // Reset the game
            generateNewOrder();
            updateUI();
            
            showMessage("Speedrun Mode Started! Unlock all achievements as fast as you can!");
        } else {
            // Disable speedrun mode
            speedrunMode = false;
            speedrunButton.textContent = "Speedrun Mode";
            speedrunButton.classList.remove('selected');
            
            // Stop the timer
            clearInterval(timerInterval);
            timerElement.style.display = 'none';
            
            // Reset the game
            generateNewOrder();
            updateUI();
            
            showMessage("Speedrun Mode Ended!");
        }
    }

    // Function to update the timer
    function updateTimer() {
        if (!startTime) return;
        
        const currentTime = new Date();
        const elapsedTime = new Date(currentTime - startTime);
        const hours = String(elapsedTime.getUTCHours()).padStart(2, '0');
        const minutes = String(elapsedTime.getUTCMinutes()).padStart(2, '0');
        const seconds = String(elapsedTime.getUTCSeconds()).padStart(2, '0');
        
        timerElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // Populate achievements list
    const achievementsList = document.createElement('div');
    achievementsList.classList.add('achievements-list');
    Object.values(achievements).forEach(achievement => {
        const achievementItem = document.createElement('div');
        achievementItem.classList.add('achievement-item');
        achievementItem.classList.add(achievement.unlocked ? 'unlocked' : 'locked');
        achievementItem.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-details">
                <h3>${achievement.name}</h3>
                <p>${achievement.description}</p>
            </div>
        `;
        achievementsList.appendChild(achievementItem);
    });

    // Add achievements menu button to stats section
    const achievementsButton = document.createElement('button');
    achievementsButton.id = 'achievements-button';
    achievementsButton.textContent = 'Achievements';
    achievementsButton.classList.add('achievements-button');
    document.querySelector('.stats').appendChild(achievementsButton);

    // Create achievements modal
    const achievementsModal = document.createElement('div');
    achievementsModal.id = 'achievements-modal';
    achievementsModal.classList.add('achievements-modal');
    achievementsModal.innerHTML = `
        <div class="achievements-modal-content">
            <span class="close-achievements">&times;</span>
            <h2>Achievements</h2>
            <div class="achievements-list"></div>
        </div>
    `;
    document.body.appendChild(achievementsModal);

    achievementsModal.querySelector('.achievements-list').appendChild(achievementsList);

    // Add event listeners for achievements modal
    achievementsButton.addEventListener('click', () => {
        achievementsModal.style.display = 'block';
    });

    achievementsModal.querySelector('.close-achievements').addEventListener('click', () => {
        achievementsModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === achievementsModal) {
            achievementsModal.style.display = 'none';
        }
    });

    // Load and update achievements modal
    updateAchievementsUI();
});