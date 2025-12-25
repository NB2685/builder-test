
// ========================================
// 建築者 ~Builder~ 専門診断テスト + Stripe Payment
// 完全統合版 v3.0 (2025.12.25) by Nobu
// ========================================

// ★ Stripe設定（本番環境に合わせて書き換え）★
// テスト用公開キー
const STRIPE_PUBLIC_KEY = "pk_test_51OcpEIItfnU847lpRvMrZf46MRhfvYVWWlHmSMOBt4PDcQnwO89qxIZADPD0Pro2G7bE06sSjyrWhg7BlgFKENFQ00hLglkcXq";
// 本番用公開キー
//const STRIPE_PUBLIC_KEY = "pk_test_51";
const stripe = Stripe(STRIPE_PUBLIC_KEY);
let elements; // Stripe Elements インスタンス

// ========================================
// Question Data (Optimized with Weights)
// ========================================
const questionsData = [
  {
    q: 1,
    text: "何かをつくるとき、最初に見るのは？",
    // Pattern: A B C D E (Standard)
    choices: { A: "構造の強度", B: "土地との相性", C: "素材の手触り", D: "機能とオペレーション", E: "空間としての体験" },
    mapping: { A: "A", B: "B", C: "C", D: "D", E: "E" }
  },
  {
    q: 2,
    text: "理想の仕事現場は？",
    // Pattern: B C D E A
    choices: { A: "森、畑、水辺", B: "木工所・工房", C: "オフィス・指揮室", D: "ギャラリーや家・人が集う場所", E: "工事現場・足場の上" },
    mapping: { A: "B", B: "C", C: "D", D: "E", E: "A" }
  },
  {
    q: 3,
    text: "人のための建築とは？",
    // Pattern: C D E A B
    choices: { A: "毎日触られること", B: "社会が回ること", C: "心が休まること", D: "倒れないこと", E: "他生物と共に息をすること" },
    mapping: { A: "C", B: "D", C: "E", D: "A", E: "B" }
  },
  {
    q: 4,
    text: "どの「計測」が好き？",
    // Pattern: D E A B C
    choices: { A: "時間とフロー", B: "心の距離", C: "mm単位", D: "湿度・温度・日照", E: "手の感覚" },
    mapping: { A: "D", B: "E", C: "A", D: "B", E: "C" }
  },
  {
    q: 5,
    text: "直したくなるのは？",
    // Pattern: E A B C D
    choices: { A: "光の入り方", B: "ひび割れ", C: "水の流れの滞り", D: "デザインの粗", E: "動線のロス" },
    mapping: { A: "E", B: "A", C: "B", D: "C", E: "D" }
  },
  {
    q: 6,
    text: "一番信じてるのは？",
    // Pattern: E D C B A
    choices: { A: "美意識", B: "ロジック", C: "職人の魂", D: "生態系", E: "工学" },
    mapping: { A: "E", B: "D", C: "C", D: "B", E: "A" }
  },
  {
    q: 7,
    text: "問題解決の切り口は？",
    // Pattern: D C B A E
    choices: { A: "仕組みを変える", B: "素材チェンジ", C: "土壌・循環修正", D: "建て替える", E: "心理設計" },
    mapping: { A: "D", B: "C", C: "B", D: "A", E: "E" }
  },
  {
    q: 8,
    text: "「壊れる建築」は…",
    // Pattern: C B A E D
    choices: { A: "職人を軽く扱ってる", B: "生態系を読めてない", C: "構造の敗北", D: "感情を軽視してる", E: "人流設計ミス" },
    mapping: { A: "C", B: "B", C: "A", D: "E", E: "D" }
  },
  {
    q: 9,
    text: "未来に最も必要なのは？",
    // Pattern: B A E D C
    choices: { A: "食と水の自立", B: "防災", C: "存在の意味", D: "効率と秩序", E: "量より質" },
    mapping: { A: "B", B: "A", C: "E", D: "D", E: "C" }
  },
  {
    q: 10,
    text: "一番怖いのは？",
    // Pattern: A E D C B
    choices: { A: "崩落", B: "人が孤立する", C: "オペレーション停止", D: "触れられない作品", E: "生き物が来ない" },
    mapping: { A: "A", B: "E", C: "D", D: "C", E: "B" }
  },
  {
    q: 11,
    text: "誰のために建てる？",
    // Pattern: A C E B D
    choices: { A: "次世代の人間", B: "使う人の手", C: "魂を宿す人たちへ", D: "地球全体", E: "社会の歯車として" },
    mapping: { A: "A", B: "C", C: "E", D: "B", E: "D" }
  },
  {
    q: 12,
    text: "完成後、何を見たい？",
    // Pattern: B D A C E
    choices: { A: "緑の成長", B: "回る経済", C: "強さ", D: "年月で深まる質感", E: "そこに生まれる物語" },
    mapping: { A: "B", B: "D", C: "A", D: "C", E: "E" }
  },
  {
    q: 13,
    text: "判断の軸は？",
    // Pattern: C E B D A
    choices: { A: "職人技第一", B: "心理第一", C: "循環第一", D: "戦略第一", E: "安全第一" },
    mapping: { A: "C", B: "E", C: "B", D: "D", E: "A" }
  },
  {
    q: 14,
    text: "欠けた仲間を補うなら…",
    // Pattern: D A C E B
    choices: { A: "マネジメント", B: "エンジニア", C: "職人仲間", D: "クリエイター", E: "農生態学者" },
    mapping: { A: "D", B: "A", C: "C", D: "E", E: "B" }
  },
  {
    q: 15,
    text: "時間を忘れる作業は？",
    // Pattern: E B D A C
    choices: { A: "レイアウト変更", B: "植栽配置", C: "フロー設計", D: "構造図", E: "削り・磨き" },
    mapping: { A: "E", B: "B", C: "D", D: "A", E: "C" }
  },
  {
    q: 16,
    text: "迷った時は…",
    // Pattern: A D B E C
    choices: { A: "法則を思い出す", B: "優先順位", C: "自然を見る", D: "人の笑顔", E: "手を動かす" },
    mapping: { A: "A", B: "D", C: "B", D: "E", E: "C" }
  },
  {
    q: 17,
    text: "現場で最も嫌うのは？",
    // Pattern: B E C A D
    choices: { A: "乱開発", B: "威圧的な空気", C: "粗製乱造", D: "手抜き", E: "ダラダラ" },
    mapping: { A: "B", B: "E", C: "C", D: "A", E: "D" }
  },
  {
    q: 18,
    text: "一番輝く瞬間は？",
    // Pattern: C A D B E
    choices: { A: "モノが使われた時", B: "竣工", C: "社会が動き出す時", D: "生き物が戻った時", E: "家族が笑った時" },
    mapping: { A: "C", B: "A", C: "D", D: "B", E: "E" }
  },
  {
    q: 19,
    text: "急な変更で…",
    // Pattern: D B E C A
    choices: { A: "計画全崩壊と焦る", B: "土地が泣いてると感じる", C: "心がついていかない", D: "自分の作品が壊れる感覚", E: "怒る" },
    mapping: { A: "D", B: "B", C: "E", D: "C", E: "A" }
  },
  {
    q: 20,
    text: "プレッシャーで…",
    // Pattern: E C A D B
    choices: { A: "感情が乱れる", B: "魂だけ走る", C: "完璧主義化", D: "マイクロマネジメント", E: "過保護化（土地の声に偏る）" },
    mapping: { A: "E", B: "C", C: "A", D: "D", E: "B" }
  },
  {
    q: 21,
    text: "仲間に言われがち：",
    // Pattern: A B E C D
    choices: { A: "頑固", B: "野生すぎ", C: "感情優先", D: "こだわり強い", E: "指示が細かい" },
    mapping: { A: "A", B: "B", C: "E", D: "C", E: "D" }
  },
  {
    q: 22,
    text: "放置すると…",
    // Pattern: B C A D E
    choices: { A: "生態原理だけで理詰め", B: "アートだけの世界", C: "大雑把な連中と衝突", D: "スプレッドシート地獄", E: "雰囲気だけの空間" },
    mapping: { A: "B", B: "C", C: "A", D: "D", E: "E" }
  },
  {
    q: 23,
    text: "最も嫌う建築は？",
    // Pattern: C D B E A
    choices: { A: "安物大量生産", B: "非効率", C: "生き物無視", D: "魂なし", E: "安全軽視" },
    mapping: { A: "C", B: "D", C: "B", D: "E", E: "A" }
  },
  {
    q: 24,
    text: "戦う相手は？",
    // Pattern: D E C A B
    choices: { A: "混乱", B: "孤独", C: "魂の貧困", D: "自然災害", E: "生態破壊" },
    mapping: { A: "D", B: "E", C: "C", D: "A", E: "B" }
  },
  {
    q: 25,
    text: "千年後に誇れるものは？",
    // Pattern: E A D B C
    choices: { A: "文化の継承", B: "耐えた構造", C: "機能する社会", D: "回復した森", E: "味のある道具" },
    mapping: { A: "E", B: "A", C: "D", D: "B", E: "C" }
  },
  {
    q: 26,
    text: "若者に継いで欲しいのは？",
    // Pattern: B A D C E
    choices: { A: "呼吸", B: "耐久", C: "構造", D: "触覚", E: "祈り" },
    mapping: { A: "B", B: "A", C: "D", D: "C", E: "E" }
  },
  {
    q: 27,
    text: "もし一つだけ残せるなら？",
    // Pattern: C B E D A
    choices: { A: "道具", B: "種と土", C: "居場所", D: "システム", E: "水道" },
    mapping: { A: "C", B: "B", C: "E", D: "D", E: "A" }
  },
  {
    q: 28,
    text: "核になる素材は？",
    // Pattern: D C A E B
    choices: { A: "情報とルール", B: "木と鉄", C: "コンクリ・鋼", D: "光と影", E: "土と水" },
    mapping: { A: "D", B: "C", C: "A", D: "E", E: "B" }
  },
  {
    q: 29,
    text: "アートと科学、どちら寄り？",
    // Pattern: E D B A C
    choices: { A: "アート＋心理", B: "科学＋経済", C: "生態科学", D: "科学", E: "職人アート" },
    mapping: { A: "E", B: "D", C: "B", D: "A", E: "C" }
  },
  {
    q: 30,
    text: "愛するものは？",
    // Pattern: A E C B D
    choices: { A: "大地の骨", B: "家族の記憶", C: "人の手", D: "生き物の声", E: "秩序と流れ" },
    mapping: { A: "A", B: "E", C: "C", D: "B", E: "D" }
  }
];


