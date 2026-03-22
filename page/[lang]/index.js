import { getConfig, getMetals, getCurrencies, getCities, getContentTemplate } from '../../lib/sheets'
import { getAllPrices } from '../../lib/api'
import Layout from '../../components/Layout'
import LanguageSelector from '../../components/LanguageSelector'
import SearchBar from '../../components/SearchBar'
import PriceCard from '../../components/PriceCard'
import CitySelector from '../../components/CitySelector'

export default function Home({ config, metals, prices, currencies, cities, content }) {
  return (
    <Layout config={config} title={content?.Title_Template?.replace('{site_name}', config.site_name)}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-4">{config.site_name}</h1>
        <p className="text-xl text-center text-gray-600 mb-8">{config.site_description}</p>
        
        <SearchBar />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {metals.map(metal => (
            <PriceCard key={metal.Metal_ID} metal={metal} price={prices[metal.Name?.toLowerCase()]} currency="USD" />
          ))}
        </div>
        
        <CitySelector />
      </div>
    </Layout>
  )
}

export async function getStaticProps({ params }) {
  const config = await getConfig()
  const metals = await getMetals()
  const currencies = await getCurrencies()
  const cities = await getCities()
  const prices = await getAllPrices('USD')
  const content = await getContentTemplate('homepage', params.lang || 'en')
  
  return { props: { config, metals, prices, currencies, cities, content }, revalidate: 60 }
}

export async function getStaticPaths() {
  const languages = ['en', 'hi', 'es', 'fr', 'de', 'ar', 'zh', 'ja', 'ru', 'pt', 'it', 'tr', 'th', 'vi', 'id']
  const paths = languages.map(lang => ({ params: { lang } }))
  return { paths, fallback: false }
}
