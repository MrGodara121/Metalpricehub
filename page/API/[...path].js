import { getConfig, getMetals, getCountries, getCities, getCurrencies, getFAQs, getSearchSuggestions } from '../../lib/sheets'
import { getPrice, getAllPrices, convertCurrency } from '../../lib/api'

export default async function handler(req, res) {
  const { path } = req.query
  const endpoint = path?.[0] || ''
  
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')
  
  try {
    switch (endpoint) {
      case 'config': res.json(await getConfig()); break
      case 'metals': res.json(await getMetals()); break
      case 'countries': res.json(await getCountries()); break
      case 'cities': res.json(await getCities(req.query.country, req.query.state)); break
      case 'currencies': res.json(await getCurrencies()); break
      case 'faqs': res.json(await getFAQs(req.query.category)); break
      case 'suggestions': res.json(await getSearchSuggestions(req.query.q)); break
      case 'price':
        const { metal, currency = 'USD' } = req.query
        const price = await getPrice(metal, currency)
        res.json({ metal, currency, price, timestamp: new Date().toISOString() })
        break
      case 'prices':
        const prices = await getAllPrices(req.query.currency || 'USD')
        res.json(prices)
        break
      case 'convert':
        const { amount, from, to } = req.query
        const converted = await convertCurrency(parseFloat(amount), from, to)
        res.json({ amount: parseFloat(amount), from, to, result: converted })
        break
      default: res.status(404).json({ error: 'Endpoint not found' })
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: error.message })
  }
}
