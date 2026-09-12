// Extracted from the NLC v30 aiAnalystCore.js prototype.
// Formatting helpers and buildEvidence are unchanged. No provider calls or runtime data are included.

function fmt(n, d = 0) { return Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: d }); }
function pct(n) { return n === null || n === undefined || Number.isNaN(Number(n)) ? "n/a" : `${Number(n).toFixed(4).replace(/\.0+$/, "")}%`; }
function shortWallet(address = "") { return address && address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address; }

export function buildEvidence(input, walletContext = null) {
  const evidence = [];
  const totals = input.totals || {};
  if (totals.swaps !== undefined) evidence.push({ source: "market-intelligence-report.json", fact: `Swap scan analyzed ${fmt(totals.swaps)} swaps across ${fmt(totals.uniqueWallets)} scan wallets with net scan flow ${fmt(totals.netNlc)} NLC.` });
  if (input.supply?.totalSupplyNlc) evidence.push({ source: "supply-intelligence-dashboard-summary.json", fact: `ERC-20 totalSupply is ${fmt(input.supply.totalSupplyNlc)} NLC.` });
  if (input.fullHolderSummary?.holderCount) evidence.push({ source: "full-holder-list.json", fact: `Imported full holder list contains ${fmt(input.fullHolderSummary.holderCount)} holders; top 1/top 10/top 100 holder shares are ${pct(input.fullHolderSummary.top1HolderPct)}, ${pct(input.fullHolderSummary.top10HolderPct)}, and ${pct(input.fullHolderSummary.top100HolderPct)}.` });
  if (input.supply?.trackedSupplyPct !== undefined) evidence.push({ source: "supply-intelligence-dashboard-summary.json", fact: `Tracked enriched wallets hold about ${pct(input.supply.trackedSupplyPct)} of total supply.` });
  if (input.trackedConcentration?.top1Pct !== undefined) evidence.push({ source: "holder-investigation-report.json", fact: `Top enriched tracked holder represents ${pct(input.trackedConcentration.top1Pct)} of enriched tracked balances, not total supply.` });
  const top = input.topWallets?.[0];
  if (top) evidence.push({ source: "wallet-detail-export.json", fact: `Top tracked wallet ${top.shortWallet || shortWallet(top.wallet)} holds ${fmt(top.balance)} NLC, representing ${pct(top.trackedShare)} of tracked balances and ${pct(top.supplyShare)} of total supply.` });
  if (input.transferSummary?.available) evidence.push({ source: "transfer-intelligence-report.json", fact: `Transfer intelligence is available for ${fmt(input.transferSummary.walletsAnalyzed)} important wallets and includes source/destination hubs.` });
  if (walletContext?.wallet) {
    const w = walletContext.wallet;
    evidence.push({ source: "wallet-detail-export.json", fact: `Wallet ${w.shortWallet || shortWallet(w.wallet)} classification is ${w.classification || "unknown"}; balance ${fmt(w.currentBalanceNlc)} NLC; supply share ${pct(w.totalSupplySharePct)}.` });
    if (w.transferIntelligence) evidence.push({ source: "transfer-intelligence-report.json", fact: `Wallet transfer history shows incoming ${fmt(w.transferIntelligence.incomingTotalNlc)} NLC, outgoing ${fmt(w.transferIntelligence.outgoingTotalNlc)} NLC, net ${fmt(w.transferIntelligence.netTransferNlc)} NLC, coverage ${pct(w.transferIntelligence.transferCoveragePct)}.` });
  }
  if (walletContext?.fullHolderRow) evidence.push({ source: "full-holder-list.json", fact: `Wallet rank in imported holder list is #${walletContext.fullHolderRow.rank}, with ${fmt(walletContext.fullHolderRow.quantityNlc)} NLC and ${pct(walletContext.fullHolderRow.percentage)} of supply.` });
  return evidence;
}
