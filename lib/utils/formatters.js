export function formatPrice(price, currency = 'USD', decimals = 2) {
  if (price === null || price === undefined) return '--'
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  
  return formatter.format(price)
}

export function formatChange(change, decimals = 2) {
  if (change === null || change === undefined) return '--'
  
  const sign = change >= 0 ? '+' : ''
  const formatted = change.toFixed(decimals)
  
  return `${sign}${formatted}%`
}

export function formatWeight(weight, unit = 'gram') {
  if (weight === null || weight === undefined) return '--'
  
  if (unit === 'gram') {
    return `${weight.toFixed(2)} g`
  } else {
    return `${weight.toFixed(4)} oz`
  }
}

export function formatTimestamp(timestamp) {
  if (!timestamp) return '--'
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  
  if (diffSec < 60) return `${diffSec} seconds ago`
  if (diffMin < 60) return `${diffMin} minutes ago`
  if (diffHour < 24) return `${diffHour} hours ago`
  
  return date.toLocaleDateString()
}

export function formatLargeNumber(num) {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}

export function truncateText(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
