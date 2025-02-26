// Store & Player Data Management
const Store = {
  // Server URL for user data (this would be a real server in production)
  serverUrl: 'https://cosmic-pong-api.herokuapp.com',
  
  // Player data
  playerName: 'Player',
  playerAvatar: 'cyan',
  playerCredits: 0, // Start with 0 credits
  playerItems: {},
  paypalEmail: '', // User's PayPal email
  actualPaypalEmail: 'cartermoyer75@gmail.com', // Actual PayPal email for processing payments
  userEmail: '', // User's login email
  userPassword: '', // User's login password (hashed for storage)
  isLoggedIn: false, // Login status
  registeredUsers: {}, // Store registered users
  promoActive: true, // 50% off promotion active
  paypalConnected: false, // Whether PayPal is connected
  
  // User stats
  userStats: {
    totalGames: 0,
    wins: 0,
    losses: 0,
    rating: 1000,
    xp: 0,
    level: 1,
    highScore: 0,
    longestStreak: 0,
    lastLogin: null
  },
  
  /**
   * Initialize the Store module
   */
  init: function() {
    try {
      console.log("Initializing Store module...");
      
      // Check for pending transactions when page loads
      this.checkPendingTransaction();
      
      // Load saved player data
      this.loadPlayerData();
      
      console.log("Store module initialized successfully");
      console.log("User logged in:", this.isLoggedIn);
      console.log("User email:", this.userEmail);
      console.log("Player credits:", this.playerCredits);
      
      // CRITICAL: Initialize Game.isLoggedIn properly
      if (typeof Game !== 'undefined') {
        Game.isLoggedIn = this.isLoggedIn;
        Game.currentUser = this.isLoggedIn ? {
          email: this.userEmail,
          name: this.playerName
        } : null;
      }
    } catch (error) {
      console.error("Error initializing Store module:", error);
    }
  },
  
  /**
   * Replace PayPal SDK buttons with our custom buttons
   */
  replacePayPalButtons: function() {
    const paypalContainers = [
      { id: 'paypal-500-container', credits: 500, price: '4.99' },
      { id: 'paypal-1200-container', credits: 1200, price: '9.99' },
      { id: 'paypal-3000-container', credits: 3000, price: '19.99' }
    ];
    
    paypalContainers.forEach(container => {
      const element = document.getElementById(container.id);
      if (element) {
        // Create custom button
        element.innerHTML = `
          <button class="cyber-button custom-paypal-button" 
                  data-credits="${container.credits}" 
                  data-price="${container.price}"
                  style="background: linear-gradient(to right, #0070ba, #1546a0); color: white; width: 100%; margin-top: 10px;">
            <i class="fas fa-credit-card"></i> Buy Now
          </button>
        `;
        
        // Add hover effect
        const button = element.querySelector('.custom-paypal-button');
        button.addEventListener('mouseenter', () => {
          button.style.transform = 'scale(1.05)';
          button.style.boxShadow = '0 0 15px rgba(0, 128, 255, 0.7)';
        });
        
        button.addEventListener('mouseleave', () => {
          button.style.transform = 'scale(1)';
          button.style.boxShadow = 'none';
        });
      }
    });
  },
  
  /**
   * Add credits to player account
   * @param {number} amount - Amount of credits to add
   */
  addCredits: function(amount) {
    this.playerCredits += amount;
    document.getElementById('playerCredits').textContent = this.playerCredits;
    
    // Save player data to localStorage
    this.savePlayerData();
  },
  
  /**
   * Purchase an item from the store
   * @param {string} itemId - Item identifier
   */
  purchaseItem: function(itemId) {
    console.log(`Attempting to purchase item: ${itemId}`);
    
    // Check if user is logged in
    if (!this.isLoggedIn) {
      Utils.showNotification('Login Required', 'Please login or create an account to make purchases.', 'warning');
      UI.showPanel('loginPanel');
      return;
    }
    
    // Define item prices
    const prices = {
      'neon_paddle_pack': 200,
      'cosmic_ball_skins': 300,
      'premium_powerups': 500,
      'arena_themes': 450,
      'power_paddle': 250,
      'shield_generator': 350
    };
    
    // First, mark the button as owned if the item is already owned
    // This is a defensive measure in case localStorage gets out of sync
    this.updateItemButtonStatus(itemId);
    
    // Check if item is already owned (after potential button update)
    if (this.playerItems && this.playerItems[itemId]) {
      Utils.showNotification('Already Owned', 'You already own this item!', 'info');
      return;
    }
    
    // Get price (with potential promo discount)
    const finalPrice = this.promoActive ? Math.floor(prices[itemId] / 2) : prices[itemId];
    
    // Check if player has enough credits
    if (this.playerCredits >= finalPrice) {
      // Show confirmation dialog
      const confirmPurchase = confirm(`Confirm purchase: ${finalPrice} credits${this.promoActive ? ' (50% OFF!)' : ''}?`);
      
      if (confirmPurchase) {
        try {
          console.log(`Processing purchase for ${itemId} at ${finalPrice} credits`);
          
          // Initialize player items if needed
          if (!this.playerItems) {
            this.playerItems = {};
          }
          
          // Deduct credits
          this.playerCredits -= finalPrice;
          
          // Update UI credits display
          if (document.getElementById('playerCredits')) {
            document.getElementById('playerCredits').textContent = this.playerCredits;
          }
          
          // Add item to player's inventory
          this.playerItems[itemId] = true;
          
          // Ensure registeredUsers exists
          if (!this.registeredUsers) {
            this.registeredUsers = {};
          }
          
          // Ensure user exists in registeredUsers
          if (this.isLoggedIn && this.userEmail && !this.registeredUsers[this.userEmail]) {
            // Create user if missing
            this.registeredUsers[this.userEmail] = {
              email: this.userEmail,
              name: this.playerName,
              credits: this.playerCredits,
              items: {},
              registrationDate: new Date().toISOString()
            };
          }
          
          // Make sure user data exists and is valid
          if (this.isLoggedIn && this.userEmail && this.registeredUsers[this.userEmail]) {
            // Ensure items object exists
            if (!this.registeredUsers[this.userEmail].items) {
              this.registeredUsers[this.userEmail].items = {};
            }
            
            // Update item in account - MOST IMPORTANT STEP
            this.registeredUsers[this.userEmail].items[itemId] = true;
            
            // Update credits in account
            this.registeredUsers[this.userEmail].credits = this.playerCredits;
            
            // Add transaction record
            if (!this.registeredUsers[this.userEmail].transactions) {
              this.registeredUsers[this.userEmail].transactions = [];
            }
            
            // Add transaction to history
            this.registeredUsers[this.userEmail].transactions.push({
              type: 'item_purchase',
              itemId: itemId,
              cost: finalPrice,
              discount: this.promoActive,
              date: new Date().toISOString()
            });
            
            console.log('Updated user account with purchase:', itemId);
            console.log('New credit balance:', this.playerCredits);
            console.log('Items owned:', Object.keys(this.registeredUsers[this.userEmail].items));
          }
          
          // Update the button state immediately
          this.updateItemButtonStatus(itemId);
          
          // Play purchase sound
          try {
            const purchaseSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2058/2058-preview.mp3');
            purchaseSound.volume = 0.5;
            purchaseSound.play().catch(e => console.warn('Could not play purchase sound', e));
          } catch (soundError) {
            console.warn('Could not play purchase sound:', soundError);
          }
          
          // Show success notification
          Utils.showNotification('Purchase Successful', `You have purchased the item for ${finalPrice} credits${this.promoActive ? ' (50% OFF!)' : ''}!`, 'success');
          
          // Save to localStorage immediately
          this.savePlayerData();
          
          // Create backup
          this.saveBackupData(itemId);
          
          console.log('Purchase completed successfully');
        } catch (error) {
          console.error('Error during purchase:', error);
          Utils.showNotification('Purchase Error', 'There was an error processing your purchase. Please try again.', 'error');
        }
      }
    } else {
      // Show error notification for insufficient credits
      Utils.showNotification('Insufficient Credits', `You need ${finalPrice - this.playerCredits} more credits. Visit the store to purchase credits.`, 'error');
    }
  },
  
  /**
   * Save backup data after purchase
   */
  saveBackupData: function(itemId) {
    try {
      // Direct save of critical purchase data
      const purchaseBackup = {
        email: this.userEmail,
        credits: this.playerCredits,
        item: itemId,
        timestamp: Date.now()
      };
      localStorage.setItem('lastPurchaseBackup', JSON.stringify(purchaseBackup));
      
      // Also save raw registered users data directly
      localStorage.setItem('cosmicPongUsers_backup', JSON.stringify(this.registeredUsers));
      
      // Schedule multiple saves to ensure data persistence
      const saveIntervals = [100, 500, 1000, 2000];
      saveIntervals.forEach(delay => {
        setTimeout(() => this.verifyAndFixPurchaseData(itemId), delay);
      });
    } catch (e) {
      console.error('Error saving backup data:', e);
    }
  },
  
  /**
   * Verify and fix purchase data if needed
   */
  verifyAndFixPurchaseData: function(itemId) {
    try {
      if (this.isLoggedIn && this.registeredUsers && this.registeredUsers[this.userEmail]) {
        // Check if item is still in account
        if (!this.registeredUsers[this.userEmail].items || 
            !this.registeredUsers[this.userEmail].items[itemId]) {
          console.warn(`Item ${itemId} not found in account, fixing...`);
          
          // Ensure items object exists
          if (!this.registeredUsers[this.userEmail].items) {
            this.registeredUsers[this.userEmail].items = {};
          }
          
          // Fix the item
          this.registeredUsers[this.userEmail].items[itemId] = true;
        }
        
        // Check if credits are correct
        if (this.registeredUsers[this.userEmail].credits !== this.playerCredits) {
          console.warn(`Credits mismatch, fixing...`);
          this.registeredUsers[this.userEmail].credits = this.playerCredits;
        }
        
        // Save again
        this.savePlayerData();
        
        // Also update button status again for safety
        this.updateItemButtonStatus(itemId);
        
        // Direct localStorage operation as a backup
        try {
          localStorage.setItem('cosmicPongUsers', JSON.stringify(this.registeredUsers));
        } catch (e) {
          console.error(`Error during verification save:`, e);
        }
      }
    } catch (error) {
      console.error("Error verifying purchase data:", error);
    }
  },
  
  /**
   * Update item button status
   */
  updateItemButtonStatus: function(itemId) {
    try {
      const isOwned = this.playerItems && this.playerItems[itemId];
      
      // Find the button for this item
      const button = document.querySelector(`button[onclick="Store.purchaseItem('${itemId}')"]`);
      if (button) {
        if (isOwned) {
          // Mark as owned
          button.textContent = 'Owned';
          button.disabled = true;
          button.classList.add('active');
          console.log(`Button for ${itemId} marked as owned`);
        } else {
          // Ensure it's purchasable
          if (button.textContent === 'Owned') {
            button.textContent = 'Purchase';
          }
          button.disabled = !this.isLoggedIn;
          console.log(`Button for ${itemId} marked as purchasable`);
        }
      } else {
        console.warn(`Button for ${itemId} not found in DOM`);
      }
    } catch (error) {
      console.error("Error updating button status:", error);
    }
  },
  
  /**
   * Save player data to localStorage
   */
  savePlayerData: function() {
    try {
      // Double-check account items are initialized
      if (this.isLoggedIn && this.registeredUsers[this.userEmail]) {
        if (!this.registeredUsers[this.userEmail].items) {
          this.registeredUsers[this.userEmail].items = {};
        }
      }
      
      // IMPORTANT: Make sure player data is properly synced with registered users first
      if (this.isLoggedIn && this.registeredUsers[this.userEmail]) {
        // Update player data in registered users (critical fields)
        this.registeredUsers[this.userEmail].credits = this.playerCredits;
        
        // Ensure player items are initialized
        if (!this.playerItems) {
          this.playerItems = {};
        }
        
        // Merge items - this ensures all items are saved to account
        Object.keys(this.playerItems).forEach(key => {
          if (this.playerItems[key]) {
            this.registeredUsers[this.userEmail].items[key] = true;
          }
        });
        
        // Also ensure account items are in player items
        Object.keys(this.registeredUsers[this.userEmail].items).forEach(key => {
          if (this.registeredUsers[this.userEmail].items[key]) {
            this.playerItems[key] = true;
          }
        });
      }
      
      // Then save player data to localStorage
      const playerData = {
        name: this.playerName,
        avatar: this.playerAvatar,
        credits: this.playerCredits,
        items: this.playerItems,
        email: this.userEmail,
        isLoggedIn: this.isLoggedIn,
        paypalEmail: this.paypalEmail,
        paypalConnected: this.paypalConnected,
        stats: this.userStats
      };
      
      // Save both the registeredUsers and playerData objects
      localStorage.setItem('cosmicPongPlayerData', JSON.stringify(playerData));
      localStorage.setItem('cosmicPongUsers', JSON.stringify(this.registeredUsers));
      
      // Force localStorage sync
      localStorage.setItem('lastSaveTimestamp', Date.now().toString());
      
      // Log what was saved for debugging
      console.log('Saved player items:', Object.keys(this.playerItems));
      console.log('Credits:', this.playerCredits);
    } catch (error) {
      console.error('Error saving player data:', error);
    }
  },
  
  /**
   * Sync with server (would be implemented in a real app)
   */
  syncWithServer: function() {
    console.log(`[SERVER] Syncing user data for ${this.userEmail}`);
    // This would make an API call to the server with the current user data
  },
  
  /**
   * Load player data from localStorage
   */
  loadPlayerData: function() {
    try {
      // ----- Backup restoration logic -----
      // Check if we have a backup from an incomplete purchase
      const purchaseBackup = localStorage.getItem('lastPurchaseBackup');
      const userBackup = localStorage.getItem('cosmicPongUsers_backup');
      
      if (purchaseBackup && userBackup) {
        try {
          const backupData = JSON.parse(purchaseBackup);
          const backupUsers = JSON.parse(userBackup);
          
          // Check if backup is recent (less than 1 hour old)
          if (Date.now() - backupData.timestamp < 3600000) {
            console.log('Found recent purchase backup, attempting to restore');
            
            // Use backup as primary data source
            localStorage.setItem('cosmicPongUsers', userBackup);
            
            // Log restoration details
            console.log('Restored backup purchase: ', backupData.item);
            console.log('Restored credit balance: ', backupData.credits);
          }
        } catch (e) {
          console.error('Error processing backup:', e);
        }
      }
      
      // ----- Normal loading logic -----
      // Load registered users
      const savedUsers = localStorage.getItem('cosmicPongUsers');
      if (savedUsers) {
        this.registeredUsers = JSON.parse(savedUsers);
      } else {
        // Initialize if not exists
        this.registeredUsers = {};
      }
      
      // Load player data from localStorage
      const savedData = localStorage.getItem('cosmicPongPlayerData');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.playerName = data.name || 'Player';
        this.playerAvatar = data.avatar || 'cyan';
        this.playerCredits = data.credits || 0;
        this.playerItems = data.items || {};
        this.userEmail = data.email || '';
        this.isLoggedIn = data.isLoggedIn || false;
        this.paypalEmail = data.paypalEmail || '';
        
        // Always enable PayPal connection to simplify payment flow
        this.paypalConnected = true;
        
        // Load user stats if available
        if (data.stats) {
          this.userStats = data.stats;
        }
        
        // ----- CRITICAL ACCOUNTS DATA SYNC -----
        // If logged in, ACCOUNT data MUST take priority over session data
        if (this.isLoggedIn && this.userEmail && this.registeredUsers[this.userEmail]) {
          const userData = this.registeredUsers[this.userEmail];
          
          // Critical: Credits must be loaded from account data
          if (typeof userData.credits === 'number') {
            this.playerCredits = userData.credits;
            console.log('Loaded credits from account:', this.playerCredits);
          }
          
          // Also critical: Owned items must be loaded from account
          if (userData.items) {
            // First ensure playerItems is initialized
            if (!this.playerItems) {
              this.playerItems = {};
            }
            
            // For each item in account, ensure it's in player items
            Object.keys(userData.items).forEach(key => {
              if (userData.items[key]) {
                this.playerItems[key] = true;
              }
            });
            
            console.log('Loaded items from account:', Object.keys(this.playerItems));
          }
          
          // Finally, synchronize back to ensure consistency
          this.savePlayerData();
        }
        
        // Extra verification: If user exists in data but not in registered users, create it
        if (this.isLoggedIn && this.userEmail && !this.registeredUsers[this.userEmail]) {
          console.warn('User exists in session but not in accounts - recreating account');
          
          // Create user data entry
          this.registeredUsers[this.userEmail] = {
            email: this.userEmail,
            name: this.playerName,
            credits: this.playerCredits,
            items: this.playerItems || {},
            password: "defaultpassword", // Fallback password for auto-created account
            registrationDate: new Date().toISOString()
          };
          
          // Save immediately
          this.savePlayerData();
        }
      }
    } catch (error) {
      console.error('Error loading player data:', error);
      
      // Initialize to defaults if there was an error
      this.registeredUsers = this.registeredUsers || {};
      this.playerItems = this.playerItems || {};
    }
    
    // Update login state in Game
    Game.isLoggedIn = this.isLoggedIn;
      Game.currentUser = this.isLoggedIn ? {
        email: this.userEmail,
        name: this.playerName
      } : null;
      
      // Update UI
      if (document.getElementById('playerName')) {
        document.getElementById('playerName').value = this.playerName;
      }
      
      if (document.getElementById('playerAvatar')) {
        document.getElementById('playerAvatar').value = this.playerAvatar;
      }
      
      if (document.getElementById('paypalEmail')) {
        document.getElementById('paypalEmail').value = this.paypalEmail;
      }
      
      if (document.getElementById('playerCredits')) {
        document.getElementById('playerCredits').textContent = this.playerCredits;
      }
      
      // Add promo notification if active
      if (this.promoActive) {
        this.showPromoNotification();
      }
      
      // Update login status in UI
      this.updateLoginUI();
      
      // Update owned items
      for (const item in this.playerItems) {
        if (this.playerItems[item]) {
          const button = document.querySelector(`button[onclick="Store.purchaseItem('${item}')"]`);
          if (button) {
            button.textContent = 'Owned';
            button.disabled = true;
            button.classList.add('active');
          }
        }
      }
      
      // Initialize multiplayer if it exists
      if (typeof Multiplayer !== 'undefined') {
        Multiplayer.init();
      }
      
      // Update stats UI
      this.updateStatsUI();
    },
  
  /**
   * Added a demo auto-register function for testing purposes
   */
  demoAutoRegister: function(email, password) {
    console.log("Auto-registering for demo:", email);
    
    // Create initial stats
    const initialStats = {
      totalGames: 0,
      wins: 0,
      losses: 0,
      rating: 1000,
      xp: 0,
      level: 1,
      highScore: 0,
      longestStreak: 0,
      currentStreak: 0,
      averageRally: 0
    };
    
    // Register the new user
    this.registeredUsers[email] = {
      email: email,
      password: password,
      name: "Demo User",
      credits: 500, // Give 500 free credits to demo users
      items: {},
      paypalEmail: '',
      registrationDate: new Date().toISOString(),
      stats: initialStats
    };
    
    // Save the registered users
    localStorage.setItem('cosmicPongUsers', JSON.stringify(this.registeredUsers));
    console.log("Auto-registered user:", email);
    Utils.showNotification('Account Created', 'An account has been automatically created for demo purposes. Please try logging in now.', 'success');
  },
  
  /**
   * Update user stats UI
   */
  updateStatsUI: function() {
    // Update profile panel stats if it exists
    const totalGamesElement = document.querySelector('.stats-total-games');
    const gamesWonElement = document.querySelector('.stats-games-won');
    const winStreakElement = document.querySelector('.stats-win-streak');
    const averageRallyElement = document.querySelector('.stats-average-rally');
    
    if (totalGamesElement && this.registeredUsers[this.userEmail]) {
      const stats = this.registeredUsers[this.userEmail].stats || this.userStats;
      
      if (totalGamesElement) totalGamesElement.textContent = stats.totalGames || 0;
      if (gamesWonElement) gamesWonElement.textContent = stats.wins || 0;
      if (winStreakElement) winStreakElement.textContent = stats.currentStreak || 0;
      if (averageRallyElement) averageRallyElement.textContent = stats.averageRally || '0.0';
    }
  },
  
  /**
   * Show promotion notification
   */
  showPromoNotification: function() {
    if (this.promoActive) {
      const storeLoginMessage = document.getElementById('store-login-message');
      if (storeLoginMessage) {
        storeLoginMessage.innerHTML = '<i class="fas fa-tags"></i> LIMITED TIME OFFER: 50% OFF ALL ITEMS!';
        storeLoginMessage.style.color = '#ffcc00';
        storeLoginMessage.style.display = 'block';
        storeLoginMessage.style.fontWeight = 'bold';
        storeLoginMessage.style.fontSize = '18px';
      }
    }
  },
  
  /**
   * Update player profile
   */
  updateProfile: function() {
    // Check if user is logged in
    if (!this.isLoggedIn) {
      Utils.showNotification('Login Required', 'Please login to update your profile.', 'warning');
      UI.showPanel('loginPanel');
      return;
    }
    
    const newName = document.getElementById('playerName').value;
    const newAvatar = document.getElementById('playerAvatar').value;
    let newPaypalEmail = '';
    
    if (document.getElementById('paypalEmail')) {
      newPaypalEmail = document.getElementById('paypalEmail').value;
    }
    
    // Basic email validation if PayPal email is provided
    if (newPaypalEmail && (!newPaypalEmail.includes('@') || !newPaypalEmail.includes('.'))) {
      Utils.showNotification('Invalid Email', 'Please enter a valid PayPal email address.', 'error');
      return;
    }
    
    // Update current user data
    this.playerName = newName;
    this.playerAvatar = newAvatar;
    
    // Update PayPal connection - skip this step, we'll always consider PayPal connected
    this.paypalConnected = true;  // Always enable PayPal purchases without requiring user PayPal connection
    
    if (newPaypalEmail !== this.paypalEmail) {
      if (newPaypalEmail) {
        // Connect PayPal
        this.paypalEmail = newPaypalEmail;
        Utils.showNotification('PayPal Connected', 'Your PayPal account has been connected successfully.', 'success');
      } else {
        // Still keep PayPal connected but with default email
        this.paypalEmail = '';
        Utils.showNotification('Profile Updated', 'Your profile has been updated. You can still make purchases.', 'info');
      }
    }
    
    // Update registered user data
    if (this.registeredUsers[this.userEmail]) {
      this.registeredUsers[this.userEmail].name = newName;
      this.registeredUsers[this.userEmail].paypalEmail = newPaypalEmail;
      this.registeredUsers[this.userEmail].avatar = newAvatar;
      
      // Ensure purchased items are preserved
      if (!this.registeredUsers[this.userEmail].items) {
        this.registeredUsers[this.userEmail].items = {};
      }
      
      // Merge items from player items
      Object.keys(this.playerItems).forEach(itemId => {
        if (this.playerItems[itemId]) {
          this.registeredUsers[this.userEmail].items[itemId] = true;
        }
      });
      
      // Update credits
      this.registeredUsers[this.userEmail].credits = this.playerCredits;
    }
    
    // Save to localStorage
    this.savePlayerData();
    
    // Update game state
    if (Game.isLoggedIn && Game.currentUser) {
      Game.currentUser.name = this.playerName;
    }
    
    Utils.showNotification('Profile Updated', 'Your profile has been updated successfully.', 'success');
    
    // Return to main menu
    UI.hidePanel('profilePanel');
    UI.showPanel('mainMenu');
  },
  
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   */
  login: function(email, password) {
    console.log("Login attempt for:", email);
    
    // Simple validation
    if (!email || !password) {
      Utils.showNotification('Login Failed', 'Please enter both email and password.', 'error');
      return;
    }
    
    // Check if registered users is initialized
    if (!this.registeredUsers) {
      console.log("No registered users found, initializing empty object");
      this.registeredUsers = {};
    }
    
    console.log("Registered users:", Object.keys(this.registeredUsers));
    
    // Check if email is registered
    if (!this.registeredUsers[email]) {
      Utils.showNotification('Login Failed', 'No account found with this email. Please register first.', 'error');
      // Auto-register for demo purposes
      this.demoAutoRegister(email, password);
      return;
    }
    
    // Check if password matches (simple comparison - would use hashing in production)
    if (this.registeredUsers[email].password !== password) {
      Utils.showNotification('Login Failed', 'Incorrect password. Please try again.', 'error');
      return;
    }
    
    // Load user data
    this.userEmail = email;
    this.playerName = this.registeredUsers[email].name;
    this.playerCredits = this.registeredUsers[email].credits || 0;
    this.playerItems = this.registeredUsers[email].items || {};
    this.paypalEmail = this.registeredUsers[email].paypalEmail || '';
    this.paypalConnected = !!this.registeredUsers[email].paypalEmail;
    this.isLoggedIn = true;
    
    // Load user stats if available
    if (this.registeredUsers[email].stats) {
      this.userStats = this.registeredUsers[email].stats;
    }
    
    // Update last login time
    this.registeredUsers[email].lastLogin = new Date().toISOString();
    if (this.registeredUsers[email].stats) {
      this.registeredUsers[email].stats.lastLogin = new Date().toISOString();
    }
    
    // Update game state
    Game.isLoggedIn = true;
    Game.currentUser = {
      email: this.userEmail,
      name: this.playerName
    };
    
    // Update UI elements
    document.getElementById('playerCredits').textContent = this.playerCredits;
    if (document.getElementById('playerName')) {
      document.getElementById('playerName').value = this.playerName;
    }
    if (document.getElementById('paypalEmail')) {
      document.getElementById('paypalEmail').value = this.paypalEmail;
    }
    
    // Show owned items
    for (const item in this.playerItems) {
      if (this.playerItems[item]) {
        const button = document.querySelector(`button[onclick="Store.purchaseItem('${item}')"]`);
        if (button) {
          button.textContent = 'Owned';
          button.disabled = true;
          button.classList.add('active');
        }
      }
    }
    
    // Save to localStorage
    this.savePlayerData();
    
    // Update UI
    this.updateLoginUI();
    
    // Update stats UI
    this.updateStatsUI();
    
    // Initialize multiplayer
    if (typeof Multiplayer !== 'undefined') {
      Multiplayer.init();
    }
    
    // Offer free credits for new users with no prior credits
    if (this.playerCredits === 0) {
      const acceptOffer = confirm('Would you like to claim 100 FREE credits to start shopping?');
      if (acceptOffer) {
        this.addCredits(100);
        Utils.showNotification('Credits Added', 'You have received 100 free credits!', 'success');
      }
    }
    
    Utils.showNotification('Login Successful', `Welcome back, ${this.playerName}!`, 'success');
    
    // Close login panel
    UI.hidePanel('loginPanel');
    
    // Return to main menu
    UI.showPanel('mainMenu');
  },
  
  /**
   * Register new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} name - User name
   */
  register: function(email, password, name) {
    console.log("Register called with:", email, password, name);

    // Simple validation
    if (!email || !password || !name) {
      Utils.showNotification('Registration Failed', 'Please fill out all fields.', 'error');
      return;
    }
    
    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
      Utils.showNotification('Registration Failed', 'Please enter a valid email address.', 'error');
      return;
    }
    
    // Basic password validation
    if (password.length < 6) {
      Utils.showNotification('Registration Failed', 'Password must be at least 6 characters long.', 'error');
      return;
    }
    
    // Check if registered users is initialized
    if (!this.registeredUsers) {
      console.log("Initializing registeredUsers object");
      this.registeredUsers = {};
    }
    
    // Check if email is already registered
    if (this.registeredUsers[email]) {
      Utils.showNotification('Registration Failed', 'An account with this email already exists. Please log in.', 'error');
      return;
    }
    
    // Create initial stats
    const initialStats = {
      totalGames: 0,
      wins: 0,
      losses: 0,
      rating: 1000,
      xp: 0,
      level: 1,
      highScore: 0,
      longestStreak: 0,
      currentStreak: 0,
      averageRally: 0
    };
    
    // Register the new user
    this.registeredUsers[email] = {
      email: email,
      password: password, // Would be hashed in production
      name: name,
      credits: 100, // Give 100 free credits to new users
      items: {},
      paypalEmail: '',
      registrationDate: new Date().toISOString(),
      stats: initialStats
    };
    
    // Set current user data
    this.userEmail = email;
    this.playerName = name;
    this.playerCredits = 100; // Start with 100 free credits
    this.playerItems = {};
    this.userStats = initialStats;
    this.isLoggedIn = true;
    
    // Update game state
    Game.isLoggedIn = true;
    Game.currentUser = {
      email: this.userEmail,
      name: this.playerName
    };
    
    // Update UI elements
    document.getElementById('playerCredits').textContent = this.playerCredits;
    
    // Save to localStorage
    this.savePlayerData();
    
    // Update UI
    this.updateLoginUI();
    
    // Initialize multiplayer
    if (typeof Multiplayer !== 'undefined') {
      Multiplayer.init();
    }
    
    Utils.showNotification('Registration Successful', `Welcome, ${this.playerName}! You've received 100 free credits to get started.`, 'success');
    
    // Close register panel
    UI.hidePanel('registerPanel');
    
    // Return to main menu
    UI.showPanel('mainMenu');
  },
  
  /**
   * Logout user
   */
  logout: function() {
    // Save user data before logout
    if (this.isLoggedIn && this.userEmail && this.registeredUsers[this.userEmail]) {
      this.registeredUsers[this.userEmail].credits = this.playerCredits;
      this.registeredUsers[this.userEmail].items = this.playerItems;
      this.registeredUsers[this.userEmail].lastLogin = new Date().toISOString();
    }
    
    // Reset user state
    this.isLoggedIn = false;
    this.userEmail = '';
    this.playerName = 'Player';
    this.playerCredits = 0;
    this.playerItems = {};
    this.paypalEmail = '';
    this.paypalConnected = false;
    
    // Update game state
    Game.isLoggedIn = false;
    Game.currentUser = null;
    
    // Update UI elements
    document.getElementById('playerCredits').textContent = this.playerCredits;
    
    // Reset owned items in UI
    document.querySelectorAll('.store-item button.active').forEach(button => {
      button.textContent = 'Purchase';
      button.disabled = true;
      button.classList.remove('active');
    });
    
    // Save to localStorage
    this.savePlayerData();
    
    // Update UI
    this.updateLoginUI();
    
    Utils.showNotification('Logged Out', 'You have been logged out successfully.', 'info');
  },
  
  /**
   * Check if PayPal is connected before making a purchase
   */
  checkPayPalConnection: function() {
    if (!this.isLoggedIn) {
      Utils.showNotification('Login Required', 'Please login or create an account to purchase credits.', 'warning');
      UI.showPanel('loginPanel');
      return false;
    }
    
    // Always consider PayPal connected
    this.paypalConnected = true;
    return true;
  },
  
  /**
   * Confirm PayPal transaction
   * @param {number} amount - Amount of credits purchased
   * @param {number} price - Price in USD
   */
  confirmTransaction: function(amount, price) {
    // In a real app, this would be handled by the PayPal API
    // For demo, we'll simulate the transaction
    
    // Check if user is logged in and PayPal is connected
    if (!this.checkPayPalConnection()) {
      return false;
    }
    
    const confirmPurchase = confirm(`Confirm purchase: ${amount} credits for $${price}?`);
    if (!confirmPurchase) {
      return false;
    }
    
    // Simulate transaction processing
    Utils.showNotification('Processing Payment', 'Please wait while we process your payment...', 'info');
    
    // Simulate processing delay
    setTimeout(() => {
      // Add credits
      this.addCredits(amount);
      
      // Update registered user data
      if (this.registeredUsers[this.userEmail]) {
        this.registeredUsers[this.userEmail].credits = this.playerCredits;
        this.registeredUsers[this.userEmail].transactions = this.registeredUsers[this.userEmail].transactions || [];
        this.registeredUsers[this.userEmail].transactions.push({
          type: 'purchase',
          amount: amount,
          price: price,
          date: new Date().toISOString()
        });
      }
      
      // Save data
      this.savePlayerData();
      
      // Show success notification
      Utils.showNotification('Payment Successful', `Thank you! ${amount} credits have been added to your account.`, 'success');
    }, 1500);
    
    return true;
  },
  
  /**
   * Initiate PayPal payment with specific amount, price and recipient
   * @param {number} credits - Amount of credits to purchase
   * @param {string} price - Price in USD
   * @param {string} recipient - PayPal recipient email
   */
  initiatePaypalPayment: function(credits, price, recipient) {
    // Check login status first
    if (!this.isLoggedIn) {
      Utils.showNotification('Login Required', 'Please log in or create an account before making a purchase.', 'warning');
      UI.showPanel('loginPanel');
      return;
    }
    
    // Apply promo discount if active
    let finalPrice = price;
    if (this.promoActive) {
      // Apply 50% discount
      finalPrice = (parseFloat(price) / 2).toFixed(2);
    }
    
    // Confirm purchase with applicable discount
    let confirmMessage = `Purchase ${credits} credits for $${finalPrice}`;
    if (this.promoActive) {
      confirmMessage += ` (50% OFF!)`;
    }
    confirmMessage += '?';
    
    const confirmPurchase = confirm(confirmMessage);
    if (!confirmPurchase) return;
    
    // Generate a unique transaction ID
    const transactionId = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
    
    // Store pending transaction in localStorage
    const pendingTransaction = {
      id: transactionId,
      credits: credits,
      price: finalPrice,
      originalPrice: price,
      timestamp: Date.now(),
      userId: this.userEmail,
      completed: false // Not completed until verified
    };
    localStorage.setItem('pendingTransaction', JSON.stringify(pendingTransaction));
    
    // Construct PayPal URL with parameters
    const paypalURL = new URL('https://www.paypal.com/cgi-bin/webscr');
    paypalURL.searchParams.append('cmd', '_xclick');
    paypalURL.searchParams.append('business', recipient);
    paypalURL.searchParams.append('item_name', `${credits} Credits for Extreme Pong${this.promoActive ? ' (50% OFF)' : ''}`);
    paypalURL.searchParams.append('amount', finalPrice);
    paypalURL.searchParams.append('currency_code', 'USD');
    paypalURL.searchParams.append('return', window.location.href + '?tx=' + transactionId + '&status=completed');
    paypalURL.searchParams.append('cancel_return', window.location.href + '?tx=' + transactionId + '&status=cancelled');
    paypalURL.searchParams.append('custom', this.userEmail); // Add user email for verification
    
    // Open PayPal in new window
    window.open(paypalURL.toString(), '_blank');
    
    // Show notification that payment is pending
    Utils.showNotification('Payment Pending', `Please complete your payment in the PayPal window. Your credits will be added after payment is verified.`, 'info');
    
    // Set up listener for when user returns from PayPal
    window.addEventListener('focus', this.checkPendingTransaction.bind(this), {once: true});
  },
  
  /**
   * Check for pending transactions when returning from PayPal
   */
  checkPendingTransaction: function() {
    // Short delay to allow window to fully regain focus
    setTimeout(() => {
      try {
        // Check for pending transaction
        const pendingTxStr = localStorage.getItem('pendingTransaction');
        if (!pendingTxStr) return;
        
        const pendingTx = JSON.parse(pendingTxStr);
        
        // Check if transaction is expired (older than 30 minutes)
        if (Date.now() - pendingTx.timestamp > 1800000) {
          localStorage.removeItem('pendingTransaction');
          Utils.showNotification('Transaction Expired', 'Your payment session has expired. Please try again.', 'warning');
          return;
        }
        
        // Check if transaction belongs to current user
        if (pendingTx.userId !== this.userEmail) {
          localStorage.removeItem('pendingTransaction');
          return;
        }
        
        // Parse URL for transaction status
        const urlParams = new URLSearchParams(window.location.search);
        const txId = urlParams.get('tx');
        const status = urlParams.get('status');
        
        // Verify transaction ID matches
        if (txId === pendingTx.id) {
          if (status === 'completed') {
            // Process completed transaction
            this.processCompletedTransaction(pendingTx);
          } else if (status === 'cancelled') {
            Utils.showNotification('Payment Cancelled', 'Your transaction was cancelled. No credits have been added.', 'warning');
            localStorage.removeItem('pendingTransaction');
          } else {
            // No status in URL, ask user if they completed payment
            this.promptForPaymentConfirmation(pendingTx);
          }
          
          // Clean up URL parameters
          if (history.pushState) {
            const newurl = window.location.protocol + "//" + 
                          window.location.host + 
                          window.location.pathname;
            window.history.pushState({path: newurl}, '', newurl);
          }
        } else if (!txId) {
          // No transaction ID in URL, ask user for confirmation
          this.promptForPaymentConfirmation(pendingTx);
        }
      } catch (e) {
        console.error('Error checking transaction:', e);
      }
    }, 500);
  },
  
  /**
   * Process a completed transaction
   * @param {Object} transaction - Transaction data
   */
  processCompletedTransaction: function(transaction) {
    // Show verification message
    Utils.showNotification('Verifying Payment', 'Please wait while we verify your payment...', 'info');
    
    // Add credits to account
    this.addCredits(transaction.credits);
    
    // Update registered user data
    if (this.registeredUsers[this.userEmail]) {
      this.registeredUsers[this.userEmail].credits = this.playerCredits;
      this.registeredUsers[this.userEmail].transactions = this.registeredUsers[this.userEmail].transactions || [];
      this.registeredUsers[this.userEmail].transactions.push({
        type: 'credit_purchase',
        amount: transaction.credits,
        price: transaction.price,
        date: new Date().toISOString(),
        transactionId: transaction.id
      });
    }
    
    // Save data to localStorage
    this.savePlayerData();
    
    // Show success notification
    Utils.showNotification('Payment Successful', 
      `Thank you for your purchase! ${transaction.credits} credits have been added to your account.`, 
      'success'
    );
    
    // Clear pending transaction
    localStorage.removeItem('pendingTransaction');
  },
  
  /**
   * Prompt user to confirm if they completed payment
   * @param {Object} transaction - Transaction data
   */
  promptForPaymentConfirmation: function(transaction) {
    // Ask user if they completed the payment
    const confirmed = confirm(
      "Did you complete your payment in PayPal?\n\n" +
      `${transaction.credits} credits for $${transaction.price}`
    );
    
    if (confirmed) {
      this.processCompletedTransaction(transaction);
    } else {
      Utils.showNotification('Payment Cancelled', 'Your transaction was cancelled. No credits have been added.', 'warning');
      localStorage.removeItem('pendingTransaction');
    }
  },
  
  /**
   * Update UI based on login status
   */
  updateLoginUI: function() {
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const userInfoDisplay = document.getElementById('userInfo');
    const storeLoginMessage = document.getElementById('store-login-message');
    
    if (this.isLoggedIn) {
      // Show logout button
      if (loginButton) loginButton.style.display = 'none';
      if (logoutButton) logoutButton.style.display = 'inline-block';
      
      // Update user info display
      if (userInfoDisplay) {
        userInfoDisplay.innerHTML = `Logged in as: <span style="color:#00ffff;">${this.userEmail}</span>`;
        userInfoDisplay.style.display = 'block';
      }
      
      // Update store message
      if (storeLoginMessage) {
        if (this.promoActive) {
          this.showPromoNotification();
        } else {
          storeLoginMessage.style.display = 'none';
        }
      }
      
      // Enable store purchases
      document.querySelectorAll('.store-item button').forEach(button => {
        if (!button.classList.contains('active')) {
          button.disabled = false;
          button.title = '';
        }
      });
      
      // Show prices with promotion
      if (this.promoActive) {
        document.querySelectorAll('.store-item').forEach(item => {
          const priceDiv = item.querySelector('.store-item-price');
          if (priceDiv && !priceDiv.querySelector('.promo-price')) {
            const originalPrice = parseInt(priceDiv.innerText.match(/\d+/)[0]);
            const discountPrice = Math.floor(originalPrice / 2);
            
            priceDiv.innerHTML = `<span class="original-price" style="text-decoration: line-through; opacity: 0.7;"><i class="fas fa-gem"></i> ${originalPrice}</span> 
                                  <span class="promo-price" style="color: #ffcc00; font-weight: bold;"><i class="fas fa-gem"></i> ${discountPrice}</span>`;
          }
        });
      }
    } else {
      // Show login button
      if (loginButton) loginButton.style.display = 'inline-block';
      if (logoutButton) logoutButton.style.display = 'none';
      
      // Hide user info
      if (userInfoDisplay) {
        userInfoDisplay.style.display = 'none';
      }
      
      // Update store message
      if (storeLoginMessage) {
        storeLoginMessage.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please log in to make purchases';
        storeLoginMessage.style.color = '#ffcc00';
        storeLoginMessage.style.display = 'block';
      }
      
      // Disable store purchases (except for viewing)
      document.querySelectorAll('.store-item button').forEach(button => {
        if (!button.classList.contains('active')) {
          button.disabled = true;
          button.title = 'Login to purchase';
        }
      });
      
      // Reset prices display
      document.querySelectorAll('.store-item').forEach(item => {
        const priceDiv = item.querySelector('.store-item-price');
        if (priceDiv && priceDiv.querySelector('.promo-price')) {
          const originalPrice = parseInt(priceDiv.querySelector('.original-price').innerText.match(/\d+/)[0]);
          priceDiv.innerHTML = `<i class="fas fa-gem" class="currency-icon"></i> ${originalPrice}`;
        }
      });
    }
  }
};