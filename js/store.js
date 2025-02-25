// Store & Player Data Management
const Store = {
  // Player data
  playerName: 'Player',
  playerAvatar: 'cyan',
  playerCredits: 1000,
  playerItems: {},
  
  /**
   * Initialize PayPal buttons
   */
  initPayPalButtons: function() {
    // Initialize PayPal buttons for each credit pack
    const paypal500Button = paypal.Buttons({
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: '4.99'
            },
            description: '500 Credits for Cosmic Pong'
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          Store.addCredits(500);
          Utils.showNotification('Payment Successful', `Thank you, ${details.payer.name.given_name}! 500 credits have been added to your account.`, 'success');
        });
      },
      style: {
        layout: 'horizontal',
        color: 'blue',
        shape: 'rect',
        label: 'pay',
        height: 40
      }
    });
    
    const paypal1200Button = paypal.Buttons({
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: '9.99'
            },
            description: '1200 Credits for Cosmic Pong'
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          Store.addCredits(1200);
          Utils.showNotification('Payment Successful', `Thank you, ${details.payer.name.given_name}! 1200 credits have been added to your account.`, 'success');
        });
      },
      style: {
        layout: 'horizontal',
        color: 'blue',
        shape: 'rect',
        label: 'pay',
        height: 40
      }
    });
    
    const paypal3000Button = paypal.Buttons({
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: '19.99'
            },
            description: '3000 Credits for Cosmic Pong'
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          Store.addCredits(3000);
          Utils.showNotification('Payment Successful', `Thank you, ${details.payer.name.given_name}! 3000 credits have been added to your account.`, 'success');
        });
      },
      style: {
        layout: 'horizontal',
        color: 'blue',
        shape: 'rect',
        label: 'pay',
        height: 40
      }
    });
    
    // Render the PayPal buttons
    paypal500Button.render('#paypal-500-container');
    paypal1200Button.render('#paypal-1200-container');
    paypal3000Button.render('#paypal-3000-container');
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
    // Define item prices
    const prices = {
      'neon_paddle_pack': 200,
      'cosmic_ball_skins': 300,
      'premium_powerups': 500,
      'arena_themes': 450
    };
    
    // Check if player has enough credits
    if (this.playerCredits >= prices[itemId]) {
      // Deduct credits
      this.playerCredits -= prices[itemId];
      document.getElementById('playerCredits').textContent = this.playerCredits;
      
      // Add item to player's inventory
      this.playerItems[itemId] = true;
      
      // Show success notification
      Utils.showNotification('Purchase Successful', `You have purchased the item for ${prices[itemId]} credits!`, 'success');
      
      // Save player data
      this.savePlayerData();
      
      // Update UI to show owned item
      const button = document.querySelector(`button[onclick="Store.purchaseItem('${itemId}')"]`);
      if (button) {
        button.textContent = 'Owned';
        button.disabled = true;
        button.classList.add('active');
      }
    } else {
      // Show error notification
      Utils.showNotification('Insufficient Credits', `You need ${prices[itemId] - this.playerCredits} more credits to buy this item.`, 'error');
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
      items: this.playerItems
    };
    
    localStorage.setItem('cosmicPongPlayerData', JSON.stringify(playerData));
  },
  
  /**
   * Load player data from localStorage
   */
  loadPlayerData: function() {
    // Load player data from localStorage
    const savedData = localStorage.getItem('cosmicPongPlayerData');
    if (savedData) {
      const data = JSON.parse(savedData);
      this.playerName = data.name || 'Player';
      this.playerAvatar = data.avatar || 'cyan';
      this.playerCredits = data.credits || 1000;
      this.playerItems = data.items || {};
      
      // Update UI
      document.getElementById('playerName').value = this.playerName;
      document.getElementById('playerAvatar').value = this.playerAvatar;
      document.getElementById('playerCredits').textContent = this.playerCredits;
      
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
    }
  },
  
  /**
   * Update player profile
   */
  updateProfile: function() {
    this.playerName = document.getElementById('playerName').value;
    this.playerAvatar = document.getElementById('playerAvatar').value;
    this.savePlayerData();
    
    Utils.showNotification('Profile Updated', 'Your profile has been updated.', 'success');
  }
};