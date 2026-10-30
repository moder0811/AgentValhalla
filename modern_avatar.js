/**
 * ============================================================================
 * 👑 ModernPixelEngine.js - 現代 64x64 高解析次像素藝術與動態呼吸紙娃娃引擎
 * ============================================================================
 * 
 * 📌 功能意圖與核心原理 (Intent & Core Principles):
 * 本模組專門解決「傳統 32x32 幾何方塊如樂高積木 (LEGO)」之視覺痛點，
 * 參照近十年 (2016-2026) 獨立遊戲與像素藝術黃金期之性感天花板代表作：
 * 1. 👑《褻瀆神明》(Blasphemous) - 痛苦聖母 (神聖色氣、金冠披紗、肌肉輪廓)
 * 2. 🍸《VA-11 HALL-A》- 調酒師吉兒 (都市賽博、黑馬甲、雙馬尾、知性慵懶)
 * 3. 🤖《SIGNALIS》(訊號) - 仿生人 Elster (冷冽生化緊身衣、高挑軍裝、禁欲系)
 * 4. 🔪《東方月神夜》- 十六夜咲夜 (英倫女僕、微動裙襬、黑絲絕對領域)
 * 5. 💋《復活邪神 Re:Universe》- 搖曳性感妖姬 (極致沙漏輪廓、H-CUP、高衩絲綢)
 * 
 * 📐 現代像素渲染技術 (HD-2D Rendering Specs):
 * - 64x64 高解析畫布（相較 16x16 / 32x32 精度提升 4~16 倍）。
 * - LPC 6-Tone 漸層色階（外框、深陰影、次陰影、基準色、高光、鏡面反射），實現次像素抗鋸齒 (Sub-pixel Anti-Aliasing)。
 * - 4 幀次像素呼吸待機動畫 (Sub-pixel Breathing Idle Animation)：胸部起伏 1px、髮絲飄逸、神聖光環脈衝。
 * - 雙模輸出：純原生 HTML5 Canvas 60 FPS 動態渲染 ＋ 純 SVG 向量靜態導出（100% 離線運行、相容 GitHub Pages）。
 * ============================================================================
 */

