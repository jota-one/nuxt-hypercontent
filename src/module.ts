import {defineNuxtModule, addPlugin, createResolver, installModule, addServerHandler, addImports} from '@nuxt/kit'
import npmPackage from '../package.json'

// Module options TypeScript interface definition
export interface ModuleOptions {
  hc: {
    baseUrl: string
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: npmPackage.name,
    configKey: 'hypercontent',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  // Default configuration options of the Nuxt module
  defaults: {
    hc: {
      baseUrl: ''
    }
  },
  async setup (options, nuxt) {
    await installModule('@nuxtjs/tailwindcss')
    await installModule('@element-plus/nuxt')
    const { resolve } = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolve('./runtime/plugin'))

    const baseUrl = options.hc.baseUrl
    addServerHandler({
      route: `${baseUrl}/settings`,
      handler: resolve('./runtime/server/api/settings')
    })

    addImports({
      name: 'useSettings',
      as: 'useSettings',
      from: resolve('./runtime/composables/useSettings')
    })
  }
})
