const i18n = require('i18n-js')

const fr = {
  errors: {
    database: {
      internal: 'Une erreur est survenue, veuillez réessayer à nouveau',
    },
    activities: {
      invalid_lastEvaluatedId: 'Une erreur est survenue lors de l\'évaluation de la pagination d\'activités',
    },
  },
  travelBands: {
    errors: {
      invalidUUID: 'L\'id du groupe de voyage est invalide',
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
