// AGENTX402 live board: raced public-RPC reads against press/config.js addresses.
// Zero address in config means not deployed yet: board shows awaiting-deployment state.
(function () {
  const S = window.AGENTX402_SETTINGS || {};
  const RPCS = [
    "https://bsc-rpc.publicnode.com",
    "https://bsc-dataseed.bnbchain.org",
    "https://bsc-dataseed.binance.org",
    "https://bsc-dataseed1.binance.org",
  ];
  const ZERO = "0x0000000000000000000000000000000000000000";
  const saleAddr = (S.address && S.address.sale) || ZERO;
  const deployed = saleAddr.toLowerCase() !== ZERO;
  const SEL = S.selectors || {};

  const fmt = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };

  async function rpc(method, params) {
    const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
    const tries = RPCS.map((url) =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: AbortSignal.timeout(7000),
      })
        .then((r) => r.json())
        .then((j) => {
          if (j.error) throw new Error(j.error.message || "rpc error");
          if (j.result === undefined || j.result === null) throw new Error("empty");
          return j.result;
        })
    );
    return Promise.any(tries);
  }
  const ethCall = (to, data) => rpc("eth_call", [{ to, data }, "latest"]);
  const asUint = (hex) => BigInt(hex);

  // Phase codes published in llms.txt: 0 pending, 1 open, 2 ignited, 3 refund, 4 closed.
  const PHASE = {
    0: { zh: "待开启", en: "PENDING", cls: "wait" },
    1: { zh: "销售中", en: "SALE OPEN", cls: "open" },
    2: { zh: "已点火 · 池已开", en: "IGNITED · POOL LIVE", cls: "open" },
    3: { zh: "退款窗口", en: "REFUND OPEN", cls: "wait" },
    4: { zh: "已结束", en: "CLOSED", cls: "done" },
  };
  let deadline = 0n;
  let phaseNow = 0;

  function phaseLabel() {
    const p = PHASE[phaseNow] || PHASE[0];
    return LANG === "zh" ? p.zh : p.en;
  }

  function tickCountdown() {
    const el = document.getElementById("bdCountdown");
    if (!el) return;
    if (!deployed || deadline === 0n) { el.textContent = "···"; return; }
    let target = Number(deadline);
    if (phaseNow === 3) target += 86400; // refund window runs 24h past the fill deadline
    const left = target - Math.floor(Date.now() / 1000);
    if (left <= 0) { el.textContent = "00:00:00"; return; }
    const d = Math.floor(left / 86400), h = Math.floor((left % 86400) / 3600),
          m = Math.floor((left % 3600) / 60), s = left % 60;
    const p2 = (n) => String(n).padStart(2, "0");
    el.textContent = (d > 0 ? d + "d " : "") + p2(h) + ":" + p2(m) + ":" + p2(s);
  }

  async function refresh() {
    if (!deployed) {
      set("bdSold", "···");
      set("bdFree", "···");
      const pill = document.getElementById("bdStatus");
      if (pill) { pill.className = "pill wait"; pill.textContent = LANG === "zh" ? "待部署" : "AWAITING DEPLOYMENT"; }
      return;
    }
    try {
      const [soldH, freeH, phaseH, dlH] = await Promise.all([
        ethCall(saleAddr, SEL.sharesSold),
        ethCall(saleAddr, SEL.freeSharesLeft),
        ethCall(saleAddr, SEL.phase),
        ethCall(saleAddr, SEL.fillDeadline),
      ]);
      const sold = asUint(soldH), free = asUint(freeH);
      phaseNow = Number(asUint(phaseH));
      deadline = asUint(dlH);
      set("bdSold", fmt(sold));
      set("bdFree", fmt(free));
      const bar = document.getElementById("bdBar");
      if (bar) bar.style.width = (Number(sold) / 100).toFixed(2) + "%";
      const pill = document.getElementById("bdStatus");
      if (pill) { const p = PHASE[phaseNow] || PHASE[0]; pill.className = "pill " + p.cls; pill.textContent = phaseLabel(); }
      tickCountdown();
    } catch (e) {
      /* keep last good values on screen */
    }
  }

  window.onLangApplied = function () { refresh(); };

  document.addEventListener("DOMContentLoaded", () => {
    refresh();
    setInterval(refresh, 30000);
    setInterval(tickCountdown, 1000);

    const cb = document.getElementById("copyBtn");
    if (cb) cb.addEventListener("click", async () => {
      const pe = document.getElementById("promptText");
      try {
        await navigator.clipboard.writeText(pe.textContent);
        cb.textContent = LANG === "zh" ? "已复制 ✓" : "COPIED ✓";
      } catch (e) {
        cb.textContent = LANG === "zh" ? "复制失败" : "COPY FAILED";
      }
      setTimeout(() => { cb.textContent = LANG === "zh" ? "复制" : "COPY"; }, 1800);
    });

    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll(".rv").forEach((el) => io.observe(el));
  });
})();
