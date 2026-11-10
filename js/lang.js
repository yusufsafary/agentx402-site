// AGENTX402 bilingual UI: zh-CN primary, EN toggle. Pattern: data-zh / data-en leaf nodes.
let LANG = localStorage.getItem("ax402-lang") || "zh";

const PROMPTS = {
  zh: "请用我的币安智能钱包在 BSC 上为我购买 AGENTX402 份额。先读 https://agentx402.store/llms.txt 和 https://agentx402.store/keepers/acquisition-handbook.md，并以 https://agentx402.store/press/config.js 的地址为准。步骤：1) 检查我的钱包持有 Agent ID，以及我还可购买的份额数；2) 用 quote 核对金额（每份价格 0.005 BNB 加服务费 0.0005 BNB）；3) 如果免费份额还有剩余，先帮我用 claimFreeShare() 领取 1 份；4) 每笔交易先预览，模拟结果干净且经我确认后才执行；5) 执行后把交易哈希发给我。不要向我要私钥或助记词。",
  en: "Buy AGENTX402 shares for me on BSC with my Binance Agentic Wallet. Read https://agentx402.store/llms.txt and https://agentx402.store/keepers/acquisition-handbook.md first, and take all addresses from https://agentx402.store/press/config.js. Steps: 1) check my wallet holds an Agent ID and how many shares I can still buy; 2) verify amounts with quote (0.005 BNB price plus 0.0005 BNB service fee per share); 3) if free shares remain, claim 1 for me with claimFreeShare() first; 4) preview every transaction, execute only after a clean simulation and my confirmation; 5) send me the transaction hash afterwards. Never ask for my private key or seed phrase.",
};

function applyLang() {
  document.documentElement.lang = LANG === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-zh]").forEach((el) => {
    el.textContent = LANG === "zh" ? el.dataset.zh : el.dataset.en;
  });
  const pe = document.getElementById("promptText");
  if (pe) pe.textContent = PROMPTS[LANG];
  const lb = document.getElementById("langBtn");
  if (lb) lb.textContent = LANG === "zh" ? "EN" : "中文";
  if (typeof onLangApplied === "function") onLangApplied();
}
function toggleLang() {
  LANG = LANG === "zh" ? "en" : "zh";
  localStorage.setItem("ax402-lang", LANG);
  applyLang();
}
document.addEventListener("DOMContentLoaded", applyLang);
