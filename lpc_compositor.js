/**
 * 🏛️ Agent Valhalla - LPC Real Layer Canvas Compositor
 * ============================================================================
 * 工業級真實 hand-drawn PNG 像素賽璐珞圖層合成器
 * 核心原理：直接讀取 LPC 開源精靈圖，依 Z-index 階層在離屏 Canvas 進行像素對齊渲染
 * 階層順序：Body素體 ➔ Head五官臉蛋 ➔ Blush腮紅 ➔ Eyes眼神 ➔ Bodice服飾 ➔ Hair長髮
 * 支援鏡頭特寫 (Bust Portrait 128x128) 與全身立繪 (Full Body)
 * 日期：2026-10-31
 * ============================================================================
 */

(function (root) {
  'use strict';

  // 圖層資源路徑清單 (相對於專案根目錄)
  const LPC_ASSET_BASE = './assets/lpc';

  // 預載影像快取池 (避免重複 I/O 請求)
  const imageCache = new Map();

  // 經典髮色濾鏡對照表 (RGB 乘法混合)
  const HAIR_PALETTES = {
    blonde: { label: '🌟 金黃聖女', color: 'rgb(245, 215, 110)', multiply: true },
    silver: { label: '❄️ 銀白冷月', color: 'rgb(225, 232, 245)', multiply: true },
    pink: { label: '🌸 櫻花粉萌', color: 'rgb(255, 170, 205)', multiply: true },
    purple: { label: '🔮 暗夜魅魔', color: 'rgb(180, 130, 240)', multiply: true },
    crimson: { label: '🩸 猩紅魔女', color: 'rgb(220, 60, 80)', multiply: true },
    raven: { label: '🖤 烏黑長直', color: 'rgb(60, 65, 80)', multiply: true },
    chestnut: { label: '🌰 栗色知性', color: 'rgb(140, 95, 65)', multiply: true },
    cyan: { label: '⚡ 賽博霓虹', color: 'rgb(80, 220, 240)', multiply: true },
    original: { label: '🎨 原始原色', color: null, multiply: false }
  };

  // 預設性感 Bodice 色彩
  const BODICE_COLORS = [
    { id: 'black', label: '🖤 蕾絲黑 (Black)' },
    { id: 'red', label: '🩸 猩紅狂熱 (Red)' },
    { id: 'purple', label: '🔮 魅魔深紫 (Purple)' },
    { id: 'white', label: '🤍 聖潔純白 (White)' },
    { id: 'pink', label: '🌸 櫻花蜜粉 (Pink)' },
    { id: 'lavender', label: '🪻 薰衣草 (Lavender)' },
    { id: 'blue', label: '💙 深邃海藍 (Blue)' },
    { id: 'leather', label: '🤎 原色皮甲 (Leather)' },
    { id: 'armor_plate', label: '🛡️ 女武神銀鎧 (Plate Armor)' },
    { id: 'none', label: '🚫 原始素體 (Bare)' }
  ];

  // 預設髮型
  const HAIR_STYLES = [
    { id: 'bangslong', label: '👱‍♀️ 飄逸長瀏海 (Bangs Long)' },
    { id: 'curly_long', label: '💃 嫵媚大波浪 (Curly Long)' },
    { id: 'bob', label: '💇‍♀️ 俐落短鮑伯 (Bob Cut)' },
    { id: 'idol', label: '✨ 日系偶像風 (Idol Bangs)' },
    { id: 'pigtails', label: '🎀 活力雙馬尾 (Pigtails)' },
    { id: 'long_straight', label: '🖤 沉穩黑長直 (Long Straight)' },
    { id: 'spiked', label: '⚔️ 刺客刺蝟頭 (Spiked)' },
    { id: 'messy1', label: '🌪️ 隨性浪人捲 (Messy)' }
  ];

  // 眼睛瞳色
  const EYE_COLORS = [
    { id: 'purple', label: '🔮 魅魔妖瞳 (Purple)' },
    { id: 'blue', label: '🌊 冰霜海藍 (Blue)' },
    { id: 'red', label: '🩸 猩紅嗜血 (Red)' },
    { id: 'green', label: '🍃 翡翠森林 (Green)' },
    { id: 'brown', label: '🍂 琥珀暖棕 (Brown)' }
  ];

  /**
   * 載入單一圖片並自動快取
   */
  function loadLpcImage(url) {
    if (!url) return Promise.resolve(null);
    if (imageCache.has(url)) {
      return Promise.resolve(imageCache.get(url));
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = (err) => {
        console.warn(`[LpcCompositor] 圖層載入略過: ${url}`);
        resolve(null);
      };
      img.src = url;
    });
  }

  /**
   * 髮型動態調色染色器 (Canvas Source-In 濾鏡運算)
   */
  function createTintedHairCanvas(hairImg, tintConfig, frameX, frameY) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 64;
    tempCanvas.height = 64;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;

    // 1. 繪製單格原始髮型 (64x64)
    tempCtx.drawImage(hairImg, frameX, frameY, 64, 64, 0, 0, 64, 64);

    if (!tintConfig || !tintConfig.color || !tintConfig.multiply) {
      return tempCanvas;
    }

    // 2. 利用 composite operation 進行高階染色保留高光與陰影
    tempCtx.globalCompositeOperation = 'multiply';
    tempCtx.fillStyle = tintConfig.color;
    tempCtx.fillRect(0, 0, 64, 64);

    // 3. 恢復 Alpha 遮罩
    tempCtx.globalCompositeOperation = 'destination-in';
    tempCtx.drawImage(hairImg, frameX, frameY, 64, 64, 0, 0, 64, 64);

    return tempCanvas;
  }

  /**
   * 核心多圖層合成函式 (Composite Core)
   * 階層依序：Body ➔ Head ➔ Blush ➔ Eyes ➔ Bodice ➔ Hair
   */
  async function compositeCharacter(options = {}, targetCanvas = null) {
    const opts = {
      gender: options.gender || 'female',
      bodiceColor: options.bodiceColor || 'black',
      hairStyle: options.hairStyle || 'bangslong',
      hairColor: options.hairColor || 'blonde',
      eyeColor: options.eyeColor || 'purple',
      enableBlush: options.enableBlush !== false, // 預設開啟可愛臉紅
      frame: (options.frame || 0) % 2,
      framing: options.framing || 'portrait',
      ...options
    };

    // 1. 解析資源路徑
    const isFemale = opts.gender === 'female';
    const bodyUrl = `${LPC_ASSET_BASE}/body/${isFemale ? 'female' : 'male'}_idle.png`;
    const headUrl = `${LPC_ASSET_BASE}/head/${isFemale ? 'female' : 'male'}_head_idle.png`;
    const blushUrl = isFemale && opts.enableBlush ? `${LPC_ASSET_BASE}/head/female_blush_idle.png` : null;
    const eyeUrl = `${LPC_ASSET_BASE}/eyes/${opts.eyeColor}.png`;
    
    let bodiceUrl = null;
    if (opts.bodiceColor === 'armor_plate') {
      bodiceUrl = `${LPC_ASSET_BASE}/armor/plate_${isFemale ? 'female' : 'male'}_idle.png`;
    } else if (opts.bodiceColor !== 'none') {
      bodiceUrl = `${LPC_ASSET_BASE}/bodice/${opts.bodiceColor}.png`;
    }

    const hairUrl = `${LPC_ASSET_BASE}/hair/${opts.hairStyle}_idle.png`;

    // 2. 並行載入所有圖層
    const [bodyImg, headImg, blushImg, eyeImg, bodiceImg, hairImg] = await Promise.all([
      loadLpcImage(bodyUrl),
      loadLpcImage(headUrl),
      loadLpcImage(blushUrl),
      loadLpcImage(eyeUrl),
      bodiceUrl ? loadLpcImage(bodiceUrl) : Promise.resolve(null),
      loadLpcImage(hairUrl)
    ]);

    // 3. 準備畫布 (128x128 高解析無損輸出)
    const canvas = targetCanvas || document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false; // 關鍵：維持硬派銳利像素，不產生模糊抗鋸齒
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 4. 計算裁切區域 (LPC 格式：Row 2 為正面視角 Y: 128..191)
    const frameIndex = opts.frame; // 0 或 1
    const srcX = frameIndex * 64;
    const srcY = 2 * 64; // Row 2 正面朝向 (Y: 128)

    // 依據鏡頭模式決定取景
    let sx, sy, sw, sh, dx, dy, dw, dh;
    if (opts.framing === 'portrait') {
      // 🌟 黃金胸像特寫：取頭部到胸部（Y: 0~48），略微平移置中
      sx = srcX;
      sy = srcY + 2;
      sw = 64;
      sh = 48; // 裁切至腰部上方，胸部曲線居中
      dx = 0;
      dy = 0;
      dw = 128;
      dh = 128; // 等比例無損放大到 128x128
    } else {
      // 全身立繪模式
      sx = srcX;
      sy = srcY;
      sw = 64;
      sh = 64;
      dx = 0;
      dy = 0;
      dw = 128;
      dh = 128;
    }

    // 5. 依精密 Z-Index 階層疊合繪製
    // [Layer 1]: 身軀素體 (Body) - 脖子以下人體線條
    if (bodyImg) {
      ctx.drawImage(bodyImg, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    // [Layer 2]: 🌸 繪師手繪頭顱與臉蛋肌膚 (Head / Face) - 告別黑色空洞！
    if (headImg) {
      ctx.drawImage(headImg, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    // [Layer 3]: 💕 少女微醺臉紅 (Sweet Blush)
    if (blushImg) {
      ctx.drawImage(blushImg, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    // [Layer 4]: 靈魂五官瞳孔 (Eyes)
    if (eyeImg) {
      ctx.drawImage(eyeImg, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    // [Layer 5]: 性感馬甲 / 鎧甲 (Bodice / Armor)
    if (bodiceImg) {
      ctx.drawImage(bodiceImg, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    // [Layer 6]: 飄逸長髮 (Hair with dynamic tinting)
    if (hairImg) {
      const tintCfg = HAIR_PALETTES[opts.hairColor] || HAIR_PALETTES.blonde;
      const tintedHairCanvas = createTintedHairCanvas(hairImg, tintCfg, srcX, srcY);
      
      const hairCropY = opts.framing === 'portrait' ? 2 : 0;
      const hairCropH = opts.framing === 'portrait' ? 48 : 64;

      ctx.drawImage(
        tintedHairCanvas,
        0, hairCropY, 64, hairCropH,
        dx, dy, dw, dh
      );
    }

    return canvas;
  }

  /**
   * 產出 Base64 Data URL (可直接放入 <img> src 或英雄大頭貼)
   */
  async function renderToDataUrl(options = {}) {
    const c = await compositeCharacter(options);
    return c.toDataURL('image/png');
  }

  // 導出全域介面
  const LpcCompositor = {
    composite: compositeCharacter,
    renderToDataUrl: renderToDataUrl,
    palettes: HAIR_PALETTES,
    bodiceColors: BODICE_COLORS,
    hairStyles: HAIR_STYLES,
    eyeColors: EYE_COLORS
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LpcCompositor };
  } else {
    root.LpcCompositor = LpcCompositor;
  }

})(typeof window !== 'undefined' ? window : this);
