// Renderer & Visual Effects
const Renderer = {
  // Main Three.js objects
  scene: null,
  camera: null,
  renderer: null,
  gameScene: null,
  
  // Game objects
  particles: null,  // Ball trail particles
  
  /**
   * Initialize the renderer
   */
  init: function() {
    // Get the canvas
    const canvas = document.getElementById('gameCanvas');
    
    // Create Three.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000033);
    this.scene.fog = new THREE.FogExp2(0x000033, 0.01);
    
    // Create camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.z = 60;
    this.camera.position.y = 20;
    this.camera.lookAt(0, 0, 0);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = Settings.settings.graphics.enableShadows;
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Create game scene group
    this.gameScene = new THREE.Group();
    this.scene.add(this.gameScene);
    
    // Create ambient light
    const ambientLight = new THREE.AmbientLight(0x333344, 0.5);
    this.scene.add(ambientLight);
    
    // Create directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 50);
    directionalLight.castShadow = Settings.settings.graphics.enableShadows;
    this.scene.add(directionalLight);
    
    // Add point lights for glow effect
    const pointLight1 = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight1.position.set(-30, 10, 20);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff00ff, 1, 100);
    pointLight2.position.set(30, 10, 20);
    this.scene.add(pointLight2);
    
    // Create the starfield background
    this.createStarfield();
    
    // Position game scene
    this.gameScene.position.y = -10;
  },
  
  /**
   * Create starfield background
   */
  createStarfield: function() {
    // Create star particles
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.2,
      transparent: true,
      opacity: 0.8,
      map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png'),
      blending: THREE.AdditiveBlending
    });
    
    // Generate random stars
    const starPositions = [];
    const starCount = 2000;
    const starSpread = 300;
    
    for (let i = 0; i < starCount; i++) {
      const x = THREE.MathUtils.randFloatSpread(starSpread);
      const y = THREE.MathUtils.randFloatSpread(starSpread);
      const z = THREE.MathUtils.randFloatSpread(starSpread) - 100; // Move stars behind the game
      
      starPositions.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(stars);
  },
  
  /**
   * Create the game field
   */
  createGameField: function() {
    // Create game field
    const fieldGeometry = new THREE.BoxGeometry(Constants.FIELD_WIDTH, Constants.FIELD_HEIGHT, Constants.FIELD_DEPTH);
    
    // Create glowing wireframe material
    const edgesMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00fcff,
      transparent: true,
      opacity: 0.3
    });
    
    // Create edges geometry
    const edges = new THREE.EdgesGeometry(fieldGeometry);
    const wireframe = new THREE.LineSegments(edges, edgesMaterial);
    this.gameScene.add(wireframe);
    Game.gameField = wireframe;
    
    // Create center line
    const centerLineGeometry = new THREE.PlaneGeometry(0.3, Constants.FIELD_HEIGHT, 1, 10);
    const centerLineMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00fcff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const centerLine = new THREE.Mesh(centerLineGeometry, centerLineMaterial);
    centerLine.rotation.y = Math.PI / 2;
    this.gameScene.add(centerLine);
    
    // Create center circle
    const centerCircleGeometry = new THREE.RingGeometry(7, 7.3, 32);
    const centerCircleMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00fcff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const centerCircle = new THREE.Mesh(centerCircleGeometry, centerCircleMaterial);
    centerCircle.rotation.x = Math.PI / 2;
    this.gameScene.add(centerCircle);
    
    // Create floor with grid texture
    const floorGeometry = new THREE.PlaneGeometry(Constants.FIELD_WIDTH, Constants.FIELD_HEIGHT);
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: 0x000066,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -Constants.FIELD_DEPTH / 2;
    this.gameScene.add(floor);
    
    // Create grid lines on floor
    const gridHelper = new THREE.GridHelper(Constants.FIELD_WIDTH, 20, 0x00fcff, 0x00fcff);
    gridHelper.position.y = -Constants.FIELD_DEPTH / 2 + 0.01;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.1;
    this.gameScene.add(gridHelper);
  },
  
  /**
   * Create paddles
   */
  createPaddles: function() {
    // Create paddle geometry
    const paddleGeometry = new THREE.BoxGeometry(
      Constants.PADDLE_WIDTH, 
      Constants.PADDLE_HEIGHT, 
      Constants.PADDLE_DEPTH
    );
    
    // Create left paddle with glow effect
    const leftPaddleMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00fcff,
      emissive: 0x00fcff,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9,
      shininess: 50
    });
    
    Game.leftPaddle = new THREE.Mesh(paddleGeometry, leftPaddleMaterial);
    Game.leftPaddle.position.set(-Constants.FIELD_WIDTH / 2 + 3, 0, 0);
    Game.leftPaddle.castShadow = Settings.settings.graphics.enableShadows;
    Game.leftPaddle.receiveShadow = Settings.settings.graphics.enableShadows;
    Game.leftPaddle.userData = {
      speed: Constants.PADDLE_SPEED,
      direction: 0,
      score: 0,
      height: Constants.PADDLE_HEIGHT,
      isAI: true,
      difficulty: Settings.settings.ai.leftDifficulty,
      activePowerUps: [],
      isFrozen: false,
      frozenUntil: 0
    };
    this.gameScene.add(Game.leftPaddle);
    
    // Create right paddle with glow effect
    const rightPaddleMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9,
      shininess: 50
    });
    
    Game.rightPaddle = new THREE.Mesh(paddleGeometry, rightPaddleMaterial);
    Game.rightPaddle.position.set(Constants.FIELD_WIDTH / 2 - 3, 0, 0);
    Game.rightPaddle.castShadow = Settings.settings.graphics.enableShadows;
    Game.rightPaddle.receiveShadow = Settings.settings.graphics.enableShadows;
    Game.rightPaddle.userData = {
      speed: Constants.PADDLE_SPEED,
      direction: 0,
      score: 0,
      height: Constants.PADDLE_HEIGHT,
      isAI: true,
      difficulty: Settings.settings.ai.rightDifficulty,
      activePowerUps: [],
      isFrozen: false,
      frozenUntil: 0
    };
    this.gameScene.add(Game.rightPaddle);
  },
  
  /**
   * Create the ball
   */
  createBall: function() {
    // Create ball geometry
    const ballGeometry = new THREE.SphereGeometry(
      Constants.BALL_RADIUS, 
      Constants.BALL_SEGMENTS, 
      Constants.BALL_SEGMENTS
    );
    
    // Create ball material with glow effect
    const ballMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      emissive: 0xffffaa,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9,
      shininess: 80
    });
    
    Game.ball = new THREE.Mesh(ballGeometry, ballMaterial);
    Game.ball.castShadow = Settings.settings.graphics.enableShadows;
    Game.ball.receiveShadow = Settings.settings.graphics.enableShadows;
    Game.ball.userData = {
      velocity: new THREE.Vector3(Settings.settings.game.baseBallSpeed, 0, 0),
      baseSpeed: Settings.settings.game.baseBallSpeed,
      speed: Settings.settings.game.baseBallSpeed,
      isGhost: false,
      ghostOpacity: 1
    };
    this.gameScene.add(Game.ball);
    
    // Create ball trail if particles are enabled
    if (Settings.settings.graphics.enableParticles) {
      this.createBallTrail();
    }
  },
  
  /**
   * Create ball trail
   */
  createBallTrail: function() {
    // Create particle system for the ball trail
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.6,
      map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/spark1.png'),
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    // Create particle positions
    const positions = new Float32Array(particleCount * 3);
    const alphas = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = Game.ball.position.x;
      positions[i * 3 + 1] = Game.ball.position.y;
      positions[i * 3 + 2] = Game.ball.position.z;
      alphas[i] = 0;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    
    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.gameScene.add(this.particles);
  },
  
  /**
   * Update ball trail
   */
  updateBallTrail: function() {
    if (!this.particles || !Settings.settings.graphics.enableParticles) return;
    
    const positions = this.particles.geometry.attributes.position.array;
    const alphas = this.particles.geometry.attributes.alpha.array;
    const count = positions.length / 3;
    
    // Move all particles one step in the trail
    for (let i = count - 1; i > 0; i--) {
      positions[i * 3] = positions[(i - 1) * 3];
      positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
      positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
      alphas[i] = alphas[i - 1] * 0.95;
    }
    
    // Set the first particle position to the ball's current position
    positions[0] = Game.ball.position.x;
    positions[1] = Game.ball.position.y;
    positions[2] = Game.ball.position.z;
    alphas[0] = 1.0;
    
    // Update the colors based on ball speed
    const speed = Game.ball.userData.velocity.length();
    const normalizedSpeed = Math.min(1.0, speed / 15);
    const color = new THREE.Color();
    
    if (normalizedSpeed < 0.3) {
      color.setHSL(0.6, 1, 0.5); // Blue
    } else if (normalizedSpeed < 0.6) {
      color.setHSL(0.3, 1, 0.5); // Green
    } else {
      color.setHSL(0.0, 1, 0.5); // Red
    }
    
    this.particles.material.color = color;
    
    // Update the geometry
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.alpha.needsUpdate = true;
  },
  
  /**
   * Update menu animation
   * @param {number} deltaTime - Time since last frame
   */
  updateMenu: function(deltaTime) {
    // Rotate the game field for a cool effect
    if (Game.gameField) {
      Game.gameField.rotation.y += deltaTime * 0.2;
    }
    
    // Make camera slowly move around
    const t = Date.now() * 0.0005;
    this.camera.position.x = Math.sin(t) * 20;
    this.camera.position.z = 60 + Math.cos(t) * 10;
    this.camera.lookAt(0, 0, 0);
    
    // Add some subtle movement to lights
    this.scene.children.forEach(child => {
      if (child.type === 'PointLight') {
        child.position.y = 10 + Math.sin(t * 0.5 + child.position.x * 0.1) * 5;
      }
    });
  },
  
  /**
   * Render the scene
   */
  render: function() {
    this.renderer.render(this.scene, this.camera);
  }
};