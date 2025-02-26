// Input handler
const Input = {
  // Keyboard state
  keys: {
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false,
    Escape: false,
    p: false
  },
  
  // Initialize input handlers
  init: function() {
    window.addEventListener('keydown', (e) => {
      if (e.key in this.keys) {
        this.keys[e.key] = true;
        e.preventDefault();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      if (e.key in this.keys) {
        this.keys[e.key] = false;
        e.preventDefault();
        
        // Toggle pause menu on Escape or P
        if ((e.key === 'Escape' || e.key === 'p') && Game.gameState === 'playing') {
          UI.togglePanel('gameModePanel');
          Game.gameState = 'paused';
        } else if ((e.key === 'Escape' || e.key === 'p') && Game.gameState === 'paused') {
          UI.togglePanel('gameModePanel');
          Game.gameState = 'playing';
        }
      }
    });
  }
};

// DRASTIC FIX: Quick scoring and reset function to bypass all game mechanics
function quickScore(side) {
  // Score
  if (side === 'left') {
    console.log("BYPASS: Left player scores");
    Game.leftPaddle.userData.score++;
    // Show score effect
    Utils.createScoreEffect(Game.leftPaddle.userData.score, 'left');
  } else {
    console.log("BYPASS: Right player scores");
    Game.rightPaddle.userData.score++;
    // Show score effect
    Utils.createScoreEffect(Game.rightPaddle.userData.score, 'right');
  }
  
  // Update display
  UI.updateScoreDisplay();
  
  // Play score sound
  Audio.playSoundWithVolume(Audio.sounds.score);
  
  // Check for game end
  if (Game.leftPaddle.userData.score >= Settings.settings.game.maxPoints) {
    Game.endGame('left');
    return;
  } else if (Game.rightPaddle.userData.score >= Settings.settings.game.maxPoints) {
    Game.endGame('right');
    return;
  }
  
  // Complete ball reset - force to center
  Game.ball.position.set(0, 0, 0);
  Game.ball.userData.velocity.x = 0;
  Game.ball.userData.velocity.y = 0;
  Game.ball.userData.velocity.z = 0;
  
  // Wait before starting ball again
  setTimeout(() => {
    const angle = (Math.random() - 0.5) * Math.PI / 2;
    const direction = Math.random() < 0.5 ? 1 : -1;
    Game.ball.userData.velocity.x = Math.cos(angle) * Settings.settings.game.baseBallSpeed * direction;
    Game.ball.userData.velocity.y = Math.sin(angle) * Settings.settings.game.baseBallSpeed / 2;
  }, 500);
}

// Animation loop
let lastTime = 0;
let loopId = null;
let lastBallPosX = 0;
let lastBallPosY = 0;
let stuckFrames = 0;

function animate(currentTime = 0) {
  loopId = requestAnimationFrame(animate);
  
  // Calculate delta time in seconds
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  
  // Skip if delta time is too large (tab was inactive)
  if (deltaTime > 0.1) return;
  
  // DIRECT BOUNDARY DETECTION - much simpler approach 
  if (Game.ball) {
    // DIRECTLY detect boundary crossing for immediate scoring
    if (Game.ball.position.x <= -Constants.FIELD_WIDTH / 2) {
      quickScore('right');
      return;
    }
    
    if (Game.ball.position.x >= Constants.FIELD_WIDTH / 2) {
      quickScore('left');
      return;
    }
    
    // Detect stuck ball (anywhere, not just boundaries)
    if (Math.abs(Game.ball.position.x - lastBallPosX) < 0.001 &&
        Math.abs(Game.ball.position.y - lastBallPosY) < 0.001) {
      stuckFrames++;
      if (stuckFrames > 60) { // Stuck for ~1 second
        console.log("EMERGENCY: Ball completely stuck, forcing reset");
        Game.ball.position.set(0, 0, 0);
        Game.ball.userData.velocity.x = Math.cos(Math.PI/4) * Settings.settings.game.baseBallSpeed;
        Game.ball.userData.velocity.y = Math.sin(Math.PI/4) * Settings.settings.game.baseBallSpeed;
        stuckFrames = 0;
      }
    } else {
      stuckFrames = 0;
    }
    
    // Store current position for next frame comparison
    lastBallPosX = Game.ball.position.x;
    lastBallPosY = Game.ball.position.y;
  }

  // Update the game state
  switch (Game.gameState) {
    case 'menu':
      // Update menu animation
      Renderer.updateMenu(deltaTime);
      break;
      
    case 'playing':
      // Update game logic
      Game.update(deltaTime);
      // Update 2.5D pop-out effects
      Renderer.updatePopOutEffects(deltaTime);
      break;
      
    case 'paused':
      // Just render the current state
      // Still update pop-out effects for visual appeal
      Renderer.updatePopOutEffects(deltaTime);
      break;
      
    case 'finished':
      // Game over animations
      Renderer.updatePopOutEffects(deltaTime);
      break;
      
    case 'gameOver':
      // Temporary state between points
      Game.update(deltaTime);
      Renderer.updatePopOutEffects(deltaTime);
      // Force a short timeout
      if (Date.now() - Game.gameOverTime >= 1000) {
        Game.resetBall();
        Game.gameState = 'playing';
      }
      break;
  }
  
  // Render the scene
  Renderer.render();
}

// Initialize loading sequence
document.addEventListener('DOMContentLoaded', initLoading);

function initLoading() {
  try {
    // Update loading bar as assets are loaded
    const loadingBar = document.getElementById('loadingBar');
    const loadingText = document.getElementById('loadingText');
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      loadingBar.style.width = `${progress}%`;
      
      if (progress === 20) {
        loadingText.textContent = 'Creating Star Background...';
        // Initialize UI first to ensure background animation starts
        try {
          UI.init();
          console.log("UI initialized with background");
        } catch (uiError) {
          console.error("UI initialization error:", uiError);
        }
      } else if (progress === 30) {
        loadingText.textContent = 'Initializing 3D Engine...';
      } else if (progress === 40) {
        // Initialize Store after UI is set up (moved to later in loading sequence)
        try {
          Store.init();
          console.log("Store initialized");
        } catch (storeError) {
          console.error("Store initialization error:", storeError);
        }
      } else if (progress === 50) {
        loadingText.textContent = 'Loading Game Assets...';
      } else if (progress === 80) {
        loadingText.textContent = 'Preparing Cosmic Arena...';
      } else if (progress >= 100) {
        clearInterval(interval);
        loadingText.textContent = 'Ready to Play!';
        
        // Fade out loading screen
        setTimeout(() => {
          document.getElementById('loadingScreen').style.opacity = '0';
          setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
            initGame();
          }, 1000);
        }, 500);
      }
    }, 80);
  
    // Set up event listeners for slider values
    try {
      UI.setupSliderListeners();
    } catch (uiError) {
      console.error("UI listener setup error:", uiError);
    }
  } catch (error) {
    console.error("Fatal loading error:", error);
    // Emergency recovery - try to show the game anyway
    document.getElementById('loadingScreen').style.display = 'none';
    initGame();
  }
}

