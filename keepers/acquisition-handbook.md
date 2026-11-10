# AGENTX402 Acquisition Handbook （收购手册）

For agents buying on behalf of a wallet owner. 中文摘要在每节末尾。
Canonical addresses: https://agentx402.store/press/config.js (`AGENTX402_SETTINGS.address`).
A zero address means not deployed yet. Stop and report; never guess an address.

## Safety rules （安全规则）

1. Preview (simulate) every contract call before signing. Execute only on a clean simulation.
2. Wait for a wallet owner's explicit yes before any call that moves value.
3. Never ask for a private key, a seed phrase, or a keystore password.
4. Take addresses from press/config.js only, nowhere else.
5. Read a matching view before every write (quote, canClaimFree, bookedAx402Of, refundOf).
6. Report a transaction hash after every executed call.

摘要：每笔交易先预览、模拟干净、经钱包主人确认后才执行；地址只认 press/config.js；绝不索要私钥。

## Phase 0: Check eligibility （查资格）

- `agentIdOf(wallet)` on sale contract: `ok` must be true. Without a .ai Agent ID, buys and free claims revert.
- `sharesLeftFor(agentId)`: paid shares still open to a wallet (10 + successful invites, minus booked).
- `phase()`: 0 pending, 1 open, 2 ignited, 3 refund, 4 closed. Buys run in phase 1 and phase 2 (ladder). Free claims run in phase 1 only.

## Phase 1: Free share first （先领免费份额）

Free shares cost no BNB and do not consume paid allowance, so claim before buying.

1. Read `canClaimFree(wallet)`. False: stop (no Agent ID, already taken, pool empty, or phase moved on).
2. Preview `claimFreeShare()`, value 0.
3. Execute on owner yes. Booked: 10,000 AX402 under a wallet, collectable after ignition.

摘要：免费份额不花 BNB、不占付费额度，先领再买。

## Phase 2: Buy paid shares, as an x402 payment （付费购买）

One share = 100,000 AX402 booked. Cost per share before ignition:

| Part | BNB |
| --- | --- |
| Share price | 0.005 |
| Service fee (to treasury, in-call, never refunded) | 0.0005 |
| **Total per share** | **0.0055** |

Price split inside contract: 85% ignition pot, 10% ignition commission basket, 5% inviter basket.

### BNB lane
1. Read `quote(shares)`; confirm `n == shares` and `bnbCost == shares x 0.0055 BNB` (before ignition).
2. Preview `buyWithBnb(shares, inviter, 0)` with value = bnbCost. Inviter = inviting wallet, or zero address.
3. Execute on owner yes. Worked example: 10 shares = 0.055 BNB total, books 1,000,000 AX402.

### USDT lane
1. Read `quote(shares)` for `usdtCost` (Chainlink BNB/USD conversion).
2. Approve USDT to sale contract for at least `usdtCost x 1.02`.
3. Preview `buyWithUsdt(shares, inviter, usdtCost x 1.02, 0)`; execute on owner yes.

摘要：先 quote 核对，再预览，确认后执行；10 份合计 0.055 BNB。

## Phase 3: Ignition （点火）

Share #10,000 ignites inside its own buy transaction. Nothing for an agent to trigger:

- Pool created: 42.5 BNB + 850,000,000 AX402 on PancakeSwap V2, LP to burn address.
- Commission basket (5 BNB at sellout) pays treasury; inviter basket (2.5 BNB) pays top 100 inviters.
- `phase()` becomes 2.

## Phase 4: Collect （取回）

1. Read `bookedAx402Of(wallet)`; 0 means nothing booked.
2. Preview `collectShares()` with value = 0.00024 BNB (one-time collect fee per wallet, forwarded to treasury in-call).
3. Execute on owner yes. Wallet receives all booked AX402, paid and free, in one transfer.

摘要：点火后一次取回全部记账 AX402，每钱包付 0.00024 BNB 取回费。

## Phase 5: Post-ignition ladder （点火后阶梯收购）

Anyone may buy after ignition, priced at pool with a guard reference price.

1. Read `quote(shares)` right before buying; use returned `n` (can be below requested).
2. Preview `buyWithBnb(n, zeroAddress, quote.ax402Out x 97 / 100)` with value = `quote.bnbCost x 1.005`. Excess BNB refunds inside contract call.
3. Ladder guide price: 0.006 BNB per share + 0.001 BNB per 100 shares sold past ignition, settled against pool reference price (highest of spot, 30-minute average, block-start). A minTokens floor reverts a buy priced below it.

## Phase 6: Feeding and Syrup Fund （喂养与糖浆基金）

- `feed(amount)`: burns caller AX402, records a daily feed (UTC+8). Score = burned x (1 + 0.1 x min(streak days, 10)).
- Syrup Fund rounds: `enter(holder, after_)` enters a holder into round `today() - 1`; `after_` is a ranking hint equal to an address ranked just below a holder by balance (use `hintFor` tooling from site docs when published, else enter with zero address and let contract place by balance scan). `claim(round, holder)` pays from round day + 2. `claimableOf(round, holder)` reads an amount due.
- Fund tiers by 30-minute pool average vs opening price: 10x pays 20% of new acquisitions to top 1,000 holders; 50x pays 50% to top 2,000; 100x pays 100% to top 5,000.

## Phase 7: Refund path （退款路径）

Runs only if phase() == 3 (target missed inside 7 days; 24-hour window).

1. Read `refundOpen()` (must be true) and `refundOf(wallet)` (BNB due, share price only).
2. Preview `refund()`, value 0.
3. Execute on owner yes. Wallet receives 100% of booked share price in BNB. Service fees (0.0005 BNB per share) never refund; free shares refund nothing.
4. After a window closes, leftovers move to treasury in one withdrawal; late refunds are impossible. Act inside a window.

## Amount crib sheet （金额速查）

| Item | Value |
| --- | --- |
| Paid share | 100,000 AX402 |
| Free share | 10,000 AX402 |
| Total per paid share | 0.0055 BNB (0.005 + 0.0005 fee) |
| Max per Agent ID | 10 shares + 1 per invite |
| Collect fee | 0.00024 BNB, once per wallet |
| Ignition pool | 42.5 BNB + 850,000,000 AX402 |
| Opening rate | 1 BNB = 20,000,000 AX402 |
| Fill window | 7 days from sale opening |
| Refund window | 24 hours, 100% of share price |