// ========================================
// Path Definitions (5つのBuilder)
// ========================================
const pathsData = {
  A: {
    name: "Structure Builder",
    subtitle: "構造防衛・都市防災",
    description: "耐震・耐風・耐水の命の防壁構築。災害多発地域、山・水際で人を「死なせない」使命を担う。",
    mainRole: "耐震・耐風・耐水の命の防壁構築",
    battleground: "災害多発地域、山・水際",
    ai: "シミュレーションAI（揺れ／流れ／劣化予測）",
    mission: "人を「死なせない」"
  },
  B: {
    name: "Habitat Builder",
    subtitle: "生態回復・水循環",
    description: "水・土壌・植生の生命基盤設計。放棄地、荒廃地、山林、海辺で地球を「呼吸させる」使命を担う。",
    mainRole: "水・土壌・植生の生命基盤設計",
    battleground: "放棄地、荒廃地、山林、海辺",
    ai: "環境センシングAI（気温・水質・微生物）",
    mission: "地球を「呼吸させる」"
  },
  C: {
    name: "Product Builder",
    subtitle: "道具・家財",
    description: "毎日触れる生活クオリティの源をつくる。工房、地場産業、輸出市場で暮らしを「豊かにする」使命を担う。",
    mainRole: "毎日触れる生活クオリティの源をつくる",
    battleground: "工房、地場産業、輸出市場",
    ai: "製造最適化AI（カット、3D、強度設計）",
    mission: "暮らしを「豊かにする」"
  },
  D: {
    name: "System Builder",
    subtitle: "社会設計・物流",
    description: "インフラ × 経済 × 法の運用システム構築。都市、国境、コミュニティ組織で文明を「回す」使命を担う。",
    mainRole: "インフラ × 経済 × 法の運用システム構築",
    battleground: "都市、国境、コミュニティ組織",
    ai: "データ統合AI（交通／配電／市場）",
    mission: "文明を「回す」"
  },
  E: {
    name: "Sanctuary Builder",
    subtitle: "空間心理・場の治癒",
    description: "共同体の心の安全基地を創る。住宅、教育、医療、寺院で人を「壊さない」使命を担う。",
    mainRole: "共同体の心の安全基地を創る",
    battleground: "住宅、教育、医療、寺院",
    ai: "光・音・心理フィード最適化AI",
    mission: "人を「壊さない」"
  }
};

