// Multiplayer Functionality
const Multiplayer = {
  // Flag to track if multiplayer mode is active
  isMultiplayer: false,
  
  // Socket connection
  socket: null,
  
  // Server URL
  serverUrl: 'https://cosmic-pong-server.herokuapp.com',
  
  // Online players
  onlinePlayers: [],
  
  // Current leaderboard
  leaderboard: [],
  
  // Match data
  currentMatch: null,
  
  /**
   * Initialize multiplayer components
   */
  init: function() {
    // Clear fake players
    document.getElementById('onlinePlayers').innerHTML = '';
    this.updateOnlinePlayersDisplay();
    
    // Load leaderboard
    this.fetchLeaderboard();
  },
  
  /**
   * Find a match with a random player
   */
  findMatch: function() {
    // Check login status
    if (!Game.isLoggedIn) {
      Utils.showNotification('Login Required', 'You must be logged in to play online. Please login or create an account.', 'warning');
      UI.showPanel('loginPanel');
      return;
    }
    
    Utils.showNotification('Finding Match', 'Searching for opponents...', 'info');
    
    // Set game mode to multiplayer
    Game.setGameMode('multiplayer');
    
    // Start connection to multiplayer server
    this.connectToMultiplayerServer('random');
  },
  
  /**
   * Host a private game with a code for friends to join
   */
  hostPrivateGame: function() {
    // Check login status
    if (!Game.isLoggedIn) {
      Utils.showNotification('Login Required', 'You must be logged in to play online. Please login or create an account.', 'warning');
      UI.showPanel('loginPanel');
      return;
    }
    
    // Generate a random game code
    const gameCode = Math.floor(100000 + Math.random() * 900000);
    
    Utils.showNotification('Private Game', `Your game code is: ${gameCode}. Share this with a friend!`, 'success');
    
    // Set game mode to multiplayer
    Game.setGameMode('multiplayer');
    
    // Show waiting notification
    Utils.showNotification('Waiting', 'Waiting for opponent to join...', 'info');
    
    // Connect to server with game code
    this.connectToMultiplayerServer('host', gameCode);
  },
  
  /**
   * Join a private game using a code
   */
  joinPrivateGame: function() {
    // Check login status
    if (!Game.isLoggedIn) {
      Utils.showNotification('Login Required', 'You must be logged in to play online. Please login or create an account.', 'warning');
      UI.showPanel('loginPanel');
      return;
    }
    
    // Prompt for game code
    const code = prompt('Enter the 6-digit game code:');
    
    if (code && code.length === 6) {
      Utils.showNotification('Joining Game', `Joining game with code: ${code}...`, 'info');
      
      // Set game mode to multiplayer
      Game.setGameMode('multiplayer');
      
      // Start connection
      this.connectToMultiplayerServer('join', code);
    } else if (code) {
      Utils.showNotification('Invalid Code', 'Please enter a valid 6-digit code.', 'error');
    }
  },
  
  /**
   * Connect to the multiplayer server
   * @param {string} mode - Connection mode ('random', 'host', or 'join')
   * @param {string} [gameCode] - Game code for private games
   */
  connectToMultiplayerServer: function(mode = 'random', gameCode = null) {
    // Show connecting notification
    Utils.showNotification('Connecting', 'Connecting to multiplayer server...', 'info');
    
    // In a real implementation, we would connect to a server via Socket.io
    // For now, we'll simulate this for demonstration purposes
    
    // This would be real code in production:
    // this.socket = io.connect(this.serverUrl);
    
    // Simulate server connection with setTimeout
    setTimeout(() => {
      this.isMultiplayer = true;
      Utils.showNotification('Connected', 'Connected to multiplayer server!', 'success');
      
      // Create player data to send to server
      const playerData = {
        name: Store.playerName || 'Player',
        userId: Store.userEmail,
        avatar: Store.playerAvatar || 'cyan'
      };
      
      // Simulate sending player data to server
      console.log('Sending player data to server:', playerData);
      
      if (mode === 'random') {
        // Simulate waiting for opponent
        Utils.showNotification('Matchmaking', 'Looking for an opponent...', 'info');
        
        // Simulate finding an opponent after a short delay
        setTimeout(() => {
          // Generate fake opponent data for demonstration
          const opponentData = {
            name: `Player${Math.floor(Math.random() * 1000)}`,
            userId: 'opponent@example.com',
            avatar: ['cyan', 'magenta', 'yellow', 'green', 'red', 'blue'][Math.floor(Math.random() * 6)]
          };
          
          // Set up the match
          this.setupMatch(playerData, opponentData);
        }, 2000);
      } else if (mode === 'host') {
        // Simulate hosting a game
        Utils.showNotification('Hosting Game', `Game code: ${gameCode}. Waiting for opponent...`, 'info');
        
        // Simulate waiting for an opponent to join
        setTimeout(() => {
          // Generate fake opponent data for demonstration
          const opponentData = {
            name: `Friend${Math.floor(Math.random() * 1000)}`,
            userId: 'friend@example.com',
            avatar: ['cyan', 'magenta', 'yellow', 'green', 'red', 'blue'][Math.floor(Math.random() * 6)]
          };
          
          Utils.showNotification('Player Joined', `${opponentData.name} has joined your game!`, 'success');
          
          // Set up the match
          this.setupMatch(playerData, opponentData);
        }, 5000);
      } else if (mode === 'join') {
        // Simulate joining a game
        Utils.showNotification('Joining Game', `Joining game with code: ${gameCode}...`, 'info');
        
        // Simulate connection process
        setTimeout(() => {
          // Generate fake host data for demonstration
          const hostData = {
            name: `Host${Math.floor(Math.random() * 1000)}`,
            userId: 'host@example.com',
            avatar: ['cyan', 'magenta', 'yellow', 'green', 'red', 'blue'][Math.floor(Math.random() * 6)]
          };
          
          Utils.showNotification('Game Found', `Joined ${hostData.name}'s game!`, 'success');
          
          // Set up the match
          this.setupMatch(playerData, hostData);
        }, 3000);
      }
    }, 1500);
  },
  
  /**
   * Set up a multiplayer match
   * @param {Object} localPlayer - Local player data
   * @param {Object} remotePlayer - Remote player data
   */
  setupMatch: function(localPlayer, remotePlayer) {
    // Store match data
    this.currentMatch = {
      localPlayer: localPlayer,
      remotePlayer: remotePlayer,
      startTime: Date.now(),
      gameId: `game_${Date.now()}`
    };
    
    // Start the game
    Utils.showNotification('Game Starting', `Playing against ${remotePlayer.name}!`, 'success');
    
    // Hide multiplayer panel
    UI.hidePanel('multiplayerPanel');
    
    // Start the game
    Game.startGame();
    
    // Set opponent name in UI
    document.querySelector('.player-score.right').setAttribute('data-name', remotePlayer.name);
    document.querySelector('.player-score.left').setAttribute('data-name', localPlayer.name);
  },
  
  /**
   * Send player input to the server
   * @param {string} input - The input data to send
   */
  sendInput: function(input) {
    if (this.socket && this.isMultiplayer) {
      // In real implementation, would send through socket.io
      // this.socket.emit('playerInput', input);
      console.log('Sending input to server:', input);
    }
  },
  
  /**
   * Handle incoming data from the server
   * @param {Object} data - The data received from the server
   */
  handleServerData: function(data) {
    if (this.isMultiplayer) {
      // Handle various types of data from the server
      switch (data.type) {
        case 'gameState':
          // Update game state based on server data
          break;
        case 'playerJoined':
          Utils.showNotification('Player Joined', `${data.name} has joined the game!`, 'info');
          break;
        case 'playerLeft':
          Utils.showNotification('Player Left', `${data.name} has left the game.`, 'warning');
          break;
        case 'gameOver':
          // Handle game over from server
          break;
      }
    }
  },
  
  /**
   * Fetch the online leaderboard
   */
  fetchLeaderboard: function() {
    // In a real implementation, we would fetch this from a server API
    // For now, we'll generate mock data
    
    // Generate mock leaderboard data
    this.leaderboard = [
      { rank: 1, name: 'CosmicChampion', score: 5820, wins: 145, userId: 'cosmic@example.com' },
      { rank: 2, name: 'PaddleMaster', score: 4930, wins: 123, userId: 'paddle@example.com' },
      { rank: 3, name: 'GalaxyGamer', score: 4750, wins: 118, userId: 'galaxy@example.com' },
      { rank: 4, name: 'NeonNinja', score: 4200, wins: 105, userId: 'neon@example.com' },
      { rank: 5, name: 'StarStriker', score: 3850, wins: 96, userId: 'star@example.com' },
      { rank: 6, name: 'VoidVoyager', score: 3620, wins: 90, userId: 'void@example.com' },
      { rank: 7, name: 'AstralAce', score: 3400, wins: 85, userId: 'astral@example.com' },
      { rank: 8, name: 'PongProdigy', score: 3150, wins: 78, userId: 'pong@example.com' },
      { rank: 9, name: 'CyberSlammer', score: 2980, wins: 74, userId: 'cyber@example.com' },
      { rank: 10, name: 'QuantumQuick', score: 2750, wins: 68, userId: 'quantum@example.com' }
    ];
    
    // If user is logged in, insert them into the leaderboard at a random position
    if (Game.isLoggedIn && Game.currentUser) {
      // Generate a random position for the current user (never at #1 to encourage playing more)
      const userRank = Math.floor(Math.random() * 15) + 2;
      const userScore = this.leaderboard[Math.floor(Math.random() * 5) + 5].score - Math.floor(Math.random() * 300);
      const userWins = Math.floor(userScore / 40);
      
      // Add current user to leaderboard
      this.leaderboard.push({
        rank: userRank,
        name: Store.playerName,
        score: userScore,
        wins: userWins,
        userId: Store.userEmail,
        isCurrentUser: true
      });
      
      // Sort by rank
      this.leaderboard.sort((a, b) => a.rank - b.rank);
    }
    
    // Update the leaderboard display
    this.updateLeaderboardDisplay();
  },
  
  /**
   * Update the leaderboard display
   */
  updateLeaderboardDisplay: function() {
    const leaderboardElement = document.getElementById('leaderboardContent');
    if (!leaderboardElement) return;
    
    // Clear existing content
    leaderboardElement.innerHTML = '';
    
    // Create table header
    const tableHeader = document.createElement('div');
    tableHeader.className = 'leaderboard-row header';
    tableHeader.innerHTML = `
      <div class="leaderboard-rank">Rank</div>
      <div class="leaderboard-name">Player</div>
      <div class="leaderboard-score">Score</div>
      <div class="leaderboard-wins">Wins</div>
    `;
    leaderboardElement.appendChild(tableHeader);
    
    // Add each player to the leaderboard
    this.leaderboard.slice(0, 10).forEach(player => {
      const playerRow = document.createElement('div');
      playerRow.className = `leaderboard-row ${player.isCurrentUser ? 'current-user' : ''}`;
      playerRow.innerHTML = `
        <div class="leaderboard-rank">${player.rank}</div>
        <div class="leaderboard-name">${player.name}</div>
        <div class="leaderboard-score">${player.score}</div>
        <div class="leaderboard-wins">${player.wins}</div>
      `;
      leaderboardElement.appendChild(playerRow);
    });
  },
  
  /**
   * Update online players display
   */
  updateOnlinePlayersDisplay: function() {
    const onlinePlayersElement = document.getElementById('onlinePlayers');
    if (!onlinePlayersElement) return;
    
    // In a real implementation, we would fetch online players from a server
    // For now, we'll generate 3-5 fake online players
    
    // Clear existing content
    onlinePlayersElement.innerHTML = '';
    
    // Generate random number of online players (3-5)
    const numPlayers = Math.floor(Math.random() * 3) + 3;
    
    // Sample player names
    const playerNames = [
      'CosmicCrusher', 'StarGazer', 'NeonDrifter', 'AstralAce',
      'VoidVoyager', 'GalaxyGlider', 'PulsePlayer', 'QuantumQuick',
      'CyberSlicer', 'WarpSpeed', 'StellarStriker', 'NebulaNinja'
    ];
    
    // Sample statuses
    const statuses = [
      'Online - Waiting for match', 'In Game', 'In Menu', 
      'Customizing Settings', 'Just Finished a Game'
    ];
    
    // Avatar colors
    const avatarColors = ['cyan', 'magenta', 'yellow', 'green', 'red', 'blue'];
    
    // Create fake online players
    for (let i = 0; i < numPlayers; i++) {
      const nameIndex = Math.floor(Math.random() * playerNames.length);
      const statusIndex = Math.floor(Math.random() * statuses.length);
      const colorIndex = Math.floor(Math.random() * avatarColors.length);
      
      const playerName = playerNames.splice(nameIndex, 1)[0];
      const playerStatus = statuses[statusIndex];
      const playerColor = avatarColors[colorIndex];
      
      const wins = Math.floor(Math.random() * 30) + 5;
      const games = wins + Math.floor(Math.random() * 40) + 10;
      const inGame = playerStatus === 'In Game';
      
      const playerItem = document.createElement('div');
      playerItem.className = 'player-item';
      playerItem.innerHTML = `
        <div class="player-avatar" style="background:var(--${playerColor});">${playerName.charAt(0)}</div>
        <div class="player-info">
          <div class="player-name">${playerName}</div>
          <div class="player-status">${playerStatus}</div>
        </div>
        <div class="player-stats">
          <div class="player-stat"><i class="fas fa-trophy"></i> ${wins}</div>
          <div class="player-stat"><i class="fas fa-gamepad"></i> ${games}</div>
        </div>
        <button class="cyber-button" style="min-width: auto; padding: 8px 15px;" ${inGame ? 'disabled' : ''}>Challenge</button>
      `;
      
      // Add event listener to challenge button
      const challengeBtn = playerItem.querySelector('button');
      if (!inGame) {
        challengeBtn.addEventListener('click', () => {
          // Check login status
          if (!Game.isLoggedIn) {
            Utils.showNotification('Login Required', 'You must be logged in to challenge players. Please login or create an account.', 'warning');
            UI.showPanel('loginPanel');
            return;
          }
          
          Utils.showNotification('Challenge Sent', `Challenging ${playerName}...`, 'info');
          
          // Simulate accepting challenge
          setTimeout(() => {
            Utils.showNotification('Challenge Accepted', `${playerName} accepted your challenge!`, 'success');
            
            // Set up the match
            const playerData = {
              name: Store.playerName || 'Player',
              userId: Store.userEmail,
              avatar: Store.playerAvatar || 'cyan'
            };
            
            const opponentData = {
              name: playerName,
              userId: `${playerName.toLowerCase()}@example.com`,
              avatar: playerColor
            };
            
            // Set up the match
            this.setupMatch(playerData, opponentData);
          }, 2000);
        });
      }
      
      onlinePlayersElement.appendChild(playerItem);
    }
  },
  
  /**
   * Update match results and submit to leaderboard
   * @param {string} winner - Winner of the match ('left' or 'right')
   */
  updateMatchResults: function(winner) {
    if (!this.isMultiplayer || !this.currentMatch) return;
    
    // Determine if local player won
    const localPlayerWon = (winner === 'left');
    
    // Update local stats
    if (localPlayerWon) {
      // Award credits and XP for winning
      const creditsEarned = 50;
      const xpEarned = 100;
      
      // Add credits
      Store.addCredits(creditsEarned);
      
      // Show notification
      Utils.showNotification('Victory!', `You won! Earned ${creditsEarned} credits and ${xpEarned} XP.`, 'success');
      
      // Update stored user stats (would be sent to server in real implementation)
      if (Store.registeredUsers[Store.userEmail]) {
        Store.registeredUsers[Store.userEmail].wins = (Store.registeredUsers[Store.userEmail].wins || 0) + 1;
        Store.registeredUsers[Store.userEmail].totalGames = (Store.registeredUsers[Store.userEmail].totalGames || 0) + 1;
        Store.registeredUsers[Store.userEmail].xp = (Store.registeredUsers[Store.userEmail].xp || 0) + xpEarned;
        
        // Calculate new rating (simple ELO-like system)
        const baseRating = Store.registeredUsers[Store.userEmail].rating || 1000;
        Store.registeredUsers[Store.userEmail].rating = baseRating + 25;
        
        // Save data
        Store.savePlayerData();
      }
    } else {
      // Just XP for losing
      const xpEarned = 30;
      
      // Show notification
      Utils.showNotification('Defeat', `You lost. Earned ${xpEarned} XP.`, 'info');
      
      // Update stored user stats (would be sent to server in real implementation)
      if (Store.registeredUsers[Store.userEmail]) {
        Store.registeredUsers[Store.userEmail].losses = (Store.registeredUsers[Store.userEmail].losses || 0) + 1;
        Store.registeredUsers[Store.userEmail].totalGames = (Store.registeredUsers[Store.userEmail].totalGames || 0) + 1;
        Store.registeredUsers[Store.userEmail].xp = (Store.registeredUsers[Store.userEmail].xp || 0) + xpEarned;
        
        // Calculate new rating (simple ELO-like system)
        const baseRating = Store.registeredUsers[Store.userEmail].rating || 1000;
        Store.registeredUsers[Store.userEmail].rating = Math.max(baseRating - 20, 100);
        
        // Save data
        Store.savePlayerData();
      }
    }
    
    // In a real implementation, we would send match results to server
    console.log('Match results:', {
      gameId: this.currentMatch.gameId,
      localPlayer: this.currentMatch.localPlayer,
      remotePlayer: this.currentMatch.remotePlayer,
      winner: localPlayerWon ? 'local' : 'remote',
      startTime: this.currentMatch.startTime,
      endTime: Date.now(),
      duration: Date.now() - this.currentMatch.startTime
    });
    
    // Reset current match
    this.currentMatch = null;
  },
  
  /**
   * Disconnect from the multiplayer server
   */
  disconnect: function() {
    if (this.socket) {
      // Close the socket connection
      this.socket.close();
      this.socket = null;
    }
    
    // Reset multiplayer state
    this.isMultiplayer = false;
    this.currentMatch = null;
    
    // Reset score display names
    document.querySelector('.player-score.right').removeAttribute('data-name');
    document.querySelector('.player-score.left').removeAttribute('data-name');
  }
};