function initGame() {
  try {
    console.log("Starting game initialization...");
    
    // Load stored settings if available
    Settings.loadSettings();
    
    // UI is now initialized earlier in the loading sequence
    // This ensures we don't reinitialize and lose the background animation
    if (!document.getElementById('backgroundStars')) {
      console.log("UI not initialized yet, initializing...");
      UI.init();
    } else {
      console.log("UI already initialized, skipping");
    }
    
    // Explicitly check and display main menu
    const mainMenu = document.getElementById('mainMenu');
    if (mainMenu) {
      console.log("Main menu element found, displaying...");
      mainMenu.style.display = 'block';
      UI.activePanel = 'mainMenu';
    } else {
      console.error("Main menu element not found!");
    }
    
    // Initialize the renderer and scene
    Renderer.init();
    
    // Create the game field
    Renderer.createGameField();
    
    // Create paddles
    Renderer.createPaddles();
    
    // Create the ball
    Renderer.createBall();
    
    // Initialize input handlers
    Input.init();
    
    // Initialize audio
    Audio.init();
    
    // Make sure Game is initialized correctly
    Game.gameState = 'menu';
    
    // Enter the animation loop
    animate();
    
    // Check for mobile device when loading
    if (Utils.isMobileDevice()) {
      detectDevice();
    }
    
    // Add event listeners for interactions
    addInteractionListeners();
    
    console.log("Game initialization complete");
  } catch (error) {
    console.error("ERROR during game initialization:", error);
    // Try to recover by forcing main menu display
    try {
      document.getElementById('mainMenu').style.display = 'block';
    } catch (e) {
      console.error("Could not recover from initialization error:", e);
    }
  }
}

