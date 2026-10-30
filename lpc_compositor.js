/**
 * 🏛️ Agent Valhalla - LPC Real Layer Canvas Compositor
 * ============================================================================
 * 工業級真實 hand-drawn PNG 像素賽璐珞圖層合成器
 * 核心原理：直接讀取 LPC 開源精靈圖，依 Z-index 階層在離屏 Canvas 進行像素對齊渲染
 * 支援三大職業陣營專屬配置：
 *   - 🛡️ 女武神 (Valkyrie)：成熟性感/纖細少女/健美女武神 + 性感馬甲/銀鎧 + 飄逸長髮 + 少女微醺腮紅
 *   - 🗡️ 魅影刺客 (Rogue)：敏捷修長身軀 + 貼身漆皮夜行衣 + 淬毒精鋼短匕 + 暗殺面罩 + 幽冥兜帽 + 殺氣冷眸
 *   - ⚔️ 男勇者 (Male Hero)：標準勇者/爆筋猛男 + 鋼鐵重鎧/浪人背心/赤膊 + 刺蝟短髮 + 威嚴戰鬥落腮鬍
 * 日期：2026-10-31
 * ============================================================================
 */

(function (root) {
  'use strict';

  const LPC_ASSET_BASE = './assets/lpc';
  const imageCache = new Map();
  const archetypeCache = new Map();
  let isArchetypesReady = false;

  // 髮色濾鏡對照表
  const HAIR_PALETTES = {
    blonde: { label: '🌟 金黃聖女', color: 'rgb(245, 215, 110)', multiply: true },
    silver: { label: '❄️ 銀白冷月', color: 'rgb(225, 232, 245)', multiply: true },
    pink: { label: '🌸 櫻花粉萌', color: 'rgb(255, 170, 205)', multiply: true },
    purple: { label: '🔮 暗夜魅魔', color: 'rgb(180, 130, 240)', multiply: true },
    crimson: { label: '🩸 猩紅魔女', color: 'rgb(220, 60, 80)', multiply: true },
    raven: { label: '🖤 烏黑長直', color: 'rgb(60, 65, 80)', multiply: true },
    chestnut: { label: '🌰 栗色知性', color: 'rgb(140, 95, 65)', multiply: true },
    cyan: { label: '⚡ 賽博霓虹', color: 'rgb(80, 220, 240)', multiply: true }
  };

  // 女性身材選項 (女武神 & 魅影刺客通用)
  const FEMALE_BODIES = [
    { id: 'female', label: '💋 成熟性感素體 (Curvy Base)' },
    { id: 'teen', label: '🎀 纖細嬌小少女 (Slender Teen)' },
    { id: 'muscular', label: '💪 健美殺戮女體 (Muscular Athletic)' }
  ];

  // 男性身材選項
  const MALE_BODIES = [
    { id: 'male', label: '⚔️ 標準勇者身軀 (Standard Male)' },
    { id: 'muscular', label: '💪 爆筋肌肉猛男 (Muscular Titan)' }
  ];

  // 女武神服裝選項
  const FEMALE_OUTFITS = [
    { id: 'bodice_black', label: '🖤 蕾絲黑馬甲 (Black)' },
    { id: 'bodice_red', label: '🩸 猩紅狂熱馬甲 (Red)' },
    { id: 'bodice_purple', label: '🔮 魅魔深紫馬甲 (Purple)' },
    { id: 'bodice_white', label: '🤍 聖潔純白胸衣 (White)' },
    { id: 'bodice_pink', label: '🌸 櫻花蜜粉胸衣 (Pink)' },
    { id: 'bodice_lavender', label: '🪻 薰衣草胸衣 (Lavender)' },
    { id: 'bodice_blue', label: '💙 深邃海藍胸衣 (Blue)' },
    { id: 'bodice_leather', label: '🤎 原色性感皮甲 (Leather)' },
    { id: 'armor_plate', label: '🛡️ 女武神銀鎧 (Plate Armor)' },
    { id: 'none', label: '🚫 原始素體 (Bare)' }
  ];

  // 🗡️ 魅影刺客專屬暗殺夜行服
  const ROGUE_OUTFITS = [
    { id: 'bodice_leather', label: '🖤 魅影貼身皮衣 (Shadow Leather)' },
    { id: 'bodice_black', label: '🖤 黑夜無聲刺殺裝 (Night Assassin)' },
    { id: 'bodice_red', label: '🩸 猩紅血滴暗殺裝 (Crimson Garb)' },
    { id: 'bodice_purple', label: '💜 幽冥魅魔束身裝 (Shadow Violet)' },
    { id: 'bodice_white', label: '🤍 幻影銀絲緊身裝 (Phantom Silver)' },
    { id: 'none', label: '🚫 原始敏捷素體 (Bare Agility)' }
  ];

  // 🗡️ 刺客面罩配件
  const ROGUE_MASKS = [
    { id: 'assassin_mask', label: '😷 冷酷暗殺面罩 (Assassin Mask)' },
    { id: 'none', label: '🚫 露出絕美面容 (Unmasked)' }
  ];

  // 🗡️ 刺客暗影兜帽
  const ROGUE_HOODS = [
    { id: 'assassin_hood', label: '🥷 幽冥暗殺兜帽 (Shadow Hood)' },
    { id: 'none', label: '🚫 輕裝不戴兜帽 (No Hood)' }
  ];

  // 男性硬派服裝選項
  const MALE_OUTFITS = [
    { id: 'armor_plate', label: '🛡️ 聖騎士鋼鐵重鎧 (Full Plate)' },
    { id: 'armor_leather', label: '⚔️ 獵人皮革護甲 (Leather Armor)' },
    { id: 'vest_black', label: '🥷 暗影開襟背心 (Shadow Vest)' },
    { id: 'vest_brown', label: '🥋 浪人武僧背心 (Martial Vest)' },
    { id: 'none', label: '🚫 狂戰士霸氣赤膊 (Muscular Bare)' }
  ];

  // 女性專屬髮型
  const FEMALE_HAIRS = [
    { id: 'bangslong', label: '👱‍♀️ 飄逸長瀏海 (Bangs Long)' },
    { id: 'curly_long', label: '💃 嫵媚大波浪 (Curly Long)' },
    { id: 'pigtails', label: '🎀 俐落雙馬尾 (Pigtails)' },
    { id: 'long_straight', label: '🖤 沉穩黑長直 (Long Straight)' },
    { id: 'bob', label: '💇‍♀️ 俐落短鮑伯 (Bob Cut)' },
    { id: 'idol', label: '✨ 日系偶像風 (Idol Bangs)' }
  ];

  // 男性專屬髮型
  const MALE_HAIRS = [
    { id: 'spiked', label: '⚔️ 刺客刺蝟頭 (Spiked)' },
    { id: 'messy1', label: '🌪️ 隨性浪人捲 (Messy)' },
    { id: 'bob', label: '🪒 乾淨俐落短髮 (Short Cut)' }
  ];

  // 男性專屬鬍鬚 (Beards)
  const MALE_BEARDS = [
    { id: 'none', label: '🪒 乾淨無鬚 (Clean Shaven)' },
    { id: 'beard_medium', label: '🧔 威嚴戰鬥落腮鬍 (Full Beard)' }
  ];

  // 神兵武器裝備槽 (支援短匕、巨劍、光劍)
  const WEAPONS = [
    { id: 'dagger', label: '🗡️ 淬毒精鋼短匕 (Dual Daggers)' },
    { id: 'sword_glow_blue', label: '⚡ 幽冥蒼藍光刃 (Blue Saber)' },
    { id: 'sword_glow_red', label: '🩸 猩紅嗜血光刃 (Red Saber)' },
    { id: 'none', label: '🚫 空手專注 (Unarmed)' }
  ];

  // 眼睛瞳色
  const EYE_COLORS = [
    { id: 'red', label: '🩸 嗜血殺氣紅瞳 (Crimson Killer)' },
    { id: 'purple', label: '🔮 幽冥魅影紫瞳 (Shadow Violet)' },
    { id: 'blue', label: '🌊 冰霜冷冽藍瞳 (Frost Assassin)' },
    { id: 'green', label: '🍃 翡翠森林 (Emerald Green)' },
    { id: 'brown', label: '🍂 琥珀深夜黑瞳 (Shadow Brown)' }
  ];

  // 12 款經典原型設計 (包含女武神、魅影刺客、男戰士)
  const ARCHETYPES = [
    // 🗡️ 魅影刺客原型 (致命性感)
    { id: 0, gender: 'female', roleClass: 'rogue', bodyType: 'teen', outfit: 'bodice_leather', hairStyle: 'pigtails', hairColor: 'raven', eyeColor: 'red', mask: 'assassin_mask', hood: 'none', weapon: 'dagger', enableBlush: false },
    { id: 1, gender: 'female', roleClass: 'rogue', bodyType: 'female', outfit: 'bodice_black', hairStyle: 'bangslong', hairColor: 'silver', eyeColor: 'purple', mask: 'none', hood: 'assassin_hood', weapon: 'dagger', enableBlush: false },
    // 🛡️ 女武神原型 (光明神聖)
    { id: 2, gender: 'female', roleClass: 'valkyrie', bodyType: 'female', outfit: 'bodice_red', hairStyle: 'bangslong', hairColor: 'blonde', eyeColor: 'blue', mask: 'none', hood: 'none', weapon: 'sword_glow_blue', enableBlush: true },
    { id: 3, gender: 'female', roleClass: 'valkyrie', bodyType: 'female', outfit: 'bodice_white', hairStyle: 'idol', hairColor: 'silver', eyeColor: 'blue', mask: 'none', hood: 'none', weapon: 'none', enableBlush: true },
    { id: 4, gender: 'female', roleClass: 'valkyrie', bodyType: 'female', outfit: 'bodice_purple', hairStyle: 'curly_long', hairColor: 'purple', eyeColor: 'purple', mask: 'none', hood: 'none', weapon: 'none', enableBlush: true },
    { id: 5, gender: 'female', roleClass: 'valkyrie', bodyType: 'muscular', outfit: 'armor_plate', hairStyle: 'bob', hairColor: 'silver', eyeColor: 'blue', mask: 'none', hood: 'none', weapon: 'sword_glow_blue', enableBlush: false },
    // ⚔️ 男勇者原型 (硬派霸氣)
    { id: 6, gender: 'male', roleClass: 'warrior', bodyType: 'male', outfit: 'armor_plate', hairStyle: 'spiked', hairColor: 'blonde', eyeColor: 'blue', mask: 'none', hood: 'none', beard: 'none', weapon: 'sword_glow_blue', enableBlush: false },
    { id: 7, gender: 'male', roleClass: 'warrior', bodyType: 'muscular', outfit: 'none', hairStyle: 'spiked', hairColor: 'raven', eyeColor: 'red', mask: 'none', hood: 'none', beard: 'beard_medium', weapon: 'sword_glow_red', enableBlush: false },
    { id: 8, gender: 'male', roleClass: 'warrior', bodyType: 'male', outfit: 'vest_black', hairStyle: 'messy1', hairColor: 'raven', eyeColor: 'blue', mask: 'none', hood: 'none', beard: 'none', weapon: 'dagger', enableBlush: false },
    { id: 9, gender: 'male', roleClass: 'warrior', bodyType: 'male', outfit: 'armor_leather', hairStyle: 'bob', hairColor: 'chestnut', eyeColor: 'green', mask: 'none', hood: 'none', beard: 'beard_medium', weapon: 'none', enableBlush: false },
    { id: 10, gender: 'female', roleClass: 'rogue', bodyType: 'muscular', outfit: 'bodice_red', hairStyle: 'long_straight', hairColor: 'raven', eyeColor: 'red', mask: 'assassin_mask', hood: 'assassin_hood', weapon: 'dagger', enableBlush: false },
    { id: 11, gender: 'female', roleClass: 'valkyrie', bodyType: 'teen', outfit: 'bodice_pink', hairStyle: 'pigtails', hairColor: 'pink', eyeColor: 'purple', mask: 'none', hood: 'none', weapon: 'none', enableBlush: true }
  ];

  function hashString(str) {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function loadLpcImage(url) {
    if (!url) return Promise.resolve(null);
    if (imageCache.has(url)) return Promise.resolve(imageCache.get(url));
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  function createTintedHairCanvas(hairImg, tintConfig, frameX, frameY) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 64;
    tempCanvas.height = 64;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;

    tempCtx.drawImage(hairImg, frameX, frameY, 64, 64, 0, 0, 64, 64);
    if (!tintConfig || !tintConfig.color || !tintConfig.multiply) return tempCanvas;

    tempCtx.globalCompositeOperation = 'multiply';
    tempCtx.fillStyle = tintConfig.color;
    tempCtx.fillRect(0, 0, 64, 64);

    tempCtx.globalCompositeOperation = 'destination-in';
    tempCtx.drawImage(hairImg, frameX, frameY, 64, 64, 0, 0, 64, 64);

    return tempCanvas;
  }

  /**
   * 核心多圖層合成函式 (Composite Core)
   * 階層依序：Body ➔ Head ➔ Blush ➔ Mask ➔ Beard ➔ Eyes ➔ Outfit ➔ Hair ➔ Hood ➔ Weapon
   */
  async function compositeCharacter(options = {}, targetCanvas = null) {
    const isFemale = (options.gender || 'female') === 'female';
    const opts = {
      gender: isFemale ? 'female' : 'male',
      roleClass: options.roleClass || (isFemale ? 'valkyrie' : 'warrior'),
      bodyType: options.bodyType || (isFemale ? 'female' : 'male'),
      outfit: options.outfit || options.bodiceColor || (isFemale ? 'bodice_black' : 'armor_plate'),
      hairStyle: options.hairStyle || (isFemale ? 'bangslong' : 'spiked'),
      hairColor: options.hairColor || 'blonde',
      eyeColor: options.eyeColor || (options.roleClass === 'rogue' ? 'red' : 'purple'),
      mask: options.mask || 'none',
      hood: options.hood || 'none',
      beard: !isFemale ? (options.beard || 'none') : 'none',
      weapon: options.weapon || (options.roleClass === 'rogue' ? 'dagger' : 'none'),
      enableBlush: isFemale ? (options.enableBlush !== false) : false,
      frame: (options.frame || 0) % 2,
      framing: options.framing || 'portrait',
      ...options
    };

    // 1. 解析資源路徑
    const bodyPath = `${LPC_ASSET_BASE}/body/${opts.bodyType}_idle.png`;
    const headPath = `${LPC_ASSET_BASE}/head/${isFemale ? 'female' : 'male'}_head_idle.png`;
    const blushPath = (isFemale && opts.enableBlush) ? `${LPC_ASSET_BASE}/head/female_blush_idle.png` : null;
    const maskPath = (opts.mask && opts.mask !== 'none') ? `${LPC_ASSET_BASE}/masks/${opts.mask}.png` : null;
    const hoodPath = (opts.hood && opts.hood !== 'none') ? `${LPC_ASSET_BASE}/hat/${opts.hood}.png` : null;
    const beardPath = (!isFemale && opts.beard && opts.beard !== 'none') ? `${LPC_ASSET_BASE}/beards/${opts.beard}.png` : null;
    const eyePath = `${LPC_ASSET_BASE}/eyes/${opts.eyeColor}.png`;

    // 服裝解析
    let outfitPath = null;
    const outfitKey = opts.outfit || 'none';
    if (outfitKey.startsWith('bodice_')) {
      const color = outfitKey.replace('bodice_', '');
      outfitPath = `${LPC_ASSET_BASE}/bodice/${color}.png`;
    } else if (outfitKey === 'armor_plate') {
      outfitPath = `${LPC_ASSET_BASE}/armor/plate_${isFemale ? 'female' : 'male'}_idle.png`;
    } else if (outfitKey === 'armor_leather') {
      outfitPath = `${LPC_ASSET_BASE}/armor/leather_male_idle.png`;
    } else if (outfitKey === 'vest_black') {
      outfitPath = `${LPC_ASSET_BASE}/clothes/vest_open_black.png`;
    } else if (outfitKey === 'vest_brown') {
      outfitPath = `${LPC_ASSET_BASE}/clothes/vest_open_brown.png`;
    }

    const hairPath = `${LPC_ASSET_BASE}/hair/${opts.hairStyle}_idle.png`;
    const weaponPath = (opts.weapon && opts.weapon !== 'none') ? `${LPC_ASSET_BASE}/weapon/${opts.weapon}.png` : null;

    // 2. 並行載入所有圖層
    const [bodyImg, headImg, blushImg, maskImg, beardImg, eyeImg, outfitImg, hairImg, hoodImg, weaponImg] = await Promise.all([
      loadLpcImage(bodyPath),
      loadLpcImage(headPath),
      loadLpcImage(blushPath),
      loadLpcImage(maskPath),
      loadLpcImage(beardPath),
      loadLpcImage(eyePath),
      loadLpcImage(outfitPath),
      loadLpcImage(hairPath),
      loadLpcImage(hoodPath),
      loadLpcImage(weaponPath)
    ]);

    // 3. 準備畫布 (128x128 高解析無損輸出)
    const canvas = targetCanvas || document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 4. 計算裁切區域 (LPC 正面視角：Row 2, Y: 128..191)
    const frameIndex = opts.frame;
    const srcX = frameIndex * 64;
    const srcY = 2 * 64;

    let sx, sy, sw, sh, dx, dy, dw, dh;
    if (opts.framing === 'portrait') {
      sx = srcX;
      sy = srcY + 2;
      sw = 64;
      sh = 48; // 胸部與臉蛋特寫
      dx = 0;
      dy = 0;
      dw = 128;
      dh = 128;
    } else {
      sx = srcX;
      sy = srcY;
      sw = 64;
      sh = 64; // 全身立繪
      dx = 0;
      dy = 0;
      dw = 128;
      dh = 128;
    }

    // 5. 依精密 Z-Index 階層疊合繪製
    // [Layer 1]: 身軀素體 (Body)
    if (bodyImg) ctx.drawImage(bodyImg, sx, sy, sw, sh, dx, dy, dw, dh);

    // [Layer 2]: 繪師手繪頭顱臉部 (Head)
    if (headImg) ctx.drawImage(headImg, sx, sy, sw, sh, dx, dy, dw, dh);

    // [Layer 3]: 女性微醺腮紅 (Blush)
    if (blushImg) ctx.drawImage(blushImg, sx, sy, sw, sh, dx, dy, dw, dh);

    // [Layer 4]: 🗡️ 刺客冷酷半臉面罩 (Mask)
    if (maskImg) ctx.drawImage(maskImg, sx, sy, sw, sh, dx, dy, dw, dh);

    // [Layer 5]: 男性戰鬥落腮鬍 (Beard)
    if (beardImg) ctx.drawImage(beardImg, sx, sy, sw, sh, dx, dy, dw, dh);

    // [Layer 6]: 靈魂五官瞳孔 (Eyes)
    if (eyeImg) ctx.drawImage(eyeImg, sx, sy, sw, sh, dx, dy, dw, dh);

    // [Layer 7]: 服裝鎧甲 (Outfit)
    if (outfitImg) ctx.drawImage(outfitImg, sx, sy, sw, sh, dx, dy, dw, dh);

    // [Layer 8]: 飄逸髮型 (Hair with dynamic tinting)
    if (hairImg) {
      const tintCfg = HAIR_PALETTES[opts.hairColor] || HAIR_PALETTES.blonde;
      const tintedHairCanvas = createTintedHairCanvas(hairImg, tintCfg, srcX, srcY);
      const hairCropY = opts.framing === 'portrait' ? 2 : 0;
      const hairCropH = opts.framing === 'portrait' ? 48 : 64;

      ctx.drawImage(tintedHairCanvas, 0, hairCropY, 64, hairCropH, dx, dy, dw, dh);
    }

    // [Layer 9]: 🥷 刺客幽冥暗影兜帽 (Hood - 覆蓋在頭部與髮絲上方)
    if (hoodImg) {
      ctx.drawImage(hoodImg, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    // [Layer 10]: 🗡️ 神兵短匕與武器 (Weapon)
    if (weaponImg) {
      ctx.drawImage(weaponImg, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    return canvas;
  }

  async function renderToDataUrl(options = {}) {
    const c = await compositeCharacter(options);
    return c.toDataURL('image/png');
  }

  async function initArchetypes() {
    if (typeof document === 'undefined') return;
    try {
      for (const arch of ARCHETYPES) {
        const dataUrl = await renderToDataUrl({
          ...arch,
          framing: 'portrait',
          frame: 0
        });
        archetypeCache.set(arch.id, dataUrl);
      }
      isArchetypesReady = true;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lpc-archetypes-ready'));
      }
    } catch (e) {
      console.warn('[LpcCompositor] initArchetypes failed:', e);
    }
  }

  function getDefaultAvatarUrl(agent) {
    if (!agent) return '';
    const idx = hashString(agent.id) % ARCHETYPES.length;
    return archetypeCache.get(idx) || '';
  }

  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', initArchetypes);
    } else {
      setTimeout(initArchetypes, 10);
    }
  }

  const LpcCompositor = {
    composite: compositeCharacter,
    renderToDataUrl: renderToDataUrl,
    initArchetypes: initArchetypes,
    getDefaultAvatarUrl: getDefaultAvatarUrl,
    palettes: HAIR_PALETTES,
    femaleBodies: FEMALE_BODIES,
    maleBodies: MALE_BODIES,
    femaleOutfits: FEMALE_OUTFITS,
    rogueOutfits: ROGUE_OUTFITS,
    rogueMasks: ROGUE_MASKS,
    rogueHoods: ROGUE_HOODS,
    maleOutfits: MALE_OUTFITS,
    femaleHairs: FEMALE_HAIRS,
    maleHairs: MALE_HAIRS,
    maleBeards: MALE_BEARDS,
    weapons: WEAPONS,
    eyeColors: EYE_COLORS,
    archetypes: ARCHETYPES,
    bodiceColors: FEMALE_OUTFITS,
    hairStyles: FEMALE_HAIRS
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LpcCompositor };
  } else {
    root.LpcCompositor = LpcCompositor;
  }

})(typeof window !== 'undefined' ? window : this);
