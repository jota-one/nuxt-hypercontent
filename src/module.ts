import {
  addImports,
  addPlugin,
  addServerHandler,
  addTemplate,
  createResolver,
  defineNuxtModule,
  installModule,
} from '@nuxt/kit'
import defu from 'defu'

import npmPackage from '../package.json'

// Module options TypeScript interface definition
export interface ModuleOptions {
  public: {
    baseUrl: string
  }
  db: {
    host: string
    user: string
    password: string
    database: string
  }
  elementPlus: {}
}

export * from './runtime/server/constants'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: npmPackage.name,
    configKey: 'hc',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    public: {
      baseUrl: '',
    },
    db: {
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'database',
    },
    elementPlus: {
      importStyle: 'css',
      themes: ['dark'],
    },
  },
  async setup(options, nuxt) {
    await installModule('@nuxtjs/tailwindcss')
    await installModule('@element-plus/nuxt')
    const { resolve } = createResolver(import.meta.url)

    // pre-configure element-plus
    nuxt.options.elementPlus ||= {}
    nuxt.options.elementPlus = defu(
      nuxt.options.elementPlus,
      options.elementPlus,
    )

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolve('./runtime/plugin'))

    nuxt.options.runtimeConfig.public.hc = defu(
      nuxt.options.runtimeConfig.public.hc,
      options.public,
    )
    nuxt.options.runtimeConfig.hc = { db: options.db }

    console.log(options)
    console.log(nuxt.options.runtimeConfig.public)

    addServerHandler({
      route: `${options.public.baseUrl}/settings`,
      handler: resolve('./runtime/server/api/settings'),
    })
    addServerHandler({
      route: `${options.public.baseUrl}/contents`,
      handler: resolve('./runtime/server/api/contents/index.post'),
      method: 'post',
    })
    addServerHandler({
      route: `${options.public.baseUrl}/contents/:id`,
      handler: resolve('./runtime/server/api/contents/[id].put'),
      method: 'put',
    })
    addServerHandler({
      route: `${options.public.baseUrl}/contents`,
      handler: resolve('./runtime/server/api/contents/[id]'),
    })

    addImports({
      name: 'useSettings',
      as: 'useSettings',
      from: resolve('./runtime/composables/useSettings'),
    })
  },
})
