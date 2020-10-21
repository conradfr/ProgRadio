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
      player: {
        placeholder: 'Cliquer sur un logo pour lancer la lecture',
        favorites: {
          add: 'Ajouter aux favoris',
          remove: 'Retirer des favoris'
        }
      },
      schedule: {
        no_schedule: 'Programmes non disponibles :(',
        today: "Aujourd'hui",
        tomorrow: 'Demain',
        radio_list: {
          page: 'Page des programmes'
        }
      },
      radio_page: {
        play: 'Ecouter {radio}',
        stop: 'Stopper',
        back: '← Retourner à la grille complète des programmes',
        no_schedule: 'Programmes non disponibles.'
      },
      streaming: {
        categories: {
          all_countries: 'Tous les pays',
          favorites: 'Favoris',
        },
        no_results: 'Aucunes radios',
        random: 'Jouer une radio au hasard',
        sort: {
          name: 'Par ordre alphabétique',
          popularity: 'Par popularité',
          random: 'Par ordre aléatoire'
        }
      }
    }
  },
  en: {
    message: {
      loading: 'Loading ...',
      player: {
        placeholder: 'Click on a radio logo to start streaming',
        favorites: {
          add: 'Add to favorites',
          remove: 'Remove from favorites'
        }
      },
      schedule: {
        no_schedule: 'Schedule not available :(',
        today: 'Today',
        tomorrow: 'Tomorrow',
        radio_list: {
          page: 'Schedule page'
        }
      },
      radio_page: {
        play: 'Listen to {radio}',
        stop: 'Stop',
        back: '← Back to radio guide',
        no_schedule: 'Schedule not available'
      },
      streaming: {
        categories: {
          all_countries: 'All countries',
          favorites: 'Favorites',
        },
        no_results: 'No radio',
        random: 'Play a random radio',
        sort: {
          name: 'By alphabetical order',
          popularity: 'By popularity',
          random: 'By random order'
        }
      }
    }
  }
};
