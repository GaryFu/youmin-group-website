import { deepClone } from '../utils/deepClone'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { get as apiGet, put as apiPut } from '../lib/api'
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
  cultureContent as defaultCulture,
  contactContent as defaultContact,
} from '../data/content'

const defaults = {
  site: defaultSite,
  home: defaultHome,
  about: defaultAbout,
  culture: defaultCulture,
  industry: defaultIndustry,
  innovation: defaultInnovation,
  products: defaultProducts,
  green: defaultGreen,
  news: defaultNews,
  partners: defaultPartners,
  contact: defaultContact,
}

const ALL_KEYS = Object.keys(defaults)

function isAdmin() {
  return window.location.pathname.startsWith('/admin')
}

const ContentContext = createContext(null)

export function ContentProvider({ children }) {
  const [content, setContent] = useState(null)

  // Load content on mount
  useEffect(() => {
    if (isAdmin()) {
      // Admin: always load from API for real-time editing
      loadFromAPI()
    } else {
      // Public: load static content.json first (instant), fall back to API
      loadStatic()
    }
  }, [])

  async function loadStatic() {
    try {
      // Cache-bust to avoid stale CDN/browser cache after redeploy
      const res = await fetch(`/content.json?t=${Date.now()}`)
      if (!res.ok) throw new Error('not found')
      const data = await res.json()
      // Merge with defaults for any missing keys
      const merged = { ...deepClone(defaults) }
      for (const key of ALL_KEYS) {
        if (data[key]) merged[key] = data[key]
      }
      setContent(merged)
    } catch {
      // Fall back to API if content.json not available (dev mode)
      loadFromAPI()
    }
  }

  async function loadFromAPI() {
    const map = {}
    // Fetch sequentially to avoid overwhelming the serverless DB pool
    for (const key of ALL_KEYS) {
      try {
        const d = await apiGet(`/content/${key}`)
        map[key] = d.data
      } catch {
        map[key] = deepClone(defaults[key])
      }
    }
    setContent(map)
  }

  const getContent = useCallback(
    (key) => {
      if (content && content[key]) return content[key]
      return deepClone(defaults[key])
    },
    [content]
  )

  const updateContent = useCallback(async (key, newData) => {
    const cloned = deepClone(newData)
    setContent((prev) => {
      if (!prev) return prev
      return { ...prev, [key]: cloned }
    })
    try {
      await apiPut(`/content/${key}`, { data: cloned })
    } catch {
      const res = await apiGet(`/content/${key}`).catch(() => ({ data: deepClone(defaults[key]) }))
      setContent((prev) => {
        if (!prev) return prev
        return { ...prev, [key]: res.data }
      })
      throw new Error('保存失败，已恢复')
    }
  }, [])

  const resetContent = useCallback(async (key) => {
    const defaultData = deepClone(defaults[key])
    await apiPut(`/content/${key}`, { data: defaultData })
    setContent((prev) => {
      if (!prev) return prev
      return { ...prev, [key]: defaultData }
    })
  }, [])

  const resetAll = useCallback(async () => {
    const cloned = deepClone(defaults)
    await Promise.all(
      ALL_KEYS.map((key) => apiPut(`/content/${key}`, { data: cloned[key] }))
    )
    setContent(cloned)
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
