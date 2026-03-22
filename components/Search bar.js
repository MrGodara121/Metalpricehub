import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { getSearchSuggestions } from '../lib/sheets'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const inputRef = useRef(null)
  const { locale } = router

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 1) {
        fetchSuggestions()
      } else {
        setSuggestions([])
      }
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [query])

  const fetchSuggestions = async () => {
    const data = await getSearchSuggestions(query)
    setSuggestions(data)
    setIsOpen(true)
  }

  const handleSearch = (suggestion) => {
    if (suggestion) {
      if (suggestion.Type === 'city') {
        router.push(`/${locale}/gold-price/${suggestion.Country}/${suggestion.State}/${suggestion.Slug}/`)
      } else if (suggestion.Type === 'metal') {
        router.push(`/${locale}/${suggestion.Slug}-price/`)
      } else if (suggestion.Type === 'karat') {
        router.push(`/${locale}/gold-price/${suggestion.Slug}/`)
      }
    } else if (query) {
      router.push(`/${locale}/search?q=${encodeURIComponent(query)}`)
    }
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={locale === 'hi' ? 'खोजें... मुंबई, दिल्ली, 24K सोना, चांदी...' : 'Search... Mumbai, Delhi, 24K Gold, Silver...'}
          className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:border-yellow-500"
        />
        <button
          onClick={() => handleSearch()}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-yellow-600 text-white px-6 py-2 rounded-full hover:bg-yellow-700"
        >
          🔍
        </button>
      </div>
      
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-2 z-50 max-h-96 overflow-y-auto">
          {suggestions.map(s => (
            <button
              key={s.Suggestion_ID}
              onClick={() => handleSearch(s)}
              className="block w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-0"
            >
              <div className="font-semibold">{locale === 'hi' ? s.Keyword_HI : s.Keyword_EN}</div>
              <div className="text-xs text-gray-500">
                {s.Type === 'city' ? '📍 City' : s.Type === 'metal' ? '🥇 Metal' : '💎 Karat'}
              </div>
            </button>
          ))}
        </div>
      )}
      
      <div className="mt-2 flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-gray-500">Popular:</span>
        <button onClick={() => { setQuery('Mumbai Gold Price'); handleSearch(); }} className="text-xs text-yellow-600 hover:underline">Mumbai</button>
        <button onClick={() => { setQuery('Delhi Gold Price'); handleSearch(); }} className="text-xs text-yellow-600 hover:underline">Delhi</button>
        <button onClick={() => { setQuery('New York Gold Price'); handleSearch(); }} className="text-xs text-yellow-600 hover:underline">New York</button>
        <button onClick={() => { setQuery('24K Gold Price'); handleSearch(); }} className="text-xs text-yellow-600 hover:underline">24K Gold</button>
        <button onClick={() => { setQuery('22K Gold Price'); handleSearch(); }} className="text-xs text-yellow-600 hover:underline">22K Gold</button>
        <button onClick={() => { setQuery('Silver Price'); handleSearch(); }} className="text-xs text-yellow-600 hover:underline">Silver</button>
      </div>
    </div>
  )
        }
