export function isValidEmail(email) {
  const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/
  return re.test(email)
}

export function isValidPhone(phone) {
  const re = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{4}$/
  return re.test(phone)
}

export function isValidPrice(price) {
  return price && !isNaN(price) && price > 0
}

export function isValidWeight(weight) {
  return weight && !isNaN(weight) && weight > 0 && weight <= 100000
}

export function isValidKarat(karat) {
  return ['24k', '22k', '18k', '14k'].includes(karat?.toLowerCase())
}

export function isValidCurrency(currency) {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'AED', 'SGD']
  return validCurrencies.includes(currency?.toUpperCase())
}

export function isValidMetal(metal) {
  return ['gold', 'silver', 'platinum', 'palladium'].includes(metal?.toLowerCase())
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

export function validateAlertData(data) {
  const errors = []
  
  if (!isValidMetal(data.metal)) errors.push('Invalid metal')
  if (!isValidKarat(data.karat)) errors.push('Invalid karat')
  if (!isValidPrice(data.targetPrice)) errors.push('Invalid target price')
  if (!isValidCurrency(data.currency)) errors.push('Invalid currency')
  if (data.email && !isValidEmail(data.email)) errors.push('Invalid email')
  if (data.phone && !isValidPhone(data.phone)) errors.push('Invalid phone number')
  
  return { isValid: errors.length === 0, errors }
}
