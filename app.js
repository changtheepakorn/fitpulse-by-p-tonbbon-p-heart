/**
 * FitPulse - Core Application Logic
 * Nutrition Tracker with Grams (g) -> Calorie & 100% Macro Ratio Calculation
 * Mobile-First Responsive Fitness App with Workout Roulette, Recommendations & Daily History Analytics
 */

// Sound Synthesizer using Web Audio API
class SoundFx {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  playFanfare() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startTime = this.ctx.currentTime + (idx * 0.1);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch (e) {}
  }

  playAlarm() {
    try {
      this.init();
      if (!this.ctx) return;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime + i * 0.25);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime + i * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.25 + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.25);
        osc.stop(this.ctx.currentTime + i * 0.25 + 0.18);
      }
    } catch (e) {}
  }
}

const sfx = new SoundFx();

// Exercise Database with Accurate METs
const EXERCISES = [
  {
    id: 'jump_rope',
    name: 'กระโดดเชือก',
    engName: 'Jump Rope',
    icon: '🪢',
    met: 11.0,
    category: 'คาร์ดิโอหนัก',
    color: '#ef4444',
    desc: 'การออกกำลังกายที่เบิร์นแคลอรีได้ไวที่สุด ฝึกกล้ามเนื้อน่อง แกนกลางลำตัว และระบบไหลเวียนโลหิต'
  },
  {
    id: 'jogging',
    name: 'วิ่งจ๊อกกิ้ง',
    engName: 'Jogging (8 km/h)',
    icon: '🏃',
    met: 8.5,
    category: 'คาร์ดิโอ',
    color: '#f97316',
    desc: 'ช่วยเสริมความแข็งแรงของหัวใจและปอด เพิ่มอัตราการเผาผลาญไขมันสะสมได้อย่างต่อเนื่อง'
  },
  {
    id: 'hiit',
    name: 'HIIT & บอดี้เวท',
    engName: 'HIIT Workout',
    icon: '🔥',
    met: 9.5,
    category: 'เข้มข้นสูง',
    color: '#e11d48',
    desc: 'สลับความหนักเบา เช่น เบอร์ปี (Burpees), สควอทจัมพ์, เมาน์เทนไคลม์เบอร์ สร้างปรากฏการณ์ Afterburn'
  },
  {
    id: 'cycling',
    name: 'ปั่นจักรยานเร็ว',
    engName: 'Cycling (~20 km/h)',
    icon: '🚴',
    met: 7.5,
    category: 'แรงกระแทกต่ำ',
    color: '#3b82f6',
    desc: 'เซฟข้อเข่า บริหารกล้ามเนื้อต้นขาและสะโพก พร้อมเบิร์นพลังงานได้ยอดเยี่ยม'
  },
  {
    id: 'aerobics',
    name: 'เต้นแอโรบิก / ซุมบ้า',
    engName: 'Aerobic / Zumba',
    icon: '💃',
    met: 6.5,
    category: 'คาร์ดิโอสนุกสนาน',
    color: '#ec4899',
    desc: 'ขยับร่างกายตามจังหวะเพลง ช่วยคลายเครียด เผาผลาญไขมันทั่วร่าง และฝึกความยืดหยุ่น'
  },
  {
    id: 'swimming',
    name: 'ว่ายน้ำฟรีสไตล์',
    engName: 'Freestyle Swimming',
    icon: '🏊',
    met: 7.0,
    category: 'ฟูลบอดี้',
    color: '#06b6d4',
    desc: 'บริหารกล้ามเนื้อทุกส่วนโดยไร้แรงกระแทกต่อข้อต่อ ดีต่อสุขภาพปอดและหลัง'
  },
  {
    id: 'stair_climb',
    name: 'ขึ้นบันได / เดินชัน',
    engName: 'Stair Climbing',
    icon: '🧗',
    met: 8.0,
    category: 'กล้ามเนื้อ & หัวใจ',
    color: '#8b5cf6',
    desc: 'การก้าวขึ้นบันไดหรือลู่วิ่งปรับชัน บริหารกล้ามเนื้อบั้นท้ายและต้นขาได้อย่างทรงพลัง'
  },
  {
    id: 'shadow_box',
    name: 'ชกมวย / ชาโดว์บ็อกซิ่ง',
    engName: 'Shadow Boxing',
    icon: '🥊',
    met: 8.5,
    category: 'ฟูลบอดี้ & คล่องตัว',
    color: '#10b981',
    desc: 'ออกหมัด แย็บ ฮุก หลบหลีก ฝึกกล้ามเนื้อหัวไหล่ แขน ลำตัว และฝึกสมาธิความไว'
  }
];

// Healthy Food Recommendations Database
const HEALTHY_FOODS = [
  {
    name: 'ไข่ต้ม 2 ฟอง',
    carbGram: 2,
    proteinGram: 14,
    fiberGram: 0,
    category: 'protein',
    icon: '🥚',
    desc: 'โปรตีนคุณภาพสูง มีกรดอะมิโนครบถ้วน ช่วยซ่อมแซมกล้ามเนื้อและอิ่มท้องนาน'
  },
  {
    name: 'อกไก่นุ่มฉีก (100g)',
    carbGram: 0,
    proteinGram: 25,
    fiberGram: 0,
    category: 'protein',
    icon: '🍗',
    desc: 'โปรตีนลีนไขมันต่ำมาก เหมาะที่สุดสำหรับการเสริมกล้ามเนื้อโดยไม่เพิ่มไขมัน'
  },
  {
    name: 'กรีกโยเกิร์ตธรรมชาติ (150g)',
    carbGram: 8,
    proteinGram: 16,
    fiberGram: 0,
    category: 'protein',
    icon: '🥣',
    desc: 'โปรตีนสูงกว่าโยเกิร์ตทั่วไป 2 เท่า มีโพรไบโอติกส์ช่วยดูแลระบบลำไส้'
  },
  {
    name: 'นมถั่วเหลืองไม่ใส่น้ำตาล (250ml)',
    carbGram: 6,
    proteinGram: 12,
    fiberGram: 2,
    category: 'protein',
    icon: '🥛',
    desc: 'โปรตีนจากพืช ย่อยง่าย ไม่มีคอเลสเตอรอล อุดมด้วยไอโซฟลาโวน'
  },
  {
    name: 'กล้วยหอม 1 ลูก (120g)',
    carbGram: 28,
    proteinGram: 1,
    fiberGram: 4,
    category: 'carbs',
    icon: '🍌',
    desc: 'คาร์บดูดซึมเร็วปานกลาง อุดมด้วยโพแทสเซียม ลดอาการกล้ามเนื้อเกร็ง'
  },
  {
    name: 'มันหวานญี่ปุ่นนึ่ง (120g)',
    carbGram: 30,
    proteinGram: 2,
    fiberGram: 4,
    category: 'carbs',
    icon: '🍠',
    desc: 'คาร์โบไฮเดรตเชิงซ้อน ค่า GI ต่ำ ให้พลังงานคงที่ อยู่ท้องยาวนาน'
  },
  {
    name: 'ขนมปังโฮลวีท 2 แผ่น (60g)',
    carbGram: 26,
    proteinGram: 6,
    fiberGram: 4,
    category: 'carbs',
    icon: '🍞',
    desc: 'คาร์บเชิงซ้อนและใยอาหาร ช่วยรักษาระดับน้ำตาลในเลือดไม่ให้เหวี่ยง'
  },
  {
    name: 'แอปเปิ้ลเขียว 1 ผล (150g)',
    carbGram: 18,
    proteinGram: 1,
    fiberGram: 5,
    category: 'fiber',
    icon: '🍏',
    desc: 'น้ำตาลต่ำ ใยอาหารเพคตินสูง ช่วยระบบขับถ่ายและดักจับไขมันส่วนเกิน'
  },
  {
    name: 'ฝรั่งสด 1 ผล (150g)',
    carbGram: 16,
    proteinGram: 3,
    fiberGram: 8,
    category: 'fiber',
    icon: '🍈',
    desc: 'วิตามินซีสูงลิบ ใยอาหารแน่น เคี้ยวเพลิน อิ่มสบายท้อง'
  },
  {
    name: 'สลัดผักรวมน้ำใส (150g)',
    carbGram: 10,
    proteinGram: 3,
    fiberGram: 20,
    category: 'fiber',
    icon: '🥗',
    desc: 'ไฟเบอร์จัดเต็มและสารต้านอนุมูลอิสระ เพิ่มความสดชื่นและช่วยระบบขับถ่าย'
  },
  {
    name: 'อัลมอนด์อบ (30g / 1 กำมือ)',
    carbGram: 6,
    proteinGram: 6,
    fiberGram: 4,
    category: 'protein',
    icon: '🥜',
    desc: 'ไขมันดี (HDL) โปรตีนพืช และวิตามินอี บำรุงหัวใจและผิวพรรณ'
  },
  {
    name: 'ถั่วแระญี่ปุ่นนึ่ง (100g)',
    carbGram: 10,
    proteinGram: 11,
    fiberGram: 5,
    category: 'fiber',
    icon: '🫛',
    desc: 'ของว่างเคี้ยวเพลินที่ได้ทั้งโปรตีนและไฟเบอร์คู่กันอย่างลงตัว'
  }
];

// Popular Thai Food Presets with Standard Grams
const FOOD_PRESETS = [
  { name: 'ข้าวกะเพราอกไก่ + ไข่ดาว', carbGram: 85, proteinGram: 45, fiberGram: 30 },
  { name: 'ข้าวผัดกุ้ง / หมู', carbGram: 95, proteinGram: 35, fiberGram: 25 },
  { name: 'ข้าวมันไก่ตอน', carbGram: 90, proteinGram: 45, fiberGram: 15 },
  { name: 'ข้าวมันไก่ต้ม (ไม่เอาหนัง)', carbGram: 85, proteinGram: 40, fiberGram: 15 },
  { name: 'ก๋วยเตี๋ยวน้ำใส อกไก่/หมูสับ', carbGram: 60, proteinGram: 30, fiberGram: 25 },
  { name: 'สุกี้น้ำรวมมิตร', carbGram: 25, proteinGram: 45, fiberGram: 55 },
  { name: 'ข้าวไข่เจียวหมูสับ', carbGram: 80, proteinGram: 35, fiberGram: 15 },
  { name: 'ข้าวต้มกุ้ง / ปลา + ผักโรย', carbGram: 55, proteinGram: 25, fiberGram: 20 },
  { name: 'สลัดอกไก่ย่างน้ำใส', carbGram: 15, proteinGram: 55, fiberGram: 70 },
  { name: 'ข้าวกล้อง + ลาบอกไก่ + แตงกวา', carbGram: 65, proteinGram: 40, fiberGram: 35 },
  { name: 'ส้มตำไทย + ไก่ย่างไม่ติดหนัง', carbGram: 30, proteinGram: 45, fiberGram: 45 },
  { name: 'แซนด์วิชทูน่าโฮลวีท', carbGram: 50, proteinGram: 35, fiberGram: 20 }
];

// ==========================================
// AUTHENTICATION & USER MANAGEMENT CONFIG
// ==========================================
const USERS_STORAGE_KEY = 'fitpulse_users_db';
const CURRENT_USER_KEY = 'fitpulse_current_user';
const DEFAULT_USERS = [
  {
    phone: '0899999999',
    password: 'admin1234',
    realName: 'ผู้ดูแลระบบ fitจัง',
    nickname: 'แอดมิน',
    role: 'admin',
    createdAt: '2025-01-01T08:00:00.000Z'
  },
  {
    phone: '0812345678',
    password: 'user1234',
    realName: 'สมชาย สุขภาพดี',
    nickname: 'ป๊อป',
    role: 'user',
    createdAt: '2025-01-02T09:30:00.000Z'
  }
];