(function (window) {
  'use strict';

  // ==========================================================================
  // 【一】LPC 6 階細膩漸層調色盤矩陣 (Anti-Aliasing Palettes)
  // ==========================================================================
  const PALETTES = {
    // 溫潤膚色 (外框, 深影, 陰影, 基準, 高光, 鏡面)
    skin: {
      porcelain: ['#2a1722', '#99423c', '#e4a47c', '#edc5a8', '#faece7', '#ffffff'], // 象牙瓷白 (ひかる款)
      peach:     ['#2a1722', '#95381c', '#ae6b3f', '#d38b59', '#edc5a8', '#f9d5ba'], // 蜜桃紅潤
      tan:       ['#271920', '#6a1d16', '#965b38', '#c07a4b', '#e4a47c', '#edc5a8'], // 小麥自然
      bronze:    ['#1a1213', '#3e111a', '#603429', '#7f4c31', '#ae6b3f', '#d38b59'], // 古銅健美
      succubus:  ['#181020', '#4a254b', '#6b3d6c', '#8e5990', '#b57fb7', '#e2bae4']  // 魅魔暗紫
    },
    // 髮色基底
    hair: {
      raven:    ['#000000', '#0f1218', '#1b192b', '#29253a', '#343043', '#484152'], // 曜石墨黑 (吉兒/仿生人)
      blonde:   ['#442725', '#794117', '#a16018', '#d19428', '#f3c35f', '#fdd082'], // 傳奇黃金
      silver:   ['#1e293b', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#f8fafc'], // 銀白純淨 (咲夜)
      crimson:  ['#2a0a0a', '#5c1010', '#8b1818', '#b91c1c', '#ef4444', '#fca5a5'], // 緋紅烈焰 (邪神妖姬)
      pink:     ['#381128', '#631d45', '#9d326f', '#db499b', '#f472b6', '#fbcfe8'], // 櫻粉霓虹
      cyberblue:['#0a192f', '#0f3460', '#165b99', '#1e88e5', '#42a5f5', '#90caf9']  // 賽博冰藍
    },
    // 主題特化配色
    theme: {
      gold:     ['#452b00', '#8c5900', '#c78400', '#f5b000', '#ffd24d', '#fff2b3'], // 褻瀆神聖金
      velvet:   ['#09090b', '#18181b', '#27272a', '#3f3f46', '#52525b', '#71717a'], // 暗夜絲絨
      cyberred: ['#3b0707', '#750f0f', '#b31717', '#ef233c', '#ff5964', '#ff9999'], // 訊號警示紅
      maidblue: ['#081c3b', '#10376d', '#1d549f', '#2b75d6', '#5b9cf6', '#a1c7fb']  // 月神女僕藍
    }
  };

  // ==========================================================================
  // 【二】五大殿堂級現代像素性感女神預設 (Legendary Presets)
  // ==========================================================================
  const PRESETS = [
    {
      id: 'blasphemous',
      name: '👑 痛苦聖母 (Blasphemous)',
      subName: '暗黑苦修 · 神聖色氣',
      skin: 'porcelain',
      hair: 'raven',
      hairStyle: 'long',
      bustSize: 'H',
      outfit: 'blasphemous',
      accessory: 'halo',
      desc: '源自《褻瀆神明》！黑金荊棘神聖光環、半透明深色面紗、深 V 緊身馬甲與神聖淚痕。'
    },
    {
      id: 'va11halla',
      name: '🍸 賽博調酒師吉兒 (VA-11 HALL-A)',
      subName: '都市賽博 · 慵懶知性',
      skin: 'porcelain',
      hair: 'raven',
      hairStyle: 'twin_tails',
      bustSize: 'D',
      outfit: 'va11halla',
      accessory: 'shaker',
      desc: '源自《賽博朋克酒保行動》！經典死魚眼、微動雙馬尾、貼身黑馬甲白襯衫與紅領帶。'
    },
    {
      id: 'signalis',
      name: '🤖 仿生人 Elster (SIGNALIS)',
      subName: '冷冽生化 · 禁欲系緊身衣',
      skin: 'porcelain',
      hair: 'raven',
      hairStyle: 'bob',
      bustSize: 'B',
      outfit: 'signalis',
      accessory: 'cyber_lens',
      desc: '源自《訊號》！啞光黑漆皮生化緊身衣、單側發光義眼、高挑軍裝關節線條與末日美學。'
    },
    {
      id: 'sakuya',
      name: '🔪 十六夜咲夜 (Touhou Luna Nights)',
      subName: '英倫女僕 · 絕對領域',
      skin: 'porcelain',
      hair: 'silver',
      hairStyle: 'braids',
      bustSize: 'D',
      outfit: 'sakuya',
      accessory: 'daggers',
      desc: '源自《東方月神夜》！精緻女僕褶邊髮箍、微動圍裙、黑絲長襪與瀟灑時停飛刀。'
    },
    {
      id: 'saga',
      name: '💋 搖曳性感妖姬 (SaGa Re:Universe)',
      subName: '現代像素肉感天花板 · 骨骼呼吸',
      skin: 'peach',
      hair: 'crimson',
      hairStyle: 'princess_curls',
      bustSize: 'H',
      outfit: 'saga',
      accessory: 'ribbons',
      desc: '源自《復活邪神》！呼之欲出的極致沙漏身材 (H-CUP)、高衩飄逸絲綢與柔軟呼吸起伏。'
    }
  ];

  // ==========================================================================
  // 【三】64x64 次像素微雕幾何點陣繪製核心 (64x64 Raster Pipeline)
  // ==========================================================================

  /**
   * 繪製 64x64 現代像素矩陣
   * @param {Object} opts 換裝配置
   * @param {number} frame 呼吸幀 (0: 靜態/吸氣初, 1: 吸氣頂點, 2: 吐氣, 3: 靜態收斂)
   * @returns {Array<Array<string|null>>} 64x64 顏色網格
   */
  function build64PixelGrid(opts, frame) {
    const f = frame % 4;
    // 呼吸律動位移 (次像素微動態：胸部/肩膀在吸氣頂點 Frame 1~2 上浮 1px)
    const breathY = (f === 1 || f === 2) ? -1 : 0;
    const swayX = (f === 1) ? 1 : ((f === 3) ? -1 : 0);

    const g = Array(64).fill(null).map(() => Array(64).fill(null));

    // 輔助填色函式
    function setPixel(x, y, color) {
      if (x >= 0 && x < 64 && y >= 0 && y < 64 && color) {
        g[y][x] = color;
      }
    }

    function fillRect(x1, y1, x2, y2, color) {
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
          setPixel(x, y, color);
        }
      }
    }

    // 取得當前色階
    const skinKey = opts.skin || 'porcelain';
    const s = PALETTES.skin[skinKey] || PALETTES.skin.porcelain;

    const hairKey = opts.hair || 'raven';
    const h = PALETTES.hair[hairKey] || PALETTES.hair.raven;

    const presetId = opts.presetId || 'saga';

    // ------------------------------------------------------------------------
    // 圖層 0: 背後神聖光環 / 賽博光斑 (Layer 0: Halo / Background Glow)
    // ------------------------------------------------------------------------
    if (opts.accessory === 'halo' || presetId === 'blasphemous') {
      const gold = PALETTES.theme.gold;
      // 痛苦聖母金色荊棘光環 (外徑 18px 環形圓)
      for (let angle = 0; angle < 360; angle += 15) {
        const rad = (angle * Math.PI) / 180;
        const hx = Math.round(32 + Math.cos(rad) * 16);
        const hy = Math.round(20 + Math.sin(rad) * 16 + breathY);
        setPixel(hx, hy, gold[3]);
        if (angle % 30 === 0) {
          // 荊棘芒刺外伸 2px
          setPixel(Math.round(32 + Math.cos(rad) * 18), Math.round(20 + Math.sin(rad) * 18 + breathY), gold[4]);
        }
      }
    }

    if (opts.accessory === 'daggers' || presetId === 'sakuya') {
      // 咲夜漂浮飛刀 (左右各兩把銀光飛刀)
      const sil = PALETTES.hair.silver;
      fillRect(14, 24 + breathY, 15, 29 + breathY, sil[4]);
      setPixel(14, 23 + breathY, '#ffffff'); // 刀尖寒芒
      fillRect(49, 24 + breathY, 50, 29 + breathY, sil[4]);
      setPixel(50, 23 + breathY, '#ffffff');
    }

    // ------------------------------------------------------------------------
    // 圖層 1: 後側長髮 (Layer 1: Background Hair)
    // ------------------------------------------------------------------------
    if (opts.hairStyle === 'long' || opts.hairStyle === 'princess_curls' || presetId === 'saga' || presetId === 'blasphemous') {
      // 及腰豐滿飄逸長髮 (垂落至腰際，隨呼吸輕微擺動)
      fillRect(23 + swayX, 16, 41 + swayX, 48, h[1]); // 深色陰影底層
      fillRect(25 + swayX, 18, 39 + swayX, 50, h[2]); // 中階絲綢陰影
      fillRect(21 + swayX, 28, 24 + swayX, 46, h[3]); // 左側飄逸大波浪
      fillRect(40 + swayX, 28, 43 + swayX, 46, h[3]); // 右側飄逸大波浪
    } else if (opts.hairStyle === 'twin_tails' || presetId === 'va11halla') {
      // 吉兒專屬長雙馬尾 (垂落兩側胸前，帶微動擺幅)
      fillRect(17 + swayX, 22, 22 + swayX, 48, h[1]); // 左馬尾
      fillRect(18 + swayX, 24, 21 + swayX, 46, h[3]); // 左馬尾高光
      fillRect(42 - swayX, 22, 47 - swayX, 48, h[1]); // 右馬尾
      fillRect(43 - swayX, 24, 46 - swayX, 46, h[3]); // 右馬尾高光
      // 暗紅髮帶
      fillRect(20, 20, 22, 21, '#991b1b');
      fillRect(42, 20, 44, 21, '#991b1b');
    }

    // ------------------------------------------------------------------------
    // 圖層 2: 腿部與下半身輪廓 (Layer 2: Legs & Absolute Territory)
    // ------------------------------------------------------------------------
    // 大腿基底 (細長微肉感比例 X: 26~37, Y: 46~60)
    fillRect(27, 46, 31, 58, s[3]); // 左腿肉色
    fillRect(33, 46, 37, 58, s[3]); // 右腿肉色
    fillRect(26, 47, 26, 57, s[1]); // 左外側次像素陰影
    fillRect(38, 47, 38, 57, s[1]); // 右外側次像素陰影

    if (opts.outfit === 'sakuya' || opts.outfit === 'va11halla' || presetId === 'sakuya' || presetId === 'va11halla') {
      // 🖤 黑色透肉絲襪與【絕對領域】(Absolute Territory)
      // Y: 46~49 裸露白皙大腿肉，Y: 50~58 黑色絲襪透肉漸層
      fillRect(27, 50, 31, 58, '#1e1b2e'); // 絲襪暗部
      fillRect(28, 50, 30, 56, '#312e45'); // 絲襪中間微透光感
      fillRect(33, 50, 37, 58, '#1e1b2e');
      fillRect(34, 50, 36, 56, '#312e45');
      // 蕾絲吊帶襪滾邊 (Garter Band)
      fillRect(27, 49, 31, 50, '#0f0e17');
      fillRect(33, 49, 37, 50, '#0f0e17');
    } else if (opts.outfit === 'signalis' || presetId === 'signalis') {
      // 🤖 仿生人漆皮金屬緊身腿甲
      fillRect(27, 46, 31, 59, '#18181b');
      fillRect(28, 47, 29, 56, '#3f3f46'); // 啞光高光
      fillRect(33, 46, 37, 59, '#18181b');
      fillRect(34, 47, 35, 56, '#3f3f46');
      setPixel(29, 52, '#ef4444'); // 膝蓋賽博紅色警示燈
      setPixel(35, 52, '#ef4444');
    }

    // 腳踝與高跟鞋 / 騎士靴 (Y: 58~62)
    fillRect(26, 58, 31, 62, '#0f172a');
    fillRect(33, 58, 38, 62, '#0f172a');
    setPixel(27, 62, '#38bdf8'); // 鞋跟反光

    // ------------------------------------------------------------------------
    // 圖層 3: 軀幹、腰臀與【H CUP 肉感呼吸】(Layer 3: Torso, H-CUP Bust & Waist)
    // ------------------------------------------------------------------------
    const by = breathY; // 吸氣上升
    // 柔美肩頸 (Y: 25~28)
    fillRect(30, 24 + by, 34, 27 + by, s[3]); // 纖細頸部
    setPixel(29, 25 + by, s[1]); setPixel(35, 25 + by, s[1]); // 頸項兩側陰影
    fillRect(24, 28 + by, 40, 29 + by, s[3]); // 圓潤鎖骨平臺
    setPixel(32, 28 + by, s[1]); // 鎖骨中心小窩 (Suprasternal notch)

    // 纖細小蠻腰 (Y: 38~46, 寬度收攏在 26~38，呈現完美沙漏腰身)
    fillRect(26, 38 + by, 38, 45, s[3]);
    fillRect(25, 40, 26, 46, s[1]); // 左腰身柔和陰影
    fillRect(38, 40, 39, 46, s[1]); // 右腰身柔和陰影

    // 🔥 豐滿胸部微雕 (Bust Volume & Cleavage)
    const isHCup = opts.bustSize === 'H' || presetId === 'saga' || presetId === 'blasphemous';
    if (isHCup) {
      // 究極 H CUP 震撼輪廓 (X: 23~41, Y: 30~38 + by)
      fillRect(24, 30 + by, 31, 37 + by, s[3]); // 左胸豐滿半球
      fillRect(33, 30 + by, 40, 37 + by, s[3]); // 右胸豐滿半球
      // 乳溝深邃陰影線 (Deep Cleavage)
      fillRect(31, 31 + by, 33, 37 + by, s[1]);
      setPixel(32, 33 + by, s[0]); // 深度暗角
      // 胸部下緣托胸支撐弧線 (Underbust Shadow)
      fillRect(24, 37 + by, 31, 38 + by, s[1]);
      fillRect(33, 37 + by, 40, 38 + by, s[1]);
      // 飽滿鏡面高光 (Specular Highlight)
      setPixel(27, 32 + by, s[5]);
      setPixel(37, 32 + by, s[5]);
    } else {
      // B~D CUP 標準勻稱曲線
      fillRect(26, 31 + by, 38, 36 + by, s[3]);
      fillRect(31, 32 + by, 33, 35 + by, s[1]); // 柔和微溝
      fillRect(26, 36 + by, 38, 37 + by, s[1]); // 下緣微陰影
      setPixel(28, 33 + by, s[4]); setPixel(36, 33 + by, s[4]);
    }

    // ------------------------------------------------------------------------
    // 圖層 4: 現代性感戰袍與制服裝備 (Layer 4: Iconic Costumes)
    // ------------------------------------------------------------------------
    if (opts.outfit === 'blasphemous' || presetId === 'blasphemous') {
      // 👑《褻瀆神明》痛苦聖母：黑色絲絨緊身胸衣 ＋ 金箔飾邊 ＋ 高衩長袍
      const gold = PALETTES.theme.gold;
      const v = PALETTES.theme.velvet;
      // 緊身刺繡馬甲
      fillRect(25, 33 + by, 39, 44, v[1]);
      // 深 V 露出白皙胸口
      fillRect(29, 31 + by, 35, 34 + by, s[3]);
      fillRect(31, 33 + by, 33, 36 + by, s[1]);
      // 馬甲金箔滾邊與十字金線
      fillRect(25, 33 + by, 26, 44, gold[3]);
      fillRect(38, 33 + by, 39, 44, gold[3]);
      fillRect(28, 38 + by, 36, 39 + by, gold[4]); // 金腰封
      // 高衩下擺飄紗 (露出左腿絕對領域)
      fillRect(32, 44, 40, 56, v[2]);
    } else if (opts.outfit === 'va11halla' || presetId === 'va11halla') {
      // 🍸《VA-11 HALL-A》吉兒：白襯衫 ＋ 酒保合身黑馬甲 ＋ 領帶
      fillRect(25, 30 + by, 39, 36 + by, '#f8fafc'); // 白襯衫
      fillRect(26, 34 + by, 38, 44, '#0f172a'); // 合身黑馬甲
      // 微開領口與暗紅領帶
      fillRect(31, 30 + by, 33, 32 + by, s[3]);
      fillRect(31, 32 + by, 33, 38 + by, '#dc2626'); // 飄逸紅領帶
      fillRect(25, 33 + by, 28, 43, '#1e293b'); // 馬甲左前襟
      fillRect(36, 33 + by, 39, 43, '#1e293b'); // 馬甲右前襟
    } else if (opts.outfit === 'signalis' || presetId === 'signalis') {
      // 🤖《SIGNALIS》仿生人：啞光漆皮生化緊身衣
      fillRect(25, 29 + by, 39, 46, '#18181b'); // 黑色主軀幹
      fillRect(28, 31 + by, 36, 43, '#27272a'); // 胸前啞光反光板
      fillRect(30, 33 + by, 34, 34 + by, '#ffffff'); // 白色胸前代號標記
      fillRect(24, 28 + by, 25, 36 + by, '#ef4444'); // 左肩生化紅色線條
      fillRect(39, 28 + by, 40, 36 + by, '#ef4444');
    } else if (opts.outfit === 'sakuya' || presetId === 'sakuya') {
      // 🔪《東方月神夜》咲夜：皇家藍女僕洋裝 ＋ 白色荷葉邊圍裙
      const blue = PALETTES.theme.maidblue;
      fillRect(25, 30 + by, 39, 45, blue[2]); // 洋裝主體
      fillRect(28, 31 + by, 36, 44, '#ffffff'); // 白色前圍裙 (Apron)
      fillRect(27, 36 + by, 37, 37 + by, '#cbd5e1'); // 圍裙荷葉摺痕
      fillRect(24, 44, 40, 48, blue[1]); // 膨膨女僕短裙褶襬
      fillRect(26, 45, 38, 47, '#ffffff'); // 裙底白色襯裙露出
    } else {
      // 💋《復活邪神》極致肉感妖姬：絳紅金箔微透絲綢掛脖背心 ＋ 高衩長裙
      const crim = PALETTES.hair.crimson;
      const gold = PALETTES.theme.gold;
      // 掛脖深 V 絲綢 (露出大片鎖骨與豐滿側乳)
      fillRect(24, 32 + by, 30, 37 + by, crim[3]);
      fillRect(34, 32 + by, 40, 37 + by, crim[3]);
      fillRect(30, 37 + by, 34, 43, crim[2]); // 纖細腹部覆蓋
      // 金箔腰帶與高衩開叉
      fillRect(25, 42, 39, 43, gold[3]);
      fillRect(33, 44, 41, 57, crim[2]); // 飄逸裙紗覆蓋右腿，大膽露出左大腿
      setPixel(28, 49, s[5]); // 左大腿肌肉光澤
    }

    // ------------------------------------------------------------------------
    // 圖層 5: 面容神韻、五官與淚痣 (Layer 5: Face, Eyes & Expression)
    // ------------------------------------------------------------------------
    // 白皙瓜子臉基底 (Y: 10~25, X: 24~40)
    fillRect(25, 12, 39, 21, s[3]);
    fillRect(26, 21, 38, 23, s[3]);
    fillRect(28, 24, 36, 25, s[3]); // 俏麗下巴
    setPixel(32, 26, s[3]); // 尖下巴端點
    // 臉頰兩側自然陰影 (Contour)
    fillRect(24, 13, 24, 20, s[1]);
    fillRect(40, 13, 40, 20, s[1]);

    // 靈動迷人眼眸 (Eyes)
    if (presetId === 'va11halla') {
      // 吉兒專屬半開慵懶死魚眼 (Half-lidded cynical cool)
      fillRect(27, 16, 30, 16, '#0f172a'); // 略帶下垂的上眼瞼
      setPixel(28, 17, '#64748b'); setPixel(29, 17, '#94a3b8'); // 灰藍色淡漠瞳孔
      fillRect(34, 16, 37, 16, '#0f172a');
      setPixel(35, 17, '#64748b'); setPixel(36, 17, '#94a3b8');
    } else if (presetId === 'signalis') {
      // 仿生人冷峻凝視 ＋ 單邊發光賽博紅眼
      fillRect(27, 16, 30, 16, '#0f172a');
      setPixel(28, 17, '#38bdf8'); // 冰藍瞳
      fillRect(34, 16, 37, 16, '#0f172a');
      setPixel(35, 17, '#ef4444'); setPixel(36, 17, '#ff8888'); // 紅色義眼發光
    } else {
      // 嫵媚深情大眼 (ひかる / 聖母 / 咲夜)
      fillRect(27, 15, 30, 15, '#0f172a'); // 濃密長睫毛
      fillRect(27, 16, 30, 17, '#3b82f6'); // 寶石藍/紫瞳
      setPixel(28, 16, '#ffffff'); // 靈魂眼神光 (Catchlight)
      fillRect(34, 15, 37, 15, '#0f172a');
      fillRect(34, 16, 37, 17, '#3b82f6');
      setPixel(35, 16, '#ffffff');
    }

    // 少女粉嫩腮紅與小巧櫻唇
    fillRect(25, 19, 27, 19, '#f43f5e'); // 左臉頰粉紅
    fillRect(37, 19, 39, 19, '#f43f5e'); // 右臉頰粉紅
    fillRect(31, 22, 33, 22, '#be185d'); // 櫻桃微張紅唇
    setPixel(32, 21, s[4]); // 唇珠微光

    // 💋 專屬嫵媚淚痣 (Beauty Mark under left eye - ひかる魂)
    setPixel(29, 19, '#1e1b2e');

    // ------------------------------------------------------------------------
    // 圖層 6: 前側精緻瀏海與髮飾 (Layer 6: Foreground Bangs & Headwear)
    // ------------------------------------------------------------------------
    if (opts.outfit === 'sakuya' || presetId === 'sakuya') {
      // 咲夜白色女僕褶邊髮箍 (Katyusha)
      fillRect(23, 9, 41, 11, '#ffffff');
      fillRect(22, 10, 23, 13, '#94a3b8');
      fillRect(41, 10, 42, 13, '#94a3b8');
      // 雙側優雅小辮子
      fillRect(23, 14, 25, 26, h[3]);
      fillRect(39, 14, 41, 26, h[3]);
      setPixel(24, 26, '#10b981'); setPixel(40, 26, '#10b981'); // 綠色小髮帶
    }

    if (opts.outfit === 'blasphemous' || presetId === 'blasphemous') {
      // 痛苦聖母黑絲滑落頭紗
      fillRect(22, 9, 42, 12, '#18181b');
      fillRect(21, 12, 23, 22, '#27272a');
      fillRect(41, 12, 43, 22, '#27272a');
      setPixel(29, 20, '#d97706'); // 金色神聖淚痕
    }

    // 柔順秀美瀏海 (齊瀏海、空氣瀏海與高光髮圈)
    fillRect(25, 10, 39, 13, h[3]);
    fillRect(26, 12, 38, 14, h[2]);
    // 髮絲光澤 (Angel Ring Specular Shine)
    fillRect(27, 11, 31, 11, h[5]);
    fillRect(33, 11, 37, 11, h[5]);

    // 鬢角柔美修容垂髮
    fillRect(23, 14, 24, 24, h[2]);
    fillRect(40, 14, 41, 24, h[2]);

    return g;
  }

  // ==========================================================================
  // 【四】雙引擎匯出：純 Canvas 60FPS 呼吸動態 ＋ 純 SVG 向量靜態
  // ==========================================================================

  const ModernPixelEngine = {
    presets: PRESETS,
    palettes: PALETTES,

    /**
     * 渲染單一幀至 HTML5 Canvas
     */
    renderCanvas: function (canvas, options, frame = 0) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const grid = build64PixelGrid(options || {}, frame);
      const cw = canvas.width;
      const ch = canvas.height;
      const pixelSize = cw / 64;

      ctx.clearRect(0, 0, cw, ch);
      ctx.imageSmoothingEnabled = false;

      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 64; x++) {
          const c = grid[y][x];
          if (c) {
            ctx.fillStyle = c;
            ctx.fillRect(Math.floor(x * pixelSize), Math.floor(y * pixelSize), Math.ceil(pixelSize), Math.ceil(pixelSize));
          }
        }
      }
    },

    /**
     * 啟動 4 幀次像素呼吸循環動畫 (每 350ms 推進一幀，形成 1.4s 呼吸律動)
     */
    startBreathingAnimation: function (canvas, options) {
      if (!canvas) return null;
      let frame = 0;
      this.renderCanvas(canvas, options, frame);

      const timerId = setInterval(() => {
        frame = (frame + 1) % 4;
        this.renderCanvas(canvas, options, frame);
      }, 350);

      return {
        stop: () => clearInterval(timerId),
        setOptions: (newOpts) => {
          options = newOpts;
          this.renderCanvas(canvas, options, frame);
        }
      };
    },

    /**
     * 產生單幀高精度 64x64 SVG 字串 (供卡牌與無 Canvas 環境使用)
     */
    renderSvg: function (options, frame = 0) {
      const grid = build64PixelGrid(options || {}, frame);
      const rects = [];

      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 64; x++) {
          if (grid[y][x]) {
            rects.push('<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + grid[y][x] + '" />');
          }
        }
      }

      return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%" shape-rendering="crispEdges" class="modern-pixel-svg">' +
        rects.join('') +
        '</svg>'
      );
    }
  };

  // 全域導出
  window.ModernPixelEngine = ModernPixelEngine;

})(typeof window !== 'undefined' ? window : this);