// ========================================
// Application State
// ========================================
let currentQuestion = 0;
let answersArray = [];
let userEmail = '';
let userName = '';

// ========================================
// DOM Elements
// ========================================
const startPage = document.getElementById('start-page');
const questionPage = document.getElementById('question-page');
const emailPage = document.getElementById('email-page');
const loadingOverlay = document.getElementById('loading-overlay');

const startBtn = document.getElementById('start-btn');
const completeBtn = document.getElementById('complete-btn');
const paymentForm = document.getElementById('payment-form');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');

const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const questionText = document.getElementById('question-text');
const choicesContainer = document.getElementById('choices-container');
const completeAction = document.getElementById('complete-action');

// ========================================
// Event Listeners
// ========================================
if (startBtn) startBtn.addEventListener('click', startDiagnosis);
if (completeBtn) completeBtn.addEventListener('click', () => {
    showEmailPage();
    // ページが表示されるアニメーション（50ms + CSS遷移）を待ってから初期化
    setTimeout(() => {
        initializePayment(); 
    }, 200); // 200ms程度待てば確実
});


if (paymentForm) paymentForm.addEventListener('submit', handlePaymentSubmit);

if (restartBtn) restartBtn.addEventListener('click', restartDiagnosis);
if (homeBtn) homeBtn.addEventListener('click', goHome);

