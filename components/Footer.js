import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Footer({ config }) {
  const { locale } = useRouter()
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-white text-lg font-bold mb-4">{config?.site_name}</h3>
            <p className="text-sm">{config?.site_description}</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Metals</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/gold-price/`}>Gold Price</Link></li>
              <li><Link href={`/${locale}/silver-price/`}>Silver Price</Link></li>
              <li><Link href={`/${locale}/platinum-price/`}>Platinum Price</Link></li>
              <li><Link href={`/${locale}/palladium-price/`}>Palladium Price</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Tools</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/tools/calculator`}>Gold Calculator</Link></li>
              <li><Link href={`/${locale}/tools/alerts`}>Price Alerts</Link></li>
              <li><Link href={`/${locale}/tools/currency-converter`}>Currency Converter</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/about`}>About</Link></li>
              <li><Link href={`/${locale}/contact`}>Contact</Link></li>
              <li><Link href={`/${locale}/privacy`}>Privacy</Link></li>
              <li><Link href={`/${locale}/terms`}>Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© {currentYear} {config?.site_name} — Global Precious Metals Price Authority</p>
          <p className="mt-1 text-gray-500">Data Sources: COMEX, LME, LBMA, SHFE | Updated every {config?.price_update_interval}s</p>
        </div>
      </div>
    </footer>
  )
  }
