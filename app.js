const generateStorySegments = async (story) => {
  const completion = await websim.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `Break down the given story into 6 sequential scenes for a comic. 
          For each scene, provide a detailed visual description and any dialogue or captions.
          Respond with JSON in the following format:
          {
            "panels": [
              {
                "description": "Detailed visual description for the image generation",
                "caption": "Text caption or dialogue for the panel"
              }
            ]
          }`
      },
      {
        role: "user",
        content: story
      }
    ],
    json: true
  });

  return JSON.parse(completion.content);
};

const getStylePrompt = (style) => {
  const stylePrompts = {
    cartoon: "Vibrant cartoon style, bold colors, exaggerated features, clean lines, similar to modern animated movies, family-friendly aesthetic",
    realistic: "Highly detailed realistic art style, photorealistic rendering, natural lighting, detailed textures, anatomically correct proportions",
    manga: "High contrast Japanese manga art style, dramatic angles, heavy ink black lines, cel shaded, dramatic lighting, expressive anime eyes, sharp clean linework, manga aesthetic, shounen style illustration",
    pixel: "8-bit pixel art style, low resolution, blocky shapes, limited color palette, retro gaming aesthetic, clearly visible pixels, no anti-aliasing, NES/SNES era style",
    microscopic: "Scientific microscope view, cellular structures, high magnification microscopy imagery, petri dish cultures, bacterial colonies, microscopic organisms, detailed cellular anatomy, fluorescent staining effects, scientific visualization style",
    "stick-figure": "Extremely simple black stick figure drawing with basic circle head and straight lines for body, arms, and legs. No facial features except simple dots for eyes and a line for mouth. Pure black lines on white background, absolutely no detail, no hair, no ears, no nose. Most minimal possible stick figure style like in xkcd comics.",
    mixed: "" 
  };
  return stylePrompts[style] || stylePrompts.cartoon;
};

const generateComicPanel = async (description, panelIndex) => {
  const selectedStyle = document.querySelector('input[name="artStyle"]:checked').value;
  
  if (selectedStyle === 'custom') {
    const styleName = document.getElementById('styleName').value;
    const customStyle = customStyles[styleName] || myStyles[styleName];
    if (customStyle) {
      const stylePrompt = `${customStyle.description}. ${description}`;
      const result = await websim.imageGen({
        prompt: stylePrompt,
        aspect_ratio: "3:4",
        seed: Math.floor(Math.random() * 1000),
      });
      return result.url;
    }
  } else if (selectedStyle === 'mixed') {
    const styles = ['cartoon', 'realistic', 'manga', 'pixel', 'microscopic', 'stick-figure'];
    const styleIndex = panelIndex % styles.length;
    const currentStyle = styles[styleIndex];
    const stylePrompt = getStylePrompt(currentStyle);
    
    let enhancedPrompt = `${stylePrompt}. ${description}`;
    
    if (currentStyle === 'manga') {
      enhancedPrompt = `Black and white ${enhancedPrompt}, manga panel layout, heavy contrast, dramatic perspective`;
    } else if (currentStyle === 'pixel') {
      enhancedPrompt = `${enhancedPrompt}, pixelated texture, 8-bit graphics, retro game art style, low resolution`;
    } else if (currentStyle === 'microscopic') {
      enhancedPrompt = `Microscopic view through laboratory microscope, scientific imagery, ${enhancedPrompt}, high magnification, cellular detail, petri dish perspective`;
    } else if (currentStyle === 'stick-figure') {
      enhancedPrompt = `${enhancedPrompt}, white background, black stick figures, minimalist design, simple lines`;
    }
    
    const result = await websim.imageGen({
      prompt: enhancedPrompt,
      aspect_ratio: "3:4",
      seed: Math.floor(Math.random() * 1000),
    });
    return result.url;
  } else {
    const stylePrompt = getStylePrompt(selectedStyle);
    let enhancedPrompt = `${stylePrompt}. ${description}`;
    
    if (selectedStyle === 'manga') {
      enhancedPrompt = `Black and white ${enhancedPrompt}, manga panel layout, heavy contrast, dramatic perspective`;
    } else if (selectedStyle === 'pixel') {
      enhancedPrompt = `${enhancedPrompt}, pixelated texture, 8-bit graphics, retro game art style, low resolution`;
    } else if (selectedStyle === 'microscopic') {
      enhancedPrompt = `Microscopic view through laboratory microscope, scientific imagery, ${enhancedPrompt}, high magnification, cellular detail, petri dish perspective`;
    } else if (selectedStyle === 'stick-figure') {
      enhancedPrompt = `${enhancedPrompt}, white background, black stick figures, minimalist design, simple lines`;
    }

    const result = await websim.imageGen({
      prompt: enhancedPrompt,
      aspect_ratio: "3:4",
      seed: Math.floor(Math.random() * 1000),
    });
    return result.url;
  }
};