// Main App Controller
class FitPulseApp {
  constructor() {
    this.currentDate = this.formatDateKey(new Date());
    this.historyPeriod = 'week'; // 'week' or 'month'

    // Auth State
    this.currentUser = null;
    this.pendingAuthAction = null;
    this.resetTargetUserPhone = null;

    // 3D Avatar Engine
    this.body3d = null;

    this.state = {
      profile: {
        gender: 'male',
        age: 25,
        weight: 68,
        height: 172,
        activity: 1.375,
        goal: 'maintain',
        bmi: 22.98,
        bmiCategory: 'สมส่วน / ปกติ',
        bmr: 1620,
        tdee: 2228,
        targetCal: 2228,
        idealWeightMin: 54.7,
        idealWeightMax: 67.8,
        avatarConfig: {
          hairStyle: 'bowl',
          hairColor: '#3d2314',
          skinColor: '#fce0d2',
          eyeColor: '#2a1708',
          shirtStyle: 'striped',
          shirtColor1: '#4a47a3',
          shirtColor2: '#f5a623',
          collarColor: '#f5a623',
          shortsStyle: 'dots',
          shortsColor: '#1f2e69',
          glasses: 'none',
          headphones: false,
          blush: true
        }
      },
      meals: {
        breakfast: { name: 'ข้าวต้มอกไก่ + ไข่ลวก', carbGram: 70, proteinGram: 45, fiberGram: 50, cal: 560, isSaved: true },
        lunch: { name: 'ข้าวกะเพราอกไก่ + ผัดผักรวม', carbGram: 85, proteinGram: 50, fiberGram: 60, cal: 660, isSaved: true },
        dinner: { name: 'สลัดปลาแซลมอน, สุกี้น้ำ', carbGram: 40, proteinGram: 55, fiberGram: 80, cal: 540, isSaved: true },
        snacks: { name: '', carbGram: 25, proteinGram: 15, fiberGram: 20, cal: 200, isSaved: false }
      },
      history: {}, // Keyed by YYYY-MM-DD
      selectedWorkout: null,
      timer: {
        remainingSeconds: 0,
        totalSeconds: 0,
        intervalId: null,
        isRunning: false
      }
    };

    this.wheel = {
      canvas: null,
      ctx: null,
      currentAngle: 0,
      isSpinning: false,
      spinSpeed: 0
    };

    this.currentPresetTargetMeal = 'breakfast';
  }

  init() {
    this.initAuth();
    this.renderAuthStatus();
    this.loadState();
    this.setupEventListeners();
    this.calculateProfile(false);
    this.renderProfileResults();

    // Initialize 3D Body Avatar
    if (typeof FitPulseBody3D !== 'undefined') {
      try {
        this.body3d = new FitPulseBody3D('avatar3dContainer', this.state.profile);
        this.body3d.init(this.state.profile);
        if (this.state.profile.avatarConfig) {
          this.body3d.setAvatarConfig(this.state.profile.avatarConfig);
        }
        this.updateAvatarModelButtonText();
      } catch (e) {
        console.warn('3D Body init error:', e);
      }
    }

    this.updateDateDisplay();

    // Check if we have data for currentDate, if not save current state
    if (!this.state.history[this.currentDate]) {
      this.syncCurrentMealsToHistory(false);
    } else {
      this.loadMealsForDate(this.currentDate);
    }

    this.renderMealInputs();
    this.evaluateEnergyBalance();
    this.initWheel();
    this.renderFoodRecommendations('all');
    this.renderHistoryAnalytics();
    this.renderAuthStatus();
  }

  // Helper: Format Date to YYYY-MM-DD
  formatDateKey(dateObj) {
    const d = new Date(dateObj);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper: Format Date for Thai Display
  formatThaiDate(dateStr) {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
      const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      
      const dayName = thaiDays[d.getDay()];
      const dayNum = d.getDate();
      const monthName = thaiMonths[d.getMonth()];
      const year = d.getFullYear() + 543;
      return `${dayName} ${dayNum} ${monthName} ${year}`;
    } catch (e) {
      return dateStr;
    }
  }

