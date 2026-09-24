from dataclasses import dataclass
from math import sqrt

MONTHS = [
    "Oct 2026", "Nov 2026", "Dec 2026", "Jan 2027", "Feb 2027", "Mar 2027",
    "Apr 2027", "May 2027", "Jun 2027", "Jul 2027", "Aug 2027", "Sep 2027",
]
START_CASH = 2_940_000
POLICY_MIN = 1_500_000
CAUTION_BAND = 1_650_000
BASELINE_FLOWS = [-640_000, -180_000, 720_000, 260_000, -120_000, 60_000, 90_000, 40_000, -80_000, 50_000, -150_000, 110_000]
OPENING_INDEX = {"Nov 2026": 1, "Jan 2027": 3, "Mar 2027": 5}
SEASONALITY = {"Nov": 1.2, "Dec": 1.6, "Jan": 0.8, "Feb": 0.85}
SALES_RAMP = [150_000, 230_000, 290_000]


@dataclass
class Scenario:
    opening: str
    funding: str
    balances: list[int]
    lowest: int
    lowest_month: str
    cash_check: str
    profit: int
    interest: int
    end_cash: int
    payback: int
    range_band: list[tuple[int, int]]


def store_cash(month_index: int, opening_index: int, include_inventory: bool) -> int:
    if month_index == opening_index - 1:
        return -36_000
    if month_index < opening_index:
        return 0
    months_open = month_index - opening_index
    base_sales = SALES_RAMP[months_open] if months_open < 3 else 330_000
    sales = round(base_sales * SEASONALITY.get(MONTHS[month_index][:3], 1))
    operating_cash = round(0.52 * sales) - 36_000 - 11_000 - 57_600
    return operating_cash - (240_000 if include_inventory and month_index == opening_index else 0)


def calculate(opening: str, funding: str) -> Scenario:
    opening_index = OPENING_INDEX[opening]
    financed = funding == "Line of credit"
    cash = START_CASH
    balances = []
    for index, baseline_flow in enumerate(BASELINE_FLOWS):
        cash += baseline_flow
        if index == opening_index - 1:
            cash -= 480_000
        cash += store_cash(index, opening_index, True)
        if financed and index == opening_index - 1:
            cash += 500_000
        if financed and index >= opening_index - 1:
            cash -= 3_542
        balances.append(cash)

    lowest = min(balances)
    active_months = 12 - (opening_index - 1)
    interest = active_months * 3_542 if financed else 0
    profit = sum(store_cash(index, opening_index, False) for index in range(opening_index - 1, 12)) - interest
    return Scenario(
        opening=opening,
        funding=funding,
        balances=balances,
        lowest=lowest,
        lowest_month=MONTHS[balances.index(lowest)],
        cash_check="fail" if lowest < POLICY_MIN else "caution" if lowest < CAUTION_BAND else "pass",
        profit=profit,
        interest=interest,
        end_cash=balances[-1],
        payback=13,
        range_band=[(value - round(40_000 * sqrt(index + 1)), value + round(40_000 * sqrt(index + 1))) for index, value in enumerate(balances)],
    )


if __name__ == "__main__":
    for opening in OPENING_INDEX:
        for funding in ("Cash", "Line of credit"):
            print(calculate(opening, funding))
