import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { VALIDATION, LIMITS } from "./constants"

/* ---------- css class merge ------------------------------------------------ */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* ---------- validators ----------------------------------------------------- */
export const validators = {
  email: (email: string): boolean => VALIDATION.email.test(email.trim()),

  url: (raw: string): boolean => {
    try {
      // valida URL absoluta/relativa e regex adicional
      new URL(raw)
      return VALIDATION.url.test(raw)
    } catch {
      return false
    }
  },

  github: (url: string): boolean => VALIDATION.github.test(url),
  linkedin: (url: string): boolean => VALIDATION.linkedin.test(url),

  imageSize: (size: number): boolean => size <= LIMITS.maxImageSize,
  textLength: (text: string, max: number): boolean => text.length <= max,
}

/* ---------- formatters ----------------------------------------------------- */
export const formatters = {
  date: (date: string | Date): string => new Date(date).toLocaleDateString("pt-BR"),

  dateTime: (date: string | Date): string => new Date(date).toLocaleString("pt-BR"),

  fileSize: (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const value = bytes / Math.pow(1024, i)
    return `${Math.round(value * 100) / 100} ${sizes[i]}`
  },

  truncate: (text: string, len: number): string => (text.length > len ? `${text.slice(0, len)}…` : text),

  capitalize: (text: string): string => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(),
}

/* ---------- security helpers ---------------------------------------------- */
export const security = {
  sanitizeHtml: (html: string): string => {
    const div = document.createElement("div")
    div.textContent = html
    return div.innerHTML
  },

  generateId: (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,

  validateImageType: (file: File): boolean => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    return allowed.includes(file.type)
  },
}

/* ---------- performance helpers ------------------------------------------- */
export const performance = {
  debounce<T extends (...args: any[]) => void>(fn: T, wait: number): (...args: Parameters<T>) => void {
    let t: ReturnType<typeof setTimeout> | null = null
    return (...args) => {
      if (t) clearTimeout(t)
      t = setTimeout(() => fn(...args), wait)
    }
  },

  throttle<T extends (...args: any[]) => void>(fn: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle = false
    return (...args) => {
      if (!inThrottle) {
        fn(...args)
        inThrottle = true
        setTimeout(() => {
          inThrottle = false
        }, limit)
      }
    }
  },
}

/* ---------- localStorage helpers ------------------------------------------ */
export const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : fallback
    } catch (err) {
      console.error(`localStorage.get "${key}":`, err)
      return fallback
    }
  },

  set<T>(key: string, value: T): boolean {
    if (typeof window === "undefined") return false
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (err) {
      console.error(`localStorage.set "${key}":`, err)
      return false
    }
  },

  remove(key: string): boolean {
    if (typeof window === "undefined") return false
    try {
      localStorage.removeItem(key)
      return true
    } catch (err) {
      console.error(`localStorage.remove "${key}":`, err)
      return false
    }
  },
}
