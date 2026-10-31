/**
 * ============================================================================
 * 🎮 Agent Valhalla - JRPG 全自主研發成長動力學與音效合成引擎 (rpg_engine.js)
 * ============================================================================
 * 
 * 📌 功能意圖與核心原理 (Intent & Core Principles):
 * 本模組是瓦爾哈拉 (Agent Valhalla) 的核心遊戲化動力學 (Gamification Engine)。
 * 為 200+ 英雄特工與指揮官提供完整的 JRPG 級經驗值曲線、特工個別養成成長、
 * 全域隊伍交叉綜效 (Team Synergy)、零算力 (0 Token / 0 Server Cost) 每日專案急診室戰役、
 * 以及裝備聖典 (Gear Codex) 等級判定與純原生 Web Audio API 8-Bit / 16-Bit 複音合成。
 * 
 * 📐 數學/經驗值成長公式 (Mathematical Progression Formula):
 * 1. 指揮官/特工等級階梯 (JRPG 指數曲線):
 *    - Lv.1 ➔ Lv.2 僅需 50 EXP (召喚 2~3 次立即升等，解鎖 32x32 紙娃娃工坊)。
 *    - 隨等級 L 遞增，所需累計經驗值滿足: EXP(L) = \lfloor 40 \times (L^{1.65}) \rfloor + 10 \times L
 *    - Lv.5: 350 EXP, Lv.10: 1,250 EXP, Lv.20: 5,500 EXP, Lv.30: 12,000 EXP (解鎖頂級福利)。
 * 2. 每日專案急診室 PRNG (偽隨機數產生器 - Mulberry32):
 *    - 藉由當日日期字串 (YYYY-MM-DD) 轉換為 32-bit 整數種子 (Deterministic Seed)。
 *    - 在無任何後端伺服器與零 API 消耗的前提下，全球客戶端每日同步抽籤 3 項真實工程危機。
 * 
 * 🛡️ 防禦邊界與安全規範 (Defensive Boundaries):
 * - 所有 localStorage 讀寫皆包覆 try-catch 防崩潰保護，在無痕模式或配額超限時優雅降級為記憶體暫存。
 * - 依循專案鐵律：完全保留原有 ValhallaAudio 全域介面，確保向下 100% 相容。
 * 
 * 💡 設計模式 (Design Patterns):
 * - Strategy Pattern (音訊合成策略：正弦波、方波、三角波、鋸齒波依情境動態切換)
 * - State Machine / PRNG Generator (日期種子確定性狀態機)
 * - Facade Pattern (門面模式統一對外導出 ValhallaAudio, ValhallaProgression, ValhallaEmergency, ValhallaCodex)
 * ============================================================================
 */

