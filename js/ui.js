// UI Management 
const UI = {
  // Track currently active panel
  activePanel: null,
  
  /**
   * Initialize UI
   */
  init: function() {
    try {
      console.log("UI initialization started");
      
      // Hide score display at start
      const scoreContainer = document.querySelector('.score-container');
      if (scoreContainer) {
        scoreContainer.style.display = 'none';
      }
      
      // Add event listeners for all close buttons
      document.querySelectorAll('.panel-header .cyber-button').forEach(button => {
        button.addEventListener('click', function() {
          const panel = this.closest('.ui-panel');
          if (panel && panel.id !== 'mainMenu') {
            UI.hidePanel(panel.id);
            
            // If we're hiding the active panel, show main menu
            if (UI.activePanel === panel.id) {
              UI.showPanel('mainMenu');
            }
          }
        });
      });
      
      // Set z-index for proper layering
      document.querySelectorAll('.ui-panel').forEach(panel => {
        if (panel.id !== 'mainMenu') {
          panel.style.zIndex = '10';
        }
      });
      
      // Create dynamic panels
      this.createAccountSettingsPanel();
      this.createLeaderboardPanel();
    
      // Initialize background animation
      this.initBackgroundAnimation();
      
      console.log("UI initialization completed successfully");
    } catch (error) {
      console.error("Error during UI initialization:", error);
    }
  },
  
  /**
   * Initialize background animation
   */
  initBackgroundAnimation: function() {
    try {
      // Create and initialize stars
      const stars = [];
      const numStars = 100;
      
      // Create canvas if not exists
      let canvas = document.getElementById('backgroundStars');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'backgroundStars';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        document.body.appendChild(canvas);
      }
      
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Create stars
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          color: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, ${Math.random() * 255}, ${Math.random() * 0.5 + 0.5})`,
          speed: Math.random() * 0.3 + 0.1
        });
      }
      
      // Animation function
      function animateStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = 'rgb(15, 15, 42)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw stars
        stars.forEach(star => {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.fill();
          
          // Move star
          star.y += star.speed;
          
          // Reset if off screen
          if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
          }
        });
        
        requestAnimationFrame(animateStars);
      }
      
      // Start animation
      animateStars();
      
      // Handle window resize
      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
      
      console.log("Background animation initialized");
    } catch (error) {
      console.error("Error initializing background animation:", error);
    }
  },
  
  /**
   * Create account settings panel
   */
  createAccountSettingsPanel: function() {
    console.log("Creating account panel...");
    
    // First remove existing panel if it exists
    const existingPanel = document.getElementById('accountPanel');
    if (existingPanel) {
      existingPanel.remove();
    }
    
    try {
      // Create new account panel
      const accountPanel = document.createElement('div');
      accountPanel.id = 'accountPanel';
      accountPanel.className = 'ui-panel';
      accountPanel.style.display = 'none';
      accountPanel.style.position = 'absolute';
      accountPanel.style.top = '50%';
      accountPanel.style.left = '50%';
      accountPanel.style.transform = 'translate(-50%, -50%)';
      accountPanel.style.width = '600px';
      accountPanel.style.maxHeight = '80vh';
      accountPanel.style.zIndex = '1000';
      
      // Get current values from Store
      const currentEmail = Store.userEmail || 'Not logged in';
      const currentName = Store.playerName || 'Player';
      const currentAvatar = Store.playerAvatar || 'cyan';
      const currentPaypalEmail = Store.paypalEmail || '';
      
      accountPanel.innerHTML = `
        <div class="panel-header">
          <h2 class="panel-title">Account Settings</h2>
          <button class="cyber-button close-btn" style="min-width: auto; padding: 5px 10px;">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="panel-content">
          <div class="settings-section">
            <h3>Account Information</h3>
            <div class="settings-row">
              <label>Email:</label>
              <span id="account-email">${currentEmail}</span>
            </div>
            
            <div class="settings-row">
              <label for="account-name">Display Name:</label>
              <input type="text" id="account-name" value="${currentName}" style="width: 200px;">
            </div>
            
            <div class="settings-row">
              <label for="account-avatar">Avatar Color:</label>
              <select id="account-avatar">
                <option value="cyan" ${currentAvatar === 'cyan' ? 'selected' : ''}>Cyan</option>
                <option value="magenta" ${currentAvatar === 'magenta' ? 'selected' : ''}>Magenta</option>
                <option value="yellow" ${currentAvatar === 'yellow' ? 'selected' : ''}>Yellow</option>
                <option value="green" ${currentAvatar === 'green' ? 'selected' : ''}>Green</option>
                <option value="red" ${currentAvatar === 'red' ? 'selected' : ''}>Red</option>
                <option value="blue" ${currentAvatar === 'blue' ? 'selected' : ''}>Blue</option>
              </select>
            </div>
          </div>
          
          <div class="settings-section">
            <h3>Game Statistics</h3>
            <div class="stats-grid">
              <div class="stats-item">
                <div class="stats-label">Total Games</div>
                <div class="stats-value stats-total-games">0</div>
              </div>
              <div class="stats-item">
                <div class="stats-label">Games Won</div>
                <div class="stats-value stats-games-won">0</div>
              </div>
              <div class="stats-item">
                <div class="stats-label">Win Streak</div>
                <div class="stats-value stats-win-streak">0</div>
              </div>
              <div class="stats-item">
                <div class="stats-label">Average Rally</div>
                <div class="stats-value stats-average-rally">0.0</div>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <h3>Payment Settings</h3>
            <div class="settings-row">
              <label for="account-paypal">PayPal Email:</label>
              <input type="email" id="account-paypal" value="${currentPaypalEmail}" placeholder="Enter PayPal email" style="width: 250px;">
            </div>
            <p style="color: #999; font-size: 0.9em; margin-top: 5px;">
              <i class="fas fa-info-circle"></i> Required to purchase credits. We never store your actual PayPal information.
            </p>
          </div>
          
          <div class="settings-section">
            <h3>Security</h3>
            <div class="settings-row">
              <label for="account-current-password">Current Password:</label>
              <input type="password" id="account-current-password" placeholder="Enter current password" style="width: 250px;">
            </div>
            
            <div class="settings-row">
              <label for="account-new-password">New Password:</label>
              <input type="password" id="account-new-password" placeholder="Enter new password" style="width: 250px;">
            </div>
            
            <div class="settings-row">
              <label for="account-confirm-password">Confirm Password:</label>
              <input type="password" id="account-confirm-password" placeholder="Confirm new password" style="width: 250px;">
            </div>
          </div>
          
          <div class="btn-group">
            <button class="cyber-button" id="save-account-button">Save Changes</button>
            <button class="cyber-button warning" id="logout-account-button">Logout</button>
            <button class="cyber-button secondary" id="back-account-button">Back to Menu</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(accountPanel);
      
      // Add CSS for stats grid if not already present
      if (!document.querySelector('style#stats-grid-style')) {
        const statsStyle = document.createElement('style');
        statsStyle.id = 'stats-grid-style';
        statsStyle.textContent = `
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-gap: 15px;
            margin-top: 10px;
          }
          
          .stats-item {
            background: rgba(0, 127, 255, 0.1);
            border: 1px solid var(--secondary);
            border-radius: 5px;
            padding: 10px;
            text-align: center;
          }
          
          .stats-label {
            font-size: 14px;
            color: #999;
            margin-bottom: 5px;
          }
          
          .stats-value {
            font-size: 20px;
            font-weight: bold;
            color: var(--tertiary);
          }
        `;
        document.head.appendChild(statsStyle);
      }
      
      // Add event listeners for buttons
      const closeButton = accountPanel.querySelector('.close-btn');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          this.hidePanel('accountPanel');
          this.showPanel('mainMenu');
        });
      }
      
      const saveButton = document.getElementById('save-account-button');
      if (saveButton) {
        saveButton.addEventListener('click', () => this.saveAccountSettings());
      }
      
      const logoutButton = document.getElementById('logout-account-button');
      if (logoutButton) {
        logoutButton.addEventListener('click', () => {
          Store.logout();
          this.hidePanel('accountPanel');
          this.showPanel('mainMenu');
        });
      }
      
      const backButton = document.getElementById('back-account-button');
      if (backButton) {
        backButton.addEventListener('click', () => {
          this.hidePanel('accountPanel');
          this.showPanel('mainMenu');
        });
      }
      
      console.log("Account panel created successfully");
    } catch (error) {
      console.error("Error creating account panel:", error);
    }
  },
  
  /**
   * Create leaderboard panel
   */
  createLeaderboardPanel: function() {
    // Create leaderboard panel if it doesn't exist
    if (!document.getElementById('leaderboardPanel')) {
      const leaderboardPanel = document.createElement('div');
      leaderboardPanel.id = 'leaderboardPanel';
      leaderboardPanel.className = 'ui-panel';
      leaderboardPanel.style.display = 'none';
      leaderboardPanel.style.position = 'absolute';
      leaderboardPanel.style.top = '50%';
      leaderboardPanel.style.left = '50%';
      leaderboardPanel.style.transform = 'translate(-50%, -50%)';
      leaderboardPanel.style.width = '800px';
      leaderboardPanel.style.maxHeight = '80vh';
      
      leaderboardPanel.innerHTML = `
        <div class="panel-header">
          <h2 class="panel-title">Global Leaderboard</h2>
          <button class="cyber-button" onclick="UI.hidePanel('leaderboardPanel')" style="min-width: auto; padding: 5px 10px;">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="panel-content">
          <div class="settings-section">
            <div class="leaderboard-container">
              <div id="leaderboardContent" class="leaderboard-content">
                <!-- Leaderboard rows will be populated here -->
              </div>
            </div>
            
            <p style="text-align: center; margin-top: 15px; color: var(--secondary);">
              <i class="fas fa-info-circle"></i> Win more games to improve your ranking!
            </p>
          </div>
          
          <div class="btn-group">
            <button class="cyber-button" onclick="Multiplayer.fetchLeaderboard()">Refresh</button>
            <button class="cyber-button secondary" onclick="UI.showPanel('multiplayerPanel')">Find Match</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(leaderboardPanel);
      
      // Add CSS for leaderboard
      const leaderboardStyle = document.createElement('style');
      leaderboardStyle.textContent = `
        .leaderboard-container {
          width: 100%;
          border: 1px solid var(--secondary);
          background: rgba(0, 0, 20, 0.5);
          border-radius: 5px;
          padding: 0;
          max-height: 500px;
          overflow-y: auto;
        }
        
        .leaderboard-content {
          width: 100%;
        }
        
        .leaderboard-row {
          display: flex;
          padding: 10px 15px;
          border-bottom: 1px solid rgba(0, 200, 255, 0.3);
          align-items: center;
        }
        
        .leaderboard-row.header {
          background: var(--secondary);
          color: #000;
          font-weight: bold;
          position: sticky;
          top: 0;
          z-index: 1;
        }
        
        .leaderboard-row.current-user {
          background: rgba(0, 255, 255, 0.2);
        }
        
        .leaderboard-rank {
          width: 10%;
          text-align: center;
          font-weight: bold;
        }
        
        .leaderboard-name {
          width: 40%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .leaderboard-score {
          width: 25%;
          text-align: center;
        }
        
        .leaderboard-wins {
          width: 25%;
          text-align: center;
        }
      `;
      document.head.appendChild(leaderboardStyle);
      
      // Add event listener for close button
      const closeButton = leaderboardPanel.querySelector('.panel-header .cyber-button');
      closeButton.addEventListener('click', function() {
        UI.hidePanel('leaderboardPanel');
        if (UI.activePanel === 'leaderboardPanel') {
          UI.showPanel('mainMenu');
        }
      });
    }
  },
  
  /**
   * Save account settings
   */
  saveAccountSettings: function() {
    if (!Store.isLoggedIn) {
      Utils.showNotification('Not Logged In', 'You must be logged in to save account settings.', 'error');
      return;
    }
    
    const nameInput = document.getElementById('account-name');
    const avatarInput = document.getElementById('account-avatar');
    const paypalInput = document.getElementById('account-paypal');
    const currentPassInput = document.getElementById('account-current-password');
    const newPassInput = document.getElementById('account-new-password');
    const confirmPassInput = document.getElementById('account-confirm-password');
    
    // Update name and avatar
    if (nameInput && avatarInput) {
      Store.playerName = nameInput.value;
      Store.playerAvatar = avatarInput.value;
      
      // Update player name in multiplayer UI
      const scoreLeft = document.querySelector('.player-score.left');
      if (scoreLeft) {
        scoreLeft.setAttribute('data-name', Store.playerName);
      }
      
      // Update registered user data
      if (Store.registeredUsers[Store.userEmail]) {
        Store.registeredUsers[Store.userEmail].name = nameInput.value;
      }
    }
    
    // Update PayPal email
    if (paypalInput) {
      const newPayPalEmail = paypalInput.value;
      
      // Basic email validation if provided
      if (newPayPalEmail && (!newPayPalEmail.includes('@') || !newPayPalEmail.includes('.'))) {
        Utils.showNotification('Invalid Email', 'Please enter a valid PayPal email address.', 'error');
        return;
      }
      
      Store.paypalEmail = newPayPalEmail;
      Store.paypalConnected = !!newPayPalEmail;
      
      // Update registered user data
      if (Store.registeredUsers[Store.userEmail]) {
        Store.registeredUsers[Store.userEmail].paypalEmail = newPayPalEmail;
      }
    }
    
    // Update password if provided
    if (currentPassInput && newPassInput && confirmPassInput) {
      const currentPass = currentPassInput.value;
      const newPass = newPassInput.value;
      const confirmPass = confirmPassInput.value;
      
      if (currentPass && newPass) {
        // Verify current password
        if (Store.registeredUsers[Store.userEmail] && 
            Store.registeredUsers[Store.userEmail].password !== currentPass) {
          Utils.showNotification('Password Error', 'Current password is incorrect.', 'error');
          return;
        }
        
        // Verify new password
        if (newPass.length < 6) {
          Utils.showNotification('Password Error', 'New password must be at least 6 characters long.', 'error');
          return;
        }
        
        // Verify confirm password
        if (newPass !== confirmPass) {
          Utils.showNotification('Password Error', 'New passwords do not match.', 'error');
          return;
        }
        
        // Update password
        Store.registeredUsers[Store.userEmail].password = newPass;
        
        // Clear password fields
        currentPassInput.value = '';
        newPassInput.value = '';
        confirmPassInput.value = '';
        
        Utils.showNotification('Password Updated', 'Your password has been updated successfully.', 'success');
      }
    }
    
    // Save changes
    Store.savePlayerData();
    
    Utils.showNotification('Settings Saved', 'Your account settings have been updated.', 'success');
    
    // Hide panel
    this.hidePanel('accountPanel');
  },
  
  /**
   * Show a specific panel by ID
   * @param {string} panelId - The ID of the panel to show
   */
  showPanel: function(panelId) {
    // Hide currently active panel
    if (this.activePanel && this.activePanel !== 'mainMenu') {
      document.getElementById(this.activePanel).style.display = 'none';
    }
    
    // If showing a panel other than main menu, hide main menu
    if (panelId !== 'mainMenu' && this.activePanel === 'mainMenu') {
      document.getElementById('mainMenu').style.display = 'none';
    }
    
    // Show requested panel
    document.getElementById(panelId).style.display = 'block';
    
    // Update active panel
    this.activePanel = panelId;
    
    // Ensure proper z-index
    document.getElementById(panelId).style.zIndex = '10';
  },
  
  /**
   * Hide a specific panel by ID
   * @param {string} panelId - The ID of the panel to hide
   */
  hidePanel: function(panelId) {
    document.getElementById(panelId).style.display = 'none';
    
    // Reset active panel if hiding the active one
    if (this.activePanel === panelId) {
      this.activePanel = null;
    }
    
    // Show main menu if hiding a panel and no other panel is active
    if (this.activePanel === null && Game.gameState === 'menu') {
      this.showPanel('mainMenu');
    }
  },
  
  /**
   * Toggle a panel's visibility
   * @param {string} panelId - The ID of the panel to toggle
   */
  togglePanel: function(panelId) {
    const panel = document.getElementById(panelId);
    if (panel.style.display === 'none') {
      this.showPanel(panelId);
    } else {
      this.hidePanel(panelId);
    }
  },
  
  /**
   * Update the score display
   */
  updateScoreDisplay: function() {
    const leftScoreElement = document.querySelector('.player-score.left');
    const rightScoreElement = document.querySelector('.player-score.right');
    
    leftScoreElement.textContent = Game.leftPaddle.userData.score;
    rightScoreElement.textContent = Game.rightPaddle.userData.score;
  },
  
  /**
   * Update power-up visual displays
   */
  updatePowerUpVisuals: function() {
    // Update power-up displays
    const leftDisplay = document.getElementById('leftPowerUps');
    const rightDisplay = document.getElementById('rightPowerUps');
    
    leftDisplay.innerHTML = '';
    rightDisplay.innerHTML = '';
    
    // Add power-up icons to the left display
    Game.leftPaddle.userData.activePowerUps.forEach(pu => {
      const icon = document.createElement('div');
      icon.className = 'power-up-icon';
      
      // Set color based on power-up type
      let color;
      let iconClass;
      
      switch (pu.type) {
        case 'speed': color = '#ffeb3b'; iconClass = 'fas fa-bolt'; break;
        case 'ballSpeed': color = '#f44336'; iconClass = 'fas fa-fire'; break;
        case 'shrink': color = '#800080'; iconClass = 'fas fa-compress-arrows-alt'; break;
        case 'shield': color = '#2196F3'; iconClass = 'fas fa-shield-alt'; break;
        case 'magnet': color = '#4CAF50'; iconClass = 'fas fa-magnet'; break;
        case 'giant': color = '#FF9800'; iconClass = 'fas fa-expand-arrows-alt'; break;
        case 'ghost': color = '#FFFFFF'; iconClass = 'fas fa-ghost'; break;
        case 'multiBall': color = '#00FFFF'; iconClass = 'fas fa-clone'; break;
        case 'freeze': color = '#008080'; iconClass = 'fas fa-snowflake'; break;
        case 'gravity': color = '#8000FF'; iconClass = 'fas fa-atom'; break;
        case 'timeSlow': color = '#00FF00'; iconClass = 'fas fa-hourglass-half'; break;
        case 'teleport': color = '#FF00FF'; iconClass = 'fas fa-random'; break;
        case 'superShot': color = '#FF3300'; iconClass = 'fas fa-rocket'; break;
        case 'mirror': color = '#AAAAAA'; iconClass = 'fas fa-exchange-alt'; break;
        case 'obstacle': color = '#663300'; iconClass = 'fas fa-ban'; break;
        default: color = '#ffffff'; iconClass = 'fas fa-question'; break;
      }
      
      icon.style.borderColor = color;
      icon.innerHTML = `<i class="${iconClass}" style="color:${color}; font-size:24px;"></i>`;
      
      // Add timer
      const timeRemaining = Math.ceil((pu.endTime - Date.now()) / 1000);
      icon.style.setProperty('--timer-count', `'${timeRemaining}'`);
      icon.setAttribute('data-time', timeRemaining);
      
      leftDisplay.appendChild(icon);
    });
    
    // Add power-up icons to the right display
    Game.rightPaddle.userData.activePowerUps.forEach(pu => {
      const icon = document.createElement('div');
      icon.className = 'power-up-icon';
      
      // Set color based on power-up type
      let color;
      let iconClass;
      
      switch (pu.type) {
        case 'speed': color = '#ffeb3b'; iconClass = 'fas fa-bolt'; break;
        case 'ballSpeed': color = '#f44336'; iconClass = 'fas fa-fire'; break;
        case 'shrink': color = '#800080'; iconClass = 'fas fa-compress-arrows-alt'; break;
        case 'shield': color = '#2196F3'; iconClass = 'fas fa-shield-alt'; break;
        case 'magnet': color = '#4CAF50'; iconClass = 'fas fa-magnet'; break;
        case 'giant': color = '#FF9800'; iconClass = 'fas fa-expand-arrows-alt'; break;
        case 'ghost': color = '#FFFFFF'; iconClass = 'fas fa-ghost'; break;
        case 'multiBall': color = '#00FFFF'; iconClass = 'fas fa-clone'; break;
        case 'freeze': color = '#008080'; iconClass = 'fas fa-snowflake'; break;
        case 'gravity': color = '#8000FF'; iconClass = 'fas fa-atom'; break;
        case 'timeSlow': color = '#00FF00'; iconClass = 'fas fa-hourglass-half'; break;
        case 'teleport': color = '#FF00FF'; iconClass = 'fas fa-random'; break;
        case 'superShot': color = '#FF3300'; iconClass = 'fas fa-rocket'; break;
        case 'mirror': color = '#AAAAAA'; iconClass = 'fas fa-exchange-alt'; break;
        case 'obstacle': color = '#663300'; iconClass = 'fas fa-ban'; break;
        default: color = '#ffffff'; iconClass = 'fas fa-question'; break;
      }
      
      icon.style.borderColor = color;
      icon.innerHTML = `<i class="${iconClass}" style="color:${color}; font-size:24px;"></i>`;
      
      // Add timer
      const timeRemaining = Math.ceil((pu.endTime - Date.now()) / 1000);
      icon.style.setProperty('--timer-count', `'${timeRemaining}'`);
      icon.setAttribute('data-time', timeRemaining);
      
      rightDisplay.appendChild(icon);
    });
  },
  
  /**
   * Shows a game over panel
   * @param {string} winner - Which side won ('left' or 'right')
   */
  showGameOverPanel: function(winner) {
    // Display game over panel
    const gameOverPanel = document.createElement('div');
    gameOverPanel.className = 'ui-panel';
    gameOverPanel.style.position = 'absolute';
    gameOverPanel.style.top = '50%';
    gameOverPanel.style.left = '50%';
    gameOverPanel.style.transform = 'translate(-50%, -50%)';
    gameOverPanel.style.width = '500px';
    gameOverPanel.style.zIndex = '100';
    
    // Set header
    let winnerText;
    switch(Game.currentGameMode) {
      case 'ai-vs-ai':
        winnerText = winner === 'left' ? 'Left AI Wins!' : 'Right AI Wins!';
        break;
      case 'human-vs-ai':
        winnerText = winner === 'left' ? 'You Win!' : 'AI Wins!';
        break;
      case 'ai-vs-human':
        winnerText = winner === 'left' ? 'AI Wins!' : 'You Win!';
        break;
      case 'human-vs-human':
        winnerText = winner === 'left' ? 'Player 1 Wins!' : 'Player 2 Wins!';
        break;
      case 'multiplayer':
        winnerText = winner === 'left' ? 'You Win!' : 'Opponent Wins!';
        break;
    }
    
    gameOverPanel.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">Game Over</h2>
      </div>
      <div class="panel-content">
        <h2 style="text-align: center; font-size: 32px; margin-bottom: 30px;">${winnerText}</h2>
        <p style="text-align: center; margin-bottom: 20px;">Final Score: ${Game.leftPaddle.userData.score} - ${Game.rightPaddle.userData.score}</p>
        <div class="btn-group">
          <button class="cyber-button" onclick="Game.playAgain()">Play Again</button>
          <button class="cyber-button secondary" onclick="Game.showMainMenu()">Main Menu</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(gameOverPanel);
  },
  
  /**
   * Initialize slider listeners
   */
  setupSliderListeners: function() {
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
      const valueDisplay = document.getElementById(`${slider.id}Value`);
      if (valueDisplay) {
        valueDisplay.textContent = slider.value;
        
        // Display special formatting for certain types
        if (slider.id === 'masterVolume' || slider.id === 'sfxVolume' || slider.id === 'musicVolume') {
          valueDisplay.textContent = `${Math.round(slider.value * 100)}%`;
        } else if (slider.id === 'powerUpFrequency') {
          valueDisplay.textContent = `${slider.value / 1000}s`;
        } else if (slider.id === 'graphicsQuality') {
          const qualities = ['Low', 'Medium', 'High'];
          valueDisplay.textContent = qualities[parseInt(slider.value)];
        } else if (slider.id === 'powerUpDurationFactor' || slider.id === 'powerUpStrengthFactor') {
          valueDisplay.textContent = `${slider.value}x`;
        } else if (slider.id.includes('Chance')) {
          valueDisplay.textContent = `${slider.value}%`;
        }
        
        slider.addEventListener('input', () => {
          if (slider.id === 'masterVolume' || slider.id === 'sfxVolume' || slider.id === 'musicVolume') {
            valueDisplay.textContent = `${Math.round(slider.value * 100)}%`;
          } else if (slider.id === 'powerUpFrequency') {
            valueDisplay.textContent = `${slider.value / 1000}s`;
          } else if (slider.id === 'graphicsQuality') {
            const qualities = ['Low', 'Medium', 'High'];
            valueDisplay.textContent = qualities[parseInt(slider.value)];
          } else if (slider.id === 'powerUpDurationFactor' || slider.id === 'powerUpStrengthFactor') {
            valueDisplay.textContent = `${slider.value}x`;
          } else if (slider.id.includes('Chance')) {
            valueDisplay.textContent = `${slider.value}%`;
          } else {
            valueDisplay.textContent = slider.value;
          }
        });
      }
    });
  }
};