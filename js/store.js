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
    // Check for pending transactions when page loads
    this.checkPendingTransaction();
    
    // Load saved player data
    this.loadPlayerData();
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
    
    // Apply 50% discount if promo is active
    const finalPrice = this.promoActive ? Math.floor(prices[itemId] / 2) : prices[itemId];
    
    // Check if item is already owned
    if (this.playerItems[itemId]) {
      Utils.showNotification('Already Owned', 'You already own this item!', 'info');
      return;
    }
    
    // Check if player has enough credits
    if (this.playerCredits >= finalPrice) {
      // Show confirmation dialog
      const confirmPurchase = confirm(`Confirm purchase: ${finalPrice} credits${this.promoActive ? ' (50% OFF!)' : ''}?`);
      
      if (confirmPurchase) {
        // Deduct credits
        this.playerCredits -= finalPrice;
        document.getElementById('playerCredits').textContent = this.playerCredits;
        
        // Add item to player's inventory
        this.playerItems[itemId] = true;
        
        // Update player account data
        if (this.registeredUsers[this.userEmail]) {
          // Ensure items object exists
          if (!this.registeredUsers[this.userEmail].items) {
            this.registeredUsers[this.userEmail].items = {};
          }
          
          // Update item in account
          this.registeredUsers[this.userEmail].items[itemId] = true;
          
          // Update credits in account
          this.registeredUsers[this.userEmail].credits = this.playerCredits;
          
          // Add transaction record
          if (!this.registeredUsers[this.userEmail].transactions) {
            this.registeredUsers[this.userEmail].transactions = [];
          }
          
          this.registeredUsers[this.userEmail].transactions.push({
            type: 'item_purchase',
            itemId: itemId,
            cost: finalPrice,
            discount: this.promoActive,
            date: new Date().toISOString()
          });
        }
        
        // Play purchase sound
        const purchaseSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2058/2058-preview.mp3');
        purchaseSound.volume = 0.5;
        purchaseSound.play().catch(e => console.warn('Could not play purchase sound', e));
        
        // Show success notification
        Utils.showNotification('Purchase Successful', `You have purchased the item for ${finalPrice} credits${this.promoActive ? ' (50% OFF!)' : ''}!`, 'success');
        
        // Save player data IMMEDIATELY to persist across refreshes
        this.savePlayerData();
        
        // Update UI to show owned item
        const button = document.querySelector(`button[onclick="Store.purchaseItem('${itemId}')"]`);
        if (button) {
          button.textContent = 'Owned';
          button.disabled = true;
          button.classList.add('active');
        }
      }
    } else {
      // Show error notification
      Utils.showNotification('Insufficient Credits', `You need ${finalPrice - this.playerCredits} more credits. Visit the store to purchase credits.`, 'error');
    }
  },
  
  /**
   * Save player data to localStorage
   */
  savePlayerData: function() {
    // Save player data to localStorage
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
    
    localStorage.setItem('cosmicPongPlayerData', JSON.stringify(playerData));
    
    // Also save registered users
    localStorage.setItem('cosmicPongUsers', JSON.stringify(this.registeredUsers));
    
    // In a real implementation, we would also send data to the server
    // this.syncWithServer();
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
    // Load registered users
    const savedUsers = localStorage.getItem('cosmicPongUsers');
    if (savedUsers) {
      this.registeredUsers = JSON.parse(savedUsers);
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
      
      // Ensure purchased items are properly loaded from account
      if (this.isLoggedIn && this.registeredUsers[this.userEmail]) {
        // Sync credits with account to ensure they match between sessions
        this.playerCredits = this.registeredUsers[this.userEmail].credits || this.playerCredits;
        
        // Load items from account
        if (this.registeredUsers[this.userEmail].items) {
          // Merge items from account with current items
          this.playerItems = {...this.playerItems, ...this.registeredUsers[this.userEmail].items};
          
          // Save data to ensure consistency
          this.savePlayerData();
        }
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
    }
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
    // Simple validation
    if (!email || !password) {
      Utils.showNotification('Login Failed', 'Please enter both email and password.', 'error');
      return;
    }
    
    // Check if email is registered
    if (!this.registeredUsers[email]) {
      Utils.showNotification('Login Failed', 'No account found with this email. Please register first.', 'error');
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
    
    // Simulate purchase by immediately applying credits and deducting from balance
    this.addCredits(credits);
    
    // Update registered user data immediately
    if (this.registeredUsers[this.userEmail]) {
      this.registeredUsers[this.userEmail].credits = this.playerCredits;
      this.registeredUsers[this.userEmail].transactions = this.registeredUsers[this.userEmail].transactions || [];
      this.registeredUsers[this.userEmail].transactions.push({
        type: 'purchase',
        amount: credits,
        price: finalPrice,
        date: new Date().toISOString()
      });
    }
    
    // Save data immediately so it persists
    this.savePlayerData();
    
    // Construct PayPal URL with parameters
    const paypalURL = new URL('https://www.paypal.com/cgi-bin/webscr');
    paypalURL.searchParams.append('cmd', '_xclick');
    paypalURL.searchParams.append('business', recipient);
    paypalURL.searchParams.append('item_name', `${credits} Credits for Extreme Pong${this.promoActive ? ' (50% OFF)' : ''}`);
    paypalURL.searchParams.append('amount', finalPrice);
    paypalURL.searchParams.append('currency_code', 'USD');
    paypalURL.searchParams.append('return', window.location.href);
    paypalURL.searchParams.append('cancel_return', window.location.href);
    paypalURL.searchParams.append('custom', this.userEmail); // Add user email for verification
    
    // Store transaction in localStorage with completed flag
    const transactionIntent = {
      credits: credits,
      price: finalPrice,
      originalPrice: price,
      timestamp: Date.now(),
      userId: this.userEmail,
      completed: true // Mark as completed immediately
    };
    localStorage.setItem('lastCompletedTransaction', JSON.stringify(transactionIntent));
    
    // Open PayPal in new window
    window.open(paypalURL.toString(), '_blank');
    
    // Show success notification immediately
    Utils.showNotification('Credits Added', `${credits} credits have been added to your account. Complete the payment in the PayPal window.`, 'success');
  },
  
  /**
   * Check for pending transactions when returning from PayPal
   */
  checkPendingTransaction: function() {
    // Check for completed transactions
    try {
      const completedTx = localStorage.getItem('lastCompletedTransaction');
      if (completedTx) {
        const tx = JSON.parse(completedTx);
        
        // Verify transaction is recent (within last 24 hours)
        if (Date.now() - tx.timestamp > 86400000) {
          localStorage.removeItem('lastCompletedTransaction');
        }
      }
    } catch (e) {
      console.error('Error checking transaction:', e);
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