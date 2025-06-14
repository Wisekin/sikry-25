export function formatCurrency(amount: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCompactCurrency(amount: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(amount)
}

export function formatNumber(number: number, locale = "en-US", options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(number)
}

export function formatPercentage(value: number, decimals = 1, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

export function formatCompactNumber(number: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(number)
}

export function formatRevenue(amount: number): string {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`
  } else if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`
  } else {
    return `$${amount.toFixed(0)}`
  }
}

export function formatEmployeeCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M employees`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K employees`
  } else {
    return `${count} employees`
  }
}

export function formatMarketCap(amount: number): string {
  if (amount >= 1000000000000) {
    return `$${(amount / 1000000000000).toFixed(1)}T`
  } else if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`
  } else if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  } else {
    return formatCurrency(amount)
  }
}
