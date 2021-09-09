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
        autoplay_error: "Votre navigateur n'autorise pas la lecture automatique de médias. Merci de cliquer sur \"Ecouter\" une fois de plus",
        play_error: 'Erreur de lecture',
        placeholder: 'Cliquer sur un logo pour lancer la lecture',
        previous: 'Ecouter {radio} de nouveau',
        favorites: {
          add: 'Ajouter aux favoris',
          remove: 'Retirer des favoris'
        },
        timer: {
          cancelled: 'Le minuteur a été annulé',
          end_in: 'Fin du minuteur dans 0 minute | Fin du minuteur dans {minutes} minute | Fin du minuteur dans {minutes} minutes',
          finish: 'Arrêt de la lecture (minuteur)',
          modal: {
            abrv: 'mn',
            add: 'Ajouter',
            cancel: 'Annuler',
            close: 'Fermer',
            length: 'Durée',
            placeholder: 'Minutes',
            quick: 'Sélection rapide',
            set: 'Lancer le minuteur',
            title: 'Minuteur',
            x_minutes: '{minutes} minutes'
          },
          set: 'Le minuteur est activé pour 0 minute | Le minuteur est activé pour {minutes} minute |Le minuteur est activé pour {minutes} minutes',
          title: 'Minuteur',
          tooltip: 'Cliquer ici pour activer le minuteur'
        }
      },
      radio_page: {
        back: '← Retourner à la grille complète des programmes',
        current: '↓ Aller à l\'émission en cours',
        no_schedule: 'Programmes non disponibles.',
        play: 'Ecouter {radio}',
        stop: 'Stopper',
        title: 'Les programmes et streaming de {radio}',
        webradios: 'Radios web'
      },
      schedule: {
        no_schedule: 'Programmes non disponibles :(',
        no_radio: 'Aucune radio dans cette catégorie',
        no_radio_favorites: "Vous n'avez pas de radios favorites",
        title: 'Toutes les grilles radio, tous les programmes et écoute en ligne',
        today: "Aujourd'hui",
        tomorrow: 'Demain',
        tooltip: 'Plus de radios ici',
        radio_list: {
          page: 'Page des programmes'
        }
      },
      streaming: {
        categories: {
          all_countries: 'Tous les pays',
          favorites: 'Favoris',
        },
        country_search_no_result: 'Aucun pays trouvé',
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
        autoplay_error: 'Your browser does not allow autoplay. Please ckick play one more time',
        play_error: 'Media error',
        placeholder: 'Click on a radio logo to start streaming',
        previous: 'Play {radio} again',
        favorites: {
          add: 'Add to favorites',
          remove: 'Remove from favorites'
        },
        timer: {
          cancelled: 'The timer has been cancelled',
          end_in: 'Timer ends in 0 minute | Timer ends in {minutes} minute | Timer ends in {minutes} minutes',
          finish: 'Playing stopped (timer)',
          modal: {
            abrv: 'mn',
            add: 'Add',
            cancel: 'Cancel',
            close: 'Close',
            length: 'Time length',
            placeholder: 'Minutes',
            quick: 'Shortcut setting',
            set: 'Set timer',
            title: 'Timer',
            x_minutes: '{minutes} minutes'
          },
          set: 'Timer has been set to {minutes} minute(s)',
          title: 'Timer',
          tooltip: 'Click here to set the timer'
        }
      },
      radio_page: {
        back: '← Back to radio guide',
        current: '↓ Go to current show',
        play: 'Listen to {radio}',
        stop: 'Stop',
        no_schedule: 'Schedule not available',
        title: 'Schedule of the radio {radio}',
        webradios: 'Webradios'
      },
      schedule: {
        no_schedule: 'Schedule not available :(',
        no_radio: 'No radio in this collection',
        no_radio_favorites: 'You have no favorite radios',
        title: 'Radio schedules in France, streaming and more !',
        today: 'Today',
        tomorrow: 'Tomorrow',
        tooltip: 'More radios here',
        radio_list: {
          page: 'Schedule page'
        }
      },
      streaming: {
        categories: {
          all_countries: 'All countries',
          favorites: 'Favorites',
        },
        country_search_no_result: 'No country found',
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