// ========================================
// Main Functions
// ========================================

function startDiagnosis() {
  currentQuestion = 0;
  answersArray = [];
  showPage(questionPage);
  renderQuestion();
}

function renderQuestion() {
  const question = questionsData[currentQuestion];
  const progress = ((currentQuestion + 1) / questionsData.length) * 100;

  if (progressFill) progressFill.style.width = progress + '%';
  if (progressText) progressText.textContent = `Q${currentQuestion + 1}/${questionsData.length}`;
  if (questionText) questionText.textContent = question.text;

  if (choicesContainer) {
    choicesContainer.innerHTML = '';
    Object.keys(question.choices).forEach(key => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = question.choices[key];

        // 連続クリック防止
        button.addEventListener('click', (e) => {
            const allBtns = choicesContainer.querySelectorAll('.choice-btn');
            allBtns.forEach(btn => btn.style.pointerEvents = 'none');
            selectAnswer(key);
        });

        choicesContainer.appendChild(button);
    });
  }

  if (completeAction) completeAction.style.display = 'none';
}

function selectAnswer(answer) {
  const question = questionsData[currentQuestion];
  answersArray.push({
    q: question.q,
    answer: answer,
    category: question.mapping[answer]
  });

  const buttons = choicesContainer.querySelectorAll('.choice-btn');
  buttons.forEach(btn => {
    if (btn.textContent === question.choices[answer]) {
      btn.classList.add('selected');
    }
  });

  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < questionsData.length) {
      renderQuestion();
    } else {
      showCompleteButton();
    }
  }, 300);
}