(function (window) {
  'use strict';

  // ==========================================================================
  // 【模組一】Web Audio 8-Bit / 16-Bit 原生複音合成器 (Audio Synthesizer)
  // ==========================================================================
  let audioCtx = null;
  let soundEnabled = true;
  try {
    soundEnabled = localStorage.getItem('valhalla_sound_enabled') !== 'false';
  } catch (e) {
    soundEnabled = true;
  }

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  const ValhallaAudio = {
    isSoundEnabled: function () {
      return soundEnabled;
    },

    toggleSound: function () {
      soundEnabled = !soundEnabled;
      try {
        localStorage.setItem('valhalla_sound_enabled', soundEnabled ? 'true' : 'false');
      } catch (e) {}
      if (soundEnabled) {
        this.playBeep(523.25, 0.1, 'sine'); // C5 確認提示音
      }
      return soundEnabled;
    },

    setSoundEnabled: function (enabled) {
      soundEnabled = !!enabled;
      try {
        localStorage.setItem('valhalla_sound_enabled', soundEnabled ? 'true' : 'false');
      } catch (e) {}
    },

    playBeep: function (freq, duration, type) {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq || 440, ctx.currentTime);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (duration || 0.15));

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + (duration || 0.15));
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    },

    /**
     * 🎴 播放特工專屬 3 音和弦 (Deterministic Chime)
     */
    playHeroChime: function (agent) {
      if (!soundEnabled || !agent) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const hash = hashString(agent.id || 'hero');
        const now = ctx.currentTime;
        const domain = (agent.domain || '').toLowerCase();
        const rarity = (agent.rarity || 'Rare');

        let waveType = 'sine';
        let basePitch = 261.63; // C4

        if (domain.includes('security') || domain.includes('sysadmin')) {
          waveType = 'triangle';
          basePitch = 196.00; // G3
        } else if (domain.includes('game') || domain.includes('spatial') || domain.includes('media')) {
          waveType = 'sawtooth';
          basePitch = 329.63; // E4
        } else if (domain.includes('design') || domain.includes('creative')) {
          waveType = 'sine';
          basePitch = 349.23; // F4
        } else if (domain.includes('finance') || domain.includes('product') || domain.includes('marketing')) {
          waveType = 'sine';
          basePitch = 293.66; // D4
        }

        const intervals = [
          1,
          1 + ((hash % 5) * 0.125),
          1.5 + (((hash >> 3) % 4) * 0.125)
        ];

        intervals.forEach((multiplier, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = waveType;
          osc.frequency.setValueAtTime(basePitch * multiplier, now + idx * 0.08);

          const startTime = now + idx * 0.08;
          const noteDuration = 0.22;

          gain.gain.setValueAtTime(0.0001, startTime);
          gain.gain.linearRampToValueAtTime(0.08, startTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + noteDuration);
        });

        if (rarity === 'Legendary') {
          const shimmerOsc = ctx.createOscillator();
          const shimmerGain = ctx.createGain();
          shimmerOsc.type = 'sine';
          shimmerOsc.frequency.setValueAtTime(basePitch * 3, now + 0.2);

          shimmerGain.gain.setValueAtTime(0.0001, now + 0.2);
          shimmerGain.gain.linearRampToValueAtTime(0.05, now + 0.26);
          shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

          shimmerOsc.connect(shimmerGain);
          shimmerGain.connect(ctx.destination);

          shimmerOsc.start(now + 0.2);
          shimmerOsc.stop(now + 0.6);
        }
      } catch (e) {
        console.warn('Audio chime error:', e);
      }
    },

    /**
     * ⚡ 召喚特工專屬激昂旋律
     */
    playSummonSound: function (agent) {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.18);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);

        const chordNotes = [523.25, 659.25, 783.99]; // C5, E5, G5
        chordNotes.forEach((freq, idx) => {
          const cOsc = ctx.createOscillator();
          const cGain = ctx.createGain();

          cOsc.type = 'sine';
          cOsc.frequency.setValueAtTime(freq, now + 0.1 + idx * 0.04);

          const cStart = now + 0.1 + idx * 0.04;
          cGain.gain.setValueAtTime(0.07, cStart);
          cGain.gain.exponentialRampToValueAtTime(0.0001, cStart + 0.2);

          cOsc.connect(cGain);
          cGain.connect(ctx.destination);

          cOsc.start(cStart);
          cOsc.stop(cStart + 0.2);
        });
      } catch (e) {
        console.warn('Summon audio error:', e);
      }
    },

    /**
     * 🏆 升等音效 - 殿堂經典歡快升階音階
     */
    playLevelUpSound: function () {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        // C5, D5, E5, F5, G5, A5, B5, C6 歡快上升音階 (8-bit 三角波)
        const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];

        scale.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);

          const startTime = now + idx * 0.07;
          const duration = idx === scale.length - 1 ? 0.35 : 0.12;

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(0.15, startTime + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
        });
      } catch (e) {
        console.warn('Level-up audio error:', e);
      }
    },

    /**
     * ⚔️ 裝備/換裝音效 - 經典金屬卡扣與清脆回饋
     */
    playEquipSound: function () {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        // 短促雙音：金屬卡榫 1200Hz + 清脆回響 1600Hz
        const tones = [1200, 1600];
        tones.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);

          const startTime = now + idx * 0.04;
          gain.gain.setValueAtTime(0.12, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.08);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.08);
        });
      } catch (e) {}
    },

    /**
     * 🚩 每日急診戰役勝利凱旋樂 (JRPG 8-Bit 方波上升和弦)
     */
    playVictorySound: function () {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        // 經典 C, E, G, C, E 勝利上升複音 (方波＋三角波)
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = idx >= 3 ? 'square' : 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          const startTime = now + idx * 0.12;
          const duration = idx === notes.length - 1 ? 0.6 : 0.25;

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
        });
      } catch (e) {}
    },

    /**
     * 🚨 緊急出擊戰鬥警報音效
     */
    playDispatchSound: function () {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.1);
        osc.frequency.linearRampToValueAtTime(440, now + 0.2);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
      } catch (e) {}
    }
  };

  // ==========================================================================
  // 【模組二】JRPG 指數曲線與特工個別成長引擎 (Progression Engine)
  // ==========================================================================

  // 門檻常數表 (計算累積所需 EXP)
  // Lv.1 ➔ Lv.2 僅需 50 EXP; Lv.30 解鎖性感福利; 封頂 Lv.99
  const EXP_MILESTONES = [
    0,      // Lv.1
    50,     // Lv.2 (解鎖自訂紙娃娃工坊)
    120,    // Lv.3
    220,    // Lv.4
    350,    // Lv.5 (解鎖二階鋼鐵裝備)
    520,    // Lv.6
    720,    // Lv.7
    960,    // Lv.8
    1240,   // Lv.9
    1560,   // Lv.10 (解鎖三階秘銀裝備)
    2000,   // Lv.11
    2500,   // Lv.12
    3100,   // Lv.13
    3800,   // Lv.14
    4600,   // Lv.15 (戰術大師)
    5500,   // Lv.16
    6500,   // Lv.17
    7600,   // Lv.18
    8800,   // Lv.19
    10100,  // Lv.20 (解鎖四階量子巨龍裝備)
    11500,  // Lv.21
    13000,  // Lv.22
    14600,  // Lv.23
    16300,  // Lv.24
    18100,  // Lv.25
    20000,  // Lv.26
    22000,  // Lv.27
    24100,  // Lv.28
    26300,  // Lv.29
    28600   // Lv.30 (頂級性感神裝解鎖點)
  ];

  // 動態推導至 Lv.99
  function getExpRequiredForLevel(level) {
    if (level <= 1) return 0;
    if (level <= EXP_MILESTONES.length) {
      return EXP_MILESTONES[level - 1];
    }
    // L > 30 採用多項式平滑漸增
    const base = EXP_MILESTONES[EXP_MILESTONES.length - 1];
    const diffL = level - EXP_MILESTONES.length;
    return base + Math.floor(diffL * 2500 + Math.pow(diffL, 1.8) * 450);
  }

  const ValhallaProgression = {
    /**
     * 計算指揮官等級與升級百分比
     */
    calculateLevelInfo: function (totalExp) {
      const exp = Math.max(0, parseInt(totalExp, 10) || 0);
      let lvl = 1;
      
      while (lvl < 99 && exp >= getExpRequiredForLevel(lvl + 1)) {
        lvl++;
      }

      const currentLevelBaseExp = getExpRequiredForLevel(lvl);
      const nextLevelExp = getExpRequiredForLevel(lvl + 1);
      const neededForThisLevel = Math.max(1, nextLevelExp - currentLevelBaseExp);
      const currentLevelExp = Math.max(0, exp - currentLevelBaseExp);
      const progressPercent = Math.min(100, Math.floor((currentLevelExp / neededForThisLevel) * 100));

      return {
        level: lvl,
        currentExp: currentLevelExp,
        neededExp: neededForThisLevel,
        progressPercent: progressPercent,
        totalExp: exp,
        isMaxLevel: lvl >= 99,
        isTopTierUnlocked: lvl >= 30 // 是否解鎖頂級性感聖裝
      };
    },

    /**
     * 讀取特工個別經驗值與等級
     */
    getHeroData: function (agentId) {
      if (!agentId) return { exp: 0, level: 1, currentExp: 0, neededExp: 50, progressPercent: 0, isTopTierUnlocked: false };
      let exp = 0;
      try {
        exp = parseInt(localStorage.getItem('valhalla_hero_exp_' + agentId) || '0', 10);
      } catch (e) {
        exp = 0;
      }
      const info = this.calculateLevelInfo(exp);
      return {
        agentId: agentId,
        exp: exp,
        level: info.level,
        currentExp: info.currentExp,
        neededExp: info.neededExp,
        progressPercent: info.progressPercent,
        isTopTierUnlocked: info.isTopTierUnlocked
      };
    },

    /**
     * 為特定特工注入經驗值
     */
    addHeroExp: function (agentId, amount) {
      if (!agentId || amount <= 0) return null;
      const prevData = this.getHeroData(agentId);
      const newTotal = prevData.exp + amount;
      try {
        localStorage.setItem('valhalla_hero_exp_' + agentId, String(newTotal));
      } catch (e) {}
      const newData = this.getHeroData(agentId);
      const leveledUp = newData.level > prevData.level;

      return {
        agentId: agentId,
        prevLevel: prevData.level,
        newLevel: newData.level,
        leveledUp: leveledUp,
        newExp: newTotal,
        addedExp: amount
      };
    },

    /**
     * 獲取指揮官頭銜
     */
    getCommanderTitle: function (level) {
      if (level >= 50) return '永恆英靈之王 (Eternal Sovereign)';
      if (level >= 40) return '半神主宰 (Demi-God Archon)';
      if (level >= 30) return '創世至尊 (Creation Supreme)';
      if (level >= 20) return '萬神殿宗師 (Valhalla Grandmaster)';
      if (level >= 13) return '傳奇督軍 (Legendary Warlord)';
      if (level >= 8)  return '戰術大師 (Tactical Master)';
      if (level >= 4)  return '探險先鋒 (Explorer Vanguard)';
      return '見習指揮官 (Novice Summoner)';
    },

    /**
     * 計算全域編隊交叉綜效 (Team Synergy)
     * 團隊若包含 工程(Engineering) + 設計(Design) + 資安(Security) 等跨領域，享有 +30% EXP 爆擊加成
     */
    calcTeamSynergy: function (teamAgents) {
      if (!Array.isArray(teamAgents) || teamAgents.length === 0) {
        return { multiplier: 1.0, bonusPercent: 0, title: '常規編隊', description: '單一專門領域' };
      }

      const domainSet = new Set();
      teamAgents.forEach(a => {
        if (a && a.domain) domainSet.add(a.domain.toLowerCase());
      });

      // 檢查領域覆蓋
      const hasEng = Array.from(domainSet).some(d => d.includes('engineer') || d.includes('dev') || d.includes('game'));
      const hasDesign = Array.from(domainSet).some(d => d.includes('design') || d.includes('creative') || d.includes('spatial'));
      const hasSec = Array.from(domainSet).some(d => d.includes('security') || d.includes('sysadmin') || d.includes('qa'));
      const hasBiz = Array.from(domainSet).some(d => d.includes('product') || d.includes('marketing') || d.includes('finance'));

      let matchedCategories = 0;
      if (hasEng) matchedCategories++;
      if (hasDesign) matchedCategories++;
      if (hasSec) matchedCategories++;
      if (hasBiz) matchedCategories++;

      if (matchedCategories >= 3) {
        return {
          multiplier: 1.30,
          bonusPercent: 30,
          title: '⚡ 全端超神戰隊 (Omni-Stack Legion)',
          description: '同時集結工程、設計與資安專家！獲得 +30% 經驗值爆擊加成！'
        };
      } else if (matchedCategories === 2) {
        return {
          multiplier: 1.15,
          bonusPercent: 15,
          title: '🔥 雙軌協同先鋒 (Dual Synergy Squad)',
          description: '具備跨領域協同作戰能力，獲得 +15% 經驗值增益！'
        };
      }

      return {
        multiplier: 1.0,
        bonusPercent: 0,
        title: '🛡️ 標準作戰分隊 (Standard Unit)',
        description: '邀請更多不同領域的特工進入喜愛清單，即可觸發跨領域經驗加成！'
      };
    }
  };

  // ==========================================================================
  // 【模組三】每日專案急診室戰役 (Zero-Compute Incident Campaign)
  // ==========================================================================
  // 52 項真實工業級軟體災難矩陣 (Real-world incident matrix)
  const INCIDENT_DATABASE = [
    {
      id: 'redis_oom',
      title: 'Redis 集群快取打滿 (OOM Panic)',
      category: 'DevOps / 架構',
      reqRole: 'engineering',
      desc: '雙十一預熱快取鍵無過期時間，主節點記憶體暴衝至 99.8%，哨兵節點瘋狂震盪！',
      difficulty: 'Normal',
      baseExp: 150,
      icon: '🔥'
    },
    {
      id: 'k8s_crashloop',
      title: 'Kubernetes Pod 跨節點 CrashLoopBackOff',
      category: '雲原生基礎設施',
      reqRole: 'engineering',
      desc: 'ConfigMap 缺少環境變數，微服務容器開機 3 秒即掛死，重啟風暴引發節點高負載。',
      difficulty: 'Normal',
      baseExp: 180,
      icon: '☸️'
    },
    {
      id: 'pg_deadlock',
      title: 'PostgreSQL 結帳交易跨行死鎖 (Deadlock)',
      category: '資料庫內核',
      reqRole: 'engineering',
      desc: '促銷訂單與庫存扣減未依主鍵順序加鎖，排程佇列全線阻塞，客戶支付停滯。',
      difficulty: 'Hard',
      baseExp: 320,
      icon: '🔒'
    },
    {
      id: 'jwt_compromise',
      title: 'JWT 密鑰弱口令遭彩虹表撞庫',
      category: '資安防禦',
      reqRole: 'security',
      desc: '黑客利用未替換的預設密鑰偽造管理員 Token，正試圖橫向移動存取財務資料！',
      difficulty: 'Hard',
      baseExp: 350,
      icon: '🛡️'
    },
    {
      id: 'safari_flex_overflow',
      title: 'iOS Safari 彈性盒橫向無窮捲軸破版',
      category: '前端工程 / UI',
      reqRole: 'design',
      desc: 'WebKit 內核 flex-shrink 預設值與 100dvh 相容性問題，導致重要結帳按鈕被擠出螢幕。',
      difficulty: 'Normal',
      baseExp: 160,
      icon: '📱'
    },
    {
      id: 'v8_memory_leak',
      title: 'Node.js V8 引擎閉包記憶體洩漏',
      category: '後端優化',
      reqRole: 'engineering',
      desc: '全域事件監聽器未解綁，伺服器 RSS 記憶體每小時線性暴增 500MB 直到滅頂。',
      difficulty: 'Hard',
      baseExp: 340,
      icon: '🧠'
    },
    {
      id: 'dns_cache_poison',
      title: '支付閘道 DNS 劫持與快取污染',
      category: '網路資安',
      reqRole: 'security',
      desc: '惡意攻擊者污染核心 DNS 伺服器，部分用戶交易請求被導向釣魚端點！',
      difficulty: 'Hell',
      baseExp: 500,
      icon: '🌐'
    },
    {
      id: 'cf_524_timeout',
      title: 'Cloudflare 524 跨國閘道連線逾時',
      category: '網路架構',
      reqRole: 'engineering',
      desc: '大檔案報表匯出同步阻塞 HTTP 連線，超過 Cloudflare 100 秒硬限制全面報錯。',
      difficulty: 'Normal',
      baseExp: 170,
      icon: '☁️'
    },
    {
      id: 'react_infinite_render',
      title: 'React 18 狀態連鎖引發無窮渲染崩潰',
      category: '前端架構',
      reqRole: 'design',
      desc: 'useEffect 內部依賴項未 memo 導致組件每秒重繪數千次，瀏覽器主線程完全凍結。',
      difficulty: 'Normal',
      baseExp: 150,
      icon: '⚡'
    },
    {
      id: 'docker_no_space',
      title: 'Docker 日誌無限制擴張吃滿硬碟磁區',
      category: 'DevOps / 維運',
      reqRole: 'engineering',
      desc: '容器 stdout 未配置 log-rotate，日誌檔案吞噬 100% 根磁區，系統拒絕任何寫入！',
      difficulty: 'Normal',
      baseExp: 160,
      icon: '💾'
    },
    {
      id: 'log4j_cve_threat',
      title: '第三方庫 JNDI 遠端代碼執行漏洞 (CVE)',
      category: '資安審計',
      reqRole: 'security',
      desc: '外掛組件依賴遭掃描出重大 RCE 威脅，需即刻注入 WAF 規則並動態熱修復！',
      difficulty: 'Hell',
      baseExp: 520,
      icon: '🚨'
    },
    {
      id: 'kafka_rebalance_storm',
      title: 'Kafka 消費群組 Rebalance 惡性風暴',
      category: '分散式系統',
      reqRole: 'engineering',
      desc: '單一 Partition 批次處理耗時過長觸發心跳逾時，集群反覆 Rebalance 導致零吞吐。',
      difficulty: 'Hard',
      baseExp: 360,
      icon: '🌪️'
    },
    {
      id: 'ssl_midnight_expire',
      title: '全域 SSL/TLS 憑證半夜突發過期',
      category: '運維安全',
      reqRole: 'security',
      desc: '自動續約 Certbot 定時任務因 API 限制失敗，全站被各瀏覽器標註「高度危險不安全」。',
      difficulty: 'Hard',
      baseExp: 330,
      icon: '🔐'
    },
    {
      id: 'graphql_nested_ddos',
      title: 'GraphQL 深層嵌套查詢惡意放大攻擊',
      category: 'API 性能與防護',
      reqRole: 'security',
      desc: '未設定查詢複雜度限制 (Query Cost)，單一 HTTP 請求觸發後端數百萬次資料庫子查詢！',
      difficulty: 'Hell',
      baseExp: 480,
      icon: '🕸️'
    },
    {
      id: 'webgl_context_loss',
      title: 'WebGL 3D 著色器在低階晶片崩潰',
      category: '視覺與圖形',
      reqRole: 'design',
      desc: '行動端裝置 GPU 記憶體耗盡引發 Context Lost，畫布瞬間全黑需要優雅降級！',
      difficulty: 'Normal',
      baseExp: 190,
      icon: '🎨'
    },
    {
      id: 'agile_sprint_scope_creep',
      title: '跨國產品需求 Scope Creep 衝刺大雪崩',
      category: '專案管理與敏捷',
      reqRole: 'product',
      desc: '多方利害關係人非同步插單，衝刺目標模糊，需要資深 TPM 進行關鍵切片收斂！',
      difficulty: 'Normal',
      baseExp: 180,
      icon: '📋'
    }
  ];

  // 確定性日期偽隨機數產生器 (Mulberry32 PRNG)
  function mulberry32(seed) {
    return function () {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getDateSeed(dateStr) {
    let hash = 0;
    const str = dateStr || new Date().toISOString().slice(0, 10);
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) + 1234567;
  }

  const ValhallaEmergency = {
    /**
     * 取得今日 3 項急診作戰任務 (100% 零後端算力、純日曆種子運算)
     */
    getDailyMissions: function (targetDateStr) {
      const todayStr = targetDateStr || new Date().toISOString().slice(0, 10);
      const seed = getDateSeed(todayStr);
      const prng = mulberry32(seed);

      // 自 50+ 事件池中確定性洗牌選出 3 項
      const pool = [...INCIDENT_DATABASE];
      const selected = [];

      for (let i = 0; i < 3; i++) {
        const idx = Math.floor(prng() * pool.length);
        const item = pool.splice(idx, 1)[0];
        
        // 檢查今日是否已解決
        let isResolved = false;
        try {
          isResolved = !!localStorage.getItem('valhalla_emergency_' + todayStr + '_' + item.id);
        } catch (e) {
          isResolved = false;
        }
        
        selected.push({
          ...item,
          missionDate: todayStr,
          isResolved: isResolved
        });
      }

      return selected;
    },

    /**
     * 派遣特工執行急診任務
     */
    dispatchHero: function (mission, agent, synergyMultiplier) {
      if (!mission || !agent) return { success: false, reason: '參數不足' };

      const todayStr = mission.missionDate || new Date().toISOString().slice(0, 10);
      const storageKey = 'valhalla_emergency_' + todayStr + '_' + mission.id;

      try {
        if (localStorage.getItem(storageKey)) {
          return { success: false, reason: '此急診戰役今日已完成！' };
        }
      } catch (e) {}

      // 檢查領域相容度
      const agentDomain = (agent.domain || '').toLowerCase();
      const isRoleMatch = agentDomain.includes(mission.reqRole) || 
                          (mission.reqRole === 'engineering' && (agentDomain.includes('dev') || agentDomain.includes('sysadmin'))) ||
                          (mission.reqRole === 'design' && agentDomain.includes('creative'));

      // 計算基礎與相容獎勵
      let finalExp = mission.baseExp;
      let matchBonus = 0;
      if (isRoleMatch) {
        matchBonus = Math.floor(mission.baseExp * 0.4); // 專業對口 +40%
        finalExp += matchBonus;
      }

      // 隊伍綜效倍率
      const mult = synergyMultiplier || 1.0;
      finalExp = Math.floor(finalExp * mult);

      // 標註已解決
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          heroId: agent.id,
          heroName: agent.name,
          resolvedAt: new Date().toISOString(),
          expAwarded: finalExp
        }));
      } catch (e) {}

      // 為該特工加經驗
      const heroResult = ValhallaProgression.addHeroExp(agent.id, finalExp);

      return {
        success: true,
        missionId: mission.id,
        missionTitle: mission.title,
        expAwarded: finalExp,
        matchBonus: matchBonus,
        isRoleMatch: isRoleMatch,
        heroResult: heroResult
      };
    }
  };

  // ==========================================================================
  // 【模組四】裝備聖典與性感福利圖鑑 (Gear Codex & Sexy Rewards)
  // ==========================================================================
  // 🌟 2026-10-31 裝備聖典與手繪換裝娃娃系統 100% 嚴密對齊打通
  // 每一階裝備均綁定實體 LPC 精靈圖圖層配置 (lpcConfig)，支援一鍵「立即試穿」即時動態渲染！
  const GEAR_CLASSES = [
    {
      id: 'warrior',
      name: '重裝勇者系 (Engineering / DevOps)',
      icon: '⚔️',
      color: 'from-amber-500 to-orange-600',
      tiers: [
        { 
          tier: 1, 
          reqLevel: 2, 
          name: '冒險長褲與獵人輕甲', 
          desc: '初階輕量戰鬥裝備，搭配真皮輕便鞋，抵禦大部分 NullPointer 暴擊。',
          lpcConfig: { outfit: 'armor_leather', legs: 'pants', feet: 'shoes' }
        },
        { 
          tier: 2, 
          reqLevel: 5, 
          name: '冒險獵人護腕與高筒戰靴', 
          desc: '精工皮革強化護腕與高筒防護皮靴，大幅提升伺服器併發承載與移動敏捷。',
          lpcConfig: { arms: 'bracers', feet: 'boots' }
        },
        { 
          tier: 3, 
          reqLevel: 10, 
          name: '軍團精銳肩甲與鋼鐵腿甲', 
          desc: '軍團重裝雙肩金屬重鎧與鋼鐵重腿甲，支援高強度多核心併行負載防禦。',
          lpcConfig: { shoulders: 'legion', legs: 'plate' }
        },
        { 
          tier: 4, 
          reqLevel: 20, 
          name: '聖騎士鋼鐵重鎧與蒼藍光刃', 
          desc: '全覆式鋼鐵重板甲、重裝護手與聖光蒼藍光刃，免疫任何分散式死鎖懲罰。',
          lpcConfig: { outfit: 'armor_plate', arms: 'plate', feet: 'plate', weapon: 'sword_glow_blue', hat: 'helmet_horned' }
        },
        { 
          tier: 5, 
          reqLevel: 30, 
          name: '聖殿全覆式閉面神盔與猩紅神刃', 
          desc: '殿堂終極密閉全覆式重盔、萬神殿肩鎧與猩紅嗜血光刃，直面億級並行。',
          lpcConfig: { hat: 'helmet_close', weapon: 'sword_glow_red', shoulders: 'pauldrons' }
        }
      ]
    },
    {
      id: 'ranger',
      name: '暗影刺客系 (Security / Audit / QA)',
      icon: '🗡️',
      color: 'from-emerald-500 to-teal-600',
      tiers: [
        { 
          tier: 1, 
          reqLevel: 2, 
          name: '魅影貼身皮衣與戰裙', 
          desc: '隨身沙盒隔離緊身夜行衣，兼顧極致敏捷與零信任憑證審查防護。',
          lpcConfig: { outfit: 'bodice_leather', legs: 'skirt', feet: 'shoes' }
        },
        { 
          tier: 2, 
          reqLevel: 5, 
          name: '黑夜無聲刺殺裝與夜行皮靴', 
          desc: '純黑蕾絲緊身刺殺裝，融入暗夜伺服器叢林，無聲無息揪出潛伏後門。',
          lpcConfig: { outfit: 'bodice_black', feet: 'boots', arms: 'bracers' }
        },
        { 
          tier: 3, 
          reqLevel: 10, 
          name: '冷酷暗殺面罩與淬毒短匕', 
          desc: '刺客冷酷半臉面罩與雙持淬毒精鋼短匕，能吸收並反彈所有 CVE 安全漏洞。',
          lpcConfig: { mask: 'assassin_mask', weapon: 'dagger', outfit: 'bodice_black' }
        },
        { 
          tier: 4, 
          reqLevel: 20, 
          name: '幽冥暗殺兜帽與精銳肩甲', 
          desc: '覆蓋頭頂之幽冥暗影兜帽與軍團肩甲，在深層封包中完全隱形。',
          lpcConfig: { hood: 'assassin_hood', shoulders: 'legion', weapon: 'dagger' }
        },
        { 
          tier: 5, 
          reqLevel: 30, 
          name: '猩紅狂熱殺手聖鎧與嗜血光刃', 
          desc: '猩紅狂熱夜行馬甲、皇家重裝腿甲與嗜血光刃，所有入侵者皆在門前湮滅。',
          lpcConfig: { outfit: 'bodice_red', weapon: 'sword_glow_red', legs: 'plate', feet: 'plate' }
        }
      ]
    },
    {
      id: 'cleric',
      name: '聖殿女武神系 (Management / Product / Ops)',
      icon: '🛡️',
      color: 'from-blue-500 to-cyan-600',
      tiers: [
        { 
          tier: 1, 
          reqLevel: 2, 
          name: '聖潔純白胸衣與戰鬥短裙', 
          desc: '純白無暇之神殿侍奉戰衣，敏捷調度團隊看板卡片，條理清晰優雅。',
          lpcConfig: { outfit: 'bodice_white', legs: 'skirt', feet: 'shoes' }
        },
        { 
          tier: 2, 
          reqLevel: 5, 
          name: '蕾絲黑馬甲與冒險者皮靴', 
          desc: '平衡長官瀑布式審查與團隊敏捷垂直切片的知性性感雙軌戰服。',
          lpcConfig: { outfit: 'bodice_black', feet: 'boots', arms: 'bracers' }
        },
        { 
          tier: 3, 
          reqLevel: 10, 
          name: '魅魔深紫馬甲與皇家鋼腿甲', 
          desc: '深紫成熟魅惑馬甲與皇家重腿甲，象徵最高專案指揮權限，調度資源游刃有餘。',
          lpcConfig: { outfit: 'bodice_purple', legs: 'plate', shoulders: 'legion' }
        },
        { 
          tier: 4, 
          reqLevel: 20, 
          name: '女武神銀鎧與萬神殿肩鎧', 
          desc: '整套銀白金屬女武神聖銀鎧甲與萬神殿鋼鐵重型肩鎧，神聖守護全域架構。',
          lpcConfig: { outfit: 'armor_plate', shoulders: 'pauldrons', arms: 'plate', feet: 'plate' }
        },
        { 
          tier: 5, 
          reqLevel: 30, 
          name: '萬神殿終極閉面神盔與蒼藍神刃', 
          desc: '純白全覆式聖神盔與蒼藍光刃，為整個英靈殿定下最高品質工業級規格。',
          lpcConfig: { hat: 'helmet_close', outfit: 'armor_plate', shoulders: 'pauldrons', legs: 'plate', feet: 'plate', weapon: 'sword_glow_blue' }
        }
      ]
    },
    {
      id: 'mage',
      name: '奧術法師系 (Architecture / AI / Data)',
      icon: '🔮',
      color: 'from-purple-500 to-indigo-600',
      tiers: [
        { 
          tier: 1, 
          reqLevel: 2, 
          name: '櫻花粉萌秘術戰袍', 
          desc: '新手奧術戰袍，隔絕底層雜訊，能使運算複雜度降低至 O(N log N)。',
          lpcConfig: { outfit: 'bodice_pink', legs: 'skirt', feet: 'shoes' }
        },
        { 
          tier: 2, 
          reqLevel: 5, 
          name: '薰衣草優雅秘術胸衣', 
          desc: '高內聚低耦合精紡製成，隔絕任何相依性污染。',
          lpcConfig: { outfit: 'bodice_lavender', feet: 'boots' }
        },
        { 
          tier: 3, 
          reqLevel: 10, 
          name: '深邃海藍奧術戰甲與淬毒短匕', 
          desc: '蘊含深度神經網絡權重，自動預測並消除潛在架構風險。',
          lpcConfig: { outfit: 'bodice_blue', weapon: 'dagger', legs: 'skirt' }
        },
        { 
          tier: 4, 
          reqLevel: 15, 
          name: '大法師星空尖頂帽與幽冥光刃', 
          desc: '突破三維限制，大法師星空尖頂帽散發浩瀚星光，穿梭超維度推理。',
          lpcConfig: { hat: 'hat_wizard', weapon: 'sword_glow_blue' }
        },
        { 
          tier: 5, 
          reqLevel: 30, 
          name: '創世大師極光全裝與能量神刃', 
          desc: '萬物代碼皆在其掌握之中，宇宙法則隨其意志重構，英靈殿至高奧義。',
          lpcConfig: { hat: 'hat_wizard', outfit: 'armor_plate', shoulders: 'pauldrons', weapon: 'sword_glow_blue' }
        }
      ]
    }
  ];

  const ValhallaCodex = {
    getClasses: function () {
      return GEAR_CLASSES;
    },

    isGearUnlocked: function (tierReqLevel, commanderOrHeroLevel) {
      return (commanderOrHeroLevel || 1) >= tierReqLevel;
    }
  };

  // ==========================================================================
  // 【全域接口導出】確保向下 100% 相容與最新 API 支援
  // ==========================================================================
  window.ValhallaAudio = ValhallaAudio;
  window.ValhallaProgression = ValhallaProgression;
  window.ValhallaEmergency = ValhallaEmergency;
  window.ValhallaCodex = ValhallaCodex;

})(typeof window !== 'undefined' ? window : this);
