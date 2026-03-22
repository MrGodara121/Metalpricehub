import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import LanguageSelector from './LanguageSelector'

export default function Header({ config }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const { locale } = router
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href={`/${locale}/`} className="text-2xl font-bold text-yellow-600">{config?.site_name}</Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link href={`/${locale}/gold-price/`} className="hover:text-yellow-600">Gold</Link>
            <Link href={`/${locale}/silver-price/`} className="hover:text-yellow-600">Silver</Link>
            <Link href={`/${locale}/platinum-price/`} className="hover:text-yellow-600">Platinum</Link>
            <Link href={`/${locale}/palladium-price/`} className="hover:text-yellow-600">Palladium</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
          </div>
        </div>
        
        {mobileOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-3">
              <Link href={`/${locale}/gold-price/`}>Gold</Link>
              <Link href={`/${locale}/silver-price/`}>Silver</Link>
              <Link href={`/${locale}/platinum-price/`}>Platinum</Link>
              <Link href={`/${locale}/palladium-price/`}>Palladium</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
          }
