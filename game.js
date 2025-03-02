(function() {
  let incomePerSecond = 0;
  let incomeTickRate = 1000; // Base tick rate for passive income in milliseconds
  let antiCheatEnabled = false;
  let lastSeen = 0; // Last seen timestamp
  
  // Flag to control saving. If a saved game exists, saving is locked until a successful load occurs.
  let allowSave = false;
  // Check if there is already a saved game in localStorage at startup.
  if (!localStorage.getItem('rockClickerSave')) {
    allowSave = true;
  }

  const SHOP_ITEMS = [
    {
      id: 1,
      name: "Pickaxe",
      cost: 50,
      description: "A sturdy tool for chipping away at rocks. Generates 1 rock per tick.",
      emoji: "⛏️",
      effect: () => {
        incomePerSecond += 1;
      }
    },
    {
      id: 2,
      name: "Dynamite",
      cost: 350,
      description: "Blast through rock formations with explosive power. Generates 5 rocks per tick.",
      emoji: "🧨",
      effect: () => {
        incomePerSecond += 5;
      }
    },
    {
      id: 3,
      name: "Drill",
      cost: 1960,
      description: "A powerful machine that bores through solid rock with ease. Generates 20 rocks per tick.",
      emoji: "🔨",
      effect: () => {
        incomePerSecond += 20;
      }
    },
    {
      id: 4,
      name: "Quantum Chisel",
      cost: 6860,
      description: "Splits rocks at the atomic level, generating 50 rocks per tick",
      emoji: "🔬",
      effect: () => {
        incomePerSecond += 50;
      }
    },
    {
      id: 5,
      name: "Gravity Manipulator",
      cost: 38416,
      description: "Alters local gravity to crumble rocks effortlessly, generating 200 rocks per tick",
      emoji: "🌌",
      effect: () => {
        incomePerSecond += 200;
      }
    },
    {
      id: 6,
      name: "Time Dilation Field",
      cost: 134400,
      description: "Slows time around rocks for rapid extraction, generating 500 rocks per tick",
      emoji: "⏳",
      effect: () => {
        incomePerSecond += 500;
      }
    },
    {
      id: 7,
      name: "Nano-Swarm Disassembler",
      cost: 752900,
      description: "Microscopic robots break down rocks molecule by molecule, generating 2000 rocks per tick",
      emoji: "🤖",
      effect: () => {
        incomePerSecond += 2000;
      }
    },
    {
      id: 8,
      name: "Planetary Core Tapper",
      cost: 5421000,
      description: "Directly extracts rocks from the planet's core, generating 10000 rocks per tick",
      emoji: "🌋",
      effect: () => {
        incomePerSecond += 10000;
      }
    },
    {
      id: 9,
      name: "Cosmic String Resonator",
      cost: 39030000,
      description: "Vibrates cosmic strings to shatter all rocks in the universe, generating 50000 rocks per tick",
      emoji: "🎻",
      effect: () => {
        incomePerSecond += 50000;
      }
    },
    {
      id: 10,
      name: "Reality Fabric Weaver",
      cost: 224800000,
      description: "Rewrites the laws of physics to turn everything into rocks, generating 200000 rocks per tick",
      emoji: "🌈",
      effect: () => {
        incomePerSecond += 200000;
      }
    },
    {
      id: 11,
      name: "Quantum Entanglement Harvester",
      cost: 1500000000,
      description: "Entangles rocks across parallel universes, generating 1000000 rocks per tick",
      emoji: "🕸️",
      effect: () => {
        incomePerSecond += 1000000;
      }
    },
    {
      id: 12,
      name: "Chronosynclastic Infundibulum",
      cost: 10000000000,
      description: "Gathers rocks from all points in time simultaneously, generating 5000000 rocks per tick",
      emoji: "🌀",
      effect: () => {
        incomePerSecond += 5000000;
      }
    },
    {
      id: 13,
      name: "Hyperdimensional Lithomancer",
      cost: 75000000000,
      description: "Conjures rocks from higher dimensions, generating 25000000 rocks per tick",
      emoji: "🔮",
      effect: () => {
        incomePerSecond += 25000000;
      }
    },
    {
      id: 14,
      name: "Ontological Petrification Engine",
      cost: 420000000000,
      description: "Transforms abstract concepts into tangible rocks, generating 100000000 rocks per tick",
      emoji: "💠",
      effect: () => {
        incomePerSecond += 100000000;
      }
    },
    {
      id: 15,
      name: "Cosmic Consciousness Crystallizer",
      cost: 4410000000000,
      description: "Solidifies the very thoughts of the universe into rocks, generating 750000000 rocks per tick",
      emoji: "🧠",
      effect: () => {
        incomePerSecond += 750000000;
      }
    }
  ];
  const UPGRADE_ITEMS = [
    {
      id: 1,
      name: "Efficient clicks",
      baseCost: 5000,
      maxPurchases: 10,
      costMultiplier: 12,
      description: "Each level you buy multiplies the amount of rocks you get from clicks by 10!",
      effect: () => {
        clickMultiplier *= 10;
      }
    },
    {
      id: 2,
      name: "Diamond Chance",
      baseCost: 100000,
      maxPurchases: 6,
      costMultiplier: 20,
      description: "Each level adds a 0.33% chance every second to spawn a clickable diamond, granting 1~50% of your current rocks! (Affected by Diamond Value upgrade)",
      effect: () => {
        diamondChance += 0.0033;
      }
    },
    {
      id: 3,
      name: "Diamond Value",
      baseCost: 100000,
      maxPurchases: 10,
      costMultiplier: 6,
      description: "Each level increases the minimum and maximum value of a diamond by 10%!",
      effect: () => {
        diamondValueMultiplier += 0.1;
      }
    },
    {
      id: 4,
      name: "Tick Speed",
      baseCost: 1000000,
      maxPurchases: 9,
      costMultiplier: 6,
      description: "Reduces the tick cooldown of passive income by 0.1 seconds!",
      effect: () => {
        incomeTickRate = Math.max(100, incomeTickRate - 100);
      }
    }
  ];
  let diamondChance = 0;
  let clickMultiplier = 1;
  let diamondValueMultiplier = 1;
  let GG_ALL_GAME_CONFIG = {
    autosaveInterval: 5000, // Autosave silently every 5 seconds
    rockEmoji: "🪨",
    counterText: "Rocks: ",
    getItemCost: (basePrice, itemCount) => Math.floor(basePrice * Math.pow(1.2, itemCount)),
    shopItems: SHOP_ITEMS
  };
  if (GG_ALL_GAME_CONFIG.diamondChance !== undefined) {
    diamondChance = GG_ALL_GAME_CONFIG.diamondChance;
    delete GG_ALL_GAME_CONFIG.diamondChance;
  }
  if (GG_ALL_GAME_CONFIG.clickMultiplier !== undefined) {
    clickMultiplier = GG_ALL_GAME_CONFIG.clickMultiplier;
    delete GG_ALL_GAME_CONFIG.clickMultiplier;
  }
  if (GG_ALL_GAME_CONFIG.diamondValueMultiplier !== undefined) {
    diamondValueMultiplier = GG_ALL_GAME_CONFIG.diamondValueMultiplier;
    delete GG_ALL_GAME_CONFIG.diamondValueMultiplier;
  }
  
  let hiddenNames = [];

  const rock = document.getElementById('rock');
  const counter = document.getElementById('counter');
  const shop = document.getElementById('shop');
  const upgradeShop = document.getElementById('upgrade-shop');
  const saveLoadButton = document.getElementById('save-load-button');
  const saveLoadInterface = document.getElementById('save-load-interface');
  const saveButton = document.getElementById('save-button');
  const loadButton = document.getElementById('load-button');
  const orbitingItemsContainer = document.getElementById('orbiting-items');
  const scoreDisplay = document.getElementById('score-display');
  const rebirthButton = document.getElementById('rebirth-button');
  const rebirthInfo = document.getElementById('rebirth-info');
  const rebirthCounterDisplay = document.getElementById('rebirth-counter');
  let count = 0;
  let items = [];
  let upgrades = {};
  let totalSpent = 0;
  let userName = '';
  let rebirthCount = 0;
  let rebirthBonus = 1;
  let rebirthCost = 5000000;

  function updateRebirthInfo() {
    const nextRebirthCost = rebirthCost * Math.pow(2, rebirthCount);
    const currentScore = count + totalSpent;
    const currentItemCap = 40 + 20 * rebirthCount;
    const newItemCap = 40 + 20 * (rebirthCount + 1);
    const currentIncomeMultiplier = 1 + rebirthCount * 0.5;
    const newIncomeMultiplier = 1 + (rebirthCount + 1) * 0.5;
    const currentDiamondRewardCap = Math.floor(nextRebirthCost * 0.05);
    const newDiamondRewardCap = Math.floor(nextRebirthCost * 2 * 0.05);
    const tooltipContent = `Rebirth Benefits:
• Increased item cap: ${currentItemCap} -> ${newItemCap}
• Income multiplier: ${currentIncomeMultiplier.toFixed(2)}x -> ${newIncomeMultiplier.toFixed(2)}x
• Diamond reward cap: ${formatNumber(currentDiamondRewardCap)} -> ${formatNumber(newDiamondRewardCap)} rocks
Warnings:
• All items will be reset
• All upgrades will be reset
• Rock counter will be reset to 0
• Score will remain unchanged
Current rebirth cost: ${formatNumber(nextRebirthCost)} score`;
    rebirthButton.setAttribute('data-tooltip', tooltipContent);
    if (currentScore >= nextRebirthCost) {
      rebirthInfo.innerHTML = `<span class="can-rebirth">Can rebirth Now!</span>`;
      rebirthButton.disabled = false;
    } else {
      rebirthInfo.textContent = `${formatNumber(nextRebirthCost - currentScore)} score until next rebirth`;
      rebirthButton.disabled = true;
    }
    rebirthCounterDisplay.textContent = `Rebirth Count: ${rebirthCount}`;
  }

  function showRebirthConfirmation() {
    const nextRebirthCost = rebirthCost * Math.pow(2, rebirthCount);
    if (count + totalSpent >= nextRebirthCost) {
      const currentItemCap = 40 + 20 * rebirthCount;
      const newItemCap = 40 + 20 * (rebirthCount + 1);
      const currentIncomeMultiplier = 1 + rebirthCount * 0.5;
      const newIncomeMultiplier = 1 + (rebirthCount + 1) * 0.5;
      const currentDiamondRewardCap = Math.floor(nextRebirthCost * 0.05);
      const newDiamondRewardCap = Math.floor(nextRebirthCost * 2 * 0.05);
      const confirmationDiv = document.createElement('div');
      confirmationDiv.id = 'rebirth-confirmation';
      confirmationDiv.innerHTML = `
<h2>Confirm Rebirth</h2>
<p style="color: green;">Benefits of rebirth:</p>
<ul style="color: green;">
<li>Item cap: ${currentItemCap} -> ${newItemCap}</li>
<li>Income multiplier: ${currentIncomeMultiplier.toFixed(2)}x -> ${newIncomeMultiplier.toFixed(2)}x</li>
<li>Diamond reward cap: ${formatNumber(currentDiamondRewardCap)} -> ${formatNumber(newDiamondRewardCap)} rocks</li>
</ul>
<p style="color: red;">Warning: All items, upgrades, and rock counter will be reset!</p>
<p style="color: black;">Your score will remain unchanged.</p>
<button id="confirm-rebirth">Confirm Rebirth</button>
<button id="cancel-rebirth">Cancel</button>
`;
      document.body.appendChild(confirmationDiv);
      document.getElementById('confirm-rebirth').addEventListener('click', () => {
        rebirth();
        document.body.removeChild(confirmationDiv);
      });
      document.getElementById('cancel-rebirth').addEventListener('click', () => {
        document.body.removeChild(confirmationDiv);
      });
    }
  }

  function rebirth() {
    if (count + totalSpent >= rebirthCost * Math.pow(2, rebirthCount)) {
      rebirthCount++;
      rebirthBonus = 1 + rebirthCount * 0.5;
      totalSpent += count;
      count = 0;
      items = [];
      upgrades = {};
      incomePerSecond = 0;
      clickMultiplier = 1;
      diamondChance = 0;
      diamondValueMultiplier = 1;
      incomeTickRate = 1000;
      updateCounter();
      updateShop();
      updateUpgradeShop();
      updateOrbitingItems();
      updateIncomeInterval();
      updateRebirthInfo();
      applyAllUpgrades();
      recalculateGameValues();
      alert(`Rebirth successful! Your production is now ${rebirthBonus.toFixed(2)}x faster! All upgrades have been reset.`);
    }
  }
  rebirthButton.addEventListener('click', showRebirthConfirmation);

  function spawnDiamond() {
    if (Math.random() < diamondChance) {
      const diamond = document.createElement('div');
      diamond.textContent = '💎';
      diamond.style.position = 'absolute';
      diamond.style.left = `${Math.random() * 100}%`;
      diamond.style.top = `${Math.random() * 100}%`;
      diamond.style.fontSize = '24px';
      diamond.style.cursor = 'pointer';
      diamond.style.zIndex = '1000';
      diamond.onclick = (event) => {
        const nextRebirthCost = rebirthCost * Math.pow(2, rebirthCount);
        const rewardCap = nextRebirthCost * 0.05;
        const minReward = Math.floor(count * 0.05 * diamondValueMultiplier);
        const maxReward = Math.floor(count * 0.5 * diamondValueMultiplier);
        let reward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
        if (reward > rewardCap) {
          const excessReward = reward - rewardCap;
          reward = rewardCap + Math.floor(Math.sqrt(excessReward));
        }
        count += reward;
        updateCounter();
        updateShop();
        updateUpgradeShop();
        document.body.removeChild(diamond);
        const rewardText = document.createElement('div');
        rewardText.textContent = `+${reward}`;
        rewardText.style.position = 'absolute';
        rewardText.style.left = `${event.clientX}px`;
        rewardText.style.top = `${event.clientY}px`;
        rewardText.style.fontSize = '20px';
        rewardText.style.fontWeight = 'bold';
        rewardText.style.color = '#FFD700';
        rewardText.style.pointerEvents = 'none';
        rewardText.style.animation = 'fadeUpAndOut 2s ease-out forwards';
        document.body.appendChild(rewardText);
        setTimeout(() => {
          if (document.body.contains(rewardText)) {
            document.body.removeChild(rewardText);
          }
        }, 2000);
      };
      document.body.appendChild(diamond);
      setTimeout(() => {
        if (document.body.contains(diamond)) {
          document.body.removeChild(diamond);
        }
      }, 5000);
    }
  }
  setInterval(spawnDiamond, 1000);

  function updateCounter() {
    counter.textContent = `${GG_ALL_GAME_CONFIG.counterText}${count.toLocaleString()}`;
    updateRocksPerSecondDisplay();
    updateScore();
    updateRebirthInfo();
  }

  function updateScore() {
    const score = Math.floor(count + totalSpent);
    scoreDisplay.textContent = `Score: ${score.toLocaleString()}`;
  }

  function formatNumber(num) {
    const suffixes = ['', 'k', 'm', 'b', 't', 'q', 'Q', 's', 'S', 'o', 'n', 'd'];
    const tier = Math.log10(Math.abs(num)) / 3 | 0;
    if (tier === 0) return num.toLocaleString();
    const suffix = suffixes[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = num / scale;
    return scaled.toFixed(3) + suffix;
  }

  function updateShop() {
    shop.innerHTML = '';
    SHOP_ITEMS.forEach(item => {
      const itemCount = items.find(i => i.ID === item.id)?.count || 0;
      const itemCost = Math.floor(item.cost * Math.pow(1.2, itemCount));
      const maxItems = 40 + 20 * rebirthCount;
      const itemElement = document.createElement('div');
      itemElement.className = 'shop-item';
      itemElement.innerHTML = `
<span>${item.name} - Cost: ${formatNumber(itemCost)} rocks</span>
<p>${item.description}</p>
<button onclick="buyItem(${item.id})" ${count < itemCost || itemCount >= maxItems ? 'disabled' : ''}>Buy</button>
<div class="item-count">Owned: ${itemCount}/${maxItems}</div>
<div class="item-emojis">
${Array(itemCount).fill(item.emoji).join('')}
</div>
`;
      shop.appendChild(itemElement);
    });
  }

  function updateUpgradeShop() {
    upgradeShop.innerHTML = '';
    UPGRADE_ITEMS.forEach(upgrade => {
      const upgradeCount = upgrades[upgrade.id] || 0;
      const upgradeCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgradeCount));
      const upgradeElement = document.createElement('div');
      upgradeElement.className = 'shop-item';
      upgradeElement.innerHTML = `
<span>${upgrade.name} - Cost: ${formatNumber(upgradeCost)} rocks</span>
<p>${upgrade.description}</p>
<button onclick="buyUpgrade(${upgrade.id})" ${count < upgradeCost || upgradeCount >= upgrade.maxPurchases ? 'disabled' : ''}>Buy</button>
<div class="item-count">Level: ${upgradeCount}/${upgrade.maxPurchases}</div>
<div class="upgrade-effect">${getUpgradeEffect(upgrade, upgradeCount)}</div>
`;
      upgradeShop.appendChild(upgradeElement);
    });
  }

  window.buyItem = function(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    const existingItem = items.find(i => i.ID === itemId);
    const itemCount = existingItem ? existingItem.count : 0;
    const itemCost = Math.floor(item.cost * Math.pow(1.2, itemCount));
    const maxItems = 40 + 20 * rebirthCount;
    if (item && count >= itemCost && itemCount < maxItems) {
      count -= itemCost;
      totalSpent += itemCost;
      item.effect();
      if (existingItem) {
        existingItem.count++;
      } else {
        items.push({
          "ID": itemId,
          "count": 1
        });
      }
      updateCounter();
      updateShop();
      updateUpgradeShop();
      updateOrbitingItems();
    }
  };

  function getUpgradeEffect(upgrade, level) {
    switch (upgrade.id) {
      case 1:
        return `Current click multiplier: ${formatNumber(clickMultiplier)}x`;
      case 2:
        return `Current diamond spawn chance: ${(diamondChance * 100).toFixed(2)}%`;
      case 3:
        return `Current diamond value range: ${formatNumber(Math.floor(5 * diamondValueMultiplier))}%-${formatNumber(Math.floor(50 * diamondValueMultiplier))}% of balance`;
      case 4:
        return `Current tick cooldown: ${(incomeTickRate / 1000).toFixed(1)} seconds`;
      default:
        return '';
    }
  }

  window.buyUpgrade = function(upgradeId) {
    const upgrade = UPGRADE_ITEMS.find(u => u.id === upgradeId);
    const upgradeCount = upgrades[upgradeId] || 0;
    const upgradeCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgradeCount));
    if (upgrade && count >= upgradeCost && upgradeCount < upgrade.maxPurchases) {
      count -= upgradeCost;
      totalSpent += upgradeCost;
      upgrades[upgradeId] = (upgradeCount + 1);
      upgrade.effect();
      applyAllUpgrades();
      updateCounter();
      updateShop();
      updateUpgradeShop();
      updateIncomeInterval();
      updateRocksPerSecondDisplay();
    }
  };

  let orbitingItemsData = [];

  function updateOrbitingItems() {
    const currentItems = items.reduce((acc, item) => {
      acc[item.ID] = (acc[item.ID] || 0) + item.count;
      return acc;
    }, {});
    orbitingItemsData = orbitingItemsData.filter(item => {
      if (!currentItems[item.ID] || currentItems[item.ID] === 0) {
        if (item.element && item.element.parentNode) {
          item.element.parentNode.removeChild(item.element);
        }
        return false;
      }
      currentItems[item.ID]--;
      return true;
    });
    items.forEach(item => {
      const shopItem = SHOP_ITEMS.find(i => i.id === item.ID);
      if (shopItem) {
        const existingCount = orbitingItemsData.filter(i => i.ID === item.ID).length;
        const newCount = item.count - existingCount;
        for (let i = 0; i < newCount; i++) {
          const orbitingItem = document.createElement('div');
          orbitingItem.className = 'orbiting-item';
          orbitingItem.textContent = shopItem.emoji;
          const randomRadius = Math.floor(Math.random() * (250 - 100 + 1)) + 100;
          const randomDuration = Math.random() * (10 - 3) + 3;
          const randomStartAngle = Math.random() * 360;
          orbitingItem.style.setProperty('--orbit-radius', `${randomRadius}px`);
          orbitingItem.style.setProperty('--orbit-duration', `${randomDuration}s`);
          orbitingItem.style.setProperty('--start-angle', `${randomStartAngle}deg`);
          orbitingItem.style.animationDuration = `${randomDuration}s`;
          orbitingItemsContainer.appendChild(orbitingItem);
          orbitingItemsData.push({
            ID: item.ID,
            element: orbitingItem,
            radius: randomRadius,
            duration: randomDuration,
            startAngle: randomStartAngle
          });
        }
      }
    });
  }

  rock.addEventListener('click', () => {
    count += 1 * clickMultiplier * rebirthBonus;
    updateCounter();
    updateShop();
    updateUpgradeShop();
    rock.style.transform = 'translate(-50%, -50%) scale(0.95)';
    setTimeout(() => {
      rock.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 50);
  });

  function updateClickMultiplier() {
    clickMultiplier = Math.pow(10, upgrades[1] || 0);
  }

  function updateDiamondChance() {
    diamondChance = (upgrades[2] || 0) * 0.0033;
  }

  function updateDiamondValueMultiplier() {
    diamondValueMultiplier = 1 + (upgrades[3] || 0) * 0.1;
  }

  function updateIncomeTickRate() {
    incomeTickRate = Math.max(100, 1000 - (upgrades[4] || 0) * 100);
  }

  function applyAllUpgrades() {
    updateClickMultiplier();
    updateDiamondChance();
    updateDiamondValueMultiplier();
    updateIncomeTickRate();
  }

  let incomeInterval;
  function updateIncomeInterval() {
    clearInterval(incomeInterval);
    incomeInterval = setInterval(() => {
      count += incomePerSecond * rebirthBonus * (incomeTickRate / 1000);
      updateCounter();
      updateUpgradeShop();
      updateShop();
    }, incomeTickRate);
  }

  function updateRocksPerSecondDisplay() {
    const adjustedIncomePerSecond = incomePerSecond * rebirthBonus;
    document.getElementById('rocks-per-second').textContent = `${adjustedIncomePerSecond.toLocaleString(undefined, {maximumFractionDigits: 1})} rocks/s`;
  }

  const saveLoadOverlay = document.createElement('div');
  saveLoadOverlay.id = 'save-load-overlay';
  document.body.appendChild(saveLoadOverlay);

  saveLoadButton.addEventListener('click', () => {
    saveLoadInterface.style.display = 'block';
    saveLoadOverlay.style.display = 'block';
    updateUsernameDisplay();
  });

  saveLoadOverlay.addEventListener('click', () => {
    saveLoadInterface.style.display = 'none';
    saveLoadOverlay.style.display = 'none';
  });

  // Local Storage Save/Load implementation using local time
  function saveGame(gameState) {
    localStorage.setItem('rockClickerSave', JSON.stringify(gameState));
  }

  function loadGameFromStorage() {
    const saveData = localStorage.getItem('rockClickerSave');
    if (saveData) {
      return JSON.parse(saveData);
    }
    return null;
  }

  function requestUserHandle() {
    window.parent.postMessage({
      type: 'REQUEST_USER_HANDLE_EVENT'
    }, '*');
  }

  function updateUsernameDisplay() {
    requestUserHandle();
  }


  window.addEventListener('load', updateUsernameDisplay);

  // Auto-load game and update orbiting items on game start
  window.addEventListener('load', () => {
    const initialSave = loadGameFromStorage();
    if (initialSave && initialSave.count !== undefined) {
      count = initialSave.count;
      items = initialSave.items || [];
      upgrades = initialSave.upgrades || {};
      totalSpent = initialSave.totalSpent || 0;
      rebirthCount = initialSave.rebirthCount || 0;
      rebirthBonus = initialSave.rebirthBonus || 1;
      lastSeen = initialSave.lastSeen || 0;
      recalculateGameValues();
      updateCounter();
      updateShop();
      updateUpgradeShop();
      updateOrbitingItems();
      // Prevent saving until a user-initiated load if no initial save existed before
      allowSave = true;
      // Use local time for offline income calculation
      const currentTime = Math.floor(Date.now() / 1000);
      const { timeDifference, offlineIncome } = calculateOfflineIncome(currentTime, lastSeen);
      count += offlineIncome;
      showOfflineIncomePopup(timeDifference, offlineIncome);
      updateCounter();
      updateShop();
      updateUpgradeShop();
      updateOrbitingItems();
      updateIncomeInterval();
      updateRebirthInfo();
      alert('Game auto-loaded!');
    } else {
      // In case there's no save, set lastSeen to current time
      setLastSeenToCurrentTime();
    }
  });

  saveButton.addEventListener('click', () => {
    if (!allowSave) {
      alert("You must load your saved game before you can save again.");
      return;
    }
    lastSeen = Math.floor(Date.now() / 1000);
    saveGame({
      count: count,
      items: items,
      upgrades: upgrades,
      incomePerSecond: incomePerSecond,
      clickMultiplier: clickMultiplier,
      diamondChance: diamondChance,
      diamondValueMultiplier: diamondValueMultiplier,
      incomeTickRate: incomeTickRate,
      totalSpent: totalSpent,
      rebirthCount: rebirthCount,
      rebirthBonus: rebirthBonus,
      lastSeen: lastSeen
    });
    alert('Game saved!');
  });

  loadButton.addEventListener('click', () => {
    const save_data = loadGameFromStorage();
    if (save_data && save_data.count !== undefined) {
      count = save_data.count;
      items = save_data.items || [];
      upgrades = save_data.upgrades || {};
      totalSpent = save_data.totalSpent || 0;
      rebirthCount = save_data.rebirthCount || 0;
      rebirthBonus = save_data.rebirthBonus || 1;
      lastSeen = save_data.lastSeen || 0;
      if (lastSeen === 0) {
        setLastSeenToCurrentTime();
      }
      recalculateGameValues();
      const currentTime = Math.floor(Date.now() / 1000);
      const { timeDifference, offlineIncome } = calculateOfflineIncome(currentTime, lastSeen);
      count += offlineIncome;
      showOfflineIncomePopup(timeDifference, offlineIncome);
      updateCounter();
      updateShop();
      updateUpgradeShop();
      updateOrbitingItems();
      updateIncomeInterval();
      updateRebirthInfo();
      alert('Game loaded!');
      // Upon a successful load, enable saving.
      allowSave = true;
    } else {
      alert('No saved game found!');
      setLastSeenToCurrentTime();
    }
  });

  const resetButton = document.getElementById('reset-button');

  resetButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the game? This will erase all progress.')) {
      count = 0;
      items = [];
      upgrades = {};
      incomePerSecond = 0;
      clickMultiplier = 1;
      diamondChance = 0;
      diamondValueMultiplier = 1;
      incomeTickRate = 1000;
      totalSpent = 0;
      rebirthCount = 0;
      rebirthBonus = 1;
      updateCounter();
      updateShop();
      updateUpgradeShop();
      updateOrbitingItems();
      updateIncomeInterval();
      updateRebirthInfo();
      saveGame({
        count: count,
        items: items,
        upgrades: upgrades,
        incomePerSecond: incomePerSecond,
        clickMultiplier: clickMultiplier,
        diamondChance: diamondChance,
        diamondValueMultiplier: diamondValueMultiplier,
        incomeTickRate: incomeTickRate,
        totalSpent: totalSpent,
        rebirthCount: rebirthCount,
        rebirthBonus: rebirthBonus
      });
      alert('Game reset!');
    }
  });

  window.addEventListener('message', (event) => {
    const { type, save_data } = event.data;
    if (type === 'RESPONSE_LOAD_GAME_EVENT') {
      if (save_data && save_data.count !== undefined) {
        count = save_data.count;
        items = save_data.items || [];
        upgrades = save_data.upgrades || {};
        totalSpent = save_data.totalSpent || 0;
        rebirthCount = save_data.rebirthCount || 0;
        rebirthBonus = save_data.rebirthBonus || 1;
        lastSeen = save_data.lastSeen || 0;
        if (lastSeen === 0) {
          setLastSeenToCurrentTime();
        }
        recalculateGameValues();
        const currentTime = Math.floor(Date.now() / 1000);
        const { timeDifference, offlineIncome } = calculateOfflineIncome(currentTime, lastSeen);
        count += offlineIncome;
        showOfflineIncomePopup(timeDifference, offlineIncome);
        updateCounter();
        updateShop();
        updateUpgradeShop();
        updateOrbitingItems();
        updateIncomeInterval();
        updateRebirthInfo();
        alert('Game loaded!');
        allowSave = true;
      } else {
        alert('No saved game found!');
        setLastSeenToCurrentTime();
      }
    }
  });

  function recalculateGameValues() {
    incomePerSecond = 0;
    clickMultiplier = 1;
    diamondChance = 0;
    diamondValueMultiplier = 1;
    incomeTickRate = 1000;
    items.forEach(item => {
      const shopItem = SHOP_ITEMS.find(i => i.id === item.ID);
      if (shopItem) {
        for (let i = 0; i < item.count; i++) {
          shopItem.effect();
        }
      }
    });
    applyAllUpgrades();
    incomePerSecond *= rebirthBonus;
    updateRocksPerSecondDisplay();
    updateIncomeInterval();
  }

  function updateIncomeInterval() {
    clearInterval(incomeInterval);
    incomeInterval = setInterval(() => {
      count += incomePerSecond * rebirthBonus * (incomeTickRate / 1000);
      updateCounter();
      updateUpgradeShop();
      updateShop();
    }, incomeTickRate);
  }

  function setLastSeenToCurrentTime() {
    lastSeen = Math.floor(Date.now() / 1000);
  }

  // Offline income calculation using local time
  function calculateOfflineIncome(currentTime, lastSeenTime) {
    const timeDifference = currentTime - lastSeenTime;
    const ticksPerSecond = 1000 / incomeTickRate;
    const adjustedIncomePerSecond = incomePerSecond * ticksPerSecond * rebirthBonus;
    const offlineIncome = Math.floor(0.25 * timeDifference * adjustedIncomePerSecond);
    return {
      timeDifference,
      offlineIncome
    };
  }

  function showOfflineIncomePopup(timeDifference, offlineIncome) {
    const popupDiv = document.createElement('div');
    popupDiv.id = 'offline-income-popup';
    popupDiv.innerHTML = `
<h2>Welcome Back!</h2>
<p>You were away for ${timeDifference} seconds.</p>
<p>You earned ${offlineIncome.toLocaleString()} rocks while offline! (25% of your normal production)</p>
<button onclick="this.parentElement.remove()">Close</button>
`;
    document.body.appendChild(popupDiv);
  }

  window.addEventListener('load', function() {
    const splashScreen = document.getElementById('splash-screen');
    const enterGameButton = document.getElementById('enter-game-button');
    enterGameButton.addEventListener('click', function() {
      splashScreen.style.opacity = '0';
      splashScreen.style.display = 'none';
    });
  });

  // Silent autosave every 5 seconds using local time
  setInterval(() => {
    if (allowSave) {
      lastSeen = Math.floor(Date.now() / 1000);
      saveGame({
        count: count,
        items: items,
        upgrades: upgrades,
        incomePerSecond: incomePerSecond,
        clickMultiplier: clickMultiplier,
        diamondChance: diamondChance,
        diamondValueMultiplier: diamondValueMultiplier,
        incomeTickRate: incomeTickRate,
        totalSpent: totalSpent,
        rebirthCount: rebirthCount,
        rebirthBonus: rebirthBonus,
        lastSeen: lastSeen
      });
    }
  }, GG_ALL_GAME_CONFIG.autosaveInterval);
})();