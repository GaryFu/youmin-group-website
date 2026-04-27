import { deepClone } from '../utils/deepClone'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  site as defaultSite,
  homeContent as defaultHome,
  aboutContent as defaultAbout,
  industryContent as defaultIndustry,
  innovationContent as defaultInnovation,
  productsContent as defaultProducts,
  greenContent as defaultGreen,
  newsContent as defaultNews,
  partnersContent as defaultPartners,
  contactContent as defaultContact,
} from '../data/content'

const STORAGE_KEY = 'youmin_admin_content'

const defaults = {
  site: defaultSite,
  home: defaultHome,
  about: defaultAbout,
  industry: defaultIndustry,
  innovation: defaultInnovation,
  products: defaultProducts,
  green: defaultGreen,
  news: defaultNews,
  partners: defaultPartners,
  contact: defaultContact,
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {}
  return null
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

const ContentContext = createContext(null)

export function ContentProvider({ children }) {
  const [content, setContent] = useState(() => {
    return loadFromStorage() || deepClone(defaults)
  })

  useEffect(() => {
    saveToStorage(content)
  }, [content])

  const getContent = useCallback((key) => {
    return content[key] ?? deepClone(defaults[key])
  }, [content])

  const updateContent = useCallback((key, newData) => {
    setContent((prev) => {
      const updated = { ...prev, [key]: deepClone(newData) }
      return updated
    })
  }, [])

  const resetContent = useCallback((key) => {
    setContent((prev) => {
      const updated = { ...prev, [key]: deepClone(defaults[key]) }
      return updated
    })
  }, [])

  const resetAll = useCallback(() => {
    setContent(deepClone(defaults))
  }, [])

  return (
    <ContentContext.Provider value={{ content, getContent, updateContent, resetContent, resetAll }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used within ContentProvider')
  return ctx
}
