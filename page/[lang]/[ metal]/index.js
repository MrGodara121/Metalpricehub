import { getConfig, getMetals, getCurrencies, getContentTemplate } from '../../../lib/sheets'
import { getPrice, getAllPrices } from '../../../lib/api'
import Layout from '../../../components/Layout'
import PriceChart from '../../../components/PriceChart'
import { getKaratPrice, formatPrice } from '../../../lib/utils'
import { generateMetaTags, generateSchema } from '../../../lib/seo'

export default function MetalPage({ config, metal, price24k, karatPrices, currencies, content, metaTags, schema }) {
  return (
    <Layout config={config} title={metaTags.title} description={metaTags.description}>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">{content?.H1_Template?.replace('{metal}', metal.Name)}</h1>
        
        <div className="bg-white rounded-lg shadow p-8 text-center mb-8">
          <div className="text-6xl font-bold text-yellow-600">
            {price24k ? formatPrice(price24k, 'USD') : '--'}
          </div>
          <p className="text-gray-500 mt-2">per ounce | Live price</p>
        </div>
        
        {metal.Karats && metal.Karats !== 'spot' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {metal.Karats.split(',').map(k => (
              <div key={k} className="bg-white rounded-lg shadow p-4 text-center">
                <h3 className="font-bold">{k.toUpperCase()} {metal.Name}</h3>
                <p className="text-2xl text-yellow-600">{getKaratPrice(price24k, k)?.toFixed(2)} USD</p>
                <p className="text-sm text-gray-500">{k === '24k' ? '99.9% Pure' : k === '22k' ? '91.67% Pure' : k === '18k' ? '75% Pure' : '58.33% Pure'}</p>
              </div>
            ))}
          </div>
        )}
        
        <PriceChart metal={metal.Name?.toLowerCase()} />
      </div>
    </Layout>
  )
}

export async function getStaticProps({ params }) {
  const config = await getConfig()
  const metals = await getMetals()
  const metal = metals.find(m => m.Slug === params.metal)
  const currencies = await getCurrencies()
  const price24k = await getPrice(metal?.Name?.toLowerCase(), 'USD')
  const content = await getContentTemplate('metal_home', params.lang || 'en')
  const metaTags = await generateMetaTags('metal_home', { metal: metal?.Name }, params.lang || 'en')
  const schema = await generateSchema('metal_home', { metal: metal?.Name, price: price24k, currency: 'USD' }, {}, params.lang || 'en')
  
  return { props: { config, metal, price24k, currencies, content, metaTags, schema }, revalidate: 60 }
}

export async function getStaticPaths() {
  const languages = ['en', 'hi', 'es', 'fr', 'de', 'ar', 'zh', 'ja', 'ru', 'pt', 'it', 'tr', 'th', 'vi', 'id']
  const metals = await getMetals()
  const paths = []
  languages.forEach(lang => {
    metals.forEach(metal => {
      paths.push({ params: { lang, metal: metal.Slug } })
    })
  })
  return { paths, fallback: false }
}
