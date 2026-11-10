// AGENTX402 public configuration. Canonical source for agents and for this site.
// Addresses go live at deployment. A zero address means: not deployed yet.
const AGENTX402_SETTINGS = {
  network: {
    chainId: 56,
    chainName: "BNB Smart Chain",
    explorer: "https://bscscan.com",
  },
  address: {
    token: "0x34682957ef8c5B77bba5411bA859EDd39A261176", // $AX402 token
    sale: "0xC0a1D0f84086F5d485bEA3FBD127eAaa151Ebcb1", // share sale (ignition)
    syrupFund: "0x4931389e43ba6Dd667eE9F9F97aBe24bd5899F33", // multiples fund
    pool: "0x0000000000000000000000000000000000000000", // AX402/WBNB PancakeSwap V2 pool, created at ignition
    treasury: "0xBcD080905a051BcC33CbeDCa99FF1a5096e3450d", // project wallet: service fees, ignition commission, sell tax
    agentIdRegistry: "0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F", // SPACE ID Agent ID registry (.ai)
    usdt: "0x55d398326f99059fF775485246999027B3197955", // USDT on BSC, 18 decimals
    pancakeRouterV2: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    wbnb: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  },
  sale: {
    totalShares: 10000,
    pricePerShareBNB: "0.005",
    serviceFeePerShareBNB: "0.0005",
    totalPerShareBNB: "0.0055",
    tokensPerShare: 100000, // AX402 per paid share
    freeShares: 1000,
    freeTokensPerShare: 10000, // AX402 per free share, 10% of a paid share
    maxSharesPerAgentId: 10,
    extraSharePerInvite: 1,
    collectFeeBNB: "0.00024", // paid once per wallet on collectShares()
    priceSplitBps: { ignitionPot: 8500, ignitionCommission: 1000, inviters: 500 },
    ignition: {
      poolBNB: "42.5",
      poolTokens: 850000000,
      impliedRate: "1 BNB = 20,000,000 AX402",
      lpDestination: "burn address",
    },
    ladder: {
      startPriceBNB: "0.006",
      stepPer100SharesBNB: "0.001",
      referencePrice: "highest of pool spot, 30-minute pool average, block-start price",
    },
    fillWindowDays: 7,
    refundWindowHours: 24,
    refundTerms: "100% of share price back; service fee is not refunded",
  },
  syrupFund: {
    tiers: [
      { multiple: "10x", shareOfAcquisitionsBps: 2000, topHolders: 1000 },
      { multiple: "50x", shareOfAcquisitionsBps: 5000, topHolders: 2000 },
      { multiple: "100x", shareOfAcquisitionsBps: 10000, topHolders: 5000 },
    ],
    roundDay: "UTC+8",
    entryLag: "D+1",
    claimLag: "D+2",
  },
  tax: { buyBps: 100, buyGoesTo: "holders, shared by balance", sellBps: 200, sellGoesTo: "treasury, as BNB", transferBps: 0 },
  feed: { action: "feed(amount) burns AX402", score: "burned x (1 + 0.1 x min(streakDays, 10))" },
  selectors: {
    sharesSold: "0x192fc516",
    freeSharesLeft: "0x778737cb",
    phase: "0xb1c9fe6e",
    fillDeadline: "0x3996a416",
  },
};
if (typeof window !== "undefined") window.AGENTX402_SETTINGS = AGENTX402_SETTINGS;
if (typeof module !== "undefined") module.exports = AGENTX402_SETTINGS;
