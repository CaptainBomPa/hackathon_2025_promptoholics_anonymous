export const pln = (n, opts = {}) =>
    new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0, ...opts }).format(n)

export const pct = (n, digits = 1) =>
    `${Number(n).toFixed(digits)}%`
