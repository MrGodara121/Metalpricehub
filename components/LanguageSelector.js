import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { getLanguages } from '../lib/sheets'

export default function LanguageSelector() {
  const router = useRouter()
  const { pathname, asPath, query, locale } = router
  const [languages, setLanguages] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadLanguages()
  }, [])

  const loadLanguages = async () => {
    const data = await getLanguages()
    setLanguages(data.filter(l => l.Is_Active === 'TRUE'))
  }

  const changeLanguage = (langCode) => {
    router.push({ pathname, query }, asPath, { locale: langCode })
    setIsOpen(false)
  }

  const currentLang = languages.find(l => l.Code === locale) || { Name: 'English', Flag: '🇺🇸' }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100"
      >
        <span>{currentLang.Flag}</span>
        <span>{currentLang.Name}</span>
        <span>▼</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {languages.map(lang => (
            <button
              key={lang.Code}
              onClick={() => changeLanguage(lang.Code)}
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${locale === lang.Code ? 'bg-yellow-50 text-yellow-600' : ''}`}
            >
              <span className="mr-2">{lang.Flag}</span>
              {lang.Native_Name} ({lang.Name})
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
