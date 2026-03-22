import { getConfig, getMetals, getCountries, getCitiesForIndexing } from '../lib/sheets'

export async function getServerSideProps({ res }) {
  const config = await getConfig()
  const metals = await getMetals()
  const countries = await getCountries()
  const cities = await getCitiesForIndexing()
  
  const urls = []
  
  // Homepage
  urls.push({ loc: `${config.site_url}/`, priority: 1.0, changefreq: 'daily' })
  
  // Metal pages
  metals.forEach(metal => {
    urls.push({ loc: `${config.site_url}/${metal.Slug}-price/`, priority: 1.0, changefreq: 'hourly' })
    if (metal.Karats && metal.Karats !== 'spot') {
      metal.Karats.split(',').forEach(k => {
        urls.push({ loc: `${config.site_url}/${metal.Slug}-price/${k}/`, priority: 0.9, changefreq: 'hourly' })
      })
    }
  })
  
  // Country pages
  countries.forEach(country => {
    urls.push({ loc: `${config.site_url}/gold-price/${country.Slug}/`, priority: 0.8, changefreq: 'weekly' })
  })
  
  // City pages (only indexed ones)
  cities.forEach(city => {
    urls.push({ loc: `${config.site_url}/gold-price/${city.Country}/${city.State}/${city.Slug}/`, priority: city.SEO_Priority / 100, changefreq: 'weekly' })
  })
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(url => `
      <url>
        <loc>${url.loc}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
      </url>
    `).join('')}
  </urlset>`
  
  res.setHeader('Content-Type', 'text/xml')
  res.write(sitemap)
  res.end()
  
  return { props: {} }
}

export default function Sitemap() {}