const createPanelElement = (imageUrl, caption) => {
  const panel = document.createElement('div');
  panel.className = 'comic-panel';
  
  const imgContainer = document.createElement('div');
  imgContainer.className = 'image-container';
  
  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = caption;
  img.loading = 'lazy'; 
  
  const captionDiv = document.createElement('div');
  captionDiv.className = 'caption';
  captionDiv.textContent = caption;
  
  imgContainer.appendChild(img);
  panel.appendChild(imgContainer);
  panel.appendChild(captionDiv);
  return panel;
};

const generateBtn = document.getElementById('generateBtn');
const comicContainer = document.getElementById('comicContainer');
const loading = document.getElementById('loading');
const storyInput = document.getElementById('storyInput');

generateBtn.addEventListener('click', async () => {
  const story = storyInput.value;
  
  if (!story.trim()) {
    alert('Please enter a story description first!');
    return;
  }

  loading.style.display = 'block';
  comicContainer.innerHTML = '';
  generateBtn.disabled = true;

  try {
    const storySegments = await generateStorySegments(story);
    
    for (let i = 0; i < storySegments.panels.length; i++) {
      const panel = storySegments.panels[i];
      const imageUrl = await generateComicPanel(panel.description, i);
      const panelElement = createPanelElement(imageUrl, panel.caption);
      comicContainer.appendChild(panelElement);
    }
  } catch (error) {
    console.error('Error generating comic:', error);
    alert('Sorry, there was an error generating your comic. Please try again.');
  } finally {
    loading.style.display = 'none';
    generateBtn.disabled = false;
  }
});

const customStyleRadio = document.getElementById('customStyleRadio');
const customStyleModal = document.getElementById('customStyleModal');
const generateStyleIcon = document.getElementById('generateStyleIcon');
const saveStyle = document.getElementById('saveStyle');
const cancelStyle = document.getElementById('cancelStyle');
const stylePreview = document.getElementById('stylePreview');

let customStyles = JSON.parse(localStorage.getItem('customStyles') || '{}');
let myStyles = JSON.parse(localStorage.getItem('myStyles') || '{}');

customStyleRadio.addEventListener('change', () => {
  if (customStyleRadio.checked) {
    customStyleModal.style.display = 'block';
  }
});

cancelStyle.addEventListener('click', () => {
  customStyleModal.style.display = 'none';
  customStyleRadio.checked = false;
  // Select the default cartoon style
  document.querySelector('input[value="cartoon"]').checked = true;
});

generateStyleIcon.addEventListener('click', async () => {
  const styleName = document.getElementById('styleName').value;
  const styleDescription = document.getElementById('styleDescription').value;
  
  if (!styleName || !styleDescription) {
    alert('Please enter both style name and description');
    return;
  }
  
  try {
    generateStyleIcon.disabled = true;
    generateStyleIcon.textContent = 'Generating...';
    
    // Generate an icon based on the style description
    const result = await websim.imageGen({
      prompt: `Create a simple icon representing this art style: ${styleDescription}. Make it minimal, symbolic, and representative of the style.`,
      width: 200,
      height: 200,
    });
    
    stylePreview.innerHTML = `<img src="${result.url}" alt="Style Preview">`;
    
    // Store the new style data
    customStyles[styleName] = {
      description: styleDescription,
      icon: result.url
    };
    
    localStorage.setItem('customStyles', JSON.stringify(customStyles));
    
  } catch (error) {
    console.error('Error generating style icon:', error);
    alert('Failed to generate style icon. Please try again.');
  } finally {
    generateStyleIcon.disabled = false;
    generateStyleIcon.textContent = 'Generate Icon';
  }
});

saveStyle.addEventListener('click', () => {
  const styleName = document.getElementById('styleName').value;
  
  if (!customStyles[styleName]) {
    alert('Please generate an icon first');
    return;
  }
  
  customStyleModal.style.display = 'none';
  
  // Update the custom style preview with the generated icon
  const customPreview = document.getElementById('customStylePreview');
  customPreview.innerHTML = `
    <img src="${customStyles[styleName].icon}" alt="${styleName}" width="50" height="50">
    <span>${styleName}</span>
  `;
});

