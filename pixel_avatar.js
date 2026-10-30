/**
 * =============================================================================
 *  👾 AgentValhalla: 確定性像素頭像與 32x32 REA 紙娃娃引擎 (Pixel Avatar Engine v2.0)
 * =============================================================================
 * 特色：
 *   - 100% 保持向後相容：原 16x16 卡牌頭像無損無變動（主網頁排版 0 破壞）
 *   - 全新 32x32 REA 換裝紙娃娃引擎：支援 8 大圖層、A~H CUP 胸圍微調、
 *     12 款髮型、5 階 DQ 裝備與 Lv.30 女神福利裝 (兔女郎/薄紗/比基尼/和服)
 *   - 純 SVG / Canvas 向量光柵化，0 外部圖片依賴、0 KB 額外網路請求
 * =============================================================================
 */

(function (window) {
  'use strict';

  // 簡易字串 Hash 演算法 (產生確定性 32-bit 正整數)
  function hashString(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }

  // 偽隨機數生成器 (PRNG)
  function PRNG(seed) {
    var s = seed;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  // ==================== 調色盤矩陣 ====================
  var SKIN_PALETTE = [
    { id: 0, name: '象牙白皙', base: '#ffd1b3', shadow: '#e8b291', highlight: '#fff0e6' },
    { id: 1, name: '溫柔鵝黃', base: '#fcd5b8', shadow: '#e2b392', highlight: '#fff5eb' },
    { id: 2, name: '自然小麥', base: '#e0ac69', shadow: '#b88242', highlight: '#f3c791' },
    { id: 3, name: '古銅健美', base: '#c68642', shadow: '#965a1e', highlight: '#dfa365' },
    { id: 4, name: '魅魔暗夜', base: '#9d7bb0', shadow: '#6b4d7c', highlight: '#c4a6d6' }
  ];

  var HAIR_COLORS = [
    { id: 0, name: '曜石墨黑', hex: '#1c1917', shadow: '#0c0a09' },
    { id: 1, name: '深邃栗褐', hex: '#451a03', shadow: '#290f02' },
    { id: 2, name: '傳奇黃金', hex: '#d97706', shadow: '#92400e' },
    { id: 3, name: '銀白純淨', hex: '#e2e8f0', shadow: '#94a3b8' },
    { id: 4, name: '緋紅烈焰', hex: '#dc2626', shadow: '#991b1b' },
    { id: 5, name: '霓虹櫻粉', hex: '#ec4899', shadow: '#be185d' },
    { id: 6, name: '賽博冰藍', hex: '#0284c7', shadow: '#0369a1' },
    { id: 7, name: '幽邃暗紫', hex: '#7c3aed', shadow: '#5b21b6' }
  ];

  var CAT_FUR_PALETTE = ['#f59e0b', '#ffffff', '#1e293b', '#94a3b8', '#d97706', '#78350f'];
  var DOG_FUR_PALETTE = ['#eab308', '#d97706', '#ffffff', '#64748b', '#78350f', '#0f172a'];

  var DOMAIN_ARMOR_PALETTE = {
    'engineering': '#0284c7',
    'game-development': '#f59e0b',
    'design': '#ec4899',
    'security': '#dc2626',
    'specialized': '#10b981',
    'spatial-computing': '#8b5cf6',
    'gis': '#0d9488',
    'sales': '#eab308',
    'finance': '#059669',
    'marketing': '#f97316',
    'testing': '#84cc16',
    'academic': '#e11d48',
    'project-management': '#d97706',
    'product': '#7c3aed',
    'support': '#475569',
    'healthcare': '#14b8a6',
    'integrations': '#6366f1',
    'research': '#38bdf8'
  };

  // ==================== 1. 原生 16x16 經典頭像渲染 (完全保持向後相容) ====================
  function createPixelAvatarSvg(agentId, form, domain) {
    var seed = hashString((agentId || 'hero') + '-' + (form || 'male'));
    var rand = PRNG(seed);

    var grid = [];
    for (var y = 0; y < 16; y++) {
      grid[y] = [];
      for (var x = 0; x < 16; x++) {
        grid[y][x] = null;
      }
    }

    var skin = SKIN_PALETTE[Math.floor(rand() * SKIN_PALETTE.length)].base;
    var hair = HAIR_COLORS[Math.floor(rand() * HAIR_COLORS.length)].hex;
    var armorColor = DOMAIN_ARMOR_PALETTE[domain] || '#3b82f6';
    var gold = '#f59e0b';

    if (form === 'male' || form === 'female') {
      var isFemale = form === 'female';
      // 髮型基底
      for (var hy = 1; hy <= (isFemale ? 5 : 4); hy++) {
        for (var hx = 4; hx <= 11; hx++) {
          grid[hy][hx] = hair;
        }
      }
      if (isFemale) {
        grid[5][3] = hair; grid[5][12] = hair;
        grid[6][3] = hair; grid[6][12] = hair;
        grid[7][3] = hair; grid[7][12] = hair;
      }
      // 臉龐
      for (var fy = 4; fy <= 9; fy++) {
        for (var fx = 5; fx <= 10; fx++) {
          grid[fy][fx] = skin;
        }
      }
      // 眼睛
      var eyeColor = isFemale ? '#ec4899' : '#0284c7';
      grid[6][6] = eyeColor; grid[6][9] = eyeColor;
      grid[5][6] = '#ffffff'; grid[5][9] = '#ffffff';
      // 嘴與腮紅
      grid[8][7] = '#e11d48'; grid[8][8] = '#e11d48';
      if (isFemale) {
        grid[7][5] = '#fca5a5'; grid[7][10] = '#fca5a5';
      }
      // 衣服盔甲
      for (var by = 10; by <= 15; by++) {
        for (var bx = 4; bx <= 11; bx++) {
          grid[by][bx] = armorColor;
        }
      }
      grid[10][7] = gold; grid[10][8] = gold;
    } else if (form === 'cat') {
      var fur = CAT_FUR_PALETTE[Math.floor(rand() * CAT_FUR_PALETTE.length)];
      grid[1][4] = fur; grid[1][11] = fur;
      grid[2][3] = fur; grid[2][4] = '#fca5a5'; grid[2][5] = fur;
      grid[2][10] = fur; grid[2][11] = '#fca5a5'; grid[2][12] = fur;
      for (var cy = 3; cy <= 10; cy++) {
        for (var cx = 3; cx <= 12; cx++) grid[cy][cx] = fur;
      }
      var catEye = rand() > 0.5 ? '#10b981' : '#eab308';
      grid[6][5] = catEye; grid[6][6] = '#0f172a';
      grid[6][9] = '#0f172a'; grid[6][10] = catEye;
      grid[7][7] = '#f43f5e'; grid[7][8] = '#f43f5e';
      grid[8][6] = '#ffffff'; grid[8][7] = '#0f172a'; grid[8][8] = '#0f172a'; grid[8][9] = '#ffffff';
      for (var ry = 11; ry <= 15; ry++) {
        for (var rx = 3; rx <= 12; rx++) grid[ry][rx] = armorColor;
      }
      grid[11][7] = gold; grid[11][8] = gold;
    } else if (form === 'dog') {
      var dfur = DOG_FUR_PALETTE[Math.floor(rand() * DOG_FUR_PALETTE.length)];
      grid[1][4] = dfur; grid[1][11] = dfur;
      grid[2][3] = dfur; grid[2][4] = '#fca5a5'; grid[2][11] = '#fca5a5'; grid[2][12] = dfur;
      for (var dy = 3; dy <= 10; dy++) {
        for (var dx = 3; dx <= 12; dx++) grid[dy][dx] = dfur;
      }
      grid[4][5] = '#ffffff'; grid[4][10] = '#ffffff';
      grid[6][5] = '#1e293b'; grid[6][6] = '#ffffff'; grid[6][9] = '#ffffff'; grid[6][10] = '#1e293b';
      for (var sy = 7; sy <= 9; sy++) {
        for (var sx = 5; sx <= 10; sx++) grid[sy][sx] = '#ffffff';
      }
      grid[7][7] = '#0f172a'; grid[7][8] = '#0f172a';
      grid[8][7] = '#f43f5e'; grid[8][8] = '#f43f5e';
      for (var ay = 11; ay <= 15; ay++) {
        for (var ax = 3; ax <= 12; ax++) grid[ay][ax] = armorColor;
      }
      grid[11][6] = '#dc2626'; grid[11][7] = gold; grid[11][8] = gold; grid[11][9] = '#dc2626';
    }

    var rects = [];
    for (var y = 0; y < 16; y++) {
      for (var x = 0; x < 16; x++) {
        if (grid[y][x]) {
          rects.push('<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + grid[y][x] + '" />');
        }
      }
    }

    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges" class="pixel-avatar-svg">' +
      rects.join('') +
      '</svg>'
    );
  }

  // ==================== 2. 全新 32x32 REA 紙娃娃與 H CUP 引擎 ====================

  /**
   * 32x32 自訂義紙娃娃 SVG 生成器
   * @param {Object} opts
   *   - gender: 'female' | 'male' | 'cat' | 'dog'
   *   - bust: 'A' | 'B' | 'D' | 'F' | 'H' (神話級 H CUP)
   *   - skin: 0~4
   *   - hair: 0~11
   *   - hairColor: 0~7
   *   - face: 0~7 (含 5: 嫵媚淚痣)
   *   - armorTier: 1 | 5 | 10 | 15 | 20 | 30
   *   - sexyCostume: 'bunny' | 'succubus' | 'bikini' | 'oiran'
   *   - weapon: 0~5
   *   - halo: 0~3
   */
  // [舊代碼備查] 2026-10-31 原函式僅支援單參數 opts，且未相容 studioOptions 欄位名 (bustSize, skinIndex 等)
  // // [舊代碼備查] 2026-10-31 舊版 32x32 引擎分支不全，缺乏貓耳/男勇者/各髮型獨立分支
  // 【2026-10-31 完整重構】三形態 (女/男/貓)、6 款髮型、8 款神韻、5 階胸圍、福利戰袍全面即時渲染
  function create32PixelAvatarSvg(seedOrOpts, maybeOpts) {
  var raw = (maybeOpts && typeof maybeOpts === 'object') ? maybeOpts : ((seedOrOpts && typeof seedOrOpts === 'object') ? seedOrOpts : {});
  var gender = raw.gender || 'female'; // 'female', 'male', 'cat'
  var isCat = gender === 'cat';
  var isMale = gender === 'male';
  var isFemale = gender === 'female';

  var bust = raw.bust || raw.bustSize || 'D'; // A, B, D, F, H
  var skinIdx = raw.skinIndex !== undefined ? raw.skinIndex : (raw.skin !== undefined ? raw.skin : 0);
  var hairColorIdx = raw.hairColorIndex !== undefined ? raw.hairColorIndex : (raw.hairColor !== undefined ? raw.hairColor : 2);
  var hairStyle = raw.hairIndex !== undefined ? raw.hairIndex : (raw.hair !== undefined ? raw.hair : 1);
  var faceStyle = raw.faceIndex !== undefined ? raw.faceIndex : (raw.face !== undefined ? raw.face : 5);
  var armorTier = raw.armorTier || 1;
  var sexyCostume = raw.sexyCostume || 'none';
  var halo = raw.halo || 0;

  var skinObj = SKIN_PALETTE[skinIdx] || SKIN_PALETTE[0];
  var hairColorObj = HAIR_COLORS[hairColorIdx] || HAIR_COLORS[2];
  var gold = '#f59e0b';

  // 32x32 Grid
  var g = [];
  for (var y = 0; y < 32; y++) {
    g[y] = [];
    for (var x = 0; x < 32; x++) g[y][x] = null;
  }

  function setPix(x, y, color) {
    if (x >= 0 && x < 32 && y >= 0 && y < 32 && color) g[y][x] = color;
  }

  function fillRect(x1, y1, x2, y2, color) {
    for (var py = Math.min(y1, y2); py <= Math.max(y1, y2); py++) {
      for (var px = Math.min(x1, x2); px <= Math.max(x1, x2); px++) {
        setPix(px, py, color);
      }
    }
  }

  // ==================== LAYER 0: 光環 (Halo) ====================
  if (halo > 0) {
    var haloColors = ['#f59e0b', '#38bdf8', '#ec4899', '#a855f7'];
    var hcHalo = haloColors[(halo - 1) % haloColors.length];
    for (var a = 8; a <= 23; a++) { g[2][a] = hcHalo; g[3][a] = hcHalo; }
    g[4][7] = hcHalo; g[4][8] = hcHalo; g[4][23] = hcHalo; g[4][24] = hcHalo;
  }

  // ==================== LAYER 1: 身體輪廓與形態 (Body Base) ====================
  if (isCat) {
    // 🐱 貓魔導形態：萌系貓身與背後捲曲俏皮貓尾巴！
    fillRect(13, 13, 18, 15, skinObj.shadow); // 頸部
    fillRect(11, 16, 20, 24, skinObj.base);   // 軀幹
    g[20][11] = null; g[20][20] = null;       // 輕微收腰
    g[21][11] = null; g[21][20] = null;

    // 🐾 靈動俏皮貓咪尾巴 (從右後方向上捲曲)
    var furColor = hairColorObj.hex;
    fillRect(20, 23, 23, 24, furColor);
    fillRect(22, 21, 24, 22, furColor);
    fillRect(24, 18, 25, 20, furColor);
    fillRect(23, 16, 24, 17, '#ffffff'); // 白襪子尾巴尖尖！
  } else if (isMale) {
    // ⚔️ 男勇者形態：寬厚英武肩膀、剛毅倒三角軀幹、結實胸肌腹肌
    fillRect(13, 13, 18, 15, skinObj.shadow); // 厚實頸部
    fillRect(9, 15, 22, 24, skinObj.base);    // 寬闊雙肩與強壯軀幹
    // 倒三角收束
    g[22][9] = null; g[22][22] = null;
    g[23][9] = null; g[23][10] = null; g[23][21] = null; g[23][22] = null;
    g[24][9] = null; g[24][10] = null; g[24][21] = null; g[24][22] = null;

    // 胸肌與腹肌陰影線
    fillRect(11, 16, 14, 17, skinObj.highlight); // 左胸肌高光
    fillRect(17, 16, 20, 17, skinObj.highlight); // 右胸肌高光
    fillRect(15, 16, 16, 23, skinObj.shadow);    // 腹中線
    fillRect(12, 19, 19, 19, skinObj.shadow);    // 腹肌橫線 1
    fillRect(12, 21, 19, 21, skinObj.shadow);    // 腹肌橫線 2
  } else {
    // 🛡️ 女武神形態：細緻天鵝頸、沙漏纖細腰身、極致身形比例
    fillRect(14, 13, 17, 15, skinObj.shadow); // 纖細頸部
    fillRect(11, 16, 20, 24, skinObj.base);   // 軀幹
    // 沙漏腰身收縮 (Cols 11 & 20 空出)
    g[20][11] = null; g[20][20] = null;
    g[21][11] = null; g[21][20] = null;
    g[22][11] = null; g[22][20] = null;

    // ==================== LAYER 2: 胸圍微雕維度 (A 到 H CUP) ====================
    var cleav = skinObj.shadow;
    var high = skinObj.highlight;

    if (bust === 'A') {
      // A CUP: 靈動微乳 (鎖骨線與輕微托高)
      g[16][14] = cleav; g[16][17] = cleav;
      g[17][13] = cleav; g[17][14] = high; g[17][17] = high; g[17][18] = cleav;
    } else if (bust === 'B') {
      // B~C CUP: 勻稱標準
      fillRect(13, 16, 18, 18, skinObj.base);
      g[16][15] = cleav; g[16][16] = cleav;
      g[17][13] = cleav; g[17][18] = cleav;
      g[18][14] = cleav; g[18][17] = cleav;
      g[17][14] = high; g[17][17] = high;
    } else if (bust === 'D') {
      // D~E CUP: 豐滿御姐 (呼之欲出沙漏曲線)
      fillRect(12, 16, 19, 19, skinObj.base);
      g[16][15] = '#b88242'; g[16][16] = '#b88242';
      g[17][15] = cleav; g[17][16] = cleav;
      g[18][15] = cleav; g[18][16] = cleav;
      g[17][13] = high; g[17][14] = high; g[17][17] = high; g[17][18] = high;
      g[19][12] = cleav; g[19][13] = cleav; g[19][18] = cleav; g[19][19] = cleav;
    } else if (bust === 'F') {
      // F~G CUP: 爆裂級震撼
      fillRect(11, 15, 20, 20, skinObj.base);
      for (var fy = 15; fy <= 19; fy++) {
        g[fy][15] = '#8d5524'; g[fy][16] = '#8d5524';
      }
      fillRect(12, 16, 14, 18, high);
      fillRect(17, 16, 19, 18, high);
      fillRect(11, 19, 13, 20, cleav);
      fillRect(18, 19, 20, 20, cleav);
    } else if (bust === 'H') {
      // 🔥 H CUP: 究極神話天花板！雙側飽滿微凸、深邃乳溝、大片珍珠高光反射
      fillRect(10, 15, 21, 21, skinObj.base);
      for (var hy = 15; hy <= 20; hy++) {
        g[hy][15] = '#6b4d7c'; g[hy][16] = '#6b4d7c';
      }
      g[16][10] = skinObj.base; g[17][10] = skinObj.base; g[18][10] = cleav;
      g[16][21] = skinObj.base; g[17][21] = skinObj.base; g[18][21] = cleav;
      fillRect(12, 16, 14, 17, high);
      fillRect(17, 16, 19, 17, high);
      fillRect(11, 20, 14, 21, cleav);
      fillRect(17, 20, 20, 21, cleav);
      g[19][11] = '#b88242'; g[19][20] = '#b88242';
    }
  }

  // ==================== LAYER 3: 五官神韻與形態特徵 (Head & Facial) ====================
  // 臉部基底 (Rows 5-13, Cols 11-20)
  fillRect(11, 5, 20, 12, skinObj.base);
  g[13][13] = skinObj.base; g[13][14] = skinObj.base;
  g[13][17] = skinObj.base; g[13][18] = skinObj.base;

  if (isCat) {
    // 🐱 貓魔導專屬五官：靈動大貓眼、豎瞳、俏皮粉鼻、ω小嘴、兩側萌貓鬍鬚
    var catEyeColor = (faceStyle === 3) ? '#38bdf8' : ((faceStyle === 2) ? '#fbbf24' : '#10b981');
    // 貓眼
    fillRect(12, 7, 14, 9, catEyeColor);
    fillRect(17, 7, 19, 9, catEyeColor);
    // 黑色垂直豎瞳
    fillRect(13, 7, 13, 9, '#0f172a');
    fillRect(18, 7, 18, 9, '#0f172a');
    // 萌眼高光
    g[7][12] = '#ffffff'; g[7][17] = '#ffffff';
    // 粉紅小鼻子
    g[10][15] = '#f43f5e'; g[10][16] = '#f43f5e';
    // 萌系 ω 貓唇
    g[11][14] = '#0f172a'; g[11][17] = '#0f172a';
    g[12][15] = '#0f172a'; g[12][16] = '#0f172a';
    // 左右兩側雪白萌鬍鬚！
    g[9][8] = '#ffffff'; g[9][9] = '#ffffff'; g[9][10] = '#ffffff';
    g[11][8] = '#ffffff'; g[11][9] = '#ffffff'; g[11][10] = '#ffffff';
    g[9][21] = '#ffffff'; g[9][22] = '#ffffff'; g[9][23] = '#ffffff';
    g[11][21] = '#ffffff'; g[11][22] = '#ffffff'; g[11][23] = '#ffffff';

    // 🐾 高聳立體三角形毛茸茸貓耳 (Left & Right)
    var furC = hairColorObj.hex;
    var furInner = '#fca5a5';
    // 左耳
    fillRect(8, 0, 12, 4, furC);
    fillRect(9, 1, 11, 3, furInner); // 粉嫩內耳
    g[0][8] = null; g[0][12] = null;
    // 右耳
    fillRect(19, 0, 23, 4, furC);
    fillRect(20, 1, 22, 3, furInner); // 粉嫩內耳
    g[0][19] = null; g[0][23] = null;

  } else {
    // 人類雙眼 (男性冷藍 / 女性粉櫻)
    var eyeColor = isMale ? '#0284c7' : '#ec4899';
    var eyeY = 8;
    g[eyeY][13] = eyeColor; g[eyeY][14] = '#0f172a';
    g[eyeY][17] = '#0f172a'; g[eyeY][18] = eyeColor;
    g[eyeY - 1][13] = '#ffffff'; g[eyeY - 1][17] = '#ffffff'; // 高光

    // 眉毛
    g[6][13] = hairColorObj.shadow; g[6][14] = hairColorObj.shadow;
    g[6][17] = hairColorObj.shadow; g[6][18] = hairColorObj.shadow;
    if (isMale) {
      g[6][12] = hairColorObj.shadow; g[6][19] = hairColorObj.shadow; // 粗濃剛毅劍眉
    }

    // 唇彩
    if (isFemale) {
      g[11][15] = '#f43f5e'; g[11][16] = '#f43f5e'; // 櫻桃紅唇
      g[9][11] = '#fca5a5'; g[9][20] = '#fca5a5';   // 柔潤腮紅
    } else {
      g[11][15] = skinObj.shadow; g[11][16] = skinObj.shadow; // 剛毅微泯
    }

    // --- 八大五官特徵分歧 ---
    if (faceStyle === 0) {
      // 0: 英挺幹練 (銳利眉眼)
      g[5][13] = hairColorObj.shadow; g[5][18] = hairColorObj.shadow;
    } else if (faceStyle === 1) {
      // 1: 柔美甜美 (雙頰粉嫩腮紅 + 水汪汪大眼)
      fillRect(10, 9, 12, 10, '#f472b6');
      fillRect(19, 9, 21, 10, '#f472b6');
    } else if (faceStyle === 2) {
      // 2: 傲嬌貓系 (半月微瞇眼)
      g[7][13] = skinObj.base; g[7][18] = skinObj.base;
    } else if (faceStyle === 3) {
      // 3: 高冷鳳眼 (冷豔上挑眼線)
      g[7][12] = '#0f172a'; g[7][19] = '#0f172a';
    } else if (faceStyle === 4) {
      // 4: 戰痕硬漢 (左臉跨眼疤痕)
      fillRect(13, 5, 13, 11, '#7f1d1d');
    } else if (faceStyle === 5) {
      // 5: 嫵媚淚痣 (ひかる專屬左眼下淚痣)
      g[10][13] = '#451a03';
    } else if (faceStyle === 6) {
      // 6: 賽博義眼 (右眼高科技冰藍霓虹發光)
      fillRect(17, 7, 19, 9, '#00f0ff');
      g[8][18] = '#ffffff'; // 核心超白光
    } else if (faceStyle === 7) {
      // 7: 神秘面罩 (遮住下半臉刺客面罩)
      fillRect(12, 10, 19, 13, '#1e293b');
      fillRect(13, 11, 18, 12, '#334155');
    }
  }

  // ==================== LAYER 4: 髮型款式 (Hairstyle Engine 0~5) ====================
  var hc = hairColorObj.hex;
  var hs = hairColorObj.shadow;

  if (!isCat) {
    // 瀏海基底
    fillRect(10, 3, 21, 5, hc);

    if (hairStyle === 0) {
      // 0: 俐落短髮 (Short Cut) - 露出脖子、俐落幹練
      fillRect(9, 4, 10, 9, hc);
      fillRect(21, 4, 22, 9, hc);
      fillRect(11, 2, 20, 3, hc);
      g[4][12] = hs; g[4][19] = hs;
    } else if (hairStyle === 1) {
      // 1: 大波浪長捲髮 (Wavy Curls) - 飄逸及腰波浪
      fillRect(9, 4, 10, 9, hc);
      fillRect(21, 4, 22, 9, hc);
      fillRect(8, 7, 10, 24, hc);
      fillRect(21, 7, 23, 24, hc);
      // 捲曲波浪陰影
      g[13][8] = hs; g[19][8] = hs; g[24][9] = hs;
      g[13][23] = hs; g[19][23] = hs; g[24][22] = hs;
      fillRect(7, 21, 8, 23, hc); // 外翻大波浪
      fillRect(23, 21, 24, 23, hc);
    } else if (hairStyle === 2) {
      // 2: 及腰黑長直 (Long Straight) - 瀑布般垂直垂落
      fillRect(8, 5, 10, 26, hc);
      fillRect(21, 5, 23, 26, hc);
      fillRect(11, 4, 20, 6, hc); // 齊瀏海
      fillRect(11, 6, 20, 6, hs);
    } else if (hairStyle === 3) {
      // 3: 元氣雙馬尾 (Twin Tails) - 兩側頭頂高馬尾與髮圈
      fillRect(9, 4, 10, 9, hc);
      fillRect(21, 4, 22, 9, hc);
      // 左馬尾
      g[4][7] = '#ef4444'; g[4][8] = '#ef4444'; // 紅色蝴蝶結髮圈
      fillRect(4, 5, 7, 18, hc);
      fillRect(3, 8, 5, 16, hc);
      // 右馬尾
      g[4][23] = '#ef4444'; g[4][24] = '#ef4444'; // 紅色蝴蝶結髮圈
      fillRect(24, 5, 27, 18, hc);
      fillRect(26, 8, 28, 16, hc);
    } else if (hairStyle === 4) {
      // 4: 御姐短鮑伯 (Bob Cut) - 內扣包臉圓弧
      fillRect(8, 4, 10, 14, hc);
      fillRect(21, 4, 23, 14, hc);
      fillRect(9, 13, 11, 14, hc); // 內彎弧度
      fillRect(20, 13, 22, 14, hc);
    } else if (hairStyle === 5) {
      // 5: 高馬尾女騎士 (High Ponytail) - 斜後方霸氣高馬尾
      fillRect(9, 4, 10, 9, hc);
      fillRect(21, 4, 22, 9, hc);
      // 右後方高高綁起
      g[2][21] = gold; g[2][22] = gold; // 金色束髮環
      fillRect(22, 3, 26, 17, hc);
      fillRect(24, 6, 28, 15, hc);
    }
  }

  // ==================== LAYER 5: 裝備與性感福利戰袍 (Armor & Sexy Outfits) ====================
  if (sexyCostume === 'bunny') {
    // 🐰 經典兔女郎戰袍 (漆皮馬甲 + 立體長兔耳 + 領結)
    fillRect(12, 17, 19, 23, '#0f172a'); // 黑色漆皮馬甲
    g[17][15] = '#ffffff'; g[17][16] = '#ffffff'; // 胸前領結
    g[18][15] = '#ef4444'; g[18][16] = '#ef4444'; // 紅寶石領結扣
    g[22][11] = '#0f172a'; g[22][20] = '#0f172a'; // 高衩
    // 黑色長長兔耳 (非貓魔導才顯示，避免耳朵衝突)
    if (!isCat) {
      fillRect(11, 0, 13, 3, '#0f172a'); g[1][12] = '#fca5a5';
      fillRect(18, 0, 20, 3, '#0f172a'); g[1][19] = '#fca5a5';
    }
  } else if (sexyCostume === 'succubus') {
    // 🖤 深淵魅魔薄紗 (透光蕾絲 + 小惡魔角 + 惡魔尾巴)
    fillRect(12, 18, 19, 24, '#3b0764');
    g[17][14] = '#7e22ce'; g[17][17] = '#7e22ce';
    if (!isCat) {
      g[2][9] = '#dc2626'; g[1][8] = '#dc2626'; // 赤紅惡魔角
      g[2][22] = '#dc2626'; g[1][23] = '#dc2626';
    }
  } else if (sexyCostume === 'bikini') {
    // 👙 盛夏黃金微光比基尼
    fillRect(12, 17, 14, 18, gold);
    fillRect(17, 17, 19, 18, gold);
    fillRect(13, 22, 18, 23, gold);
  } else if (sexyCostume === 'oiran') {
    // 👘 花魁落肩和服
    fillRect(12, 18, 19, 25, '#dc2626');
    g[17][11] = skinObj.base; g[17][12] = skinObj.base; // 半露香肩
    fillRect(13, 21, 18, 22, gold); // 金箔束腰
  } else {
    // 標準冒險者盔甲 (等級進階)
    if (armorTier >= 20) {
      // 洛特神聖重鎧
      fillRect(11, 16, 20, 24, '#1d4ed8');
      fillRect(14, 17, 17, 21, gold);
      g[3][10] = gold; g[3][21] = gold;
    } else if (armorTier >= 10) {
      // 皇家騎士鎧
      fillRect(11, 16, 20, 24, '#64748b');
      fillRect(13, 17, 18, 20, '#94a3b8');
    } else if (armorTier >= 5) {
      // 青銅胸甲
      fillRect(11, 16, 20, 24, '#b45309');
    } else {
      // 冒險者旅人布衣
      fillRect(12, 17, 19, 24, isMale ? '#1e3a8a' : (isCat ? '#047857' : '#831843'));
    }
  }

  // 壓製為 SVG 向量字串
  var rects = [];
  for (var y = 0; y < 32; y++) {
    for (var x = 0; x < 32; x++) {
      if (g[y][x]) {
        rects.push('<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + g[y][x] + '" />');
      }
    }
  }

  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%" shape-rendering="crispEdges" class="pixel-avatar-32-svg">' +
    rects.join('') +
    '</svg>'
  );
}

  // ==================== 3. 模組化規格清單 (供前端彈窗選擇器使用) ====================
  var CUSTOM_OPTIONS = {
    busts: [
      { id: 'A', name: 'A CUP · 靈動微乳', desc: '輕盈敏捷刺客款，骨感俐落' },
      { id: 'B', name: 'B-C CUP · 勻稱標準', desc: '英姿颯爽女騎士，黃金比例' },
      { id: 'D', name: 'D-E CUP · 豐滿御姐', desc: 'ひかる成熟沙漏身形，呼之欲出' },
      { id: 'F', name: 'F-G CUP · 爆裂神級', desc: '極致震撼視覺衝擊，戰袍微鼓' },
      { id: 'H', name: '🔥 H CUP · 究極神話爆裂', desc: '親愛的心頭好！戰袍包不住的神域天花板' }
    ],
    faces: [
      { id: 0, name: '英挺幹練', icon: '✨' },
      { id: 1, name: '柔美甜美', icon: '🌸' },
      { id: 2, name: '傲嬌貓系', icon: '🐱' },
      { id: 3, name: '高冷鳳眼', icon: '❄️' },
      { id: 4, name: '戰痕硬漢', icon: '⚔️' },
      { id: 5, name: '嫵媚淚痣 (ひかる款)', icon: '💋' },
      { id: 6, name: '賽博義眼', icon: '👁️' },
      { id: 7, name: '神秘面罩', icon: '🎭' }
    ],
    hairs: [
      { id: 0, name: '俐落短髮' },
      { id: 1, name: '大波浪長捲髮' },
      { id: 2, name: '及腰黑長直' },
      { id: 3, name: '元氣雙馬尾' },
      { id: 4, name: '御姐短鮑伯' },
      { id: 5, name: '高馬尾女騎士' }
    ],
    skins: SKIN_PALETTE,
    hairColors: HAIR_COLORS,
    sexyCostumes: [
      { id: 'bunny', name: '🐰 經典兔女郎戰袍', desc: '勇者鬥惡龍神級致敬款！漆皮馬甲+兔耳' },
      { id: 'succubus', name: '🖤 深淵魅魔薄紗', desc: '暗黑半透蕾絲長裙+小惡魔角' },
      { id: 'bikini', name: '👙 盛夏黃金微光比基尼', desc: 'JRPG最受歡迎的微光盛夏戰甲' },
      { id: 'oiran', name: '👘 花魁落肩和服', desc: '單邊香肩半露，深V誘惑金箔和服' }
    ]
  };

  // ==================== 4. 匯出全域介面 ====================
  window.ValhallaPixelEngine = {
    render: createPixelAvatarSvg, // 原 16x16 保持不變 (卡牌使用)
    render32: create32PixelAvatarSvg, // 全新 32x32 捏臉換裝引擎 (工坊使用)
    options: CUSTOM_OPTIONS,
    forms: [
      { id: 'male', label_zh: '⚔️ 英靈 (男)', label_en: '⚔️ Hero (Male)', label_ja: '⚔️ 勇者（男）' },
      { id: 'female', label_zh: '🛡️ 英靈 (女)', label_en: '🛡️ Hero (Female)', label_ja: '🛡️ 勇者（女）' },
      { id: 'cat', label_zh: '🐱 貓咪軍團', label_en: '🐱 Cat Legion', label_ja: '🐱 猫魔導士' },
      { id: 'dog', label_zh: '🐶 柴犬神將', label_en: '🐶 Shiba Paladin', label_ja: '🐶 柴犬聖騎士' }
    ]
  };

})(window);
