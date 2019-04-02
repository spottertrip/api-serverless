const i18n = require('i18n-js')

const fr = {
  parameters: {
    travelBand: 'groupe de voyage',
    folder: 'dossier d\'activitiés',
  },
  errors: {
    invalidUUID: 'L\'id du {{name}} est invalide',
    database: {
      internal: 'Une erreur est survenue, veuillez réessayer à nouveau',
    },
    activities: {
      notFound: 'L\'activité recherchée n\'existe pas',
      invalid_lastEvaluatedId: 'Une erreur est survenue lors de l\'évaluation de la pagination d\'activités',
      invalidUUID: 'L\'id de l\'activité fourni est invalide',
      missingId: 'L\'id de l\'activité est requis pour obtenir ses disponibilités',
      existsInFolder: 'L\'activité a déjà été partagée dans le dossier donné',
    },
    folders: {
      noDefaultFolder: 'Aucun dossier par défaut n\'existe',
      notFound: 'Le dossier recherché n\'existe pas',
      invalidUUID: 'L\'id du dossier est invalide',
      invalid: 'Le dossier est invalide',
      name: {
        required: 'Le nom du dossier est requis',
        max: 'Le nom du dossier ne doit pas dépasser 20 caractères',
        min: 'Le nom du dossier doit contenir au moins 3 caractères',
        alreadyExists: 'Un autre dossier existe déjà avec le nom "{{name}}" pour ce groupe de voyage.',
      },
      description: {
        max: 'La description du dossier ne doit pas dépasser 120 caractères',
      },
    },
  },
  travelBands: {
    errors: {
      invalidUUID: 'L\'id du groupe de voyage est invalide',
      missingId: 'L\'id du groupe de voyage est requise',
      notFound: 'Le groupe de voyage n\'existe pas',
    },
  },
  categories: {
    exploration: {
      name: 'Nature et exploration',
      description: 'Explorer la nature avec ses amis n\'a jamais été aussi prenant.',
    },
    culture: {
      name: 'Sortie culturel et touristique',
      description: 'Osez vous aventurer dans les pièces secrètes d\'anciens donjons oubliés, ou simplement passez visiter le Louvres.',
    },
    sport: {
      name: 'Découvertes sportives',
      description: 'Envie de vous dépenser dans un milieu inconnu ?',
    },
    party: {
      name: 'Soirées et détente',
      description: 'Faire la fête avec des locaux dans un pays étranger, quelle bonne idée !',
    },
  },
}

i18n.fallbacks = true
i18n.translations = { fr }
i18n.locale = 'fr'

// @ts-ignore
export const t = (...args) => i18n.t(...args)
