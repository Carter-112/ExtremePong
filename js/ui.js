// UI Management 
const UI = {
  /**
   * Show a specific panel by ID
   * @param {string} panelId - The ID of the panel to show
   */
  showPanel: function(panelId) {
    document.getElementById(panelId).style.display = 'block';
  },
  
  /**
   * Hide a specific panel by ID
   * @param {string} panelId - The ID of the panel to hide
   */
  hidePanel: function(panelId) {
    document.getElementById(panelId).style.display = 'none';
  },
  
  /**
   * Toggle a panel's visibility
   * @param {string} panelId - The ID of the panel to toggle
   */
  togglePanel: function(panelId) {
    const panel = document.getElementById(panelId);
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
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