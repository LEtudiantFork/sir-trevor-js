'use strict';

var _ = require('./lodash');
var config = require('./config');
var utils = require('./utils');

var Locales = {
    fr: {
        general: {
            delete:           'Suppression ?',
            drop:             'Glissez __block__ ici',
            paste:            'Ou copiez le lien ici',
            upload:           '...ou choisissez un fichier',
            close:            'fermer',
            position:         'Position',
            wait:             'Veuillez patienter...',
            link:             'Entrez un lien',
            yes:              'Oui',
            no:               'Non'
        },
        errors: {
            title: 'Vous avez l\'erreur suivante :',
            validation_fail: 'Bloc __type__ est invalide',
            block_empty: '__name__ ne doit pas être vide',
            type_missing: 'Vous devez avoir un bloc de type __type__',
            required_type_empty: 'Un bloc requis de type __type__ est vide',
            load_fail: 'Il y a un problème avec le chargement des données du document'
        },
        blocks: {
            text: {
                title: 'Texte'
            },
            list: {
                title: 'Liste'
            },
            quote: {
                title: 'Citation',
                credit_field: 'Auteur'
            },
            media: {
                title: 'Média'
            },
            diaporama: {
                title: 'Diaporama'
            },
            embed: {
                title: 'Embed'
            },
            chart: {
                title: 'Chart'
            },
            barChart: {
                title: 'Charte de barres'
            },
            pieChart: {
                title: 'Charte en camembert'
            },
            table: {
                title: 'Table'
            },
            image: {
                title: 'Image'
            },
            iframe: {
                title: 'Iframe',
                placeholder: 'Coller'
            },
            video: {
                title: 'Vidéo'
            },
            heading: {
                title: 'Titre'
            },
            quiz: {
                title: 'Quiz'
            },
            poll: {
                title: 'Sondage'
            },
            personality: {
                title: 'Personnalité'
            },
            script: {
                title: 'Script'
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
