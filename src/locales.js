var _ = require('./lodash');
var config = require('./config');
var utils = require('./utils');

var Locales = {
  en: {
    general: {
      delete:   'Suppression ?',
      drop:     'Glissez __block__ ici',
      paste:    'Ou copiez le lien ici',
      upload:   '...ou choisissez un fichier',
      close:    'fermer',
      position: 'Position',
      wait:     'Veuillez patienter...',
      link:     'Entrez un lien',
      save:     'Le bloc a été sauvegardé'
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
            title: 'Paragraphe'
        },
        quote: {
            title: 'Citation',
            credit_field: 'Auteur'
        },
        chart: {
            title: 'Graphique',
            selectedTitle: 'Votre Titre',
            width: 'Largeur',
            height: 'Hauteur',
            value: 'Valeur',
            mode: 'Mode d\'affichage',
            col: 'Ajouter une colonne',
            row: 'Ajouter une ligne',
            no_deletion_col: 'Impossible de supprimer cette ligne',
            no_deletion_line: 'Impossible de supprimer cette colonne',
            xTitle: 'Abscisse',
            yTitle: 'Ordonnée',
            bar: {
                addCol: 'Ajouter une colonne',
                addRow: 'Ajouter une ligne'
            },
            pie: {
                addSection: 'Ajouter une part'
            }
        },
        medias: {
            title: 'Medias'
        },
        iframe: {
            title: 'Iframe',
            placeholder: 'Copie l\'URL du site ici'
        },
        embed: {
            title: 'Embed'
        },
        heading: {
            title: 'Titre'
        },
        table: {
            title: 'Tableaux',
            default: 'Defaut',
            blue_theme: 'Theme bleu',
            red_theme: 'Theme rouge',
            helper_merge : 'Cliquez sur une cellule grise pour la fusionner avec la cellule de droite',
            helper_unmerge : 'Cliquez sur une cellule grise pour annuler la fusion'
        },
        illustrated: {
            title: 'Valeur illustrée',
            button: {
                color: 'Couleur'
            },
            placeholder: {
                text: 'Votre texte',
                title: 'Votre titre',
                drop : 'Uploader et associer une nouvelle image',
                updated : 'Copyright mis à jour'
            },
            modal: {
                close: 'Fermer',
                header: 'Image',
                prev: 'Prev',
                next: 'Next'
            }

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
  utils.log('Using i18n stub');
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

      if (!_.isString(str)) { return ''; }

      if (str.indexOf('__') >= 0) {
        Object.keys(options).forEach(function(opt) {
          str = str.replace('__' + opt + '__', options[opt]);
        });
      }

      return str;
    }
  };
} else {
  utils.log('Using i18next');
  // Only use i18next when the library has been loaded by the user, keeps
  // dependencies slim
  i18n.init({ resStore: Locales, fallbackLng: config.language,
            ns: { namespaces: ['general', 'blocks'], defaultNs: 'general' }
  });
}

module.exports = Locales;
