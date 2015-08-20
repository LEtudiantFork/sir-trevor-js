var Locales = {
  en: {
    general: {
      'delete':           'Delete?',
      'drop':             'Drag __block__ here',
      'paste':            'Or paste URL here',
      'upload':           '...or choose a file',
      'close':            'close',
      'position':         'Position',
      'wait':             'Please wait...',
      'link':             'Enter a link',
      'yes':              'Yes',
      'no':               'No'
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
        'title': "Texte"
      },
      list: {
        'title': "Liste"
      },
      iframe: {
        'title': "Iframe"
      },
      quote: {
        'title': "Citation",
        'credit_field': "Auteur"
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
        'title': "Titre"
      },
      media: {
        'title': "Média"
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
        service: {
            title: 'Service'
        },
        script: {
            title: 'Script'
        }
      }
    }
  }
};

module.exports = Locales;
