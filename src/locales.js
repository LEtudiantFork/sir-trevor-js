var Locales = {
  en: {
    general: {
      delete:           'Supprimer?',
      drop:             'Faites trainer un __block__ ici',
      paste:            'Ou collez un URL ici',
      upload:           '...ou choisissez un fichier',
      close:            'Fermer',
      position:         'Position',
      wait:             'Veuillez attendre...',
      link:             'Saisir un lien',
      yes:              'Oui',
      no:               'Non'
    },
    framed: {
        choose: 'Choissisez un style',
        no_style: 'Aucun style'
    },
    errors: {
      'title': 'Vous avez les erreurs suivantes:',
      'validation_fail': '__type__ bloc invalide',
      'block_empty': '__name__ ne doit pas être vide',
      'type_missing': 'Vous devez obligatoirement avoir un bloc de type __type__',
      'required_type_empty': 'Un type de bloc __type__ qui est requis, est vide',
      'load_fail': 'Il y a eu un problème lors du chargement du contenu du document'
    },
    blocks: {
      text: {
        title: 'Texte'
      },
      list: {
        title: 'Liste'
      },
      iframe: {
        title: 'Iframe'
      },
      quote: {
        title: 'Citation',
        credit_field: 'Auteur'
      },
      image: {
        title: 'Image',
        upload_error: 'Il y a eu un problème lors de votre téléchargement'
      },
      video: {
        title: 'Video'
      },
      tweet: {
        title: 'Tweet',
        fetch_error: 'Il y a eu un problème lors de la récuperation de votre tweet'
      },
      heading: {
        title: 'Titre'
      },
      media: {
        title: 'Média'
      },
      embed: {
        title: 'Embed'
      },
      chart: {
        title: 'Chart'
      }
    },
    sub_blocks: {
      media: {
        image: {
          title: 'Image'
        },
        video: {
          title: 'Vidéo'
        },
        diaporama: {
          title: 'Diaporama'
        }
      },
      embed: {
        poll: {
            title: 'Sondage'
        },
        quiz: {
            title: 'Quiz'
        },
        personality: {
            title: 'Personality'
        },
        service: {
            title: 'Service'
        },
        script: {
            title: 'Script',
            save: 'Sauvegarder',
            edit: 'Editer'
        }
      }
    }
  }
};

module.exports = Locales;
