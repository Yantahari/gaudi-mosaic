// =====================================================
// GAUDÍ MOSAIC — 日本語翻訳
// =====================================================

export default {
  meta: { lang: 'ja', name: '日本語', flag: '🇯🇵' },

  // ---- スプラッシュ画面 ----
  splash: {
    title: 'Gaudí Mosaic',
    subtitle: 'トレンカディス・クリエイター',
    enter: '制作をはじめる',
    year: '1926 — 2026 · アントニ・ガウディ没後100年'
  },

  // ---- ヘッダー ----
  header: {
    brand: 'Gaudí',
    brandAccent: 'Mosaic',
    brandTitle: 'ダブルクリックでサプライズ',
    edu: '🏛 ガウディ',
    eduTitle: 'ガウディについて (?)',
    eduAria: '教育コンテンツとガイド',
    load: '↑ 読み込み',
    loadTitle: 'プロジェクトを読み込む (Ctrl+O)',
    save: '↓ 保存',
    saveTitle: 'プロジェクトを保存 (Ctrl+S)',
    clear: 'クリア',
    clearTitle: 'キャンバスをクリア',
    undo: '↩ 元に戻す',
    undoTitle: '元に戻す (Ctrl+Z)',
    export: 'エクスポート',
    exportTitle: 'PNGエクスポート (Ctrl+E)'
  },

  // ---- パネル ----
  panels: {
    ceramics: 'タイル',
    layers: 'レイヤー',
    templates: 'テンプレート',

    ceramicsTitle: 'タイル',
    ceramicsSubtitle: 'タイルを選んで割って破片を作ろう',
    finishLabel: '仕上げ',

    layersTitle: 'レイヤー',
    layersSubtitle: 'レイヤーでモザイクを整理',
    addLayer: '+ 新しいレイヤー',
    hideLayer: 'レイヤーを非表示',
    showLayer: 'レイヤーを表示',
    deleteLayer: 'レイヤーを削除',
    layerCreated: '新しいレイヤーを作成しました',
    layerDeleted: 'レイヤーを削除しました',

    templatesTitle: 'テンプレート',
    templatesSubtitle: 'ガウディの作品にインスピレーションを得たガイド',
    noTemplate: 'テンプレートなし',
    opacityLabel: '不透明度',
    sizeLabel: 'サイズ',
    templateActive: 'テンプレート: {name}',

    loadingTiles: 'タイルを読み込み中…',
    noTiles: 'この仕上げのタイルはありません'
  },

  // ---- 仕上げの種類 ----
  finishes: {
    glazed: '釉薬',
    matte: 'マット',
    iridescent: '玉虫色',
    rustic: 'ラスティック'
  },

  // ---- 破砕ゾーン ----
  breakzone: {
    title: 'タイルを割る',
    subtitle: '本物のトレンカディスのように、偶然が割れ方を決めます',
    algorithmLabel: 'アルゴリズム',
    granularityLabel: '粒度',
    granularityFine: '細かい',
    granularityMedium: '中',
    granularityCoarse: '粗い',
    crack: '⚡ 割る',
    useFragments: '✓ 破片を使う',
    cancel: 'キャンセル',
    fragmentsCreated: '{count}個の破片ができました！',
    fragmentsAdded: '破片がトレイに追加されました。キャンバスにドラッグしてください！'
  },

  // ---- 破砕アルゴリズム ----
  fractures: {
    voronoi: 'ボロノイ',
    radial: 'ラジアル',
    organic: 'オーガニック'
  },

  // ---- ツールバー ----
  tools: {
    label: 'ツール',
    move: '移動',
    moveTitle: '移動 (V)',
    rotate: '回転',
    rotateTitle: '回転 (R)',
    scale: '拡大縮小',
    scaleTitle: '拡大縮小 (S)',
    pan: 'パン',
    panTitle: 'パン (スペース)',
    duplicate: '複製',
    duplicateTitle: '複製 (Ctrl+D)',
    delete: '削除',
    deleteTitle: '削除 (Del)',
    resetZoom: 'ズームリセット',
    resetZoomTitle: 'ズームリセット (Ctrl+0)'
  },

  // ---- 目地 ----
  grout: {
    label: '目地',
    toggle: '目地を有効にする',
    color: '目地の色',
    width: '目地の幅',
    activate: '有効にする'
  },

  // ---- 背景 ----
  backgrounds: {
    label: '背景',
    dark: 'ダーク',
    light: 'ライト',
    blue: '地中海ブルー',
    stone: '石',
    cement: 'セメント',
    canvasBackground: 'キャンバスの背景'
  },

  // ---- キャンバス ----
  canvas: {
    hint: '左のパネルからタイルを選んでください',
    hintBold: '割って',
    hintSuffix: '破片をここにドラッグしてください',
    trayLabel: '破片'
  },

  // ---- モバイルナビ ----
  mobile: {
    ceramics: 'タイル',
    canvas: 'キャンバス',
    layers: 'レイヤー',
    templates: 'テンプレート',
    tools: 'ツール',
    actions: 'アクション',
    resetZoom: 'ズームリセット'
  },

  // ---- 通知 ----
  notify: {
    fragmentDeleted: '破片を削除しました',
    gridOn: 'グリッドを表示',
    gridOff: 'グリッドを非表示',
    zoomReset: 'ズームをリセットしました',
    selectFragment: '破片をクリックして選択し、矢印キーで移動できます',
    projectSaved: 'プロジェクト「{name}」を保存しました',
    projectLoaded: 'プロジェクト「{name}」を読み込みました',
    projectDeleted: 'プロジェクト「{name}」を削除しました',
    noProjects: '保存されたプロジェクトはありません',
    projectNotFound: 'プロジェクトが見つかりません',
    saveError: 'プロジェクトの保存中にエラーが発生しました',
    loadError: 'プロジェクトの読み込み中にエラーが発生しました',
    storageFullError: 'エラー：ストレージがいっぱいです。古いプロジェクトを削除してください。',
    autoSaved: '自動保存しました',
    autoSaveName: '(自動保存)',
    exportEmpty: 'キャンバスが空です — エクスポートするにはピースを追加してください',
    exported: 'モザイクを高画質でエクスポートしました！',
    actionUndone: '操作を元に戻しました',
    fragmentDuplicated: '破片を複製しました',
    canvasCleared: 'キャンバスをクリアしました',
    langChanged: '言語を{name}に変更しました'
  },

  // ---- 共有 ----
  share: {
    title: 'Gaudí Mosaicで作ったモザイク',
    text: 'ガウディのトレンカディス技法でデジタルモザイクを作りました 🎨✨ #GaudíMosaic #Trencadís #Gaudí2026',
    shareBtn: '共有',
    downloadBtn: 'ダウンロード',
    shared: 'モザイクを共有しました！',
    shareFailed: '共有できませんでした',
    modalTitle: 'モザイクが完成しました！',
    modalText: '作品を共有するか、高画質でダウンロードできます。'
  },

  // ---- チュートリアル ----
  tutorial: {
    step1title: 'タイルを選ぶ',
    step1text: '左のパネルからタイルを選んでください',
    step2title: '割る',
    step2text: '「割る」を押して破片にしましょう',
    step3title: 'キャンバスにドラッグ',
    step3text: 'トレイから破片をキャンバスに移動します',
    step4title: 'モザイクを作る',
    step4text: 'ツールで移動・回転・拡大縮小できます',
    step5title: '作品をエクスポート',
    step5text: 'モザイクを保存または共有しましょう',
    next: '次へ',
    skip: 'わかった',
    repeat: 'チュートリアルを繰り返す'
  },

  // ---- ダイアログ ----
  dialogs: {
    projectName: 'プロジェクト名：',
    defaultProjectName: 'マイモザイク',
    overwrite: '「{name}」を上書きしますか？\n\nOK → 上書き\nキャンセル → 新しい名前で保存',
    newProjectName: '新しいプロジェクト名：',
    copyName: '{name}（コピー）',
    storageSizeWarning: 'プロジェクトのサイズは{size}MBです。ストレージには限りがあります。続けますか？',
    deleteProject: '「{name}」を削除しますか？',
    untitled: '無題',
    loadProject: 'プロジェクトを読み込む',
    close: '閉じる',
    loadBtn: '読み込む',
    deleteBtn: '削除',
    pieces: 'ピース'
  },

  // ---- テンプレート名（カタルーニャ語の固有名詞を維持） ----
  templateNames: {
    drac: 'エル・ドラク（竜）',
    salamandra: 'サラマンダー',
    banc: 'バンク・サルパンティ（蛇行ベンチ）',
    creu: 'ガウディの十字架',
    rosassa: 'バラ窓',
    sagradafamilia: 'サグラダ・ファミリア'
  },

  templateDescriptions: {
    drac: 'グエル公園の竜、バルセロナのシンボル',
    salamandra: 'グエル公園のモザイクのサラマンダー',
    banc: 'グエル公園の波打つベンチ',
    creu: '冠を戴いた四腕の十字架',
    rosassa: '植物模様のゴシック様式バラ窓',
    sagradafamilia: '未完の大聖堂のシルエット'
  },

  // ---- 教育モーダル ----
  education: {
    modalTitle: 'ガウディを知る',
    navGuide: '使い方ガイド',
    navBio: '伝記',
    navTrencadis: 'トレンカディス',
    navNature: '自然',
    navCuriosities: '豆知識',

    // 使い方ガイド
    guideTitle: 'Gaudí Mosaicの使い方',
    guideSubtitle: 'デジタル・トレンカディスを作るためのクイックガイド',
    guideSteps: [
      {
        title: '1. タイルを選ぶ',
        text: '左のパネルからカタログのタイルを選んでください。破砕の種類（ボロノイ、ラジアル、オーガニック）、破片のサイズ、タイルの種類を変更できます。',
        icon: '🎨'
      },
      {
        title: '2. 割る',
        text: '「割る」を押してタイルを破砕します。本物のトレンカディスのように、偶然が割れ方を決めます。アルゴリズムと粒度を変えるとさまざまな結果が得られます。',
        icon: '⚡'
      },
      {
        title: '3. 破片を使う',
        text: '「破片を使う」を押すと、画面下部の破片トレイに送られます。各破片をキャンバスにドラッグして配置してください。',
        icon: '✋'
      },
      {
        title: '4. モザイクを作る',
        text: '下部のツールバーのツールで破片を移動・回転・拡大縮小できます。テンプレートをガイドとして使ったり、レイヤーでピースを整理することもできます。',
        icon: '🧩'
      },
      {
        title: '5. エクスポートと保存',
        text: 'モザイクを高画質PNGとしてエクスポートするか、プロジェクトを保存して後で続けましょう。',
        icon: '💾'
      }
    ],
    shortcutsTitle: 'キーボードショートカット',
    shortcuts: [
      { key: 'V', action: '移動ツール' },
      { key: 'R', action: '回転ツール' },
      { key: 'S', action: '拡大縮小ツール' },
      { key: 'X', action: '削除ツール' },
      { key: 'スペース', action: 'キャンバスをパン（長押し）' },
      { key: 'G', action: 'グリッドの表示/非表示' },
      { key: '矢印キー', action: '破片を移動（Shift = ×10）' },
      { key: 'Del', action: '選択した破片を削除' },
      { key: 'Ctrl+D', action: '破片を複製' },
      { key: 'Ctrl+Z', action: '元に戻す' },
      { key: 'Ctrl+S', action: 'プロジェクトを保存' },
      { key: 'Ctrl+O', action: 'プロジェクトを読み込む' },
      { key: 'Ctrl+E', action: 'PNGエクスポート' },
      { key: '+/−', action: 'ズーム' },
      { key: 'Ctrl+0', action: 'ズームリセット' },
      { key: '?', action: 'このガイド' }
    ],

    // 伝記
    bioTitle: 'アントニ・ガウディ・イ・コルネット',
    bioSubtitle: '1852 — 1926',
    bioIntro: 'バルセロナを野外美術館に変えた先見の建築家。自然とカタルーニャの伝統に深く根ざしたその作品は、没後一世紀を経てもなお世界を魅了し続けています。',
    bioTimeline: [
      { year: 1852, title: '誕生', text: '6月25日、レウス（一説にはリウドムス）に生まれる。銅細工師の息子として幼少期から自然の形や職人技を観察して育った。', quote: null },
      { year: 1873, title: '建築学校', text: 'バルセロナ県立建築学校に入学。校長は「狂人に学位を与えたのか天才に与えたのかわからない」と語った。', quote: null },
      { year: 1878, title: '初期の作品', text: '建築家の資格を取得。生涯の大パトロンとなるエウゼビ・グエルと出会い、重要な依頼が始まる。', quote: null },
      { year: 1883, title: 'サグラダ・ファミリア', text: 'サグラダ・ファミリア贖罪聖堂の建設を引き継ぐ。彼の人生を定義するプロジェクトとなった。', quote: '私の依頼主は急いでいない。' },
      { year: 1886, title: 'グエル邸', text: 'ランブラス通り近くのグエル邸を建設。屋上にトレンカディスを初めて本格的に採用した大作。', quote: null },
      { year: 1900, title: 'グエル公園', text: 'グエル公園の建設を開始。大規模なトレンカディスの最高傑作となる庭園都市。蛇行ベンチと竜は世界的アイコンに。', quote: null },
      { year: 1904, title: 'カサ・バトリョ', text: 'グラシア通りのカサ・バトリョを改装。海と骨を思わせるファサードに、見事な玉虫色のトレンカディス。', quote: '物の色彩、それが生命である。' },
      { year: 1906, title: 'カサ・ミラ', text: '波打つファサードと彫刻的な屋上を持つラ・ペドレラを建設。サグラダ・ファミリアに専念する前の最後の民間建築。', quote: null },
      { year: 1910, title: '国際的評価', text: 'パリで作品展が開催。世界がその天才を認め始めるが、彼自身はますます社交界から遠ざかっていった。', quote: null },
      { year: 1914, title: '専念', text: 'サグラダ・ファミリアのみに専念するようになる。生活はますます質素になり、最終的には工事現場の工房に住み込んだ。', quote: null },
      { year: 1924, title: 'カタルーニャ語の擁護者', text: 'プリモ・デ・リベラ独裁政権下で警察官にカタルーニャ語で話したため逮捕される。「私はカタルーニャ人であり、カタルーニャ語を話す」と宣言。', quote: '私はカタルーニャ人であり、カタルーニャ語を話す。' },
      { year: 1926, title: '死去', text: '6月7日、路面電車にはねられる。質素な身なりのため誰にも気づかれなかった。3日後の6月10日に死去。バルセロナ中が悲しんだ。', quote: null }
    ],

    // トレンカディス
    trencadisTitle: 'トレンカディス',
    trencadisSubtitle: '割れた陶器のアート',
    trencadisSections: [
      { title: 'トレンカディスとは？', text: 'トレンカディスは、陶器やガラスなどの不規則な破片を使ってモザイクを作る装飾技法です。名前はカタルーニャ語の動詞「trencar（割る）」に由来します — 割ることで創造するアートです。', icon: '🔨' },
      { title: '起源', text: 'ガウディがモザイクを発明したわけではありませんが、革命を起こしました。陶器工場の不良品 — 欠陥品、割れたもの、廃棄されたもの — を崇高な芸術に変えたのです。時代に先駆けたアーティスティック・リサイクルです。', icon: '♻' },
      { title: '技法', text: 'プロセスは単純ですが、卓越した審美眼を要します。陶器やガラスのタイルをハンマーで割り、形と色で破片を選び、モルタルで表面に配置してデザインを形成します。', icon: '🎨' },
      { title: '哲学', text: 'ガウディにとってトレンカディスは比喩でした。破壊から創造が生まれる。割れた一つ一つの破片が調和ある全体の中に居場所を見つける。間違いはなく、可能性だけがある。', icon: '✨' },
      { title: 'どこで見られる？', text: 'グエル公園が最も有名ですが、トレンカディスはガウディ作品の至るところに見られます。グエル邸の屋上、カサ・バトリョのファサード、サグラダ・ファミリアの尖塔、コロニア・グエルの地下聖堂…', icon: '🏛' }
    ],

    // 自然
    natureTitle: 'ガウディと自然',
    natureSubtitle: 'バイオミミクリーという言葉が生まれる前の実践者',
    natureText: 'ガウディは最初のバイオミメティック建築家でした。エンジニアの目で自然を研究しました。骨の構造、花の幾何学、風に対する木の抵抗力。自然こそが偉大な書物であり、常に開かれていて、読む努力をしなければならない、と語っていました。',
    natureExamples: [
      { element: 'サグラダ・ファミリアの柱', inspiration: '天井に向かって枝分かれする木の幹のように、石の森のように重さを分散する。' },
      { element: 'カサ・バトリョのファサード', inspiration: '骨、骸骨、海の形。屋根は竜の背中や海のうねりを思わせる。' },
      { element: 'グエル邸の煙突', inspiration: 'トレンカディスに覆われた巨大なキノコのような形。' },
      { element: 'カテナリーアーチ', inspiration: '重力で垂れ下がった鎖が描く形 — 構造的に完璧な形。' },
      { element: '線織面', inspiration: '双曲面と放物面、馬の脚やトンボの翅に見られる形。' }
    ],
    natureQuote: '私の工房の近くの木、それが私の師匠である。',

    // 豆知識
    curiositiesTitle: '豆知識と名言',
    curiositiesSubtitle: 'ガウディの小さな宝物',
    curiosities: [
      'ガウディは晩年、厳格な菜食主義者だった。',
      'サグラダ・ファミリアの完成はおよそ2026年、彼の死後100年と予想されている。',
      'ガウディは光がどのように形を変えるかを研究するために鏡を使った。',
      'カタルーニャと南フランスの外に旅行したことはなかった。',
      'グエル公園のトレンカディスはエスプルーゲスのプジョル・イ・バウシス陶器工場の廃棄品を使用している。',
      'ガウディはアーチの理想的な形を見つけるために鎖を逆さに吊るした。',
      'ガウディの7つの作品がユネスコ世界遺産に登録されている。',
      'グエル公園の蛇行ベンチは人間工学的にデザインされている — ガウディは完璧な形を得るために裸の作業員を石膏に座らせた。',
      'ガウディの多くの作品を冠する四腕の十字架は東西南北を象徴している。',
      'グエル公園の竜はもともと噴水のように水を吐いていた。'
    ],
    quotesTitle: 'アントニ・ガウディの名言',
    quotes: [
      '独創性とは、起源に立ち戻ることである。',
      '自然に由来しないものは芸術ではない。',
      '創造は人間の手段を通じて絶え間なく続く。',
      '物の色彩、それが生命である。',
      '直線は人間の線。曲線は神の線。',
      '物事をうまくやるには、第一に愛、第二に技術が必要だ。',
      '私の工房の近くの木、それが私の師匠である。',
      '何も発明されていない。自然がすべてを先に書いたのだから。',
      '美は真理の輝きである。',
      'すべては自然という偉大な書物から生まれる。',
      '直角は自然界には存在しない。',
      '私の依頼主は急いでいない。',
      '私はカタルーニャ人であり、カタルーニャ語を話す。',
      '建築とは光の秩序である。',
      '告白すれば、私の偉大な師匠はずっと、そしてこれからも木なのだ。'
    ],

    // プライバシー
    navPrivacy: 'プライバシー',
    privacyTitle: 'プライバシー',
    privacySubtitle: 'データの取り扱いについて',
    privacyIntro: 'Gaudí Mosaicはあなたのプライバシーを尊重します。このアプリケーションは、あなたのデータがデバイスの外に出ないよう設計されています。',
    privacyItems: [
      {
        icon: '🚫',
        title: '個人情報は収集しません',
        text: '名前、メールアドレス、その他の個人情報をお聞きすることはありません。ユーザー登録やアカウントはありません。'
      },
      {
        icon: '🍪',
        title: '分析Cookieの使用（任意）',
        text: 'アプリの使用状況を理解し改善するためにGoogle Analyticsを使用しています。これらのCookieはあなたが同意した場合にのみ読み込まれます。個人を特定できるデータは収集しません。いつでも設定を変更できます。'
      },
      {
        icon: '📡',
        title: 'ローカル処理',
        text: 'アプリは完全にブラウザ内で動作します。モザイクの作成と保存はすべてローカルで行われます。唯一の外部サービスはGoogle Analytics（同意した場合）です。'
      },
      {
        icon: '💾',
        title: 'ローカルストレージのみ',
        text: '保存したプロジェクト、言語設定、Cookieの同意はブラウザのlocalStorageに保存されます。これらのデータはあなたのデバイスに残ります。'
      }
    ],
    privacyResetCookies: 'Cookieの設定を変更',
    privacyCookiesReset: 'Cookieの設定をリセットしました',

    // お問い合わせ
    navContact: 'お問い合わせ',
    contactTitle: 'お問い合わせ',
    contactSubtitle: 'ご質問、ご提案、コラボレーションのご相談はお気軽に',
    contactEmail: 'contact@gaudimosaic.art',
    contactEmailText: 'メールはこちら',
    contactSocialTitle: 'フォローする',
    contactSocial: [
      { icon: '🐦', name: 'Twitter / X', url: 'https://twitter.com/gaudimosaic', handle: '@gaudimosaic' },
      { icon: '📸', name: 'Instagram', url: 'https://instagram.com/gaudimosaic', handle: '@gaudimosaic' }
    ],
    contactProjectTitle: 'プロジェクトについて',
    contactProjectText: 'Gaudí Mosaicはアントニ・ガウディ没後100年（1926–2026）を記念して制作されたプロジェクトです。アプリケーションは無料です。',
    contactLicense: 'バルセロナから♥を込めて'
  },

  // ---- PWA ----
  pwa: {
    install: 'インストール',
    installTitle: 'Gaudí Mosaicをデバイスにインストール',
    installed: 'Gaudí Mosaicをインストールしました！',
    offline: '接続なし — オフラインで動作中',
    online: '接続が回復しました',
    updated: '新しいバージョンがあります — 更新するにはリロードしてください'
  },

  // ---- Cookies (GDPR) ----
  cookies: {
    text: 'ユーザー体験向上のため分析Cookieを使用しています。承諾または拒否を選択できます。',
    accept: '承諾',
    reject: '拒否'
  },

  // ---- 言語セレクター ----
  language: {
    label: '言語',
    current: '日本語'
  }
};
