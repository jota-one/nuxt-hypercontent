import {defineNuxtModule, addPlugin, createResolver, installModule, addServerHandler, addImports} from '@nuxt/kit'
import npmPackage from '../package.json'
import defu from 'defu'

// Module options TypeScript interface definition
export interface ModuleOptions {
  public: {
    baseUrl: string
  },
  db: {
    host: string
    user: string
    password: string
    database: string
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: npmPackage.name,
    configKey: 'hc',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  // Default configuration options of the Nuxt module
  defaults: {
    public: {
      baseUrl: ''
    },
    db: {
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'database',
    }
  },
  async setup (options, nuxt) {
    await installModule('@nuxtjs/tailwindcss')
    await installModule('@element-plus/nuxt')
    const { resolve } = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolve('./runtime/plugin'))

    nuxt.options.runtimeConfig.public.hc = defu(nuxt.options.runtimeConfig.public.hc, options.public)
    nuxt.options.runtimeConfig.hc = { db: options.db }

    console.log(options)
    console.log(nuxt.options.runtimeConfig.public)

    addServerHandler({
      route: `${options.public.baseUrl}/settings`,
      handler: resolve('./runtime/server/api/settings')
    })

    addImports({
      name: 'useSettings',
      as: 'useSettings',
      from: resolve('./runtime/composables/useSettings')
    })
  }
})