function showCompleteButton() {
  choicesContainer.innerHTML = '<p class="complete-message" style="text-align:center; font-weight:bold; margin-bottom:20px;">全ての質問に回答しました</p>';
  if (completeAction) completeAction.style.display = 'block';
}

function showEmailPage() {
  showPage(emailPage);
}

// ========================================
// Stripe Payment Logic
// ========================================

async function initializePayment() {
    if (elements) return;

    try {
        setLoading(true);

        const response = await fetch("create_payment_intent.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: [{ id: "diagnosis-fee" }] }),
        });

        if (!response.ok) throw new Error('Payment Intent Creation Failed');

        const { clientSecret } = await response.json();

        const appearance = {
            theme: 'night', 
            variables: {
                colorPrimary: '#ffffff',
                colorBackground: 'rgba(255, 255, 255, 0.05)',
                colorText: '#ffffff',
                colorDanger: '#ff4444',
                fontFamily: '"Noto Sans JP", sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
            },
        };

        elements = stripe.elements({ appearance, clientSecret });
        const paymentElement = elements.create("payment", {
            layout: "tabs",
        });

        paymentElement.mount("#payment-element");
        setLoading(false);

    } catch (error) {
        console.error("Stripe Initialize Error:", error);
        showMessage("決済システムの読み込みに失敗しました。ページを再読み込みしてください。");
        setLoading(false);
    }
}


// handlePaymentSubmit関数
async function handlePaymentSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('name-input');
    const emailInput = document.getElementById('email-input');
    
    if (!nameInput.value || !emailInput.value) {
        showMessage("お名前とメールアドレスを入力してください。");
        return;
    }
    
    setLoading(true);
    
    try {
        console.log('🚀 Step 1: Saving diagnosis...');
        
        // Step 1: 診断データを保存して診断IDを取得
        const pageIdVal = document.getElementById('page_id')?.value || 'builder_diagnosis';
        const diagnosticData = {
            answers: answersArray,
            email: emailInput.value,
            name: nameInput.value,
            page_id: pageIdVal,
            timestamp: new Date().toISOString()
        };
        
        const diagResponse = await fetch('https://x-sennin.com/api/tribe_diagnosis/builder_diagnose.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(diagnosticData)
        });
        
        if (!diagResponse.ok) throw new Error('Diagnosis Save Failed');
        const diagResult = await diagResponse.json();
        
        if (diagResult.status !== 'success' || !diagResult.diagnosisId) {
            throw new Error(diagResult.message || 'Diagnosis Error');
        }
        
        const diagnosisId = diagResult.diagnosisId;
        console.log('✅ Diagnosis saved:', diagnosisId);
        
        // Step 2: Stripe決済実行（redirect不使用 = JS内で完結）
        console.log('💳 Step 2: Processing payment...');
        
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                payment_method_data: {
                    billing_details: {
                        name: nameInput.value,
                        email: emailInput.value
                    }
                }
            },
            redirect: 'if_required'  // ★重要: リダイレクトせずJS内で完結
        });
        
        // Step 3: 決済結果に応じた事後処理
        if (error) {
            // ========== 決済失敗 ==========
            console.error('❌ Payment Failed:', error);
            
            // finalize_transaction.php に失敗を通知
            await fetch('https://x-sennin.com/api/tribe_diagnosis/finalize_transaction.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    diagnosisId: diagnosisId,
                    status: 'failed',
                    email: emailInput.value,
                    name: nameInput.value,
                    errorMessage: error.message
                })
            });
            
            showMessage(error.message || '決済に失敗しました。もう一度お試しください。');
            
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // ========== 決済成功 ==========
            console.log('✅ Payment Succeeded:', paymentIntent.id);
            console.log('📨 Step 3: Finalizing transaction...');
            
            // finalize_transaction.php に成功を通知
            // （DB更新・GAS送信・Kit登録・メール送信が実行される）
            const finalizeResponse = await fetch('https://x-sennin.com/api/tribe_diagnosis/finalize_transaction.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    diagnosisId: diagnosisId,
                    status: 'success',
                    email: emailInput.value,
                    name: nameInput.value,
                    paymentIntentId: paymentIntent.id
                })
            });
            
            if (finalizeResponse.ok) {
                const finalizeResult = await finalizeResponse.json();
                console.log('✅ Finalize complete:', finalizeResult);
            } else {
                console.warn('⚠️ Finalize request failed, but payment was successful');
            }
            
            // 結果ページへ遷移
            window.location.href = `result.html?id=${diagnosisId}`;
        }
        
    } catch (err) {
        console.error('⚠️ Error:', err);
        showMessage("処理中にエラーが発生しました: " + err.message);
    } finally {
        setLoading(false);
    }
}

