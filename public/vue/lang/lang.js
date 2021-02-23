// todo modularize

export const dateTimeFormats = {
  fr: {
    date_title: { year: 'numeric', month: 'long', day: 'numeric' }
  },
  en: {
    date_title: { year: 'numeric', month: 'short', day: 'numeric' }
  }
};

export const messages = {
  fr: {
    message: {
      loading: 'Chargement ...',
      now_page: {
        back: '← Retourner à la grille complète des programmes',
        title: 'En ce moment à la radio'
      },
      player: {
        autoplay_error: "Votre navigateur n'autorise pas la lecture automatique de médias. Merci de cliquer sur \"Ecouter\" une fois de plus.",
        play_error: 'Erreur de lecture.',
        placeholder: 'Cliquer sur un logo pour lancer la lecture',
        favorites: {
          add: 'Ajouter aux favoris',
          remove: 'Retirer des favoris'
        }
      },
      radio_page: {
        back: '← Retourner à la grille complète des programmes',
        no_schedule: 'Programmes non disponibles.',
        play: 'Ecouter {radio}',
        stop: 'Stopper',
        title: 'Les programmes et streaming de {radio}',
        webradios: 'Radios web'
      },
      schedule: {
        no_schedule: 'Programmes non disponibles :(',
        title: 'Toutes les grilles radio, tous les programmes et écoute en ligne',
        today: "Aujourd'hui",
        tomorrow: 'Demain',
        radio_list: {
          page: 'Page des programmes'
        }
      },
      streaming: {
        categories: {
          all_countries: 'Tous les pays',
          favorites: 'Favoris',
        },
        no_results: 'Aucune radio',
        random: 'Jouer une radio au hasard',
        search_placeholder: 'Chercher par nom, style, contenu ...',
        sort: {
          name: 'Par ordre alphabétique',
          popularity: 'Par popularité',
          random: 'Par ordre aléatoire'
        },
        title: 'Les radios du monde entier en streaming'
      }
    }
  },
  en: {
    message: {
      loading: 'Loading ...',
      now_page: {
        back: '← Back to radio guide',
        title: 'Currently on the radio'
      },
      player: {
        autoplay_error: 'Your browser does not allow autoplay. Please ckick play one more time.',
        play_error: 'Media error.',
        placeholder: 'Click on a radio logo to start streaming',
        favorites: {
          add: 'Add to favorites',
          remove: 'Remove from favorites'
        }
      },
      radio_page: {
        play: 'Listen to {radio}',
        stop: 'Stop',
        back: '← Back to radio guide',
        no_schedule: 'Schedule not available',
        title: 'Schedule of the radio {radio}',
        webradios: 'Webradios'
      },
      schedule: {
        no_schedule: 'Schedule not available :(',
        title: 'Radio schedules in France, streaming and more !',
        today: 'Today',
        tomorrow: 'Tomorrow',
        radio_list: {
          page: 'Schedule page'
        }
      },
      streaming: {
        categories: {
          all_countries: 'All countries',
          favorites: 'Favorites',
        },
        no_results: 'No radio',
        random: 'Play a random radio',
        search_placeholder: 'Search by name, style, content ...',
        sort: {
          name: 'By alphabetical order',
          popularity: 'By popularity',
          random: 'By random order'
        },
        title: 'Stream radios from all over the world!'
      }
    }
  }
};
