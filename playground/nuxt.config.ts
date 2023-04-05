export default defineNuxtConfig({
  modules: ['../src/module'],
  hc: {
    public: {
      baseUrl: '/api',
    },
    db: {
      host: '',
      user: '',
      password: '',
      database: '',
    }
  }
})
