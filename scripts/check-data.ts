import { BASELINE_BALANCES, SCENARIOS } from '../src/data/model';

const equal = (actual: unknown, expected: unknown, label: string) => {
  if (actual !== expected) throw new Error(`${label}: expected ${String(expected)}, received ${String(actual)}`);
};

const deepEqual = (actual: readonly number[], expected: readonly number[], label: string) => {
  equal(JSON.stringify(actual), JSON.stringify(expected), label);
};

const expected = [
  ['Nov 2026', 'Cash', 1_353_000, 'Nov 2026', 'fail', 566_060, 0, 2_946_060, 13],
  ['Nov 2026', 'Line of credit', 1_845_916, 'Nov 2026', 'pass', 523_556, 42_504, 3_403_556, 13],
  ['Jan 2027', 'Cash', 2_120_000, 'Nov 2026', 'pass', 367_060, 0, 2_747_060, 13],
  ['Jan 2027', 'Line of credit', 2_120_000, 'Nov 2026', 'pass', 331_640, 35_420, 3_211_640, 13],
  ['Mar 2027', 'Cash', 2_120_000, 'Nov 2026', 'pass', 266_600, 0, 2_646_600, 13],
  ['Mar 2027', 'Line of credit', 2_120_000, 'Nov 2026', 'pass', 238_264, 28_336, 3_118_264, 13],
] as const;

deepEqual([...BASELINE_BALANCES], [2_300_000, 2_120_000, 2_840_000, 3_100_000, 2_980_000, 3_040_000, 3_130_000, 3_170_000, 3_090_000, 3_140_000, 2_990_000, 3_100_000], 'Baseline balances');
SCENARIOS.forEach((scenario, index) => {
  const [opening, funding, lowest, month, cashCheck, profit, interest, endCash, payback] = expected[index];
  equal(scenario.opening, opening, `${scenario.id} opening`);
  equal(scenario.funding, funding, `${scenario.id} funding`);
  equal(scenario.lowest, lowest, `${scenario.id} lowest cash`);
  equal(scenario.lowestMonth, month, `${scenario.id} lowest month`);
  equal(scenario.cashCheck, cashCheck, `${scenario.id} cash check`);
  equal(scenario.profit, profit, `${scenario.id} profit`);
  equal(scenario.interest, interest, `${scenario.id} interest`);
  equal(scenario.endCash, endCash, `${scenario.id} ending cash`);
  equal(scenario.payback, payback, `${scenario.id} payback`);
});

console.log('Preflight cash model matches all 6 expected scenarios.');
