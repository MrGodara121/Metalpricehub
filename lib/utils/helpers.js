export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return '--'
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

export function formatPercentage(num) {
  if (num === null || num === undefined) return '--'
  const sign = num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(2)}%`
}

export function formatDate(date, format = 'MMM DD, YYYY') {
  const d = new Date(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  return format
    .replace('MMM', months[d.getMonth()])
    .replace('DD', d.getDate().toString().padStart(2, '0'))
    .replace('YYYY', d.getFullYear())
    .replace('HH', d.getHours().toString().padStart(2, '0'))
    .replace('MM', d.getMinutes().toString().padStart(2, '0'))
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export function formatPrice(price, currency = 'USD', decimals = 2) {
  if (price === null || price === undefined) return '--'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(price)
}

export function formatChange(change) {
  if (change === null || change === undefined) return '--'
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

export function getKaratPrice(price24k, karat) {
  const multipliers = { '24k': 1, '22k': 0.9167, '18k': 0.75, '14k': 0.5833 }
  return price24k * (multipliers[karat?.toLowerCase()] || 1)
}
