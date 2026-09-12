// Synthetic regression checks added for the public portfolio extraction.
// These test evidence packaging, not live model accuracy or blockchain analysis.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEvidence } from '../evidence-builder.mjs';

test('empty input produces no evidence claims', () => {
  assert.deepEqual(buildEvidence({}), []);
});

test('keeps tracked-balance concentration separate from total supply', () => {
  const evidence = buildEvidence({ trackedConcentration: { top1Pct: 40 } });
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0].source, 'holder-investigation-report.json');
  assert.match(evidence[0].fact, /40%/);
  assert.match(evidence[0].fact, /not total supply/);
});

test('missing holder-share metrics remain explicitly unavailable', () => {
  const evidence = buildEvidence({ fullHolderSummary: { holderCount: 2 } });
  assert.equal(evidence[0].source, 'full-holder-list.json');
  assert.match(evidence[0].fact, /n\/a, n\/a, and n\/a/);
});

test('wallet context carries source labels and the supplied classification', () => {
  const evidence = buildEvidence({}, { wallet: {
    shortWallet: 'demo-wallet', classification: 'Unclassified',
    currentBalanceNlc: 10, totalSupplySharePct: 1
  } });
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0].source, 'wallet-detail-export.json');
  assert.match(evidence[0].fact, /demo-wallet classification is Unclassified/);
  assert.match(evidence[0].fact, /supply share 1%/);
});
