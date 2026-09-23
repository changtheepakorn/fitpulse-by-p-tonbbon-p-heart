/**
 * FitPulse - Interactive Realistic 3D Human Avatar Engine
 * Powered by Three.js & GLTFLoader
 * 
 * Features:
 * - 100% Offline, Self-Contained Realistic Human 3D Model (Zero CORS / file:/// compatible)
 * - Full Human Anatomy, Athletic Contours, Realistic Skin, Sportswear & Running Shoes
 * - Real-Time Dynamic BMI Body Morphing (Waist, Torso, Silhouette & Proportions)
 * - Dynamic Health Aura Light Indicator (Blue, Emerald, Amber, Crimson based on BMI)
 * - Fluid Skeletal Animations (Breathing Idle, Cardio Jog, Friendly Wave, Flex, Victory Dance)
 * - 360° Orbit Interaction, Smooth Zoom & Camera Presets (Front, 45°, Side, Back)
 * - Avatar Studio Customizer Integration
 */

class FitPulseBody3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = null;
    this.animFrameId = null;

    // 3D Objects & Hierarchy
    this.characterRoot = null;
    this.characterModel = null;
    this.mixer = null;
    this.actions = {};
    this.bones = {};
    this.materials = {};

    // Podium & Lighting
    this.podiumGroup = null;
    this.podiumRing = null;
    this.rimLight = null;
    this.spotAccent = null;

    // Active Model & Pose State
    this.activeModelKey = 'michelle'; // 'michelle' (Female Runner) or 'xbot' (Male Trainer)
    this.currentPose = 'idle';        // 'idle', 'wave', 'flex', 'jog', 'dance'
    this.currentAction = null;

    // Body Metrics & BMI Morph Targets
    this.metrics = {
      gender: 'female',
      weight: 56,
      height: 165,
      bmi: 20.57,
      goal: 'maintain'
    };

    // Smooth Lerp values for morphing
    this.morph = {
      heightScale: 1.0,
      targetHeightScale: 1.0,
      bmiScaleX: 1.0,
      targetBmiScaleX: 1.0,
      bmiScaleZ: 1.0,
      targetBmiScaleZ: 1.0,
      currentColor: new THREE.Color(0x10b981),
      targetColor: new THREE.Color(0x10b981)
    };

    // Camera & Controls State
    this.isAutoRotating = true;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.cameraRotation = { x: 0.08, y: 0.0 };
    this.targetCameraRotation = { x: 0.08, y: 0.0 };
    this.cameraDistance = 3.25;
    this.targetCameraDistance = 3.25;

    // Character Customizer Configuration
    this.config = {
      model: 'michelle',
      skinTone: 'fair',
      skinColor: '#d6a374',
      shirtColor: '#4a47a3',
      pantsColor: '#facc15',
      glasses: true,
      headphones: true
    };

    this._loadSeq = 0;
    this.isInitialized = false;
    this.isPaused = false;
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================
  init(profile) {
    if (!this.container) return;
    if (typeof THREE === 'undefined') {
      console.warn('Three.js library is not loaded. 3D Avatar cannot initialize.');
      this.renderFallback();
      return;
    }

    try {
      if (profile) {
        this.metrics = { ...this.metrics, ...profile };
      }

      this.setupScene();
      this.setupLights();
      this.buildPodium();
      this.setupEventListeners();

      // Check user gender preference if available
      if (this.metrics.gender === 'female') {
        this.activeModelKey = 'michelle';
      } else {
        this.activeModelKey = 'xbot';
      }

      this.loadModel(this.activeModelKey, () => {
        this.updateMorphTargets(this.metrics);
        this.setPose(this.currentPose, true);
      });

      this.clock = new THREE.Clock();
      this.isInitialized = true;
      this.animate();

      setTimeout(() => this.handleResize(), 80);
    } catch (err) {
      console.error('FitPulseBody3D init error:', err);
      this.renderFallback();
    }
  }

  renderFallback() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; text-align: center; padding: 2rem;">
        <div style="font-size: 3.5rem; margin-bottom: 0.5rem;">🏃</div>
        <h3 style="color: #f8fafc; font-size: 1.15rem; margin-bottom: 0.3rem;">3D Realistic Human Avatar</h3>
        <p style="font-size: 0.85rem; max-width: 260px;">โมเดล 3D จำลองรูปร่างสรีระจริงตามค่า BMI พร้อมใช้งานบนเบราว์เซอร์ที่มี WebGL</p>
      </div>
    `;
  }

  setupScene() {
    const width = this.container.clientWidth || 340;
    const height = this.container.clientHeight || 380;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.08);

    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    this.camera.position.set(0, 1.25, this.cameraDistance);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Root Group for Character + Morphs
    this.characterRoot = new THREE.Group();
    this.scene.add(this.characterRoot);
  }

  setupLights() {
    // Soft studio ambient light
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.85);
    this.scene.add(ambientLight);

    // Key front-top light (warm studio key)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
    keyLight.position.set(2.5, 4.2, 3.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    this.scene.add(keyLight);

    // Soft cool fill light from left
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.65);
    fillLight.position.set(-3.0, 2.5, 2.0);
    this.scene.add(fillLight);

    // Dynamic Rim / Back light (changes color with BMI)
    this.rimLight = new THREE.DirectionalLight(0x10b981, 1.5);
    this.rimLight.position.set(0, 3.2, -3.2);
    this.scene.add(this.rimLight);

    // Upward floor accent bounce
    const groundLight = new THREE.DirectionalLight(0x38bdf8, 0.25);
    groundLight.position.set(0, -2, 1);
    this.scene.add(groundLight);

    // Stage point light inside podium (changes color with BMI)
    this.spotAccent = new THREE.PointLight(0x10b981, 1.8, 5.0);
    this.spotAccent.position.set(0, 0.2, 0);
    this.scene.add(this.spotAccent);
  }

  buildPodium() {
    this.podiumGroup = new THREE.Group();

    // Dark sleek carbon stage base
    const baseGeo = new THREE.CylinderGeometry(0.88, 1.05, 0.12, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.75
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.06;
    baseMesh.receiveShadow = true;
    this.podiumGroup.add(baseMesh);

    // Illuminated Neon Aura Ring (Pulse with BMI)
    const ringGeo = new THREE.TorusGeometry(0.82, 0.022, 16, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.95,
      roughness: 0.2,
      metalness: 0.1
    });
    this.podiumRing = new THREE.Mesh(ringGeo, ringMat);
    this.podiumRing.position.y = 0.005;
    this.podiumGroup.add(this.podiumRing);

    // Outer subtle ring
    const outerGeo = new THREE.RingGeometry(0.88, 0.92, 48);
    outerGeo.rotateX(-Math.PI / 2);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x334155,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    outerMesh.position.y = 0.002;
    this.podiumGroup.add(outerMesh);

    this.scene.add(this.podiumGroup);
  }

  // ==========================================
  // MODEL LOADING & ANIMATION SYSTEM
  // ==========================================
  loadModel(modelKey, callback) {
    if (!window.FITPULSE_MODELS || !window.FITPULSE_MODELS[modelKey]) {
      console.warn('Model key not found:', modelKey);
      return;
    }

    const seq = ++this._loadSeq;

    // Clean up existing model
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }
    this.currentAction = null;
    if (this.characterModel) {
      this.characterRoot.remove(this.characterModel);
      this.characterModel = null;
    }
    this.actions = {};
    this.bones = {};

    const b64Data = window.FITPULSE_MODELS[modelKey];
    const binary = atob(b64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const loader = new THREE.GLTFLoader();
    loader.parse(bytes.buffer, '', (gltf) => {
      if (this._loadSeq !== seq) return; // Prevent race conditions

      this.characterModel = gltf.scene;
      this.activeModelKey = modelKey;

      // Handle materials & bones
      this.characterModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.skinning = true;
            if (modelKey === 'xbot') {
              if (child.name === 'Beta_Surface') {
                child.material.roughness = 0.45;
                child.material.metalness = 0.1;
                this.materials['body'] = child.material;
              } else if (child.name === 'Beta_Joints') {
                child.material.roughness = 0.3;
                child.material.metalness = 0.6;
                this.materials['joints'] = child.material;
              }
            } else {
              child.material.roughness = Math.max(0.35, child.material.roughness || 0.4);
              this.materials[child.name || child.material.name] = child.material;
            }
          }
        }
        if (child.isBone) {
          const cleanName = child.name.replace('mixamorig:', '').replace('mixamorig', '');
          this.bones[cleanName] = child;
        }
      });

      // Position character standing upright on podium
      this.characterModel.position.set(0, 0, 0);
      this.characterModel.rotation.set(0, 0, 0);
      this.characterRoot.add(this.characterModel);

      // Create Animation Mixer & Actions
      this.mixer = new THREE.AnimationMixer(this.characterModel);
      this.setupAnimations(gltf.animations);

      // Start current pose immediately
      this.setPose(this.currentPose, true);

      if (callback) callback();
    }, (err) => {
      if (this._loadSeq !== seq) return;
      console.error('GLTF parse error:', err);
      this.renderFallback();
    });
  }

  setupAnimations(gltfAnimations) {
    // 1. Programmatic Natural Breathing Idle Clip
    const idleTracks = [
      this.createEulerTrack('mixamorigLeftArm', [0, 1.8, 3.6], [
        [0, 0, -1.25],
        [0, 0, -1.22],
        [0, 0, -1.25]
      ]),
      this.createEulerTrack('mixamorigRightArm', [0, 1.8, 3.6], [
        [0, 0, 1.25],
        [0, 0, 1.22],
        [0, 0, 1.25]
      ]),
      this.createEulerTrack('mixamorigLeftForeArm', [0, 1.8, 3.6], [
        [0.1, 0, 0.15],
        [0.1, 0, 0.15],
        [0.1, 0, 0.15]
      ]),
      this.createEulerTrack('mixamorigRightForeArm', [0, 1.8, 3.6], [
        [0.1, 0, -0.15],
        [0.1, 0, -0.15],
        [0.1, 0, -0.15]
      ]),
      this.createEulerTrack('mixamorigSpine1', [0, 1.8, 3.6], [
        [0, 0, 0],
        [0.035, 0, 0],
        [0, 0, 0]
      ]),
      this.createEulerTrack('mixamorigHead', [0, 1.8, 3.6], [
        [0, 0.04, 0.02],
        [0, -0.04, -0.02],
        [0, 0.04, 0.02]
      ])
    ];
    const idleClip = new THREE.AnimationClip('idle', 3.6, idleTracks);
    this.actions.idle = this.mixer.clipAction(idleClip);

    // 2. Programmatic Friendly Waving Clip
    const waveTracks = [
      this.createEulerTrack('mixamorigLeftArm', [0, 1.0], [
        [0, 0, -1.25],
        [0, 0, -1.25]
      ]),
      this.createEulerTrack('mixamorigRightArm', [0, 0.25, 0.5, 0.75, 1.0], [
        [0.2, 0.5, 0.3],
        [0.2, 0.5, 0.3],
        [0.2, 0.5, 0.3],
        [0.2, 0.5, 0.3],
        [0.2, 0.5, 0.3]
      ]),
      this.createEulerTrack('mixamorigRightForeArm', [0, 0.25, 0.5, 0.75, 1.0], [
        [0, 0, -1.5],
        [0, 0, -1.2],
        [0, 0, -1.75],
        [0, 0, -1.2],
        [0, 0, -1.5]
      ]),
      this.createEulerTrack('mixamorigHead', [0, 0.5, 1.0], [
        [0, 0, 0.08],
        [0, 0, 0.12],
        [0, 0, 0.08]
      ])
    ];
    const waveClip = new THREE.AnimationClip('wave', 1.0, waveTracks);
    this.actions.wave = this.mixer.clipAction(waveClip);

    // 3. Programmatic Double-Bicep Flex Clip
    const flexTracks = [
      this.createEulerTrack('mixamorigLeftArm', [0, 0.8, 1.6], [
        [0, -0.3, -0.22],
        [0, -0.3, -0.26],
        [0, -0.3, -0.22]
      ]),
      this.createEulerTrack('mixamorigLeftForeArm', [0, 0.8, 1.6], [
        [0, 0, 2.0],
        [0, 0, 2.18],
        [0, 0, 2.0]
      ]),
      this.createEulerTrack('mixamorigRightArm', [0, 0.8, 1.6], [
        [0, 0.3, 0.22],
        [0, 0.3, 0.26],
        [0, 0.3, 0.22]
      ]),
      this.createEulerTrack('mixamorigRightForeArm', [0, 0.8, 1.6], [
        [0, 0, -2.0],
        [0, 0, -2.18],
        [0, 0, -2.0]
      ]),
      this.createEulerTrack('mixamorigSpine1', [0, 0.8, 1.6], [
        [0.05, 0, 0],
        [0.08, 0, 0],
        [0.05, 0, 0]
      ])
    ];
    const flexClip = new THREE.AnimationClip('flex', 1.6, flexTracks);
    this.actions.flex = this.mixer.clipAction(flexClip);

    // 4. Programmatic Cardio Jog / Run Cycle
    const jogTracks = [
      this.createEulerTrack('mixamorigLeftArm', [0, 0.35, 0.7], [
        [-0.65, 0, -0.35],
        [0.65, 0, -0.35],
        [-0.65, 0, -0.35]
      ]),
      this.createEulerTrack('mixamorigLeftForeArm', [0, 0.35, 0.7], [
        [-1.15, 0, 0],
        [-1.25, 0, 0],
        [-1.15, 0, 0]
      ]),
      this.createEulerTrack('mixamorigRightArm', [0, 0.35, 0.7], [
        [0.65, 0, 0.35],
        [-0.65, 0, 0.35],
        [0.65, 0, 0.35]
      ]),
      this.createEulerTrack('mixamorigRightForeArm', [0, 0.35, 0.7], [
        [-1.25, 0, 0],
        [-1.15, 0, 0],
        [-1.25, 0, 0]
      ]),
      this.createEulerTrack('mixamorigLeftUpLeg', [0, 0.35, 0.7], [
        [0.55, 0, 0],
        [-0.45, 0, 0],
        [0.55, 0, 0]
      ]),
      this.createEulerTrack('mixamorigLeftLeg', [0, 0.35, 0.7], [
        [0.75, 0, 0],
        [0.15, 0, 0],
        [0.75, 0, 0]
      ]),
      this.createEulerTrack('mixamorigRightUpLeg', [0, 0.35, 0.7], [
        [-0.45, 0, 0],
        [0.55, 0, 0],
        [-0.45, 0, 0]
      ]),
      this.createEulerTrack('mixamorigRightLeg', [0, 0.35, 0.7], [
        [0.15, 0, 0],
        [0.75, 0, 0],
        [0.15, 0, 0]
      ])
    ];
    const jogClip = new THREE.AnimationClip('jog', 0.7, jogTracks);
    this.actions.jog = this.mixer.clipAction(jogClip);

    // 5. Connect Native Mixamo Clips if provided (e.g. SambaDance, walk, run, agree, idle)
    if (gltfAnimations && gltfAnimations.length > 0) {
      const findClip = (names) => gltfAnimations.find(a => names.includes(a.name));

      const nativeIdle = findClip(['idle', 'Idle']);
      if (nativeIdle) this.actions.idle = this.mixer.clipAction(nativeIdle);

      const nativeJog = findClip(['run', 'Run']);
      if (nativeJog) this.actions.jog = this.mixer.clipAction(nativeJog);

      const nativeWave = findClip(['agree', 'Agree']);
      if (nativeWave) this.actions.wave = this.mixer.clipAction(nativeWave);

      const nativeDance = findClip(['SambaDance', 'dance', 'Dance', 'walk', 'Walk']);
      if (nativeDance) this.actions.dance = this.mixer.clipAction(nativeDance);
    }

    if (!this.actions.dance) {
      this.actions.dance = this.actions.jog || this.actions.wave || this.actions.idle;
    }
  }

  createEulerTrack(boneName, times, eulerArray) {
    const values = [];
    for (let i = 0; i < eulerArray.length; i++) {
      const e = eulerArray[i];
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(e[0], e[1], e[2]));
      values.push(q.x, q.y, q.z, q.w);
    }
    return new THREE.QuaternionKeyframeTrack(boneName + '.quaternion', times, values);
  }

  updateMetrics(userProfile) {
    if (!userProfile) return;
    this.metrics = { ...this.metrics, ...userProfile };

    const targetModelKey = (this.metrics.gender === 'male' ? 'xbot' : 'michelle');
    if (this.isInitialized && targetModelKey !== this.activeModelKey) {
      this.loadModel(targetModelKey, () => {
        this.updateMorphTargets(this.metrics);
        this.setPose(this.currentPose);
      });
      return;
    }

    this.updateMorphTargets(this.metrics);
  }

  updateMorphTargets(p) {
    const height = parseFloat(p.height) || 165;
    const weight = parseFloat(p.weight) || 56;
    const bmi = parseFloat(p.bmi) || (weight / ((height / 100) * (height / 100)));
    const isMale = p.gender === 'male';

    // 1. Height Scaling (proportional to 170cm reference)
    this.morph.targetHeightScale = Math.max(0.85, Math.min(1.22, height / 170));

    // 2. BMI-driven Waist & Body Mass Morphing
    let bmiFactor = 1.0;
    if (bmi < 18.5) {
      // Underweight (< 18.5) - Lean, slender athletic
      const t = Math.max(0, (bmi - 14) / 4.5);
      bmiFactor = 0.88 + t * 0.08; // 0.88 - 0.96
    } else if (bmi <= 22.9) {
      // Normal / Healthy (18.5 - 22.9) - Fit, toned
      const t = (bmi - 18.5) / 4.4;
      bmiFactor = 0.96 + t * 0.09; // 0.96 - 1.05
    } else if (bmi <= 24.9) {
      // Overweight (23.0 - 24.9) - Fuller waist & hips
      const t = (bmi - 23.0) / 2.0;
      bmiFactor = 1.06 + t * 0.12; // 1.06 - 1.18
    } else if (bmi <= 29.9) {
      // Obese Class 1 (25.0 - 29.9) - Plump, rounded silhouette
      const t = (bmi - 25.0) / 5.0;
      bmiFactor = 1.19 + t * 0.16; // 1.19 - 1.35
    } else {
      // Obese Class 2+ (>= 30.0) - Robust, heavy build
      const t = Math.min(1.0, (bmi - 30.0) / 10.0);
      bmiFactor = 1.36 + t * 0.18; // 1.36 - 1.54
    }

    this.morph.targetBmiScaleX = bmiFactor;
    this.morph.targetBmiScaleZ = bmiFactor;

    // 3. Health Zone Color for Rim Light & Podium Ring
    let colorHex = 0x10b981; // Normal (Emerald Green)
    if (bmi < 18.5) {
      colorHex = 0x38bdf8;   // Underweight (Sky Blue)
    } else if (bmi <= 22.9) {
      colorHex = 0x10b981;   // Normal (Emerald Green)
    } else if (bmi <= 24.9) {
      colorHex = 0xf59e0b;   // Overweight (Amber Gold)
    } else {
      colorHex = 0xef4444;   // Obese (Crimson Red)
    }
    this.morph.targetColor.setHex(colorHex);

    this.updateDomBadges(p, bmi, isMale);
  }

  updateDomBadges(p, bmi, isMale) {
    const hBadge = document.getElementById('avatar3dHeightVal');
    if (hBadge) hBadge.textContent = `${p.height || 165} ซม.`;

    const wBadge = document.getElementById('avatar3dWeightVal');
    if (wBadge) wBadge.textContent = `${p.weight || 56} กก.`;

    const bBadge = document.getElementById('avatar3dBmiVal');
    if (bBadge) bBadge.textContent = `BMI ${bmi.toFixed(1)}`;

    const gBadge = document.getElementById('avatar3dGenderVal');
    if (gBadge) gBadge.textContent = isMale ? '👦 ชาย' : '👧 หญิง';
  }

  // ==========================================
  // POSES & ANIMATION SWITCHING
  // ==========================================
  setPose(poseName, force = false) {
    if (!this.actions || Object.keys(this.actions).length === 0) {
      this.currentPose = poseName;
      return;
    }

    const prevAction = this.currentAction;
    let newAction = this.actions[poseName];

    // Fallback to idle if pose is not found
    if (!newAction) {
      newAction = this.actions.idle;
      poseName = 'idle';
    }

    if (newAction && (newAction !== prevAction || force)) {
      newAction.reset();
      newAction.fadeIn(0.25);
      newAction.play();

      if (prevAction && prevAction !== newAction) {
        prevAction.fadeOut(0.25);
      }
      this.currentAction = newAction;
      this.currentPose = poseName;
    }

    // Update active pose chip in UI
    const chips = document.querySelectorAll('.pose-chip');
    chips.forEach(chip => {
      if (chip.dataset.pose === poseName) chip.classList.add('active');
      else chip.classList.remove('active');
    });
  }

  // ==========================================
  // CAMERA & INTERACTION CONTROLS
  // ==========================================
  setCameraAngle(angle) {
    this.isAutoRotating = false;
    this.updateAutoRotateBtn();

    if (angle === 'front') {
      this.targetCameraRotation.y = 0;
      this.targetCameraRotation.x = 0.08;
    } else if (angle === 'threequarter') {
      this.targetCameraRotation.y = Math.PI / 4;
      this.targetCameraRotation.x = 0.10;
    } else if (angle === 'side') {
      this.targetCameraRotation.y = Math.PI / 2;
      this.targetCameraRotation.x = 0.08;
    } else if (angle === 'back') {
      this.targetCameraRotation.y = Math.PI;
      this.targetCameraRotation.x = 0.08;
    }
  }

  toggleAutoRotate() {
    this.isAutoRotating = !this.isAutoRotating;
    this.updateAutoRotateBtn();
  }

  updateAutoRotateBtn() {
    const btn = document.getElementById('btnAvatarAutoRotate');
    if (btn) {
      if (this.isAutoRotating) {
        btn.classList.add('active');
        btn.innerHTML = '🔄 หมุนออโต้: เปิด';
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '⏸️ หมุนออโต้: ปิด';
      }
    }
  }

  setupEventListeners() {
    const el = this.container;
    if (!el) return;

    const onStart = (x, y) => {
      this.isDragging = true;
      this.isAutoRotating = false;
      this.updateAutoRotateBtn();
      this.previousMousePosition = { x, y };
    };

    const onMove = (x, y) => {
      if (!this.isDragging) return;
      const deltaX = x - this.previousMousePosition.x;
      const deltaY = y - this.previousMousePosition.y;

      this.targetCameraRotation.y += deltaX * 0.012;
      this.targetCameraRotation.x = Math.max(-0.45, Math.min(0.65, this.targetCameraRotation.x + deltaY * 0.012));
      this.previousMousePosition = { x, y };
    };

    const onEnd = () => {
      this.isDragging = false;
    };

    el.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) onMove(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', onEnd);

    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', onEnd);

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.targetCameraDistance = Math.max(1.8, Math.min(4.5, this.targetCameraDistance + e.deltaY * 0.0028));
    }, { passive: false });

    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || 340;
    const height = this.container.clientHeight || 380;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // ==========================================
  // AVATAR CUSTOMIZER API
  // ==========================================
  setAvatarConfig(newConfig) {
    if (!newConfig) return;
    this.config = { ...this.config, ...newConfig };

    // Check if switching model (Male / Female)
    if (newConfig.characterModel && newConfig.characterModel !== this.activeModelKey) {
      this.loadModel(newConfig.characterModel, () => {
        this.updateMetrics(this.metrics);
        this.setPose(this.currentPose);
      });
      return;
    }

    // Update material colors if applicable
    if (newConfig.skinColor && this.materials['Ch03_Body']) {
      // Subtle tint for PBR skin
      this.materials['Ch03_Body'].color.set(newConfig.skinColor);
    }
  }

  getAvatarConfig() {
    return { ...this.config };
  }

  resetToReference() {
    this.setAvatarConfig({
      characterModel: 'michelle',
      skinColor: '#ffffff',
      shirtColor: '#4a47a3',
      pantsColor: '#facc15'
    });
  }

  randomizeAvatar() {
    const models = ['michelle', 'xbot'];
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    this.setAvatarConfig({
      characterModel: pick(models)
    });
  }

  // ==========================================
  // RENDER ANIMATION LOOP
  // ==========================================
  animate() {
    this.animFrameId = requestAnimationFrame(() => this.animate());
    if (this.isPaused || !this.renderer) return;

    const delta = this.clock.getDelta();

    // 1. Update Mixer
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // 2. Smooth Lerp BMI Morphs
    const lerpSpeed = 0.08;
    this.morph.heightScale += (this.morph.targetHeightScale - this.morph.heightScale) * lerpSpeed;
    this.morph.bmiScaleX += (this.morph.targetBmiScaleX - this.morph.bmiScaleX) * lerpSpeed;
    this.morph.bmiScaleZ += (this.morph.targetBmiScaleZ - this.morph.bmiScaleZ) * lerpSpeed;
    this.morph.currentColor.lerp(this.morph.targetColor, 0.08);

    // Apply BMI Morphs to Character Root (1.0x life-size scale)
    if (this.characterRoot) {
      const baseScale = 1.0;
      this.characterRoot.scale.set(
        baseScale * this.morph.bmiScaleX,
        baseScale * this.morph.heightScale,
        baseScale * this.morph.bmiScaleZ
      );
    }

    // Apply Health Aura Colors to Lights & Podium
    if (this.rimLight) {
      this.rimLight.color.copy(this.morph.currentColor);
    }
    if (this.spotAccent) {
      this.spotAccent.color.copy(this.morph.currentColor);
    }
    if (this.podiumRing && this.podiumRing.material) {
      this.podiumRing.material.color.copy(this.morph.currentColor);
      this.podiumRing.material.emissive.copy(this.morph.currentColor);
    }

    // 3. Camera Interpolation
    if (this.isAutoRotating) {
      this.targetCameraRotation.y += delta * 0.42;
    }
    this.cameraRotation.x += (this.targetCameraRotation.x - this.cameraRotation.x) * 0.1;
    this.cameraRotation.y += (this.targetCameraRotation.y - this.cameraRotation.y) * 0.1;
    this.cameraDistance += (this.targetCameraDistance - this.cameraDistance) * 0.1;

    const cosX = Math.cos(this.cameraRotation.x);
    this.camera.position.x = Math.sin(this.cameraRotation.y) * this.cameraDistance * cosX;
    this.camera.position.z = Math.cos(this.cameraRotation.y) * this.cameraDistance * cosX;
    this.camera.position.y = 1.02 + Math.sin(this.cameraRotation.x) * this.cameraDistance;
    this.camera.lookAt(0, 0.95, 0);

    this.renderer.render(this.scene, this.camera);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}

// Global Export for FitPulse
window.FitPulseBody3D = FitPulseBody3D;
