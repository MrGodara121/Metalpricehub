import { getConfig, getCurrencies } from './sheets'
import { getCache, setCache } from './cache'

let config = null
let currencies = null

async function loadConfig() {
  if (!config) config = await getConfig()
  return config
}

async function loadCurrencies() {
  if (!currencies) currencies = await getCurrencies()
  return currencies
}

export async function getPrice(metal, currency = 'USD') {
  const cacheKey = `price:${metal}:${currency}`
  const cached = await getCache(cacheKey)
  if (cached) return cached
  
  const cfg = await loadConfig()
  const symbolMap = { gold: 'XAU', silver: 'XAG', platinum: 'XPT', palladium: 'XPD' }
  const symbol = `${symbolMap[metal]}/${currency}`
  
  const apis = [
    { url: `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${cfg.api_twelvedata_key}`, key: 'price' },
    { url: `https://api-v4.fcsapi.com/forex/latest?symbol=${symbol}&access_key=${cfg.api_fcs_key}`, key: 'response', subKey: 'price' },
    { url: `https://www.goldapi.io/api/${symbol}`, headers: { 'x-access-token': cfg.api_gold_key }, key: 'price' }
  ]
  
  for (const api of apis) {
    try {
      const response = await fetch(api.url, { headers: api.headers })
      const data = await response.json()
      let price = null
      if (api.subKey) price = data[api.key]?.[0]?.[api.subKey]
      else price = data[api.key]
      if (price) {
        const result = parseFloat(price)
        await setCache(cacheKey, result, 30)
        return result
      }
    } catch (e) { console.log(`API failed: ${api.url}`) }
  }
  
  throw new Error('All APIs failed')
}

export async function getAllPrices(currency = 'USD') {
  const metals = ['gold', 'silver', 'platinum', 'palladium']
  const prices = {}
  for (const metal of metals) {
    try { prices[metal] = await getPrice(metal, currency) }
    catch (e) { prices[metal] = null }
  }
  return prices
}

export async function convertCurrency(amount, from, to) {
  if (from === to) return amount
  const currencies = await loadCurrencies()
  const fromRate = currencies.find(c => c.Code === from)?.Rate_to_USD || 1
  const toRate = currencies.find(c => c.Code === to)?.Rate_to_USD || 1
  return amount * (toRate / fromRate)
}