  // Load from localStorage (with User Isolation)
  loadState() {
    try {
      const storageKey = this.currentUser 
        ? `fitpulse_user_data_${this.currentUser.phone}` 
        : 'fitpulse_app_state_v3';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) this.state.profile = { ...this.state.profile, ...parsed.profile };
        if (parsed.history) this.state.history = parsed.history;
        if (parsed.meals) this.state.meals = parsed.meals;
      } else if (this.currentUser) {
        // First login for this user: save initial baseline
        this.saveState();
      }
      if (this.body3d && this.state.profile.avatarConfig) {
        this.body3d.setAvatarConfig(this.state.profile.avatarConfig);
      }
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }
  }

  // Save to localStorage (with User Isolation)
  saveState() {
    try {
      const storageKey = this.currentUser 
        ? `fitpulse_user_data_${this.currentUser.phone}` 
        : 'fitpulse_app_state_v3';
      localStorage.setItem(storageKey, JSON.stringify({
        profile: this.state.profile,
        history: this.state.history,
        meals: this.state.meals
      }));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  // Setup DOM Event Listeners
  setupEventListeners() {
    // Navigation Tabs (Desktop & Mobile)
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Profile Form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleProfileSubmit();
      });

      // Live 3D Avatar morphing as user types or changes gender
      const liveUpdateAvatar = () => {
        if (!this.body3d) return;
        const checkedGender = document.querySelector('input[name="gender"]:checked');
        const gender = checkedGender ? checkedGender.value : (this.state.profile.gender || 'male');
        const weight = parseFloat(document.getElementById('inputWeight')?.value) || this.state.profile.weight;
        const height = parseFloat(document.getElementById('inputHeight')?.value) || this.state.profile.height;
        const hM = height / 100;
        const bmi = parseFloat((weight / (hM * hM)).toFixed(2));
        this.body3d.updateMetrics({ gender, weight, height, bmi });
      };

      ['inputWeight', 'inputHeight'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', liveUpdateAvatar);
      });
      document.querySelectorAll('input[name="gender"]').forEach(radio => {
        radio.addEventListener('change', liveUpdateAvatar);
      });
    }

    // Reset Day Button
    const resetDayBtn = document.getElementById('resetDayBtn');
    if (resetDayBtn) {
      resetDayBtn.addEventListener('click', () => {
        if (confirm(`คุณต้องการล้างข้อมูลอาหารของวันที่ ${this.formatThaiDate(this.currentDate)} ใช่หรือไม่?`)) {
          this.resetMeals();
        }
      });
    }

    // Window resize for charts
    window.addEventListener('resize', () => {
      if (document.getElementById('tab-history')?.classList.contains('active')) {
        this.renderHistoryAnalytics();
      }
    });

    // Close Modals on Overlay Click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
          if (modal.id === 'authModal') {
            this.pendingAuthAction = null;
          }
        }
      });
    });
  }

  // Switch Active Tab
  switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const activeDesktopBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const activeMobileBtn = document.querySelector(`.mobile-nav-btn[data-tab="${tabId}"]`);
    const activeContent = document.getElementById(tabId);

    if (activeDesktopBtn) activeDesktopBtn.classList.add('active');
    if (activeMobileBtn) activeMobileBtn.classList.add('active');
    if (activeContent) activeContent.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (tabId === 'tab-workout') {
      this.drawWheel();
    } else if (tabId === 'tab-history') {
      this.renderHistoryAnalytics();
    }

    // 3D Avatar Performance: Resume when on tab-profile, pause when on other tabs
    if (this.body3d) {
      if (tabId === 'tab-profile') {
        this.body3d.resume();
      } else {
        this.body3d.pause();
      }
    }
  }

  // ==========================================
  // DATE NAVIGATION & HISTORY SYNC
  // ==========================================
  shiftDate(deltaDays) {
    const parts = this.currentDate.split('-');
    const cur = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    cur.setDate(cur.getDate() + deltaDays);
    this.setDate(this.formatDateKey(cur));
  }

  goToToday() {
    this.setDate(this.formatDateKey(new Date()));
  }

  onDateInputChange(dateVal) {
    if (dateVal) {
      this.setDate(dateVal);
    }
  }

  setDate(newDateStr) {
    // Save current meals to current date before switching
    this.syncCurrentMealsToHistory(false);

    this.currentDate = newDateStr;
    this.updateDateDisplay();
    this.loadMealsForDate(newDateStr);
    this.renderMealInputs();
    this.evaluateEnergyBalance();

    const todayStr = this.formatDateKey(new Date());
    if (newDateStr === todayStr) {
      this.showToast(`📅 กลับสู่วันที่ปัจจุบัน (${this.formatThaiDate(newDateStr)})`);
    } else {
      this.showToast(`📅 สลับไปยังวันที่ ${this.formatThaiDate(newDateStr)}`);
    }
  }

  updateDateDisplay() {
    const formatted = this.formatThaiDate(this.currentDate);
    const labelEl = document.getElementById('activeDateFormatted');
    if (labelEl) labelEl.textContent = formatted;

    const inputEl = document.getElementById('activeDateInput');
    if (inputEl) inputEl.value = this.currentDate;

    const badgeEl = document.getElementById('dateTagBadge');
    const todayStr = this.formatDateKey(new Date());
    if (badgeEl) {
      if (this.currentDate === todayStr) {
        badgeEl.textContent = 'วันนี้';
        badgeEl.className = 'date-tag-badge';
      } else if (this.currentDate < todayStr) {
        badgeEl.textContent = 'ย้อนหลัง';
        badgeEl.className = 'date-tag-badge past';
      } else {
        badgeEl.textContent = 'ล่วงหน้า';
        badgeEl.className = 'date-tag-badge past';
      }
    }
  }

  loadMealsForDate(dateStr) {
    const savedDay = this.state.history[dateStr];
    if (savedDay && savedDay.meals) {
      this.state.meals = JSON.parse(JSON.stringify(savedDay.meals));
    } else {
      // Empty meals template for unrecorded date
      this.state.meals = {
        breakfast: { name: '', carbGram: 0, proteinGram: 0, fiberGram: 0, cal: 0, isSaved: false },
        lunch: { name: '', carbGram: 0, proteinGram: 0, fiberGram: 0, cal: 0, isSaved: false },
        dinner: { name: '', carbGram: 0, proteinGram: 0, fiberGram: 0, cal: 0, isSaved: false },
        snacks: { name: '', carbGram: 0, proteinGram: 0, fiberGram: 0, cal: 0, isSaved: false }
      };
    }
  }

  syncCurrentMealsToHistory(showNotification = false) {
    const m = this.state.meals;
    const p = this.state.profile;

    const totalIntake = (m.breakfast.cal || 0) + (m.lunch.cal || 0) + (m.dinner.cal || 0) + (m.snacks.cal || 0);
    const target = p.targetCal;
    const diff = totalIntake - target;

    let status = 'balanced';
    if (totalIntake === 0) status = 'empty';
    else if (diff > 50) status = 'surplus';
    else if (diff < -50) status = 'deficit';

    let totalCarbGram = 0, totalProteinGram = 0, totalFiberGram = 0;
    let totalCarbCal = 0, totalProteinCal = 0, totalFiberCal = 0;

    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(k => {
      const meal = m[k];
      totalCarbGram += (meal.carbGram || 0);
      totalProteinGram += (meal.proteinGram || 0);
      totalFiberGram += (meal.fiberGram || 0);
      totalCarbCal += (meal.carbCal || 0);
      totalProteinCal += (meal.proteinCal || 0);
      totalFiberCal += (meal.fiberCal || 0);
    });

    let carbPct = 0, proteinPct = 0, fiberPct = 0;
    if (totalIntake > 0) {
      carbPct = Math.round((totalCarbCal / totalIntake) * 100);
      proteinPct = Math.round((totalProteinCal / totalIntake) * 100);
      fiberPct = Math.max(0, 100 - carbPct - proteinPct);
    }

    this.state.history[this.currentDate] = {
      date: this.currentDate,
      targetCal: target,
      totalCal: totalIntake,
      diff: diff,
      status: status,
      carbGram: totalCarbGram,
      proteinGram: totalProteinGram,
      fiberGram: totalFiberGram,
      carbPct: carbPct,
      proteinPct: proteinPct,
      fiberPct: fiberPct,
      meals: JSON.parse(JSON.stringify(this.state.meals)),
      savedAt: new Date().toISOString()
    };

    this.saveState();

    if (showNotification) {
      this.showToast(`💾 บันทึกประวัติของวันที่ ${this.formatThaiDate(this.currentDate)} เรียบร้อย`);
      this.renderHistoryAnalytics();
    }
  }

  saveCurrentDaySummary() {
    if (!this.requireAuth(() => this.saveCurrentDaySummary())) return;
    this.syncCurrentMealsToHistory(true);
  }

  // ==========================================
  // PROFILE & BODY METRICS
  // ==========================================
  handleProfileSubmit() {
    if (!this.requireAuth(() => this.handleProfileSubmit())) return;

    const checkedGender = document.querySelector('input[name="gender"]:checked');
    const gender = checkedGender ? checkedGender.value : 'male';
    const age = parseInt(document.getElementById('inputAge').value) || 25;
    const weight = parseFloat(document.getElementById('inputWeight').value) || 68;
    const height = parseFloat(document.getElementById('inputHeight').value) || 172;
    const activity = parseFloat(document.getElementById('inputActivity').value) || 1.375;
    const goal = document.getElementById('inputGoal').value;

    this.state.profile = {
      ...this.state.profile,
      gender,
      age,
      weight,
      height,
      activity,
      goal
    };

    this.calculateProfile(true);
    this.renderProfileResults();
    this.evaluateEnergyBalance();
    this.saveState();
    this.showToast('✅ บันทึกข้อมูลร่างกายเรียบร้อย!');
  }

  calculateProfile(showNotice = false) {
    const p = this.state.profile;
    const hM = p.height / 100;
    
    // BMI
    const bmi = p.weight / (hM * hM);
    p.bmi = parseFloat(bmi.toFixed(2));

    // Asian BMI Criteria
    let category = '', tagClass = '', advice = '', arrowPercent = 50;

    if (bmi < 18.5) {
      category = 'ผอมเกินไป (Underweight)';
      tagClass = 'bmi-under';
      advice = 'น้ำหนักน้อยกว่าเกณฑ์ แนะนำให้เพิ่มอาหารที่มีโปรตีนและคาร์โบไฮเดรตเชิงซ้อน';
      arrowPercent = Math.max(5, (bmi / 18.5) * 20);
    } else if (bmi <= 22.9) {
      category = 'สมส่วน / ปกติ (Normal)';
      tagClass = 'bmi-normal';
      advice = 'ยอดเยี่ยมมาก! น้ำหนักของคุณอยู่ในเกณฑ์สมส่วนสุขภาพดี ควรรักษาความสมดุลนี้ไว้';
      arrowPercent = 20 + ((bmi - 18.5) / (22.9 - 18.5)) * 20;
    } else if (bmi <= 24.9) {
      category = 'น้ำหนักเกิน / ท้วม (Overweight)';
      tagClass = 'bmi-over';
      advice = 'เริ่มมีน้ำหนักเกินเกณฑ์มาตรฐานเล็กน้อย ควรควบคุมของหวาน ของทอด และเพิ่มการออกกำลังกาย';
      arrowPercent = 40 + ((bmi - 23) / (24.9 - 23)) * 20;
    } else if (bmi <= 29.9) {
      category = 'อ้วนระดับ 1 (Obese Class 1)';
      tagClass = 'bmi-obese';
      advice = 'อยู่ในเกณฑ์อ้วนระดับที่ 1 มีความเสี่ยงต่อสุขภาพ ควรควบคุมสัดส่วนอาหารและออกกำลังกายสม่ำเสมอ';
      arrowPercent = 60 + ((bmi - 25) / (29.9 - 25)) * 20;
    } else {
      category = 'อ้วนระดับ 2 (Obese Class 2)';
      tagClass = 'bmi-obese';
      advice = 'อยู่ในเกณฑ์อ้วนระดับอันตราย แนะนำให้ปรับโภชนาการอย่างจริงจังเพื่อลดความเสี่ยงต่อโรคเรื้อรัง';
      arrowPercent = Math.min(95, 80 + ((bmi - 30) / 10) * 15);
    }

    p.bmiCategory = category;
    p.bmiTagClass = tagClass;
    p.bmiAdvice = advice;
    p.bmiArrowPercent = Math.min(95, Math.max(5, arrowPercent));

    // Ideal Weight Range
    p.idealWeightMin = parseFloat((18.5 * hM * hM).toFixed(1));
    p.idealWeightMax = parseFloat((22.9 * hM * hM).toFixed(1));

    // BMR (Mifflin-St Jeor)
    let bmr = 0;
    if (p.gender === 'male') {
      bmr = (10 * p.weight) + (6.25 * p.height) - (5 * p.age) + 5;
    } else {
      bmr = (10 * p.weight) + (6.25 * p.height) - (5 * p.age) - 161;
    }
    p.bmr = Math.round(bmr);

    // TDEE
    const tdee = Math.round(p.bmr * p.activity);
    p.tdee = tdee;

    // Daily Calorie Target
    if (p.goal === 'cut') {
      p.targetCal = Math.max(1200, tdee - 400);
    } else if (p.goal === 'bulk') {
      p.targetCal = tdee + 350;
    } else {
      p.targetCal = tdee;
    }
  }

  renderProfileResults() {
    const p = this.state.profile;

    const maleRadio = document.querySelector('input[name="gender"][value="male"]');
    const femaleRadio = document.querySelector('input[name="gender"][value="female"]');
    if (p.gender === 'female' && femaleRadio) femaleRadio.checked = true;
    else if (maleRadio) maleRadio.checked = true;

    const ageInp = document.getElementById('inputAge');
    if (ageInp) ageInp.value = p.age;
    const weightInp = document.getElementById('inputWeight');
    if (weightInp) weightInp.value = p.weight;
    const heightInp = document.getElementById('inputHeight');
    if (heightInp) heightInp.value = p.height;
    const actInp = document.getElementById('inputActivity');
    if (actInp) actInp.value = p.activity;
    const goalInp = document.getElementById('inputGoal');
    if (goalInp) goalInp.value = p.goal;

    document.getElementById('bmiNumberLarge').textContent = p.bmi;
    const tagEl = document.getElementById('bmiTagLarge');
    tagEl.textContent = p.bmiCategory;
    tagEl.className = `bmi-tag ${p.bmiTagClass || 'bmi-normal'}`;

    document.getElementById('bmiIndicatorArrow').style.left = `${p.bmiArrowPercent}%`;
    document.getElementById('bmiAdviceText').textContent = p.bmiAdvice;

    document.getElementById('resBmr').textContent = `${p.bmr.toLocaleString()} kcal`;
    document.getElementById('resTdee').textContent = `${p.tdee.toLocaleString()} kcal`;
    document.getElementById('resTarget').textContent = `${p.targetCal.toLocaleString()} kcal`;
    document.getElementById('resIdealWeight').textContent = `${p.idealWeightMin} - ${p.idealWeightMax} กก.`;

    document.getElementById('displayTdee').textContent = p.targetCal.toLocaleString();
    document.getElementById('displayBmrSub').textContent = `BMR: ${p.bmr.toLocaleString()} kcal`;
    document.getElementById('displayBmi').textContent = p.bmi;
    const topBmiCat = document.getElementById('displayBmiCategory');
    topBmiCat.textContent = p.bmiCategory.split(' ')[0];
    topBmiCat.className = `metric-badge ${p.bmiTagClass || ''}`;

    // Update 3D Avatar
    if (this.body3d) {
      this.body3d.updateMetrics(p);
    }
  }

  // =======================================================
  // GRAMS (g) -> CALORIE & 100% PERCENTAGE CALCULATION ENGINE
  // =======================================================
  renderMealInputs() {
    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(meal => {
      const data = this.state.meals[meal];
      const nameInp = document.getElementById(`${meal}Name`);
      if (nameInp) nameInp.value = data.name || '';

      const carbInp = document.getElementById(`${meal}CarbGram`);
      if (carbInp) carbInp.value = data.carbGram ?? 0;

      const proteinInp = document.getElementById(`${meal}ProteinGram`);
      if (proteinInp) proteinInp.value = data.proteinGram ?? 0;

      const fiberInp = document.getElementById(`${meal}FiberGram`);
      if (fiberInp) fiberInp.value = data.fiberGram ?? 0;

      const statusEl = document.getElementById(`${meal}Status`);
      if (statusEl) {
        if (data.isSaved) {
          statusEl.textContent = 'บันทึกแล้ว ✓';
          statusEl.className = 'meal-status saved';
        } else {
          statusEl.textContent = 'ยังไม่บันทึก';
          statusEl.className = 'meal-status';
        }
      }

      this.updateMealFromGrams(meal);
    });
  }

  stepGram(meal, macro, delta) {
    const inputId = `${meal}${macro.charAt(0).toUpperCase() + macro.slice(1)}Gram`;
    const input = document.getElementById(inputId);
    if (!input) return;

    let currentVal = parseInt(input.value) || 0;
    let nextVal = Math.max(0, Math.min(1000, currentVal + delta));
    input.value = nextVal;
    this.onGramInputChange(meal);
  }

  setGram(meal, macro, value) {
    const inputId = `${meal}${macro.charAt(0).toUpperCase() + macro.slice(1)}Gram`;
    const input = document.getElementById(inputId);
    if (!input) return;

    input.value = Math.max(0, parseInt(value) || 0);
    this.onGramInputChange(meal);
  }

  onGramInputChange(meal) {
    this.updateMealFromGrams(meal);
    this.evaluateEnergyBalance();
    this.syncCurrentMealsToHistory(false);
  }

  updateMealFromGrams(meal) {
    const data = this.state.meals[meal];

    const carbGram = Math.max(0, parseInt(document.getElementById(`${meal}CarbGram`)?.value) || 0);
    const proteinGram = Math.max(0, parseInt(document.getElementById(`${meal}ProteinGram`)?.value) || 0);
    const fiberGram = Math.max(0, parseInt(document.getElementById(`${meal}FiberGram`)?.value) || 0);

    data.carbGram = carbGram;
    data.proteinGram = proteinGram;
    data.fiberGram = fiberGram;

    const carbCal = carbGram * 4;
    const proteinCal = proteinGram * 4;
    const fiberCal = fiberGram * 2;
    const totalCal = carbCal + proteinCal + fiberCal;
    const totalWeight = carbGram + proteinGram + fiberGram;

    data.carbCal = carbCal;
    data.proteinCal = proteinCal;
    data.fiberCal = fiberCal;
    data.cal = totalCal;
    data.totalWeight = totalWeight;

    let carbPct = 0, proteinPct = 0, fiberPct = 0;
    if (totalCal > 0) {
      carbPct = Math.round((carbCal / totalCal) * 100);
      proteinPct = Math.round((proteinCal / totalCal) * 100);
      fiberPct = Math.max(0, 100 - carbPct - proteinPct);
    }

    data.carbPct = carbPct;
    data.proteinPct = proteinPct;
    data.fiberPct = fiberPct;

    const cCalEl = document.getElementById(`${meal}CarbCal`);
    if (cCalEl) cCalEl.textContent = `${carbCal} kcal`;
    const cPctEl = document.getElementById(`${meal}CarbPct`);
    if (cPctEl) cPctEl.textContent = `${carbPct}%`;

    const pCalEl = document.getElementById(`${meal}ProteinCal`);
    if (pCalEl) pCalEl.textContent = `${proteinCal} kcal`;
    const pPctEl = document.getElementById(`${meal}ProteinPct`);
    if (pPctEl) pPctEl.textContent = `${proteinPct}%`;

    const fCalEl = document.getElementById(`${meal}FiberCal`);
    if (fCalEl) fCalEl.textContent = `${fiberCal} kcal`;
    const fPctEl = document.getElementById(`${meal}FiberPct`);
    if (fPctEl) fPctEl.textContent = `${fiberPct}%`;

    const badgeCal = document.getElementById(`${meal}TotalCal`);
    if (badgeCal) badgeCal.textContent = totalCal.toLocaleString();

    const btnCal = document.getElementById(`${meal}BtnCal`);
    if (btnCal) btnCal.textContent = totalCal.toLocaleString();

    const weightBadge = document.getElementById(`${meal}TotalWeight`);
    if (weightBadge) weightBadge.textContent = `รวม ${totalWeight}g`;

    const totalPctBadge = document.getElementById(`${meal}TotalPercent`);
    if (totalPctBadge) {
      const sum = totalCal > 0 ? (carbPct + proteinPct + fiberPct) : 0;
      totalPctBadge.textContent = `รวม ${sum}%`;
    }

    const plateBar = document.getElementById(`${meal}PlateBar`);
    if (plateBar) {
      const parts = plateBar.querySelectorAll('.plate-part');
      if (parts.length >= 3) {
        parts[0].style.width = `${carbPct}%`;
        parts[1].style.width = `${proteinPct}%`;
        parts[2].style.width = `${fiberPct}%`;
      }
    }
  }

  saveMeal(meal) {
    if (!this.requireAuth(() => this.saveMeal(meal))) return;

    const nameInp = document.getElementById(`${meal}Name`);
    this.state.meals[meal].name = nameInp ? nameInp.value.trim() : '';
    this.state.meals[meal].isSaved = true;

    const statusEl = document.getElementById(`${meal}Status`);
    if (statusEl) {
      statusEl.textContent = 'บันทึกแล้ว ✓';
      statusEl.className = 'meal-status saved';
    }

    this.evaluateEnergyBalance();
    this.syncCurrentMealsToHistory(true);
  }

  resetMeals() {
    this.state.meals = {
      breakfast: { name: '', carbGram: 0, proteinGram: 0, fiberGram: 0, cal: 0, isSaved: false },
      lunch: { name: '', carbGram: 0, proteinGram: 0, fiberGram: 0, cal: 0, isSaved: false },
      dinner: { name: '', carbGram: 0, proteinGram: 0, fiberGram: 0, cal: 0, isSaved: false },
      snacks: { name: '', carbGram: 0, proteinGram: 0, fiberGram: 0, cal: 0, isSaved: false }
    };

    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(m => {
      const statusEl = document.getElementById(`${m}Status`);
      if (statusEl) {
        statusEl.textContent = 'ยังไม่บันทึก';
        statusEl.className = 'meal-status';
      }
    });

    this.renderMealInputs();
    this.evaluateEnergyBalance();
    this.syncCurrentMealsToHistory(false);
    this.showToast(`🔄 ล้างข้อมูลอาหารของวันที่ ${this.formatThaiDate(this.currentDate)} เรียบร้อย`);
  }

  // ==========================================
  // ENERGY BALANCE & MACROS
  // ==========================================
  evaluateEnergyBalance() {
    const p = this.state.profile;
    const m = this.state.meals;

    const totalIntake = (m.breakfast.cal || 0) + (m.lunch.cal || 0) + (m.dinner.cal || 0) + (m.snacks.cal || 0);
    const target = p.targetCal;
    const diff = totalIntake - target;

    let recordedCount = 0;
    if (m.breakfast.cal > 0) recordedCount++;
    if (m.lunch.cal > 0) recordedCount++;
    if (m.dinner.cal > 0) recordedCount++;
    if (m.snacks.cal > 0) recordedCount++;

    const displayIntake = document.getElementById('displayIntake');
    if (displayIntake) displayIntake.textContent = totalIntake.toLocaleString();
    const displayMealCount = document.getElementById('displayMealCount');
    if (displayMealCount) displayMealCount.textContent = `${recordedCount} มื้อที่บันทึก`;

    const displayDiff = document.getElementById('displayDiff');
    const displayStatusBadge = document.getElementById('displayStatusBadge');
    const quickBadge = document.getElementById('quickStatusBadge');
    const quickText = document.getElementById('quickStatusText');

    const hero = document.getElementById('analysisHero');
    const heroIcon = document.getElementById('heroIcon');
    const heroTitle = document.getElementById('heroTitle');
    const heroDesc = document.getElementById('heroDesc');
    const heroActionBox = document.getElementById('heroActionBox');

    const ctaSurplus = document.getElementById('ctaSurplusCard');
    const ctaDeficit = document.getElementById('ctaDeficitCard');
    const ctaBalanced = document.getElementById('ctaBalancedCard');

    if (ctaSurplus) ctaSurplus.classList.remove('visible');
    if (ctaDeficit) ctaDeficit.classList.remove('visible');
    if (ctaBalanced) ctaBalanced.classList.remove('visible');

    const surplusBadge = document.getElementById('surplusBadge');
    const deficitBadge = document.getElementById('deficitBadge');

    let status = 'balanced';

    if (totalIntake === 0) {
      if (displayDiff) displayDiff.textContent = '0';
      if (displayStatusBadge) {
        displayStatusBadge.textContent = 'ยังไม่บันทึกอาหาร';
        displayStatusBadge.className = 'metric-badge';
      }
      if (quickBadge) quickBadge.className = 'quick-status-badge';
      if (quickText) quickText.textContent = 'รอการบันทึกอาหาร';

      if (hero) {
        hero.className = 'analysis-hero';
        if (heroIcon) heroIcon.textContent = '🍽️';
        if (heroTitle) heroTitle.textContent = 'ยังไม่มีข้อมูลมื้ออาหารของวันที่เลือก';
        if (heroDesc) heroDesc.textContent = 'ระบุน้ำหนักอาหารเป็นกรัมในมื้อเช้า มื้อเที่ยง หรือมื้อเย็น เพื่อวิเคราะห์พลังงานและสารอาหาร';
        if (heroActionBox) heroActionBox.innerHTML = `<button class="btn btn-primary" onclick="app.switchTab('tab-meals')">ไปบันทึกอาหาร →</button>`;
      }
      
      if (surplusBadge) surplusBadge.textContent = '0 kcal';
      if (deficitBadge) deficitBadge.textContent = '0 kcal';
    } else if (diff > 50) {
      status = 'surplus';
      const surplusCal = diff;
      if (displayDiff) displayDiff.textContent = `+${surplusCal.toLocaleString()}`;
      if (displayStatusBadge) {
        displayStatusBadge.textContent = `🔥 เกินเป้าหมาย +${surplusCal} kcal`;
        displayStatusBadge.className = 'metric-badge surplus';
      }

      if (quickBadge) quickBadge.className = 'quick-status-badge surplus';
      if (quickText) quickText.textContent = `พลังงานเกิน (+${surplusCal} kcal)`;

      if (hero) {
        hero.className = 'analysis-hero surplus';
        if (heroIcon) heroIcon.textContent = '🔥';
        if (heroTitle) heroTitle.textContent = `กินพลังงานเกินเกณฑ์ +${surplusCal.toLocaleString()} kcal`;
        if (heroDesc) heroDesc.textContent = `วันนี้คุณกินเกินกว่าที่ร่างกายต้องการไป ${surplusCal} kcal ระบบพร้อมพาคุณไปหมุนวงล้อสุ่มออกกำลังกายเพื่อเผาผลาญส่วนเกินนี้ออกทันที!`;
        if (heroActionBox) heroActionBox.innerHTML = `<button class="btn btn-warning btn-lg" onclick="app.switchTab('tab-workout')">🎡 สุ่มออกกำลังกายเบิร์นส่วนเกิน →</button>`;
      }

      if (ctaSurplus) ctaSurplus.classList.add('visible');
      const ctaSurplusVal = document.getElementById('ctaSurplusVal');
      if (ctaSurplusVal) ctaSurplusVal.textContent = surplusCal.toLocaleString();

      if (surplusBadge) {
        surplusBadge.textContent = `+${surplusCal} kcal`;
        surplusBadge.style.display = 'inline-block';
      }
      if (deficitBadge) deficitBadge.textContent = '0 kcal';

      const workoutSurplusTarget = document.getElementById('workoutSurplusTarget');
      if (workoutSurplusTarget) workoutSurplusTarget.textContent = `${surplusCal.toLocaleString()} kcal`;
    } else if (diff < -50) {
      status = 'deficit';
      const deficitCal = Math.abs(diff);
      if (displayDiff) displayDiff.textContent = `-${deficitCal.toLocaleString()}`;
      if (displayStatusBadge) {
        displayStatusBadge.textContent = `⚡ ยังขาดอีก -${deficitCal} kcal`;
        displayStatusBadge.className = 'metric-badge deficit';
      }

      if (quickBadge) quickBadge.className = 'quick-status-badge deficit';
      if (quickText) quickText.textContent = `พลังงานขาด (-${deficitCal} kcal)`;

      if (hero) {
        hero.className = 'analysis-hero deficit';
        if (heroIcon) heroIcon.textContent = '🥗';
        if (heroTitle) heroTitle.textContent = `พลังงานยังไม่ถึงเกณฑ์ ขาดอีก ${deficitCal.toLocaleString()} kcal`;
        if (heroDesc) heroDesc.textContent = `หากร่างกายได้รับพลังงานไม่เพียงพอ อัตราการเผาผลาญอาจลดลงได้ แนะนำให้เติมเต็มด้วยของว่างเพื่อสุขภาพที่มีสารอาหารตรงจุด`;
        if (heroActionBox) heroActionBox.innerHTML = `<button class="btn btn-info btn-lg" onclick="app.switchTab('tab-recommend')">🍲 ดูเมนูอาหารแนะนำ →</button>`;
      }

      if (ctaDeficit) ctaDeficit.classList.add('visible');
      const ctaDeficitVal = document.getElementById('ctaDeficitVal');
      if (ctaDeficitVal) ctaDeficitVal.textContent = deficitCal.toLocaleString();

      if (deficitBadge) {
        deficitBadge.textContent = `-${deficitCal} kcal`;
        deficitBadge.style.display = 'inline-block';
      }
      if (surplusBadge) surplusBadge.textContent = '0 kcal';

      const recommendDeficitAmount = document.getElementById('recommendDeficitAmount');
      if (recommendDeficitAmount) recommendDeficitAmount.textContent = `${deficitCal.toLocaleString()} kcal`;
      this.updateSmartAdvice(deficitCal);
    } else {
      status = 'balanced';
      if (displayDiff) displayDiff.textContent = `±${Math.abs(diff)}`;
      if (displayStatusBadge) {
        displayStatusBadge.textContent = '🎯 สมดุลตามเกณฑ์เป๊ะ!';
        displayStatusBadge.className = 'metric-badge balanced';
      }

      if (quickBadge) quickBadge.className = 'quick-status-badge balanced';
      if (quickText) quickText.textContent = 'พลังงานสมดุลพอดี';

      if (hero) {
        hero.className = 'analysis-hero balanced';
        if (heroIcon) heroIcon.textContent = '🎉';
        if (heroTitle) heroTitle.textContent = 'พลังงานสมดุลยอดเยี่ยมตามเกณฑ์!';
        if (heroDesc) heroDesc.textContent = `คุณได้รับพลังงานรวม ${totalIntake.toLocaleString()} kcal ซึ่งตรงกับเป้าหมาย ${target.toLocaleString()} kcal ได้อย่างสมบูรณ์แบบ รักษามาตรฐานนี้ไว้ได้เลย!`;
        if (heroActionBox) heroActionBox.innerHTML = `<button class="btn btn-success" onclick="app.switchTab('tab-meals')">ดูรายละเอียดอาหาร ✓</button>`;
      }

      if (ctaBalanced) ctaBalanced.classList.add('visible');
      if (surplusBadge) surplusBadge.textContent = '0 kcal';
      if (deficitBadge) deficitBadge.textContent = '0 kcal';
    }

    const statTarget = document.getElementById('statTarget');
    if (statTarget) statTarget.textContent = `${target.toLocaleString()} kcal`;
    const statActual = document.getElementById('statActual');
    if (statActual) statActual.textContent = `${totalIntake.toLocaleString()} kcal`;
    const statMealBreakdown = document.getElementById('statMealBreakdown');
    if (statMealBreakdown) statMealBreakdown.textContent = `เช้า ${m.breakfast.cal} | เที่ยง ${m.lunch.cal} | เย็น ${m.dinner.cal} | ว่าง ${m.snacks.cal}`;
    const statDiff = document.getElementById('statDiff');
    if (statDiff) statDiff.textContent = `${diff > 0 ? '+' : ''}${diff.toLocaleString()} kcal`;
    
    const statVerdict = document.getElementById('statVerdict');
    if (statVerdict) {
      if (status === 'surplus') {
        statVerdict.textContent = 'เกินกว่าเกณฑ์ร่างกายต้องการ';
        statVerdict.style.color = 'var(--warning)';
      } else if (status === 'deficit') {
        statVerdict.textContent = 'ยังไม่เพียงพอต่อเกณฑ์';
        statVerdict.style.color = 'var(--info)';
      } else {
        statVerdict.textContent = 'สมดุลอยู่ในเกณฑ์ที่ยอดเยี่ยม';
        statVerdict.style.color = 'var(--success)';
      }
    }

    this.calculateDailyMacros();

    if (this.state.selectedWorkout && diff > 0) {
      this.updateWorkoutCalculation(this.state.selectedWorkout, diff);
    }
  }

  calculateDailyMacros() {
    const m = this.state.meals;
    let totalCarbCal = 0, totalProteinCal = 0, totalFiberCal = 0;

    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(k => {
      const meal = m[k];
      totalCarbCal += (meal.carbCal || 0);
      totalProteinCal += (meal.proteinCal || 0);
      totalFiberCal += (meal.fiberCal || 0);
    });

    const sumCal = totalCarbCal + totalProteinCal + totalFiberCal;
    let carbPct = 33, proteinPct = 33, fiberPct = 34;

    if (sumCal > 0) {
      carbPct = Math.round((totalCarbCal / sumCal) * 100);
      proteinPct = Math.round((totalProteinCal / sumCal) * 100);
      fiberPct = Math.max(0, 100 - carbPct - proteinPct);
    }

    const carbBar = document.getElementById('dailyCarbBar');
    const proteinBar = document.getElementById('dailyProteinBar');
    const fiberBar = document.getElementById('dailyFiberBar');

    if (carbBar) {
      carbBar.style.width = `${carbPct}%`;
      carbBar.textContent = `แป้ง ${carbPct}%`;
    }
    if (proteinBar) {
      proteinBar.style.width = `${proteinPct}%`;
      proteinBar.textContent = `โปรตีน ${proteinPct}%`;
    }
    if (fiberBar) {
      fiberBar.style.width = `${fiberPct}%`;
      fiberBar.textContent = `ไฟเบอร์ ${fiberPct}%`;
    }

    document.getElementById('dailyCarbTotal').textContent = `${Math.round(totalCarbCal)} kcal`;
    document.getElementById('dailyCarbPct').textContent = `${carbPct}%`;

    document.getElementById('dailyProteinTotal').textContent = `${Math.round(totalProteinCal)} kcal`;
    document.getElementById('dailyProteinPct').textContent = `${proteinPct}%`;

    document.getElementById('dailyFiberTotal').textContent = `${Math.round(totalFiberCal)} kcal`;
    document.getElementById('dailyFiberPct').textContent = `${fiberPct}%`;

    this.dailyMacroPcts = { carbPct, proteinPct, fiberPct };
  }

  // ==========================================
  // TAB 4: ROULETTE WHEEL & EXERCISE LOGIC
  // ==========================================
  initWheel() {
    this.wheel.canvas = document.getElementById('wheelCanvas');
    if (!this.wheel.canvas) return;
    this.wheel.ctx = this.wheel.canvas.getContext('2d');
    this.drawWheel();
  }

  drawWheel() {
    const canvas = this.wheel.canvas;
    if (!canvas) return;
    const ctx = this.wheel.ctx;
    const numSegments = EXERCISES.length;
    const arc = (2 * Math.PI) / numSegments;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.wheel.currentAngle);

    EXERCISES.forEach((ex, i) => {
      const angle = i * arc;

      ctx.beginPath();
      ctx.fillStyle = ex.color;
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + arc);
      ctx.lineTo(0, 0);
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.save();
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Kanit, sans-serif';
      ctx.fillText(`${ex.icon} ${ex.name}`, radius - 16, 5);
      ctx.restore();
    });

    ctx.restore();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();
  }

  spinWheel() {
    if (this.wheel.isSpinning) return;

    const m = this.state.meals;
    const totalIntake = (m.breakfast.cal || 0) + (m.lunch.cal || 0) + (m.dinner.cal || 0) + (m.snacks.cal || 0);
    const surplus = totalIntake - this.state.profile.targetCal;

    this.wheel.isSpinning = true;
    sfx.init();

    const winningIndex = Math.floor(Math.random() * EXERCISES.length);
    const numSegments = EXERCISES.length;
    const arc = (2 * Math.PI) / numSegments;

    const targetAngleAtTop = (3 * Math.PI / 2) - (winningIndex * arc + arc / 2);
    const extraRounds = (5 + Math.floor(Math.random() * 4)) * (2 * Math.PI);
    const finalAngle = targetAngleAtTop + extraRounds;

    const startAngle = this.wheel.currentAngle % (2 * Math.PI);
    const totalDelta = finalAngle - startAngle;
    const duration = 4000;
    const startTime = performance.now();

    let lastTickAngle = startAngle;

    const animateSpin = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      this.wheel.currentAngle = startAngle + totalDelta * easeOut;
      this.drawWheel();

      if (Math.abs(this.wheel.currentAngle - lastTickAngle) >= arc) {
        sfx.playTick();
        lastTickAngle = this.wheel.currentAngle;
      }

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        this.wheel.isSpinning = false;
        sfx.playFanfare();
        const selected = EXERCISES[winningIndex];
        this.onWheelLanded(selected, surplus);
      }
    };

    requestAnimationFrame(animateSpin);
  }

  onWheelLanded(exercise, surplus) {
    this.state.selectedWorkout = exercise;

    document.getElementById('noWorkoutYet').style.display = 'none';
    const planCard = document.getElementById('workoutPlanDetails');
    planCard.style.display = 'block';

    document.getElementById('activityTag').textContent = exercise.category;
    document.getElementById('burnRateTag').textContent = `ระดับความหนัก: MET ${exercise.met.toFixed(1)}`;
    document.getElementById('chosenIcon').textContent = exercise.icon;
    document.getElementById('chosenName').textContent = `${exercise.name} (${exercise.engName})`;
    document.getElementById('chosenDescription').textContent = exercise.desc;

    this.updateWorkoutCalculation(exercise, surplus);
    this.showToast(`🎉 สุ่มได้: ${exercise.name}!`);
  }

  updateWorkoutCalculation(exercise, surplus) {
    const userWeight = this.state.profile.weight || 68;
    const excessCalToBurn = surplus > 20 ? surplus : 250;
    const requiredMinutes = Math.max(5, Math.round((excessCalToBurn * 60) / (exercise.met * userWeight)));

    document.getElementById('calcExcessCal').textContent = `${excessCalToBurn} kcal ${surplus <= 20 ? '(แนะนำเบิร์นทั่วไป)' : '(ส่วนเกินจริง)'}`;
    document.getElementById('calcUserWeight').textContent = `${userWeight} กก.`;
    document.getElementById('calcMinutes').textContent = `${requiredMinutes} นาที`;

    this.setupTimer(requiredMinutes);
  }

  setupTimer(minutes) {
    this.pauseTimer();
    this.state.timer.totalSeconds = minutes * 60;
    this.state.timer.remainingSeconds = minutes * 60;
    this.updateTimerDisplay();
    document.getElementById('timerStartBtn').disabled = false;
    document.getElementById('timerPauseBtn').disabled = true;
  }

  updateTimerDisplay() {
    const total = this.state.timer.totalSeconds || 1;
    const remaining = this.state.timer.remainingSeconds;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    document.getElementById('timerDisplay').textContent = formatted;

    const progress = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
    document.getElementById('timerProgressFill').style.width = `${progress}%`;
  }

  startTimer() {
    if (this.state.timer.isRunning) return;
    if (this.state.timer.remainingSeconds <= 0) {
      this.resetTimer();
    }

    sfx.init();
    this.state.timer.isRunning = true;
    document.getElementById('timerStartBtn').disabled = true;
    document.getElementById('timerPauseBtn').disabled = false;

    this.state.timer.intervalId = setInterval(() => {
      if (this.state.timer.remainingSeconds > 0) {
        this.state.timer.remainingSeconds--;
        this.updateTimerDisplay();
      } else {
        this.pauseTimer();
        sfx.playAlarm();
        this.showToast('🏆 ยินดีด้วยครับ! คุณออกกำลังกายครบเวลาเรียบร้อย เผาผลาญพลังงานสำเร็จ!');
      }
    }, 1000);
  }

  pauseTimer() {
    if (this.state.timer.intervalId) {
      clearInterval(this.state.timer.intervalId);
      this.state.timer.intervalId = null;
    }
    this.state.timer.isRunning = false;
    document.getElementById('timerStartBtn').disabled = false;
    document.getElementById('timerPauseBtn').disabled = true;
  }

  resetTimer() {
    this.pauseTimer();
    this.state.timer.remainingSeconds = this.state.timer.totalSeconds;
    this.updateTimerDisplay();
  }

  // ==========================================
  // TAB 5: SMART FOOD RECOMMENDATIONS
  // ==========================================
  updateSmartAdvice(deficitCal) {
    const macros = this.dailyMacroPcts || { carbPct: 33, proteinPct: 33, fiberPct: 34 };
    const banner = document.getElementById('smartAdviceText');
    if (!banner) return;

    let advice = '';
    if (macros.proteinPct < 25) {
      advice = `วันนี้สัดส่วน <strong>โปรตีนของคุณค่อนข้างน้อย (${macros.proteinPct}%)</strong> และพลังงานยังขาดอีก <strong>${deficitCal} kcal</strong> แนะนำให้เลือกเสริมอาหารหมวดโปรตีน เช่น ไข่ต้ม กรีกโยเกิร์ต หรืออกไก่ เพื่อเสริมสร้างกล้ามเนื้อ`;
    } else if (macros.fiberPct < 20) {
      advice = `วันนี้สัดส่วน <strong>ไฟเบอร์/ผักของคุณค่อนข้างน้อย (${macros.fiberPct}%)</strong> แนะนำผลไม้ใยอาหารสูงอย่าง แอปเปิ้ลเขียว ฝรั่ง หรือสลัดผัก เพื่อช่วยระบบขับถ่าย`;
    } else if (macros.carbPct < 30) {
      advice = `วันนี้คุณทาน <strong>แป้ง/คาร์บน้อยเป็นพิเศษ (${macros.carbPct}%)</strong> ร่างกายอาจอ่อนล้า แนะนำคาร์บเชิงซ้อนคุณภาพดี เช่น มันหวาน ขนมปังโฮลวีท หรือกล้วยหอม`;
    } else {
      advice = `พลังงานของคุณยังขาดอีก <strong>${deficitCal} kcal</strong> สามารถเลือกของว่างเพื่อสุขภาพด้านล่างเพื่อเติมพลังงานให้สมดุลได้เลยครับ`;
    }

    banner.innerHTML = advice;
  }

  renderFoodRecommendations(filterCategory = 'all') {
    const grid = document.getElementById('foodRecsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const filtered = HEALTHY_FOODS.filter(item => {
      if (filterCategory === 'all') return true;
      return item.category === filterCategory;
    });

    filtered.forEach(item => {
      const approxCal = (item.carbGram * 4) + (item.proteinGram * 4) + (item.fiberGram * 2);
      const card = document.createElement('div');
      card.className = 'food-card';
      card.innerHTML = `
        <div>
          <div class="food-card-top">
            <span class="food-card-icon">${item.icon}</span>
            <div class="food-card-title">
              <h4>${item.name}</h4>
              <span class="food-card-cal">+${approxCal} kcal</span>
            </div>
          </div>
          <p class="food-card-desc">${item.desc}</p>
          <div class="food-macro-pills">
            <span class="pill carb">แป้ง ${item.carbGram}g</span>
            <span class="pill protein">โปรตีน ${item.proteinGram}g</span>
            <span class="pill fiber">ไฟเบอร์ ${item.fiberGram}g</span>
          </div>
        </div>
        <button class="btn btn-sm btn-outline btn-block" onclick="app.quickAddFoodSnack('${item.name}', ${item.carbGram}, ${item.proteinGram}, ${item.fiberGram})">
          ➕ เติมลงในมื้อของว่าง
        </button>
      `;
      grid.appendChild(card);
    });
  }

  filterFoodRecs(category, btn) {
    document.querySelectorAll('.recommend-filters .filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.renderFoodRecommendations(category);
  }

  quickAddFoodSnack(name, carbGram, proteinGram, fiberGram) {
    const snacks = this.state.meals.snacks;
    const currentName = snacks.name ? `${snacks.name}, ${name}` : name;
    snacks.name = currentName;
    snacks.carbGram = (snacks.carbGram || 0) + carbGram;
    snacks.proteinGram = (snacks.proteinGram || 0) + proteinGram;
    snacks.fiberGram = (snacks.fiberGram || 0) + fiberGram;
    snacks.isSaved = true;

    const nameInp = document.getElementById('snacksName');
    if (nameInp) nameInp.value = currentName;

    const carbInp = document.getElementById('snacksCarbGram');
    if (carbInp) carbInp.value = snacks.carbGram;

    const proteinInp = document.getElementById('snacksProteinGram');
    if (proteinInp) proteinInp.value = snacks.proteinGram;

    const fiberInp = document.getElementById('snacksFiberGram');
    if (fiberInp) fiberInp.value = snacks.fiberGram;

    this.updateMealFromGrams('snacks');
    this.evaluateEnergyBalance();
    this.syncCurrentMealsToHistory(false);
    this.showToast(`🥗 เติม "${name}" ลงในมื้อของว่างเรียบร้อย!`);
  }

  // ==========================================
  // FOOD PRESET MODAL (WITH GRAMS)
  // ==========================================
  showPresets(targetMeal) {
    this.currentPresetTargetMeal = targetMeal;
    const modal = document.getElementById('presetModal');
    const list = document.getElementById('presetList');
    if (!modal || !list) return;

    list.innerHTML = '';
    FOOD_PRESETS.forEach(preset => {
      const cal = (preset.carbGram * 4) + (preset.proteinGram * 4) + (preset.fiberGram * 2);
      const item = document.createElement('div');
      item.className = 'preset-item';
      item.onclick = () => this.selectPreset(preset);
      item.innerHTML = `
        <div>
          <div class="preset-name">${preset.name}</div>
          <div class="preset-info">แป้ง ${preset.carbGram}g | โปรตีน ${preset.proteinGram}g | ไฟเบอร์ ${preset.fiberGram}g</div>
        </div>
        <div class="preset-cal">${cal} kcal</div>
      `;
      list.appendChild(item);
    });

    modal.classList.add('open');
  }

  closePresets() {
    const modal = document.getElementById('presetModal');
    if (modal) modal.classList.remove('open');
  }

  selectPreset(preset) {
    const meal = this.currentPresetTargetMeal;
    const data = this.state.meals[meal];

    data.name = preset.name;
    data.carbGram = preset.carbGram;
    data.proteinGram = preset.proteinGram;
    data.fiberGram = preset.fiberGram;

    document.getElementById(`${meal}Name`).value = preset.name;
    document.getElementById(`${meal}CarbGram`).value = preset.carbGram;
    document.getElementById(`${meal}ProteinGram`).value = preset.proteinGram;
    document.getElementById(`${meal}FiberGram`).value = preset.fiberGram;

    this.updateMealFromGrams(meal);
    this.evaluateEnergyBalance();
    this.syncCurrentMealsToHistory(false);
    this.closePresets();
    this.showToast(`🍱 เลือกเมนู "${preset.name}" เรียบร้อย`);
  }

  // =======================================================
  // TAB 6: HISTORY & ANALYTICS (WEEKLY & MONTHLY)
  // =======================================================
  setHistoryPeriod(period) {
    this.historyPeriod = period;
    document.getElementById('periodWeeklyBtn')?.classList.toggle('active', period === 'week');
    document.getElementById('periodMonthlyBtn')?.classList.toggle('active', period === 'month');
    document.getElementById('chartPeriodTitle').textContent = period === 'week' ? '7 วันล่าสุด' : '30 วันล่าสุด';
    this.renderHistoryAnalytics();
  }

  getFilteredHistoryDays() {
    const daysLimit = this.historyPeriod === 'week' ? 7 : 30;
    const dateKeys = Object.keys(this.state.history).sort(); // Ascending

    // Build consecutive days up to today or selected date
    const today = new Date();
    const resultDays = [];

    for (let i = daysLimit - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = this.formatDateKey(d);

      if (this.state.history[key]) {
        resultDays.push(this.state.history[key]);
      } else {
        // Empty placeholder day
        resultDays.push({
          date: key,
          targetCal: this.state.profile.targetCal,
          totalCal: 0,
          diff: -this.state.profile.targetCal,
          status: 'empty',
          carbGram: 0,
          proteinGram: 0,
          fiberGram: 0,
          carbPct: 0,
          proteinPct: 0,
          fiberPct: 0,
          meals: {}
        });
      }
    }

    return resultDays;
  }

  renderHistoryAnalytics() {
    const daysData = this.getFilteredHistoryDays();
    const recordedDays = daysData.filter(d => d.totalCal > 0);
    const target = this.state.profile.targetCal || 2000;

    // 1. KPI: Average Calorie
    let totalCals = 0;
    let balanceDaysCount = 0;
    let netDiffSum = 0;
    let sumCarbPct = 0, sumProteinPct = 0, sumFiberPct = 0;

    recordedDays.forEach(d => {
      totalCals += d.totalCal;
      netDiffSum += d.diff;
      if (d.status === 'balanced') balanceDaysCount++;
      sumCarbPct += (d.carbPct || 0);
      sumProteinPct += (d.proteinPct || 0);
      sumFiberPct += (d.fiberPct || 0);
    });

    const avgCal = recordedDays.length > 0 ? Math.round(totalCals / recordedDays.length) : 0;
    const balanceRate = recordedDays.length > 0 ? Math.round((balanceDaysCount / recordedDays.length) * 100) : 0;

    const avgCarb = recordedDays.length > 0 ? Math.round(sumCarbPct / recordedDays.length) : 0;
    const avgProtein = recordedDays.length > 0 ? Math.round(sumProteinPct / recordedDays.length) : 0;
    const avgFiber = recordedDays.length > 0 ? Math.max(0, 100 - avgCarb - avgProtein) : 0;

    // Populate KPIs
    document.getElementById('kpiAvgCal').textContent = avgCal.toLocaleString();
    document.getElementById('kpiTargetSub').textContent = `เทียบกับเป้าหมาย ${target.toLocaleString()} kcal`;

    document.getElementById('kpiBalanceRate').textContent = `${balanceRate}%`;
    document.getElementById('kpiBalanceDays').textContent = `${balanceDaysCount} วัน จากที่บันทึก ${recordedDays.length} วัน`;

    const netEl = document.getElementById('kpiNetDiff');
    const netSubEl = document.getElementById('kpiNetDiffSub');
    if (netEl) {
      netEl.innerHTML = `${netDiffSum > 0 ? '+' : ''}${netDiffSum.toLocaleString()} <span class="unit">kcal</span>`;
      if (netDiffSum > 100) {
        netEl.style.color = 'var(--warning)';
        if (netSubEl) netSubEl.textContent = 'พลังงานเกินสะสม (แนวโน้มน้ำหนักเพิ่ม)';
      } else if (netDiffSum < -100) {
        netEl.style.color = 'var(--info)';
        if (netSubEl) netSubEl.textContent = 'พลังงานขาดสะสม (แนวโน้มน้ำหนักลด)';
      } else {
        netEl.style.color = 'var(--success)';
        if (netSubEl) netSubEl.textContent = 'สมดุลยอดเยี่ยม คุมน้ำหนักได้ดี';
      }
    }

    const macroMiniEl = document.getElementById('kpiMacroAvg');
    if (macroMiniEl) {
      macroMiniEl.innerHTML = `
        <span class="m-carb" title="แป้ง">C: ${avgCarb}%</span> | 
        <span class="m-protein" title="โปรตีน">P: ${avgProtein}%</span> | 
        <span class="m-fiber" title="ไฟเบอร์">F: ${avgFiber}%</span>
      `;
    }

    // 2. Render Chart
    this.renderHistoryChart(daysData, target);

    // 3. Render Logs List
    this.renderHistoryLogsList();
  }

  // Pure HTML5 Canvas Trend Bar Chart
  renderHistoryChart(daysData, targetCal) {
    const canvas = document.getElementById('historyChartCanvas');
    if (!canvas) return;

    const wrapper = canvas.parentElement;
    const clientW = wrapper ? wrapper.clientWidth : 0;
    const clientH = wrapper ? wrapper.clientHeight : 0;
    const displayWidth = Math.max(280, clientW > 16 ? clientW - 16 : 280);
    const displayHeight = Math.max(200, clientH > 16 ? clientH - 16 : 220);

    // High DPI Retina Support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(displayWidth * dpr);
    canvas.height = Math.round(displayHeight * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const padLeft = 45;
    const padBottom = 35;
    const padTop = 25;
    const padRight = 15;

    const chartW = displayWidth - padLeft - padRight;
    const chartH = displayHeight - padTop - padBottom;

    // Determine max Y scale
    let maxCal = targetCal * 1.35;
    daysData.forEach(d => {
      if (d.totalCal > maxCal) maxCal = d.totalCal * 1.15;
    });

    // Draw Y-Axis Grid Lines & Numbers
    const gridSteps = 4;
    ctx.font = '10px Prompt, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridSteps; i++) {
      const val = Math.round((maxCal / gridSteps) * i);
      const y = padTop + chartH - (i / gridSteps) * chartH;

      ctx.beginPath();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.moveTo(padLeft, y);
      ctx.lineTo(displayWidth - padRight, y);
      ctx.stroke();

      ctx.fillText(`${val}`, padLeft - 6, y + 3);
    }

    // Draw Target Line
    const targetY = padTop + chartH - (targetCal / maxCal) * chartH;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.8;
    ctx.moveTo(padLeft, targetY);
    ctx.lineTo(displayWidth - padRight, targetY);
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 10px Kanit, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`เป้า ${targetCal}`, displayWidth - padRight, targetY - 5);
    ctx.restore();

    // Draw Bars
    const numBars = daysData.length;
    const slotW = chartW / numBars;
    const barW = Math.max(8, Math.min(36, slotW * 0.65));

    this.chartBarHitboxes = [];

    daysData.forEach((day, idx) => {
      const slotX = padLeft + idx * slotW;
      const barX = slotX + (slotW - barW) / 2;
      const barH = (day.totalCal / maxCal) * chartH;
      const barY = padTop + chartH - barH;

      // Color based on status
      let barColor = '#cbd5e1'; // default / empty
      if (day.totalCal > 0) {
        if (day.status === 'balanced') barColor = '#10b981';
        else if (day.status === 'surplus') barColor = '#f97316';
        else if (day.status === 'deficit') barColor = '#3b82f6';
      }

      // Draw Bar
      if (barH > 0) {
        ctx.fillStyle = barColor;
        ctx.beginPath();
        const r = Math.min(4, barW / 2);
        ctx.roundRect(barX, barY, barW, barH, [r, r, 0, 0]);
        ctx.fill();

        // Bar Calorie Value on top
        if (barW >= 16) {
          ctx.fillStyle = '#334155';
          ctx.font = 'bold 10px Kanit, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${day.totalCal}`, barX + barW / 2, barY - 4);
        }
      } else {
        // Dot for 0 cal
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(barX + barW / 2, padTop + chartH - 2, 2.5, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Store Hitbox for interaction
      this.chartBarHitboxes.push({
        x: slotX,
        y: padTop,
        w: slotW,
        h: chartH + padBottom,
        dayData: day
      });

      // X-Axis Date Label
      ctx.fillStyle = (day.date === this.currentDate) ? '#10b981' : '#64748b';
      ctx.font = (day.date === this.currentDate) ? 'bold 10px Kanit, sans-serif' : '10px Prompt, sans-serif';
      ctx.textAlign = 'center';

      const dParts = day.date.split('-');
      const labelText = numBars <= 10 ? `${parseInt(dParts[2])} ${['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][parseInt(dParts[1])-1]}` : `${parseInt(dParts[2])}`;
      
      // If 30 days, skip some labels to avoid clutter
      if (numBars > 10 && idx % 3 !== 0 && idx !== numBars - 1) {
        // Skip label
      } else {
        ctx.fillText(labelText, barX + barW / 2, padTop + chartH + 18);
      }
    });

    // Attach click/touch to canvas
    canvas.onclick = (e) => this.handleChartClick(e);
  }

  handleChartClick(event) {
    if (!this.chartBarHitboxes) return;
    const canvas = document.getElementById('historyChartCanvas');
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const hit = this.chartBarHitboxes.find(b => clickX >= b.x && clickX <= b.x + b.w);
    if (hit && hit.dayData) {
      const d = hit.dayData;
      if (d.totalCal > 0) {
        this.showToast(`📊 ${this.formatThaiDate(d.date)}: ${d.totalCal} kcal (${d.diff > 0 ? '+' : ''}${d.diff} kcal)`);
      } else {
        this.showToast(`📅 ${this.formatThaiDate(d.date)}: ยังไม่ได้บันทึกอาหาร`);
      }
    }
  }

  // Render History Logs List
  renderHistoryLogsList() {
    const listContainer = document.getElementById('historyLogsContainer');
    if (!listContainer) return;

    const allKeys = Object.keys(this.state.history).sort().reverse(); // Newest first
    const recordedKeys = allKeys.filter(k => this.state.history[k].totalCal > 0);

    const countEl = document.getElementById('historyLogCount');
    if (countEl) countEl.textContent = recordedKeys.length;

    listContainer.innerHTML = '';

    if (recordedKeys.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📂</div>
          <h4>ยังไม่มีประวัติการบันทึก</h4>
          <p>เมื่อคุณบันทึกมื้ออาหารในแต่ละวัน ข้อมูลจะถูกเก็บรวบรวมไว้ที่นี่อัตโนมัติ หรือกดปุ่ม <strong>"สุ่มตัวอย่าง 7 วัน"</strong> ด้านบนเพื่อทดลองดูสถิติได้ทันที</p>
        </div>
      `;
      return;
    }

    recordedKeys.forEach(dateKey => {
      const log = this.state.history[dateKey];
      const thaiDate = this.formatThaiDate(dateKey);

      let statusText = '🎯 สมดุลพอดี';
      let statusClass = 'balanced';
      if (log.status === 'surplus') {
        statusText = `🔥 เกิน +${log.diff} kcal`;
        statusClass = 'surplus';
      } else if (log.status === 'deficit') {
        statusText = `⚡ ขาด ${log.diff} kcal`;
        statusClass = 'deficit';
      }

      const item = document.createElement('div');
      item.className = 'history-log-item';
      item.innerHTML = `
        <div class="log-date-col">
          <span class="log-date-title">${thaiDate}</span>
          <span class="log-date-sub">${dateKey === this.currentDate ? '⭐ วันที่กำลังเลือก' : 'ประวัติที่บันทึก'}</span>
        </div>

        <div class="log-cal-col">
          <span class="log-cal-val">${log.totalCal.toLocaleString()} kcal</span>
          <span class="log-status-badge ${statusClass}">${statusText}</span>
        </div>

        <div class="log-macro-col">
          <div class="log-macro-label">
            <span>แป้ง ${log.carbPct}%</span>
            <span>โปรตีน ${log.proteinPct}%</span>
            <span>ผัก ${log.fiberPct}%</span>
          </div>
          <div class="mini-plate-bar">
            <div class="plate-part carb" style="width: ${log.carbPct}%;"></div>
            <div class="plate-part protein" style="width: ${log.proteinPct}%;"></div>
            <div class="plate-part fiber" style="width: ${log.fiberPct}%;"></div>
          </div>
        </div>

        <button type="button" class="btn btn-sm btn-outline" onclick="app.viewDateFromLog('${dateKey}')">
          🔍 ดู / แก้ไข
        </button>
      `;

      listContainer.appendChild(item);
    });
  }

  viewDateFromLog(dateKey) {
    this.setDate(dateKey);
    this.switchTab('tab-meals');
  }

  // Demo / Sample Data Generator
  generateDemoHistory(daysCount = 7) {
    const today = new Date();
    const target = this.state.profile.targetCal || 2200;

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = this.formatDateKey(d);

      // Create realistic meal variations
      const variation = (Math.random() - 0.45) * 450; // Random swing
      const dayCal = Math.round(target + variation);
      const diff = dayCal - target;

      let status = 'balanced';
      if (diff > 50) status = 'surplus';
      else if (diff < -50) status = 'deficit';

      const carbGram = Math.round((dayCal * (0.40 + (Math.random() * 0.15 - 0.075))) / 4);
      const proteinGram = Math.round((dayCal * (0.32 + (Math.random() * 0.10 - 0.05))) / 4);
      const fiberGram = Math.max(10, Math.round((dayCal - (carbGram * 4) - (proteinGram * 4)) / 2));

      const carbCal = carbGram * 4;
      const proteinCal = proteinGram * 4;
      const fiberCal = fiberGram * 2;
      const actualTotal = carbCal + proteinCal + fiberCal;

      const carbPct = Math.round((carbCal / actualTotal) * 100);
      const proteinPct = Math.round((proteinCal / actualTotal) * 100);
      const fiberPct = Math.max(0, 100 - carbPct - proteinPct);

      this.state.history[key] = {
        date: key,
        targetCal: target,
        totalCal: actualTotal,
        diff: actualTotal - target,
        status: status,
        carbGram: carbGram,
        proteinGram: proteinGram,
        fiberGram: fiberGram,
        carbPct: carbPct,
        proteinPct: proteinPct,
        fiberPct: fiberPct,
        meals: {
          breakfast: { name: 'ข้าวต้มอกไก่ + ไข่ต้ม', carbGram: Math.round(carbGram * 0.35), proteinGram: Math.round(proteinGram * 0.35), fiberGram: Math.round(fiberGram * 0.3), cal: Math.round(actualTotal * 0.35), isSaved: true },
          lunch: { name: 'ข้าวกะเพราอกไก่ + ผัดผัก', carbGram: Math.round(carbGram * 0.40), proteinGram: Math.round(proteinGram * 0.40), fiberGram: Math.round(fiberGram * 0.4), cal: Math.round(actualTotal * 0.40), isSaved: true },
          dinner: { name: 'สลัดปลาแซลมอนย่าง', carbGram: Math.round(carbGram * 0.25), proteinGram: Math.round(proteinGram * 0.25), fiberGram: Math.round(fiberGram * 0.3), cal: Math.round(actualTotal * 0.25), isSaved: true },
          snacks: { name: '', carbGram: 0, proteinGram: 0, fiberGram: 0, cal: 0, isSaved: false }
        },
        savedAt: new Date().toISOString()
      };
    }

    this.saveState();
    this.renderHistoryAnalytics();
    this.showToast(`✨ สุ่มสร้างข้อมูลประวัติตัวอย่าง ${daysCount} วันเรียบร้อยแล้ว!`);
  }

  clearHistoryData() {
    if (confirm('คุณต้องการลบประวัติการบันทึกทั้งหมดใช่หรือไม่?')) {
      this.state.history = {};
      this.saveState();
      this.renderHistoryAnalytics();
      this.showToast('🗑️ ล้างประวัติสถิติทั้งหมดเรียบร้อย');
    }
  }

  // ==========================================
  // AUTHENTICATION & USER CONTROLLERS
  // ==========================================
  initAuth() {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (!savedUsers) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      }
      const savedCur = localStorage.getItem(CURRENT_USER_KEY);
      if (savedCur) {
        this.currentUser = JSON.parse(savedCur);
      }
    } catch (e) {
      console.warn('Auth initialization error:', e);
    }
  }

  getUsers() {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [...DEFAULT_USERS];
  }

  saveUsers(users) {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Save users error:', e);
    }
  }

  setCurrentUser(user) {
    this.currentUser = user;
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (e) {}

    // Load isolated state for this user
    this.loadState();
    this.calculateProfile(false);
    this.renderProfileResults();
    this.loadMealsForDate(this.currentDate);
    this.renderMealInputs();
    this.evaluateEnergyBalance();
    this.renderHistoryAnalytics();
    this.renderAuthStatus();
  }

  renderAuthStatus() {
    const container = document.getElementById('authStatusContainer');
    if (!container) return;

    if (!this.currentUser) {
      container.innerHTML = `
        <div class="auth-btn-group">
          <button type="button" class="btn btn-login-top btn-sm" onclick="app.openAuthModal(false, 'login')" title="เข้าสู่ระบบ fitจัง">
            🔑 เข้าสู่ระบบ (Login)
          </button>
          <button type="button" class="btn btn-signup-top btn-sm" onclick="app.openAuthModal(false, 'signup')" title="สมัครสมาชิกใหม่">
            📝 สมัครสมาชิก
          </button>
        </div>
      `;
    } else {
      const isAdmin = this.currentUser.role === 'admin';
      const nickname = this.currentUser.nickname ? `(${this.currentUser.nickname})` : '';
      const fullDisplayName = this.currentUser.realName ? `${this.currentUser.realName} ${nickname}`.trim() : (this.currentUser.phone || 'ผู้ใช้');
      const shortName = this.currentUser.nickname || this.currentUser.realName || this.currentUser.phone;
      const roleLabel = isAdmin ? 'Admin' : 'User';

      container.innerHTML = `
        <div class="user-profile-top">
          <div class="user-display-badge" title="${this.escapeHtml(fullDisplayName)} | ${this.currentUser.phone}">
            <span class="user-avatar-icon">${isAdmin ? '👑' : '👤'}</span>
            <div class="user-text-info">
              <span class="user-display-name">${this.escapeHtml(shortName)}</span>
              <span class="badge-role ${this.currentUser.role}">${roleLabel}</span>
            </div>
          </div>
          ${isAdmin ? `
            <button type="button" class="btn btn-admin-top btn-sm" onclick="app.openAdminModal()" title="เปิดแดชบอร์ดแอดมิน">
              🛡️ แดชบอร์ด
            </button>
          ` : ''}
          <button type="button" class="btn btn-logout-top btn-sm" onclick="app.logout()" title="ออกจากระบบ (Logout)">
            🚪 ออกจากระบบ (Logout)
          </button>
        </div>
      `;
    }
  }

  // Intercept any saving action if user is not authenticated
  requireAuth(actionCallback) {
    if (this.currentUser) {
      return true;
    }
    this.pendingAuthAction = actionCallback;
    this.openAuthModal(true, 'login');
    return false;
  }

  openAuthModal(isRequiredNotice = false, initialTab = 'login') {
    const modal = document.getElementById('authModal');
    const notice = document.getElementById('authRequireNotice');
    const errBox = document.getElementById('authErrorMessage');
    if (notice) {
      notice.style.display = isRequiredNotice ? 'block' : 'none';
    }
    if (errBox) {
      errBox.style.display = 'none';
      errBox.textContent = '';
    }
    this.switchAuthTab(initialTab);
    if (modal) modal.classList.add('open');
  }

  closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('open');
    this.pendingAuthAction = null;
    const errBox = document.getElementById('authErrorMessage');
    if (errBox) {
      errBox.style.display = 'none';
      errBox.textContent = '';
    }
  }

  switchAuthTab(tab) {
    const loginBtn = document.getElementById('authTabLoginBtn');
    const signupBtn = document.getElementById('authTabSignupBtn');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const errBox = document.getElementById('authErrorMessage');
    if (errBox) {
      errBox.style.display = 'none';
      errBox.textContent = '';
    }

    if (tab === 'login') {
      if (loginBtn) loginBtn.classList.add('active');
      if (signupBtn) signupBtn.classList.remove('active');
      if (loginForm) loginForm.style.display = 'block';
      if (signupForm) signupForm.style.display = 'none';
    } else {
      if (signupBtn) signupBtn.classList.add('active');
      if (loginBtn) loginBtn.classList.remove('active');
      if (signupForm) signupForm.style.display = 'block';
      if (loginForm) loginForm.style.display = 'none';
    }
  }

  showAuthError(msg) {
    const errBox = document.getElementById('authErrorMessage');
    if (errBox) {
      errBox.textContent = msg;
      errBox.style.display = 'block';
    }
    this.showToast(msg);
  }

  fillDemoAccount(phone, password) {
    const pInp = document.getElementById('loginPhone');
    const passInp = document.getElementById('loginPassword');
    if (pInp) pInp.value = phone;
    if (passInp) passInp.value = password;
    const errBox = document.getElementById('authErrorMessage');
    if (errBox) errBox.style.display = 'none';
    sfx.playTick();
  }

  handleLoginSubmit(e) {
    if (e) e.preventDefault();
    const phone = (document.getElementById('loginPhone')?.value || '').trim();
    const password = document.getElementById('loginPassword')?.value || '';

    if (!phone || !password) {
      this.showAuthError('⚠️ กรุณากรอกเบอร์โทรศัพท์และรหัสผ่าน');
      return;
    }

    const users = this.getUsers();
    const user = users.find(u => u.phone === phone && u.password === password);

    if (!user) {
      this.showAuthError('❌ เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    const callback = this.pendingAuthAction;
    this.pendingAuthAction = null;

    try {
      this.setCurrentUser(user);
    } catch (err) {
      console.warn('setCurrentUser error:', err);
    }

    this.closeAuthModal();
    sfx.playFanfare();
    this.showToast(`🎉 เข้าสู่ระบบสำเร็จ ยินดีต้อนรับคุณ ${user.nickname || user.realName}!`);

    setTimeout(() => {
      window.location.reload();
    }, 300);
  }

  handleSignupSubmit(e) {
    if (e) e.preventDefault();
    const phone = (document.getElementById('signupPhone')?.value || '').trim();
    const realName = (document.getElementById('signupRealName')?.value || '').trim();
    const nickname = (document.getElementById('signupNickname')?.value || '').trim();
    const password = document.getElementById('signupPassword')?.value || '';
    const confirmPassword = document.getElementById('signupConfirmPassword')?.value || '';

    if (!phone || !/^[0-9]{9,10}$/.test(phone)) {
      this.showAuthError('⚠️ เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก');
      return;
    }
    if (!realName || !nickname) {
      this.showAuthError('⚠️ กรุณากรอกชื่อจริงและชื่อเล่น');
      return;
    }
    if (password.length < 4) {
      this.showAuthError('⚠️ รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      this.showAuthError('⚠️ รหัสผ่านยืนยันไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    const users = this.getUsers();
    if (users.some(u => u.phone === phone)) {
      this.showAuthError('⚠️ เบอร์โทรศัพท์นี้ถูกลงทะเบียนไว้แล้ว');
      return;
    }

    const newUser = {
      phone: phone,
      password: password,
      realName: realName,
      nickname: nickname,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    const callback = this.pendingAuthAction;
    this.pendingAuthAction = null;

    try {
      this.setCurrentUser(newUser);
    } catch (err) {
      console.warn('setCurrentUser error:', err);
    }

    this.closeAuthModal();
    sfx.playFanfare();
    this.showToast(`🎉 สมัครสมาชิกสำเร็จ! ยินดีต้อนรับคุณ ${newUser.nickname}`);

    setTimeout(() => {
      window.location.reload();
    }, 300);
  }

  logout() {
    if (this.currentUser) {
      this.saveState();
    }
    this.currentUser = null;
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {}

    // Reset to guest data
    this.loadState();
    this.calculateProfile(false);
    this.renderProfileResults();
    this.loadMealsForDate(this.currentDate);
    this.renderMealInputs();
    this.evaluateEnergyBalance();
    this.renderHistoryAnalytics();
    this.renderAuthStatus();
    this.closeAdminModal();
    this.showToast('👋 ออกจากระบบเรียบร้อย (กำลังรีเฟรช...)');
    setTimeout(() => {
      window.location.reload();
    }, 250);
  }

  // ==========================================
  // ADMIN DASHBOARD CONTROLLER
  // ==========================================
  openAdminModal() {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.showToast('⛔ เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่เข้าถึงได้');
      return;
    }
    this.renderAdminDashboard();
    const modal = document.getElementById('adminModal');
    if (modal) modal.classList.add('open');
  }

  closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.classList.remove('open');
  }

  renderAdminDashboard() {
    const users = this.getUsers();
    const totalUsersEl = document.getElementById('adminTotalUsers');
    const userRoleEl = document.getElementById('adminUserRoleCount');
    const adminRoleEl = document.getElementById('adminAdminRoleCount');
    const tbody = document.getElementById('adminUserTableBody');

    const totalCount = users.length;
    const userCount = users.filter(u => u.role === 'user').length;
    const adminCount = users.filter(u => u.role === 'admin').length;

    if (totalUsersEl) totalUsersEl.textContent = totalCount;
    if (userRoleEl) userRoleEl.textContent = userCount;
    if (adminRoleEl) adminRoleEl.textContent = adminCount;

    if (!tbody) return;
    tbody.innerHTML = '';

    users.forEach(u => {
      const isSelf = this.currentUser && this.currentUser.phone === u.phone;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${this.escapeHtml(u.phone)}</strong></td>
        <td>${this.escapeHtml(u.realName || '-')}</td>
        <td><span class="user-nickname-tag">${this.escapeHtml(u.nickname || '-')}</span></td>
        <td><span class="badge-role ${u.role}">${u.role === 'admin' ? '👑 Admin' : '👤 User'}</span></td>
        <td><small class="text-muted">${this.formatUserDate(u.createdAt)}</small></td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn btn-sm btn-outline-warning" onclick="app.openAdminResetModal('${u.phone}')" title="รีเซ็ตรหัสผ่าน">
              🔑 รีเซ็ต
            </button>
            ${!isSelf ? `
              <button type="button" class="btn btn-sm btn-outline-danger" onclick="app.adminDeleteUser('${u.phone}')" title="ลบผู้ใช้">
                🗑️ ลบ
              </button>
            ` : `
              <span class="text-muted" style="font-size: 0.75rem; align-self: center;">(บัญชีคุณ)</span>
            `}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  toggleAdminAddUserForm() {
    const box = document.getElementById('adminAddUserContainer');
    if (!box) return;
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
  }

  handleAdminCreateUser(e) {
    if (e) e.preventDefault();
    const phone = (document.getElementById('adminNewPhone')?.value || '').trim();
    const password = document.getElementById('adminNewPassword')?.value || '';
    const realName = (document.getElementById('adminNewRealName')?.value || '').trim();
    const nickname = (document.getElementById('adminNewNickname')?.value || '').trim();
    const role = document.getElementById('adminNewRole')?.value || 'user';

    if (!phone || !/^[0-9]{9,10}$/.test(phone)) {
      this.showToast('⚠️ เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก');
      return;
    }
    if (!password || password.length < 4) {
      this.showToast('⚠️ รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
      return;
    }

    const users = this.getUsers();
    if (users.some(u => u.phone === phone)) {
      this.showToast('⚠️ เบอร์โทรศัพท์นี้มีในระบบแล้ว');
      return;
    }

    const newUser = {
      phone,
      password,
      realName,
      nickname,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    this.renderAdminDashboard();

    const form = document.getElementById('adminCreateUserForm');
    if (form) form.reset();
    this.toggleAdminAddUserForm();
    this.showToast(`✅ เพิ่มผู้ใช้งาน ${phone} (${role}) สำเร็จ`);
  }

  openAdminResetModal(phone) {
    const users = this.getUsers();
    const user = users.find(u => u.phone === phone);
    if (!user) return;

    this.resetTargetUserPhone = phone;
    const nameEl = document.getElementById('resetTargetName');
    const phoneEl = document.getElementById('resetTargetPhone');
    const passInp = document.getElementById('resetNewPassword');

    if (nameEl) nameEl.textContent = user.nickname ? `${user.realName} (${user.nickname})` : user.realName;
    if (phoneEl) phoneEl.textContent = user.phone;
    if (passInp) passInp.value = '';

    const modal = document.getElementById('adminResetModal');
    if (modal) modal.classList.add('open');
  }

  closeAdminResetModal() {
    const modal = document.getElementById('adminResetModal');
    if (modal) modal.classList.remove('open');
    this.resetTargetUserPhone = null;
  }

  generateRandomPassword() {
    const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
    let res = '';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const passInp = document.getElementById('resetNewPassword');
    if (passInp) passInp.value = res;
    sfx.playTick();
  }

  handleAdminResetPasswordSubmit(e) {
    if (e) e.preventDefault();
    if (!this.resetTargetUserPhone) return;

    const passInp = document.getElementById('resetNewPassword');
    const newPass = passInp ? passInp.value.trim() : '';

    if (!newPass || newPass.length < 4) {
      this.showToast('⚠️ รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
      return;
    }

    const users = this.getUsers();
    const user = users.find(u => u.phone === this.resetTargetUserPhone);
    if (!user) {
      this.showToast('❌ ไม่พบบัญชีผู้ใช้นี้');
      return;
    }

    user.password = newPass;
    this.saveUsers(users);

    // If resetting currently logged in user's password, update current session
    if (this.currentUser && this.currentUser.phone === user.phone) {
      this.currentUser.password = newPass;
      try {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));
      } catch (err) {}
    }

    const phone = this.resetTargetUserPhone;
    this.closeAdminResetModal();
    this.showToast(`🔑 รีเซ็ตรหัสผ่านสำหรับ ${phone} เป็น "${newPass}" สำเร็จ`);
  }

  adminDeleteUser(phone) {
    if (this.currentUser && this.currentUser.phone === phone) {
      this.showToast('⚠️ ไม่สามารถลบบัญชีของตัวเองได้');
      return;
    }

    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี ${phone}?`)) {
      return;
    }

    let users = this.getUsers();
    users = users.filter(u => u.phone !== phone);
    this.saveUsers(users);

    try {
      localStorage.removeItem(`fitpulse_user_data_${phone}`);
    } catch (e) {}

    this.renderAdminDashboard();
    this.showToast(`🗑️ ลบบัญชีผู้ใช้ ${phone} สำเร็จ`);
  }

  toggle3DAvatarModel() {
    if (!this.body3d) return;
    const current = this.body3d.activeModelKey;
    const nextModel = (current === 'xbot' ? 'michelle' : 'xbot');
    const newGender = (nextModel === 'xbot' ? 'male' : 'female');

    this.body3d.loadModel(nextModel, () => {
      this.body3d.metrics.gender = newGender;
      this.body3d.updateMorphTargets(this.state.profile);
      this.body3d.setPose(this.body3d.currentPose, true);
      this.updateAvatarModelButtonText();
    });

    if (typeof sfx !== 'undefined') sfx.playTick();
    this.showToast(`สลับโมเดลเป็น: ${nextModel === 'xbot' ? '👨 ชาย (อเล็กซ์)' : '👩 หญิง (มิเชล)'}`);
  }

  updateAvatarModelButtonText() {
    const btn = document.getElementById('btnToggleCharacterModel');
    if (!btn || !this.body3d) return;
    if (this.body3d.activeModelKey === 'michelle') {
      btn.innerHTML = '👩 มิเชล (คลิกสลับเป็นชาย)';
    } else {
      btn.innerHTML = '👨 อเล็กซ์ (คลิกสลับเป็นหญิง)';
    }
  }

  // ==========================================
  // AVATAR CUSTOMIZER STUDIO CONTROLLERS
  // ==========================================
  openAvatarStudio() {
    const modal = document.getElementById('avatarStudioModal');
    if (!modal) return;

    if (!this.state.profile.avatarConfig) {
      this.state.profile.avatarConfig = this.body3d ? this.body3d.getAvatarConfig() : {
        hairStyle: 'bowl',
        hairColor: '#3d2314',
        skinColor: '#fce0d2',
        eyeColor: '#2a1708',
        shirtStyle: 'striped',
        shirtColor1: '#4a47a3',
        shirtColor2: '#f5a623',
        collarColor: '#f5a623',
        shortsStyle: 'dots',
        shortsColor: '#1f2e69',
        glasses: 'none',
        headphones: false,
        blush: true
      };
    }

    this.syncAvatarStudioUI();
    modal.classList.add('open');
    if (typeof sfx !== 'undefined') sfx.playTick();
  }

  closeAvatarStudio() {
    const modal = document.getElementById('avatarStudioModal');
    if (modal) modal.classList.remove('open');
  }

  switchStudioTab(tabId) {
    document.querySelectorAll('.studio-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.studiotab === tabId);
    });
    document.querySelectorAll('.studio-tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `studio-${tabId}`);
    });
    if (typeof sfx !== 'undefined') sfx.playTick();
  }

  onAvatarCustomChange(key, value) {
    if (!this.state.profile.avatarConfig) {
      this.state.profile.avatarConfig = {};
    }
    this.state.profile.avatarConfig[key] = value;

    // Real-time 3D update
    if (this.body3d) {
      this.body3d.setAvatarConfig({ [key]: value });
    }

    // Update active button highlights in studio
    this.syncAvatarStudioUI();
    if (typeof sfx !== 'undefined') sfx.playTick();
  }

  syncAvatarStudioUI() {
    const cfg = this.state.profile.avatarConfig || {};

    // 1. Style Buttons (Hair, Shirt, Shorts, Glasses)
    document.querySelectorAll('.studio-opt-btn').forEach(btn => {
      const opt = btn.dataset.opt;
      const val = btn.dataset.val;
      if (opt && val) {
        btn.classList.toggle('active', cfg[opt] === val);
      }
    });

    // 2. Color Swatches
    document.querySelectorAll('.color-swatch-btn').forEach(btn => {
      const opt = btn.dataset.opt;
      const val = btn.dataset.val;
      if (opt && val) {
        btn.classList.toggle('active', (cfg[opt] || '').toLowerCase() === val.toLowerCase());
      }
    });

    // 3. Toggles
    const blushTog = document.getElementById('studioBlushToggle');
    if (blushTog) blushTog.checked = cfg.blush !== false;

    const hpTog = document.getElementById('studioHeadphonesToggle');
    if (hpTog) hpTog.checked = !!cfg.headphones;
  }

  resetAvatarToReference() {
    if (this.body3d) {
      this.body3d.resetToReference();
      this.state.profile.avatarConfig = this.body3d.getAvatarConfig();
    }
    this.syncAvatarStudioUI();
    this.saveState();
    if (typeof sfx !== 'undefined') sfx.playFanfare();
    this.showToast('⭐ คืนค่าเป็นตัวละครตามภาพต้นแบบเรียบร้อยแล้ว!');
  }

  randomizeAvatarLook() {
    if (this.body3d) {
      this.body3d.randomizeAvatar();
      this.state.profile.avatarConfig = this.body3d.getAvatarConfig();
    }
    this.syncAvatarStudioUI();
    if (typeof sfx !== 'undefined') sfx.playTick();
    this.showToast('🎲 สุ่มลุคใหม่เรียบร้อยแล้ว!');
  }

  saveAvatarLook() {
    if (this.body3d) {
      this.state.profile.avatarConfig = this.body3d.getAvatarConfig();
    }
    this.saveState();
    this.closeAvatarStudio();
    if (typeof sfx !== 'undefined') sfx.playFanfare();
    this.showToast('💾 บันทึกการแต่งตัวตัวละครเรียบร้อยแล้ว!');
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  formatUserDate(isoStr) {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return isoStr;
    }
  }

  // Toast Notification
  showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = 'block';
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }
}

// Global App Instance
const app = new FitPulseApp();
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
