import { google } from 'googleapis'

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
})

const sheets = google.sheets({ version: 'v4', auth })
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID

let cache = {}
let cacheTime = {}

async function getSheetData(sheetName, refresh = false) {
  const now = Date.now()
  if (!refresh && cache[sheetName] && cacheTime[sheetName] > now - 300000) {
    return cache[sheetName]
  }
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`
  })
  
  const rows = response.data.values || []
  if (rows.length === 0) return []
  
  const headers = rows[0]
  const data = rows.slice(1).map(row => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = row[i] || '' })
    return obj
  }).filter(row => row.Is_Active !== 'FALSE')
  
  cache[sheetName] = data
  cacheTime[sheetName] = now
  return data
}

// Config
export async function getConfig() {
  const data = await getSheetData('config')
  const config = {}
  data.forEach(item => { config[item.Key] = item.Value })
  return config
}

// Languages
export async function getLanguages() {
  return await getSheetData('languages')
}

// Metals
export async function getMetals() {
  return await getSheetData('metals')
}

// Countries
export async function getCountries() {
  return await getSheetData('countries')
}

// States
export async function getStates(countryCode = null) {
  const states = await getSheetData('states')
  if (countryCode) return states.filter(s => s.Country_Code === countryCode)
  return states
}

// Cities — with SEO control
export async function getCities(country = null, state = null, limit = null) {
  let cities = await getSheetData('cities')
  if (country) cities = cities.filter(c => c.Country === country)
  if (state) cities = cities.filter(c => c.State === state)
  if (limit) cities = cities.slice(0, limit)
  return cities
}

export async function getCityBySlug(country, state, slug) {
  const cities = await getCities()
  return cities.find(c => 
    c.Country === country && 
    c.State === state && 
    c.Slug === slug
  )
}

export async function getCitiesForIndexing() {
  const cities = await getCities()
  return cities.filter(c => c.Index_Status === 'index')
}

// Currencies
export async function getCurrencies() {
  return await getSheetData('currencies')
}

// Jewelers
export async function getJewelers(cityId) {
  const jewelers = await getSheetData('jewelers')
  return jewelers.filter(j => j.City_ID === cityId).slice(0, 10)
}

// Internal Links
export async function getInternalLinks(sourcePattern = null) {
  const links = await getSheetData('internal_links')
  if (sourcePattern) return links.filter(l => sourcePattern.includes(l.Source_Pattern))
  return links
}

// FAQs
export async function getFAQs(category = null) {
  const faqs = await getSheetData('faqs')
  if (category) return faqs.filter(f => f.Category === category)
  return faqs
}

// Search Suggestions
export async function getSearchSuggestions(query = null) {
  const suggestions = await getSheetData('search_suggestions')
  if (query) {
    return suggestions.filter(s => 
      s.Keyword_EN.toLowerCase().includes(query.toLowerCase()) ||
      s.Keyword_HI.includes(query)
    ).slice(0, 10)
  }
  return suggestions
}

// Content Template
export async function getContentTemplate(pageType, language = 'en') {
  const templates = await getSheetData('content_templates')
  return templates.find(t => t.Page_Type === pageType && t.Language === language)
}

// Refresh cache
export function refreshCache(sheetName) {
  delete cache[sheetName]
  delete cacheTime[sheetName]
}