function renderMyStyles() {
  const myStyleGrid = document.getElementById('myStyleGrid');
  const searchTerm = document.getElementById('searchMyStyles')?.value.toLowerCase() || '';
  
  // Combine custom styles and added marketplace styles
  const allMyStyles = {
    ...customStyles,
    ...myStyles
  };
  
  if (Object.keys(allMyStyles).length === 0) {
    myStyleGrid.innerHTML = `
      <div class="empty-my-styles">
        <svg viewBox="0 0 24 24">
          <path fill="currentColor" d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H14.82C14.4,0.84 13.3,0 12,0C10.7,0 9.6,0.84 9.18,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2M12,7L16,11H13V17H11V11H8L12,7Z"/>
        </svg>
        <h3>No Styles Yet</h3>
        <p>Browse the marketplace to find and add new styles, or create your own custom style!</p>
      </div>
    `;
    return;
  }

  myStyleGrid.innerHTML = '';
  
  for (const [styleName, style] of Object.entries(allMyStyles)) {
    if (searchTerm && !styleName.toLowerCase().includes(searchTerm) && 
        !style.description.toLowerCase().includes(searchTerm)) {
      continue;
    }
    
    const card = document.createElement('div');
    card.className = 'style-card';
    card.innerHTML = `
      <div class="style-preview">
        <img src="${style.icon || style.preview_url}" alt="${styleName}">
      </div>
      <h3>${styleName}</h3>
      <p>${style.description}</p>
      <div class="style-actions">
        <button class="remove-style-btn" onclick="removeStyle('${styleName}')">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
          </svg>
          Remove Style
        </button>
      </div>
    `;
    myStyleGrid.appendChild(card);
  }
}

window.removeStyle = (styleName) => {
  if (confirm(`Are you sure you want to remove "${styleName}" from your styles?`)) {
    if (customStyles[styleName]) {
      delete customStyles[styleName];
      localStorage.setItem('customStyles', JSON.stringify(customStyles));
    }
    if (myStyles[styleName]) {
      delete myStyles[styleName];
      localStorage.setItem('myStyles', JSON.stringify(myStyles));
    }
    renderMyStyles();
  }
};

document.getElementById('searchMyStyles').addEventListener('input', () => {
  renderMyStyles();
});

// Add WebSocket connection for marketplace functionality
const room = new WebsimSocket();

// Store marketplace styles
let marketplaceStyles = [];

// Marketplace UI Elements
const openMarketplace = document.getElementById('openMarketplace');
const marketplaceModal = document.getElementById('marketplaceModal');
const closeMarketplace = document.getElementById('closeMarketplace');
const tabButtons = document.querySelectorAll('.tab-button');
const searchStyles = document.getElementById('searchStyles');
const styleGrid = document.getElementById('styleGrid');
const publishStyleName = document.getElementById('publishStyleName');
const publishStyleDescription = document.getElementById('publishStyleDescription');
const generateMarketplaceIcon = document.getElementById('generateMarketplaceIcon');
const publishStyle = document.getElementById('publishStyle');

// Tab switching functionality
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const tabId = button.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
    });
    document.getElementById(`${tabId}Content`).classList.remove('hidden');
    
    if (tabId === 'mystyles') {
      renderMyStyles();
    }
  });
});

// Modal controls
openMarketplace.addEventListener('click', () => {
  marketplaceModal.style.display = 'block';
  loadMarketplaceStyles();
});

closeMarketplace.addEventListener('click', () => {
  marketplaceModal.style.display = 'none';
});

// Search functionality
searchStyles.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const styleCards = styleGrid.querySelectorAll('.style-card');
  let hasResults = false;

  styleCards.forEach(card => {
    const name = card.querySelector('h3').textContent.toLowerCase();
    const description = card.querySelector('p').textContent.toLowerCase();
    const creator = card.querySelector('.creator span').textContent.toLowerCase();
    
    if (name.includes(searchTerm) || 
        description.includes(searchTerm) || 
        creator.includes(searchTerm)) {
      card.style.display = 'block';
      hasResults = true;
    } else {
      card.style.display = 'none';
    }
  });

  // Show no results message if needed
  const noResults = document.getElementById('noResults');
  if (!hasResults && styleCards.length > 0) {
    if (!noResults) {
      const message = document.createElement('div');
      message.id = 'noResults';
      message.className = 'no-results';
      message.innerHTML = `
        <div class="no-results-content">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <p>No styles found matching "${searchTerm}"</p>
          <span>Try different keywords or browse all styles</span>
        </div>
      `;
      styleGrid.appendChild(message);
    }
  } else if (noResults) {
    noResults.remove();
  }
});