function detectDevice() {
  // Check if mobile device
  if (Utils.isMobileDevice()) {
    // Show mobile controls
    document.getElementById('mobileControls').style.display = 'flex';
    Game.setupMobileControls();
    
    // Show mobile notification
    Utils.showNotification('Mobile Detected', 'Touch controls are enabled. You can also tilt your device to move the paddle.', 'info');
    
    // Set up device orientation for tilt controls
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleTilt);
    }
  }
}

function handleTilt(event) {
  // Only use tilt controls for human-controlled paddles
  if (!Game.leftPaddle.userData.isAI) {
    // Use gamma (left/right tilt) for paddle movement
    const tilt = event.gamma;
    
    // Apply deadzone for stability
    if (Math.abs(tilt) < 5) {
      Game.leftPaddle.userData.direction = 0;
    } else {
      // Map tilt to paddle direction (-1 to 1)
      Game.leftPaddle.userData.direction = Math.max(-1, Math.min(1, -tilt / 20));
    }
  }
  
  if (!Game.rightPaddle.userData.isAI && Game.currentGameMode === 'human-vs-human') {
    // For right paddle in two-player mode, use beta (forward/back tilt)
    const tilt = event.beta;
    
    // Apply deadzone for stability
    if (Math.abs(tilt - 45) < 5) { // 45 is roughly neutral phone position
      Game.rightPaddle.userData.direction = 0;
    } else {
      // Map tilt to paddle direction (-1 to 1)
      Game.rightPaddle.userData.direction = Math.max(-1, Math.min(1, (tilt - 45) / 20));
    }
  }
}

/**
 * Add event listeners for better UI interactions
 */
function addInteractionListeners() {
  // Add form submission prevention
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      return false;
    });
  });
  
  // Make sure clicking input fields doesn't trigger other actions
  document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('click', function(e) {
      e.stopPropagation();
    });
    
    // Ensure proper focus and selection
    input.addEventListener('focus', function(e) {
      if (this.type === 'text' || this.type === 'email') {
        setTimeout(() => {
          this.select();
        }, 100);
      }
    });
  });
  
  // Add explicit event listener for the Play Game button
  const playButton = document.getElementById('playGameButton');
  if (playButton) {
    // Remove the onclick attribute to prevent double execution
    playButton.removeAttribute('onclick');
    
    playButton.addEventListener('click', function() {
      console.log('Play button clicked, changing game state to playing');
      Game.startGame();
    });
    
    // Debug click handler to ensure it works
    playButton.addEventListener('mousedown', function() {
      console.log('Play button mousedown detected');
    });
  } else {
    console.error('Could not find Play Game button');
  }
  
  // Add event listener for the Account button
  const accountButton = document.getElementById('account-button');
  if (accountButton) {
    accountButton.addEventListener('click', function() {
      console.log('Account button clicked');
      UI.showPanel('accountPanel');
    });
  } else {
    console.error('Could not find Account button');
  }
  
  // Make store items interactive
  document.querySelectorAll('.store-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.05)';
      this.style.transition = 'transform 0.2s ease-in-out';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
  });
  
  // Ensure all panels can be properly scrolled
  document.querySelectorAll('.panel-content').forEach(panel => {
    panel.style.overflowY = 'auto';
    panel.style.maxHeight = '70vh';
    
    // Prevent propagation to ensure scrolling works
    panel.addEventListener('wheel', function(e) {
      e.stopPropagation();
    });
  });
}