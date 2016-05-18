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
        help: {
            format: 'Tips'
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
            filters: {
                defaultOption: 'Aucune Thematique',
                next: 'Suivant',
                prev: 'Précédent'
            },
            chart: {
                title: 'Charte'
            },
            barChart: {
                title: 'Charte de barres'
            },
            pieChart: {
                title: 'Charte en camembert'
            },
            illustrated: {
                title: 'Illustrée',
                placeholder: 'Something something',
                pickIcon: 'Choisissez une icône'
            },
            illustratedValue: {
                title: 'Valeur Illustrée',
                placeholder: 'Titre',
                pickIcon: 'Choisir une icône'
            },
            illustratedImage: {
                title: 'Valeur Imagée',
                pickImage: 'Choisir une image'
            },
            illustratedLeft: {
                title: 'Image à gauche',
                pickImage: 'Choisir une image'
            },
            illustratedRight: {
                title: 'Image à droite',
                pickImage: 'Choisir une image'
            },
            table: {
                title: 'Tableau',
                rowAbove: '+ une rangée au dessus',
                rowBelow: '+ une rangée en dessous',
                colLeft: '+ une colonne à gauche',
                colRight: '+ une colonne à droite',
                removeRow: 'Supprimer la rangée',
                removeCol: 'Supprimer la colonne',
                undo: 'Annuler',
                redo: 'Rétablir',
                mergeCells: 'Fusionner les cellules',
                splitCells: 'Séparer les cellules',
                setTH: 'Mettre TH',
                unsetTH: 'Retirer TH',
                setTHEAD: 'Mettre THEAD',
                unsetTHEAD: 'Retirer THEAD',
                setTFOOT: 'Mettre TFOOT',
                unsetTFOOT: 'Retirer TFOOT',
                pasteXLS: 'Coller le excel'
            },
            table1D: {
                addRef: 'Ajouter une Section',
                newRef: 'Nouvelle Section',
                delete: 'Supprimer'
            },
            table2D: {
                axisX: 'Axe horizontal',
                axisY: 'Axe vertical',
                addProp: 'Ajouter une colonne',
                newProp: 'Nouvelle colonne',
                addRef: 'Ajouter une rangée',
                newRef: 'Nouvelle rangée',
                delete: 'Supprimer'
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
