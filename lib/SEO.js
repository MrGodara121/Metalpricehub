import { getConfig, getMetals, getCountries, getCitiesForIndexing, getInternalLinks } from './sheets'

export async function generateMetaTags(pageType, params, language = 'en') {
  const config = await getConfig()
  
  let title = config.site_name
  let description = config.site_description
  let canonical = `${config.site_url}/${language}`
  
  if (pageType === 'metal_home') {
    const metal = params.metal
    title = `${metal.toUpperCase()} Price Today | ${config.site_name}`
    description = `Live ${metal} price in all currencies. Real-time updates, charts, alerts.`
    canonical = `${config.site_url}/${language}/${metal}-price/`
  }
  
  if (pageType === 'city_page') {
    const { metal, city, state, country } = params
    title = `${metal.toUpperCase()} Price in ${city}, ${state} | Live Rates`
    description = `Live ${metal} price in ${city}, ${state}, ${country}. 24K, 22K, 18K, 14K rates. Find best jewelers.`
    canonical = `${config.site_url}/${language}/${metal}-price/${country}/${state}/${city}/`
  }
  
  if (pageType === 'karat_page') {
    const { metal, karat } = params
    const purity = { '24k': '99.9%', '22k': '91.67%', '18k': '75%', '14k': '58.33%' }[karat]
    title = `${karat.toUpperCase()} ${metal.toUpperCase()} Price Today`
    description = `${karat.toUpperCase()} ${metal} price. ${purity} pure. Real-time rates in all currencies.`
    canonical = `${config.site_url}/${language}/${metal}-price/${karat}/`
  }
  
  return { title, description, canonical }
}

export async function generateSchema(pageType, params, data, language = 'en') {
  const config = await getConfig()
  
  if (pageType === 'city_page') {
    const { city, state, country, price24k, currency, jewelers } = params
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": `${city} Gold Price`,
      "description": `Live gold price in ${city}, ${state}, ${country}.`,
      "url": `${config.site_url}/${language}/gold-price/${country}/${state}/${city}/`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": city,
        "addressRegion": state,
        "addressCountry": country
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": data.latitude,
        "longitude": data.longitude
      },
      "priceRange": `${price24k * 0.9167} - ${price24k} ${currency}`,
      "openingHours": "Mo-Su 00:00-23:59"
    }
  }
  
  if (pageType === 'metal_home') {
    const { metal, price, currency } = params
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": `${metal} Price`,
      "description": `Live ${metal} price in ${currency}`,
      "offers": {
        "@type": "Offer",
        "price": price,
        "priceCurrency": currency,
        "availability": "https://schema.org/OnlineOnly"
      }
    }
  }
  
  return null
}

export async function generateBreadcrumb(items, language = 'en') {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }
}

export async function getRobotsConfig() {
  const config = await getConfig()
  const indexedCities = await getCitiesForIndexing()
  
  return `User-agent: *
Allow: /
Allow: /*/gold-price/
Allow: /*/silver-price/
Allow: /*/platinum-price/
Allow: /*/palladium-price/
Disallow: /api/
Disallow: /admin/

Sitemap: ${config.site_url}/sitemap.xml
Sitemap: ${config.site_url}/sitemap-cities.xml

# Index control for cities
${indexedCities.map(city => `Allow: /${city.Country}/${city.State}/${city.Slug}/`).join('\n')}

Host: ${config.site_url}
Crawl-delay: 5`
}
