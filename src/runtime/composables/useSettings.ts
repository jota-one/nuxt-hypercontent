import { useRuntimeConfig, useRoute, useState, ref, useFetch, computed } from '#imports'

export interface Lang {
  id: number
  code: string
  label: string
  is_default: boolean
  sort: number
}

export interface Settings {
  langs: Lang[]
}

export const useSettings = () => {
  const { hc } = useRuntimeConfig().public
  const route = useRoute()

  const langs = useState('langs', () => ref<Lang[]>([]))
  const defaultLang = useState('defaultLang', () => ref<Lang | null>(null))

  const loadSettings = async () => {
    if (langs.value.length) {
      return
    }

    const { data: settings } = await useFetch<Settings>(
      `${hc.baseUrl}/settings`,
    )

    if (settings.value?.langs) {
      langs.value = settings.value.langs

      const defaultLangItem = langs.value.find(l => l.is_default)

      if (defaultLangItem) {
        defaultLang.value = defaultLangItem
      }
    }
  }

  const langCodes = computed(() => langs.value.map(l => l.code))

  const currentLangCode = computed(() =>
    Array.isArray(route.params?.lang)
      ? (route.params?.lang[0])
      : (route.params?.lang),
  )

  const currentLang = computed(() => {
    return (
      langs.value.find(l => l.code === currentLangCode.value) ||
      defaultLang.value
    )
  })

  return {
    currentLang,
    currentLangCode,
    defaultLang,
    langs,
    langCodes,
    loadSettings,
  }
}