// Load marketplace styles from the collection
async function loadMarketplaceStyles() {
  styleGrid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  
  try {
    const styles = await room.collection('style').getList();
    marketplaceStyles = styles;
    renderStyles(styles);
  } catch (error) {
    console.error('Error loading styles:', error);
    styleGrid.innerHTML = '<p>Error loading styles. Please try again.</p>';
  }
}

// Render styles in the grid
function renderStyles(styles) {
  styleGrid.innerHTML = '';
  
  if (styles.length === 0) {
    styleGrid.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" width="64" height="64">
          <path fill="currentColor" d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H14.82C14.4,0.84 13.3,0 12,0C10.7,0 9.6,0.84 9.18,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2M12,7L16,11H13V17H11V11H8L12,7Z"/>
        </svg>
        <p>No styles published yet</p>
        <span>Be the first to share your creative style!</span>
      </div>
    `;
    return;
  }
  
  styles.forEach((style, index) => {
    const card = document.createElement('div');
    card.className = 'style-card';
    card.style.animationDelay = `${index * 0.1}s`;
    card.innerHTML = `
      <div class="style-preview">
        <img src="${style.preview_url}" alt="${style.name}" loading="lazy">
      </div>
      <h3>${style.name}</h3>
      <p>${style.description}</p>
      <div class="creator">
        <img src="https://images.websim.ai/avatar/${style.username}" alt="${style.username}">
        <span>by ${style.username}</span>
      </div>
      <div class="style-actions">
        <button onclick="addStyle('${style.id}')" class="add-style-btn">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
          </svg>
          Add to My Styles
        </button>
      </div>
    `;
    styleGrid.appendChild(card);
  });
}

// Generate preview for new style
generateMarketplaceIcon.addEventListener('click', async () => {
  const name = publishStyleName.value;
  const description = publishStyleDescription.value;
  
  if (!name || !description) {
    alert('Please enter both name and description');
    return;
  }
  
  try {
    generateMarketplaceIcon.disabled = true;
    generateMarketplaceIcon.textContent = 'Generating...';
    
    const result = await websim.imageGen({
      prompt: `Create a preview image for this art style: ${description}. Make it visually representative of the style.`,
      width: 400,
      height: 300,
    });
    
    document.getElementById('publishPreview').innerHTML = `
      <img src="${result.url}" alt="Style Preview">
    `;
    
  } catch (error) {
    console.error('Error generating preview:', error);
    alert('Failed to generate preview. Please try again.');
  } finally {
    generateMarketplaceIcon.disabled = false;
    generateMarketplaceIcon.textContent = 'Generate Preview';
  }
});

// Publish new style
publishStyle.addEventListener('click', async () => {
  const name = publishStyleName.value;
  const description = publishStyleDescription.value;
  const previewImg = document.querySelector('#publishPreview img');
  
  if (!name || !description || !previewImg) {
    alert('Please fill all fields and generate a preview');
    return;
  }
  
  try {
    publishStyle.disabled = true;
    publishStyle.textContent = 'Publishing...';
    
    await room.collection('style').create({
      name,
      description,
      preview_url: previewImg.src,
    });
    
    // Clear form
    publishStyleName.value = '';
    publishStyleDescription.value = '';
    document.getElementById('publishPreview').innerHTML = '';
    
    // Switch to browse tab and reload styles
    document.querySelector('[data-tab="browse"]').click();
    await loadMarketplaceStyles();
    
  } catch (error) {
    console.error('Error publishing style:', error);
    alert('Failed to publish style. Please try again.');
  } finally {
    publishStyle.disabled = false;
    publishStyle.textContent = 'Publish Style';
  }
});

// Add style to user's custom styles
window.addStyle = async (styleId) => {
  const style = marketplaceStyles.find(s => s.id === styleId);
  if (!style) return;
  
  myStyles[style.name] = {
    description: style.description,
    preview_url: style.preview_url
  };
  
  localStorage.setItem('myStyles', JSON.stringify(myStyles));
  
  // Update custom style preview if this style is selected
  const customPreview = document.getElementById('customStylePreview');
  customPreview.innerHTML = `
    <img src="${style.preview_url}" alt="${style.name}" width="50" height="50">
    <span>${style.name}</span>
  `;
  
  alert(`Added "${style.name}" to your styles!`);
};

// Subscribe to style updates
room.collection('style').subscribe((styles) => {
  if (marketplaceModal.style.display === 'block') {
    marketplaceStyles = styles;
    renderStyles(styles);
  }
});