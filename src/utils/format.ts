export function formatMoney(amount: number, unit: string = '元'): string {
  // 处理负数
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  let result: string;
  if (absAmount >= 100000000) {
    result = (absAmount / 100000000).toFixed(2) + '亿' + unit;
  } else if (absAmount >= 10000) {
    result = (absAmount / 10000).toFixed(1) + '万' + unit;
  } else {
    result = absAmount.toLocaleString('zh-CN') + unit;
  }
  
  return isNegative ? '-' + result : result;
}

export function formatMoneyShort(amount: number): string {
  // 处理负数
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  let result: string;
  if (absAmount >= 100000000) {
    result = (absAmount / 100000000).toFixed(1) + '亿';
  } else if (absAmount >= 10000) {
    result = (absAmount / 10000).toFixed(0) + '万';
  } else {
    result = absAmount.toLocaleString('zh-CN');
  }
  
  return isNegative ? '-' + result : result;
}

export function formatPercent(value: number, decimals: number = 1): string {
  // 处理负数百分比
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  return (isNegative ? '-' : '') + (absValue * 100).toFixed(decimals) + '%';
}
