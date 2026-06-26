export function formatMoney(amount: number, unit: string = '元'): string {
  if (amount >= 100000000) {
    return (amount / 100000000).toFixed(2) + '亿' + unit;
  }
  if (amount >= 10000) {
    return (amount / 10000).toFixed(1) + '万' + unit;
  }
  return amount.toLocaleString('zh-CN') + unit;
}

export function formatMoneyShort(amount: number): string {
  if (amount >= 100000000) {
    return (amount / 100000000).toFixed(1) + '亿';
  }
  if (amount >= 10000) {
    return (amount / 10000).toFixed(0) + '万';
  }
  return amount.toLocaleString('zh-CN');
}

export function formatPercent(value: number, decimals: number = 1): string {
  return (value * 100).toFixed(decimals) + '%';
}
