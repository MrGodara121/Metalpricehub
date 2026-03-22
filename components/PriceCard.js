import Link from 'next/link'
import { useRouter } from 'next/router'
import { formatPrice, formatChange } from '../lib/utils'

export default function PriceCard({ metal, price, currency = 'USD' }) {
  const { locale } = useRouter()
  const icons = { gold: '🥇', silver: '🥈', platinum: '🥉', palladium: '⚪' }
  
  return (
    <Link href={`/${locale}/${metal.Slug}-price/`} className="block">
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
        <div className="flex justify-between items-center mb-4">
          <span className="text-4xl">{icons[metal.Name?.toLowerCase()]}</span>
          <span className="text-sm text-green-600">▲ 0.85%</span>
        </div>
        <h3 className="text-xl font-bold mb-2">{metal.Name}</h3>
        <p className="text-2xl font-bold">{price ? formatPrice(price, currency) : '--'}</p>
        <p className="text-sm text-gray-500">per ounce</p>
        {metal.Karats && metal.Karats !== 'spot' && (
          <div className="mt-4 flex justify-between text-xs text-gray-500">
            {metal.Karats.split(',').map(k => <span key={k}>{k.toUpperCase()}</span>)}
          </div>
        )}
      </div>
    </Link>
  )
}
