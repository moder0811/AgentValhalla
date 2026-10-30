/**
 * =============================================================================
 *  👾 AgentValhalla: 確定性 16x16 像素頭像動態生成引擎 (Pixel Avatar Engine)
 * =============================================================================
 * 功能意圖：
 *   為 306 尊英靈根據其 ID 產生確定性（Deterministic）唯一特徵，
 *   支援四種形態：
 *   1. ⚔️ 'male'   : 雄性戰神 / 帥氣硬派冒險者
 *   2. 🛡️ 'female' : 雌性女武神 / 優雅魔法使
 *   3. 🐱 'cat'    : 貓咪軍團 / 萌系貓耳魔導士
 *   4. 🐶 'dog'    : 柴犬神將 / 忠勇聖騎士
 *
 * 特色：
 *   - 100% 離線純前端 SVG 向量渲染，零網路請求、零 API 成本
 *   - 使用 shape-rendering="crispEdges" 保持原汁原味 8-bit / 16-bit 復古像素質感
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

  // 膚色與毛色調色盤
  var SKIN_PALETTE = ['#ffd1b3', '#fcd5b8', '#ffdfba', '#e0ac69', '#c68642', '#8d5524'];
  var HAIR_PALETTE = ['#2b2b2b', '#4a3728', '#8b5a2b', '#d4af37', '#b22222', '#e6e6e6', '#3b82f6', '#ec4899', '#8b5cf6'];
  var CAT_FUR_PALETTE = ['#f59e0b', '#ffffff', '#1e293b', '#94a3b8', '#d97706', '#78350f']; // 橘貓、白貓、黑貓、灰貓、三花
  var DOG_FUR_PALETTE = ['#eab308', '#d97706', '#ffffff', '#64748b', '#78350f', '#0f172a']; // 柴犬金、赤柴、白柴、黑柴

  // 領域裝備配色
  var DOMAIN_ARMOR_PALETTE = {
    'engineering': '#0284c7', // 科技藍
    'game-development': '#f59e0b', // 傳奇金
    'design': '#ec4899', // 霓虹粉
    'security': '#dc2626', // 警示赤紅
    'specialized': '#10b981', // 祖母綠
    'spatial-computing': '#8b5cf6', // 空間紫
    'gis': '#0d9488', // 碧青
    'sales': '#eab308', // 帝王黃
    'finance': '#059669', // 財富綠
    'marketing': '#f97316', // 烈焰橘
    'testing': '#84cc16', // 酸性螢光綠
    'academic': '#e11d48', // 典雅深紅
    'project-management': '#d97706', // 琥珀
    'product': '#7c3aed', // 深紫
    'support': '#475569', // 玄武岩灰
    'healthcare': '#14b8a6', // 治癒青
    'integrations': '#6366f1', // 乙太靛藍
    'research': '#38bdf8'  // 天空藍
  };

  /**
   * 繪製 16x16 網格的像素點矩陣
   */
  function createPixelAvatarSvg(agentId, form, domain) {
    var seed = hashString((agentId || 'hero') + '-' + (form || 'male'));
    var rand = PRNG(seed);

    // 建立 16x16 像素畫布矩陣
    var grid = [];
    for (var y = 0; y < 16; y++) {
      grid[y] = [];
      for (var x = 0; x < 16; x++) {
        grid[y][x] = null;
      }
    }

    var armorColor = DOMAIN_ARMOR_PALETTE[domain] || '#3b82f6';
    var armorDark = '#0f172a';
    var gold = '#f59e0b';

    if (form === 'male') {
      // ⚔️ 雄性英靈 (Warrior / Adventurer)
      var skin = SKIN_PALETTE[Math.floor(rand() * SKIN_PALETTE.length)];
      var hair = HAIR_PALETTE[Math.floor(rand() * HAIR_PALETTE.length)];

      // 頭盔或髮型 (Rows 2-5)
      var hasHelmet = rand() > 0.6;
      var helmetColor = hasHelmet ? armorColor : hair;

      for (var hx = 4; hx <= 11; hx++) {
        grid[2][hx] = helmetColor;
        grid[3][hx] = helmetColor;
      }
      grid[1][5] = helmetColor; grid[1][6] = helmetColor; grid[1][9] = helmetColor; grid[1][10] = helmetColor;
      grid[4][3] = helmetColor; grid[4][12] = helmetColor;

      // 臉龐 (Rows 4-9)
      for (var fy = 4; fy <= 9; fy++) {
        for (var fx = 4; fx <= 11; fx++) {
          grid[fy][fx] = skin;
        }
      }

      // 額頭髮絲或頭盔護額
      if (hasHelmet) {
        grid[4][6] = gold; grid[4][7] = gold; grid[4][8] = gold; grid[4][9] = gold;
      } else {
        grid[4][4] = hair; grid[4][5] = hair; grid[4][10] = hair; grid[4][11] = hair;
      }

      // 眼睛 (Row 6)
      var eyeColor = '#1e293b';
      grid[6][5] = eyeColor; grid[6][6] = eyeColor;
      grid[6][9] = eyeColor; grid[6][10] = eyeColor;
      grid[5][5] = hair; grid[5][6] = hair; // 粗眉
      grid[5][9] = hair; grid[5][10] = hair;

      // 鬍渣或堅毅嘴角 (Row 9)
      if (rand() > 0.4) {
        grid[9][6] = hair; grid[9][7] = hair; grid[9][8] = hair; grid[9][9] = hair;
      } else {
        grid[8][7] = '#c68642'; grid[8][8] = '#c68642'; // 鼻影
      }

      // 護肩與重裝胸甲 (Rows 10-15)
      for (var ay = 10; ay <= 15; ay++) {
        for (var ax = 3; ax <= 12; ax++) {
          grid[ay][ax] = armorColor;
        }
      }
      // 胸甲徽飾 (金飾 / 符文)
      grid[11][7] = gold; grid[11][8] = gold;
      grid[12][7] = gold; grid[12][8] = gold;
      grid[10][2] = armorDark; grid[10][13] = armorDark; // 巨型護肩邊界

    } else if (form === 'female') {
      // 🛡️ 雌性女武神 (Valkyrie / Mage)
      var skin = SKIN_PALETTE[Math.floor(rand() * 3)]; // 較白皙色號
      var hair = HAIR_PALETTE[Math.floor(rand() * HAIR_PALETTE.length)];

      // 長髮波浪或雙馬尾 (Rows 1-13)
      for (var fy = 2; fy <= 13; fy++) {
        grid[fy][2] = hair; grid[fy][3] = hair;
        grid[fy][12] = hair; grid[fy][13] = hair;
      }
      for (var hx = 4; hx <= 11; hx++) {
        grid[1][hx] = hair; grid[2][hx] = hair;
      }

      // 女武神頭冠 (Tiara)
      grid[2][7] = gold; grid[2][8] = gold;
      grid[1][7] = '#ef4444'; grid[1][8] = '#ef4444'; // 紅寶石頭飾

      // 臉龐 (Rows 3-8)
      for (var fy = 3; fy <= 8; fy++) {
        for (var fx = 4; fx <= 11; fx++) {
          grid[fy][fx] = skin;
        }
      }

      // 劉海修飾
      grid[3][5] = hair; grid[3][6] = hair; grid[3][9] = hair; grid[3][10] = hair;

      // 明媚雙眸與睫毛 (Row 5)
      grid[4][5] = hair; grid[4][10] = hair; // 上睫毛
      grid[5][5] = '#3b82f6'; grid[5][6] = '#ffffff'; // 高光眼眸
      grid[5][9] = '#3b82f6'; grid[5][10] = '#ffffff';

      // 櫻桃唇與腮紅 (Row 7-8)
      grid[7][4] = '#fca5a5'; grid[7][11] = '#fca5a5'; // 腮紅
      grid[8][7] = '#f43f5e'; grid[8][8] = '#f43f5e'; // 唇膏

      // 輕甲披風 (Rows 9-15)
      for (var ay = 9; ay <= 15; ay++) {
        for (var ax = 4; ax <= 11; ax++) {
          grid[ay][ax] = armorColor;
        }
      }
      grid[10][6] = gold; grid[10][7] = '#ffffff'; grid[10][8] = '#ffffff'; grid[10][9] = gold; // 水晶項鍊

    } else if (form === 'cat') {
      // 🐱 貓咪軍團 (Cat Mage / Feline Adventurer)
      var fur = CAT_FUR_PALETTE[Math.floor(rand() * CAT_FUR_PALETTE.length)];
      var innerEar = '#fca5a5'; // 粉紅內耳

      // 三角貓耳朵 (Rows 1-4)
      grid[1][3] = fur; grid[1][12] = fur;
      grid[2][2] = fur; grid[2][3] = innerEar; grid[2][4] = fur;
      grid[2][11] = fur; grid[2][12] = innerEar; grid[2][13] = fur;
      grid[3][2] = fur; grid[3][3] = innerEar; grid[3][4] = fur;
      grid[3][11] = fur; grid[3][12] = innerEar; grid[3][13] = fur;

      // 貓貓頭部 (Rows 3-10)
      for (var cy = 3; cy <= 10; cy++) {
        for (var cx = 3; cx <= 12; cx++) {
          grid[cy][cx] = fur;
        }
      }

      // 大大的貓咪眼眸 (Row 6)
      var catEye = rand() > 0.5 ? '#10b981' : '#eab308'; // 綠眼或金眼
      grid[6][5] = catEye; grid[6][6] = '#0f172a'; // 瞳孔
      grid[6][9] = '#0f172a'; grid[6][10] = catEye;
      grid[5][5] = '#ffffff'; grid[5][10] = '#ffffff'; // 高光

      // 貓咪鬍鬚 (Rows 7-8)
      grid[7][1] = '#ffffff'; grid[7][2] = '#ffffff'; grid[7][13] = '#ffffff'; grid[7][14] = '#ffffff';
      grid[8][1] = '#ffffff'; grid[8][2] = '#ffffff'; grid[8][13] = '#ffffff'; grid[8][14] = '#ffffff';

      // 貓嘴 :3 與粉紅小鼻子 (Rows 7-9)
      grid[7][7] = '#f43f5e'; grid[7][8] = '#f43f5e'; // 鼻
      grid[8][6] = '#ffffff'; grid[8][7] = '#0f172a'; grid[8][8] = '#0f172a'; grid[8][9] = '#ffffff'; // :3 吻部
      grid[9][7] = '#fca5a5'; grid[9][8] = '#fca5a5'; // 小舌頭

      // 魔導法袍與鈴鐺項圈 (Rows 11-15)
      for (var ry = 11; ry <= 15; ry++) {
        for (var rx = 3; rx <= 12; rx++) {
          grid[ry][rx] = armorColor;
        }
      }
      grid[11][7] = gold; grid[11][8] = gold; // 金色大鈴鐺
      grid[12][7] = '#ef4444'; grid[12][8] = '#ef4444';

    } else if (form === 'dog') {
      // 🐶 柴犬神將 (Dog Paladin / Shiba Warrior)
      var fur = DOG_FUR_PALETTE[Math.floor(rand() * DOG_FUR_PALETTE.length)];
      var snoutWhite = '#ffffff';

      // 尖尖直挺柴犬耳 (Rows 1-4)
      grid[1][4] = fur; grid[1][11] = fur;
      grid[2][3] = fur; grid[2][4] = '#fca5a5'; grid[2][5] = fur;
      grid[2][10] = fur; grid[2][11] = '#fca5a5'; grid[2][12] = fur;
      grid[3][3] = fur; grid[3][4] = fur; grid[3][11] = fur; grid[3][12] = fur;

      // 狗狗臉龐 (Rows 3-10)
      for (var dy = 3; dy <= 10; dy++) {
        for (var dx = 3; dx <= 12; dx++) {
          grid[dy][dx] = fur;
        }
      }

      // 柴犬經典白眉點 (Row 4)
      grid[4][5] = snoutWhite; grid[4][10] = snoutWhite;

      // 忠誠有神黑眼珠 (Row 6)
      grid[6][5] = '#1e293b'; grid[6][6] = '#ffffff';
      grid[6][9] = '#ffffff'; grid[6][10] = '#1e293b';

      // 柴犬白臉頰與口鼻部 (Rows 7-9)
      for (var sy = 7; sy <= 9; sy++) {
        for (var sx = 5; sx <= 10; sx++) {
          grid[sy][sx] = snoutWhite;
        }
      }
      grid[7][7] = '#0f172a'; grid[7][8] = '#0f172a'; // 濕漉黑鼻子
      grid[8][7] = '#f43f5e'; grid[8][8] = '#f43f5e'; // 憨厚吐舌頭
      grid[9][7] = '#f43f5e'; grid[9][8] = '#f43f5e';

      // 聖騎士重鎧與金屬圍巾 (Rows 11-15)
      for (var ay = 11; ay <= 15; ay++) {
        for (var ax = 3; ax <= 12; ax++) {
          grid[ay][ax] = armorColor;
        }
      }
      grid[11][6] = '#dc2626'; grid[11][7] = gold; grid[11][8] = gold; grid[11][9] = '#dc2626'; // 紅圍巾與聖光勳章
    }

    // 將 16x16 矩陣組合成 SVG 矩形元素
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

  // 匯出至全域
  window.ValhallaPixelEngine = {
    render: createPixelAvatarSvg,
    forms: [
      { id: 'male', label_zh: '⚔️ 雄性英靈', label_en: '⚔️ Male Hero', label_ja: '⚔️ 勇者（男）' },
      { id: 'female', label_zh: '🛡️ 雌性女武神', label_en: '🛡️ Valkyrie', label_ja: '🛡️ 戦乙女（女）' },
      { id: 'cat', label_zh: '🐱 貓咪軍團', label_en: '🐱 Cat Legion', label_ja: '🐱 猫魔導士' },
      { id: 'dog', label_zh: '🐶 柴犬神將', label_en: '🐶 Shiba Paladin', label_ja: '🐶 柴犬聖騎士' }
    ]
  };

})(window);