// ========================================
// Utility Functions
// ========================================

function setLoading(isLoading) {
    const submitBtn = document.getElementById("submit-button");
    const spinner = document.getElementById("spinner");
    const buttonText = document.getElementById("button-text");

    if (isLoading) {
        if(submitBtn) submitBtn.disabled = true;
        if(spinner) spinner.classList.remove("hidden");
        if(buttonText) buttonText.classList.add("hidden");
        if(loadingOverlay) loadingOverlay.classList.add('active');
    } else {
        if(submitBtn) submitBtn.disabled = false;
        if(spinner) spinner.classList.add("hidden");
        if(buttonText) buttonText.classList.remove("hidden");
        if(loadingOverlay) loadingOverlay.classList.remove('active');
    }
}

function showMessage(messageText) {
    const messageContainer = document.getElementById("payment-message");
    if (messageContainer) {
        messageContainer.textContent = messageText;
        messageContainer.classList.remove("hidden");
        setTimeout(() => {
            messageContainer.textContent = "";
            messageContainer.classList.add("hidden");
        }, 5000);
    } else {
        alert(messageText);
    }
}

function restartDiagnosis() {
  currentQuestion = 0;
  answersArray = [];
  userEmail = '';
  userName = '';

  const emailIn = document.getElementById('email-input');
  if(emailIn) emailIn.value = '';

  const nameIn = document.getElementById('name-input');
  if(nameIn) nameIn.value = '';

  if (elements) {
      // Elements reset logic if needed
  }

  showPage(startPage);
}

function goHome() {
  restartDiagnosis();
}

function showPage(page) {
  [startPage, questionPage, emailPage].forEach(p => {
    if (p) p.classList.remove('active');
  });

  setTimeout(() => {
    if (page) page.classList.add('active');
    window.scrollTo(0, 0);
  }, 50);
}

// ========================================
// Mailcheck Integration
// ========================================
if (typeof $ !== 'undefined' && $.fn.mailcheck) {
    $(document).ready(function() {
        const emailInput = $('#email-input');
        const suggestionBox = $('#email-suggestion');

        const domains = [
            "gmail.com", "yahoo.co.jp", "icloud.com", "outlook.com", "hotmail.com",
            "docomo.ne.jp", "ezweb.ne.jp", "softbank.ne.jp", "i.softbank.jp",
            "au.com", "ymobile.ne.jp", "me.com", "mac.com"
        ];

        emailInput.on('blur', function() {
            suggestionBox.empty();
            $(this).mailcheck({
                domains: domains,
                suggested: function(element, suggestion) {
                    const correctedEmail = suggestion.full;
                    const html = `
                        <div class="suggestion-message">
                            <span>💡 もしかして:</span>
                            <span class="suggestion-link" data-suggested="${correctedEmail}">
                                ${correctedEmail}
                            </span>
                            <span>ですか？</span>
                        </div>
                    `;
                    suggestionBox.html(html);
                }
            });
        });

        suggestionBox.on('click', '.suggestion-link', function() {
            const correctedEmail = $(this).data('suggested');
            emailInput.val(correctedEmail);
            suggestionBox.empty();
        });
    });
}