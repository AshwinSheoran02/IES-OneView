export const money = (value: number) => {
  const sign = value < 0 ? '−' : '';
  const n = Math.abs(value);
  if (n >= 1_000_000) return `${sign}$${(n / 1_000_000).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}M`;
  if (n >= 100_000) return `${sign}$${Math.round(n / 1_000)}K`;
  if (n >= 1_000) {
    const k = n / 1_000;
    return `${sign}$${Number.isInteger(k) ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `${sign}$${n.toLocaleString('en-US')}`;
};

export const exactMoney = (value: number) => `$${value.toLocaleString('en-US')}`;
export const openingShort = (opening: string) => opening.replace(' 20', ' ');
