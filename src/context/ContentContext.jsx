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

const ContentContext = createContext(null)

export function ContentProvider({ children }) {
  const [content, setContent] = useState(null)

  // Load all content from API on mount
  useEffect(() => {
    Promise.all(
      ALL_KEYS.map((key) =>
        apiGet(`/content/${key}`)
          .then((d) => ({ key, data: d.data }))
          .catch(() => ({ key, data: deepClone(defaults[key]) }))
      )
    ).then((results) => {
      const map = {}
      results.forEach(({ key, data }) => {
        map[key] = data
      })
      setContent(map)
    })
  }, [])

  const getContent = useCallback(
    (key) => {
      if (content && content[key]) return content[key]
      return deepClone(defaults[key])
    },
    [content]
  )

  const updateContent = useCallback(async (key, newData) => {
    const cloned = deepClone(newData)
    // Optimistic update
    setContent((prev) => {
      if (!prev) return prev
      return { ...prev, [key]: cloned }
    })
    // Persist to server
    try {
      await apiPut(`/content/${key}`, { data: cloned })
    } catch {
      // Revert on failure — reload from server
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
