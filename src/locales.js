'use strict';

var _ = require('./lodash');
var config = require('./config');
var utils = require('./utils');

var Locales = {
    en: {
        general: {
            'delete':                     'Delete?',
            'drop':                         'Drag __block__ here',
            'paste':                        'Or paste URL here',
            'upload':                     '...or choose a file',
            'close':                        'close',
            'position':                 'Position',
            'wait':                         'Please wait...',
            'link':                         'Enter a link',
            'yes':                            'Yes',
            'no':                             'No'
        },
        errors: {
            'title': "You have the following errors:",
            'validation_fail': "__type__ block is invalid",
            'block_empty': "__name__ must not be empty",
            'type_missing': "You must have a block of type __type__",
            'required_type_empty': "A required block type __type__ is empty",
            'load_fail': "There was a problem loading the contents of the document"
        },
        blocks: {
            text: {
                'title': "Text"
            },
            list: {
                'title': "List"
            },
            quote: {
                'title': "Quote",
                'credit_field': "Credit"
            },
            image: {
                'title': "Image",
                'upload_error': "There was a problem with your upload"
            },
            video: {
                'title': "Video"
            },
            tweet: {
                'title': "Tweet",
                'fetch_error': "There was a problem fetching your tweet"
            },
            embedly: {
                'title': "Embedly",
                'fetch_error': "There was a problem fetching your embed",
                'key_missing': "An Embedly API key must be present"
            },
            heading: {
                'title': "Heading"
            }
        }
    },
    fr: {
      general: {
        'delete':           'Suppression ?',
        'drop':             'Glissez __block__ ici',
        'paste':            'Ou copiez le lien ici',
        'upload':           '...ou choisissez un fichier',
        'close':            'fermer',
        'position':         'Position',
        'wait':             'Veuillez patienter...',
        'link':             'Entrez un lien',
        'yes':              'Oui',
        'no':               'Non'
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
        media: {
          'title': "Média"
        },
        image: {
          'title': "Image",
          'upload_error': "Il y a un problème avec votre téléchargement"
        },
        video: {
          'title': "Vidéo"
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
        }
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
