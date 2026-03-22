import { getConfig, getCityBySlug, getJewelers, getInternalLinks, getContentTemplate } from '../../../../lib/sheets'
import { getPrice, convertCurrency } from '../../../../lib/api'
import Layout from '../../../../components/Layout'
import Link from 'next/link'
import { formatPrice, getKaratPrice } from '../../../../lib/utils'
import { generateMetaTags, generateSchema, generateBreadcrumb } from '../../../../lib/seo'

export default function CityPage({ config, metal, city, price24k, jewelers, internalLinks, content, metaTags, schema, breadcrumb }) {
  const karatPrices = {
    '24K': price24k,
    '22K': price24k * 0.9167,
    '18K': price24k * 0.75,
    '14K': price24k * 0.5833
  }
  
  return (
    <Layout config={config} title={metaTags.title} description={metaTags.description}>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      
      <div className="container mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href={`/${config.default_language}/`}>Home</Link> &gt;
          <Link href={`/${config.default_language}/${metal.Slug}-price/`}> {metal.Name} Price</Link> &gt;
          <Link href={`/${config.default_language}/${metal.Slug}-price/${city.Country}/`}> {city.Country}</Link> &gt;
          <Link href={`/${config.default_language}/${metal.Slug}-price/${city.Country}/${city.State}/`}> {city.State}</Link> &gt;
          <span> {city.Name}</span>
        </nav>
        
        <h1 className="text-4xl font-bold mb-2">{content?.H1_Template?.replace('{metal}', metal.Name).replace('{city}', city.Name)}</h1>
        <p className="text-gray-600 mb-8">{content?.Meta_Desc_Template?.replace('{city}', city.Name).replace('{metal}', metal.Name)}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <h3 className="font-bold">24K {metal.Name}</h3>
            <p className="text-2xl text-yellow-600">{formatPrice(karatPrices['24K'], city.Currency)}</p>
            <p className="text-sm">per ounce | 99.9% pure</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <h3 className="font-bold">22K {metal.Name}</h3>
            <p className="text-2xl text-yellow-600">{formatPrice(karatPrices['22K'], city.Currency)}</p>
            <p className="text-sm">per ounce | 91.67% pure</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <h3 className="font-bold">18K {metal.Name}</h3>
            <p className="text-2xl text-yellow-600">{formatPrice(karatPrices['18K'], city.Currency)}</p>
            <p className="text-sm">per ounce | 75% pure</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <h3 className="font-bold">14K {metal.Name}</h3>
            <p className="text-2xl text-yellow-600">{formatPrice(karatPrices['14K'], city.Currency)}</p>
            <p className="text-sm">per ounce | 58.33% pure</p>
          </div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Gold Market in {city.Name}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><h3 className="font-semibold">Local Tax Rate</h3><p>{city.Tax_Rate}% on gold value</p></div>
            <div><h3 className="font-semibold">Making Charges</h3><p>{city.Making_Charge}% of gold value</p></div>
            <div><h3 className="font-semibold">Top Jewelers</h3><p>{city.Top_Jewelers}</p></div>
            <div><h3 className="font-semibold">Best Time to Buy</h3><p>Festive seasons, wedding months</p></div>
          </div>
        </div>
        
        {jewelers.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Top Jewelers in {city.Name}</h2>
            {jewelers.map(j => (
              <div key={j.ID} className="border rounded-lg p-4 mb-3">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold">{j.Name}</h3>
                    <p className="text-gray-600 text-sm">{j.Address}</p>
                    <p className="text-gray-500 text-sm">📞 {j.Phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-yellow-500">⭐ {j.Rating}</span>
                    <p className="text-sm text-gray-500">{j.Reviews} reviews</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {internalLinks.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Gold Price in Nearby Cities</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {internalLinks.slice(0, 10).map(link => (
                <Link key={link.Link_ID} href={link.Target_URL} className="p-2 bg-gray-100 rounded text-center hover:bg-yellow-100">
                  {link.Link_Text_EN}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export async function getStaticPaths() {
  const languages = ['en', 'hi', 'es', 'fr', 'de', 'ar', 'zh', 'ja', 'ru', 'pt', 'it', 'tr', 'th', 'vi', 'id']
  const cities = await getCities()
  const paths = []
  languages.forEach(lang => {
    cities.forEach(city => {
      paths.push({ params: { lang, metal: 'gold', country: city.Country, state: city.State, city: city.Slug } })
    })
  })
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const config = await getConfig()
  const metals = await getMetals()
  const metal = metals.find(m => m.Slug === params.metal)
  const city = await getCityBySlug(params.country, params.state, params.city)
  if (!city) return { notFound: true }
  
  const price24k = await getPrice('gold', city.Currency)
  const jewelers = await getJewelers(city.City_ID)
  const internalLinks = await getInternalLinks(`/city/${city.Slug}`)
  const content = await getContentTemplate('city_page', params.lang || 'en')
  const metaTags = await generateMetaTags('city_page', { metal: metal.Name, city: city.Name, state: city.State, country: city.Country }, params.lang || 'en')
  const schema = await generateSchema('city_page', { city: city.Name, state: city.State, country: city.Country, price24k, currency: city.Currency, jewelers }, city, params.lang || 'en')
  const breadcrumb = await generateBreadcrumb([
    { name: 'Home', url: `/${params.lang}/` },
    { name: `${metal.Name} Price`, url: `/${params.lang}/${metal.Slug}-price/` },
    { name: city.Country, url: `/${params.lang}/${metal.Slug}-price/${city.Country}/` },
    { name: city.State, url: `/${params.lang}/${metal.Slug}-price/${city.Country}/${city.State}/` },
    { name: city.Name, url: `/${params.lang}/${metal.Slug}-price/${city.Country}/${city.State}/${city.Slug}/` }
  ], params.lang || 'en')
  
  return { props: { config, metal, city, price24k, jewelers, internalLinks, content, metaTags, schema, breadcrumb }, revalidate: 3600 }
  }
