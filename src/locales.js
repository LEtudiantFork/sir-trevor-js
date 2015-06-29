"use strict";

var _ = require('./lodash');
var config = require('./config');
var utils = require('./utils');

var Locales = {
  en: {
    general: {
      'delete':   'Suppression ?',
      'drop':     'Glissez __block__ ici',
      'paste':    'Ou copiez le lien ici',
      'upload':   '...ou choisissez un fichier',
      'close':    'fermer',
      'position': 'Position',
      'wait':     'Veuillez patienter...',
      'link':     'Entrez un lien',
      'save':     'Le bloc a été sauvegardé'
    },
    errors: {
      'title': "Vous avez l'erreur suivante :",
      'validation_fail': "Bloc __type__ est invalide",
      'block_empty': "__name__ ne doit pas être vide",
      'type_missing': "Vous devez avoir un bloc de type __type__",
      'required_type_empty': "Un bloc requis de type __type__ est vide",
      'load_fail': "Il y a un problème avec le chargement des données du document"
    },
    blocks: {
      text: {
        'title': "Texte"
      },
      list: {
        'title': "Liste"
      },
      quote: {
        'title': "Citation",
        'credit_field': "Auteur"
      },
      medias: {
        title: 'Medias'
      },
      image: {
        'title': "Image",
        'upload_error': "Il y a un problème avec votre téléchargement"
      },
      video: {
        'title': "Vidéo"
      },
      iframe: {
        'placeholder': "Copie l'URL du site ici"
      },
      embed: {
        'title': 'Embed'
      },
      tweet: {
        'title': "Tweet",
        'fetch_error': "Un problème est survenu lors de la récupération de votre tweet"
      },
      embedly: {
        'title': "Embedly",
        'fetch_error': "Un problème est survenu lors de la récupération de votre embed",
        'key_missing': "Une clé API pour Embedly doit être présente"
      },
      heading: {
        'title': 'Titre'
      },
      subhead: {
        'title': 'Sous titre'
      },
      table: {
        'title': 'Table',
        'default': 'Defaut',
        'blue-theme': 'Theme bleu',
        'red-theme': 'Theme rouge',
        'helper-merge' : 'Cliquez sur une cellule grise pour la fusionner avec la cellule de droite',
        'helper-unmerge' : 'Cliquez sur une cellule grise pour annuler la fusion'
      }
    },
    slider: {
        no_results: 'No results'
    },
    sub_blocks: {
        embed: {
            personality: {
                title: 'Test de personnalité'
            },
            poll: {
                title: 'Sondage'
            },
            quiz: {
                title: 'Quiz'
            },
            script: {
                title: 'Script',
                save: 'Sauvegarder',
                edit: 'Editer',
                invalid: 'Veuillez vérifier votre script'
            }
        },
        media: {
            save: 'Sauvegarder',
            legend: 'Legende',
            copyright: 'Copyright',
            category: 'Categorie',
            image: {
                title: 'Image'
            },
            video: {
                title: 'Vidéo'
            }
        },
        image: 'Image',
        video: 'Video'
    }
  }
};

if (window.i18n === undefined) {
  // Minimal i18n stub that only reads the English strings
  utils.log("Using i18n stub");
  window.i18n = {
    t: function(key, options) {
      var parts = key.split(':'), str, obj, part, i;

      obj = Locales[config.language];

      for(i = 0; i < parts.length; i++) {
        part = parts[i];

        if(!_.isUndefined(obj[part])) {
          obj = obj[part];
        }
      }

      str = obj;

      if (!_.isString(str)) { return ""; }

      if (str.indexOf('__') >= 0) {
        Object.keys(options).forEach(function(opt) {
          str = str.replace('__' + opt + '__', options[opt]);
        });
      }

      return str;
    }
  };
} else {
  utils.log("Using i18next");
  // Only use i18next when the library has been loaded by the user, keeps
  // dependencies slim
  i18n.init({ resStore: Locales, fallbackLng: config.language,
            ns: { namespaces: ['general', 'blocks'], defaultNs: 'general' }
  });
}

module.exports = Locales;
