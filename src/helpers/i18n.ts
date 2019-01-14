const i18n = require('i18n-js')

const fr = {
  travelBands: {
    errors: {
      missingId: 'L\'id du groupe de voyage est requise',
      notFound: 'Le groupe de voyage n\'existe pas',
    },
  },
}

i18n.fallbacks = true
i18n.translations = { fr }
i18n.locale = 'fr'

// @ts-ignore
export const t = (...args) => i18n.t(...args)
