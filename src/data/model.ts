export const MONTHS = [
  'Oct 2026', 'Nov 2026', 'Dec 2026', 'Jan 2027', 'Feb 2027', 'Mar 2027',
  'Apr 2027', 'May 2027', 'Jun 2027', 'Jul 2027', 'Aug 2027', 'Sep 2027',
] as const;

export const CHART_MONTHS = ['Sep 2026', ...MONTHS] as const;
export const START_CASH = 2_940_000;
export const POLICY_MIN = 1_500_000;
export const CAUTION_BAND = 1_650_000;
export const BASELINE_FLOWS = [-640_000, -180_000, 720_000, 260_000, -120_000, 60_000, 90_000, 40_000, -80_000, 50_000, -150_000, 110_000] as const;
export const BASELINE_BALANCES = [2_300_000, 2_120_000, 2_840_000, 3_100_000, 2_980_000, 3_040_000, 3_130_000, 3_170_000, 3_090_000, 3_140_000, 2_990_000, 3_100_000] as const;

export type Opening = 'Nov 2026' | 'Jan 2027' | 'Mar 2027';
export type Funding = 'Cash' | 'Line of credit';
export type CheckStatus = 'pass' | 'caution' | 'fail';

export type Scenario = {
  id: string;
  opening: Opening;
  funding: Funding;
  balances: number[];
  chart: Array<{ month: string; scenario: number; baseline: number; low: number; high: number; range?: [number, number] }>;
  lowest: number;
  lowestMonth: string;
  cashCheck: CheckStatus;
  profit: number;
  interest: number;
  endCash: number;
  payback: number;
};

const OPENING_INDEX: Record<Opening, number> = { 'Nov 2026': 1, 'Jan 2027': 3, 'Mar 2027': 5 };
const SALES_RAMP = [150_000, 230_000, 290_000];
const SEASONALITY: Record<string, number> = { Nov: 1.2, Dec: 1.6, Jan: 0.8, Feb: 0.85 };

function monthlyStoreCash(monthIndex: number, openingIndex: number, includeInventory: boolean) {
  if (monthIndex === openingIndex - 1) return -36_000;
  if (monthIndex < openingIndex) return 0;
  const monthsOpen = monthIndex - openingIndex;
  const baseSales = SALES_RAMP[monthsOpen] ?? 330_000;
  const monthName = MONTHS[monthIndex]?.slice(0, 3) ?? '';
  const sales = Math.round(baseSales * (SEASONALITY[monthName] ?? 1));
  const operatingCash = Math.round(0.52 * sales) - 36_000 - 11_000 - 57_600;
  return operatingCash - (includeInventory && monthIndex === openingIndex ? 240_000 : 0);
}

export function calculateScenario(opening: Opening, funding: Funding): Scenario {
  const openingIndex = OPENING_INDEX[opening];
  const financed = funding === 'Line of credit';
  const balances: number[] = [];
  let cash = START_CASH;

  MONTHS.forEach((_, monthIndex) => {
    cash += BASELINE_FLOWS[monthIndex];
    if (monthIndex === openingIndex - 1) cash -= 480_000;
    cash += monthlyStoreCash(monthIndex, openingIndex, true);
    if (financed && monthIndex === openingIndex - 1) cash += 500_000;
    if (financed && monthIndex >= openingIndex - 1) cash -= 3_542;
    balances.push(cash);
  });

  const lowest = Math.min(...balances);
  const lowestIndex = balances.indexOf(lowest);
  const activeMonths = 12 - (openingIndex - 1);
  const interest = financed ? activeMonths * 3_542 : 0;
  let profit = 0;
  for (let monthIndex = openingIndex - 1; monthIndex < 12; monthIndex += 1) {
    profit += monthlyStoreCash(monthIndex, openingIndex, false);
  }
  profit -= interest;

  const chart = [
    { month: 'Sep 2026', scenario: START_CASH, baseline: START_CASH, low: START_CASH, high: START_CASH },
    ...balances.map((scenario, index) => {
      const spread = Math.round(40_000 * Math.sqrt(index + 1));
      return {
        month: MONTHS[index], scenario, baseline: BASELINE_BALANCES[index],
        low: scenario - spread, high: scenario + spread,
        range: [scenario - spread, scenario + spread] as [number, number],
      };
    }),
  ];

  return {
    id: `${opening.slice(0, 3).toLowerCase()}-${financed ? 'line' : 'cash'}`,
    opening,
    funding,
    balances,
    chart,
    lowest,
    lowestMonth: MONTHS[lowestIndex],
    cashCheck: lowest < POLICY_MIN ? 'fail' : lowest < CAUTION_BAND ? 'caution' : 'pass',
    profit,
    interest,
    endCash: balances[balances.length - 1],
    payback: 13,
  };
}

export const SCENARIOS: Scenario[] = (['Nov 2026', 'Jan 2027', 'Mar 2027'] as Opening[])
  .flatMap(opening => (['Cash', 'Line of credit'] as Funding[]).map(funding => calculateScenario(opening, funding)));

export const BEST_SCENARIO = SCENARIOS.find(s => s.opening === 'Nov 2026' && s.funding === 'Line of credit')!;

export function findScenario(opening: Opening, funding: Funding) {
  return SCENARIOS.find(s => s.opening === opening && s.funding === funding)!;
}
