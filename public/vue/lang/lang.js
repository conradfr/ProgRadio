// todo modularize

/* eslint-disable max-len */

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
      consent: {
        accept: 'Oui',
        allow: 'Préférer les pubs personnalisées ?',
        deny: 'Non',
        disclaimer: '(Nous ne vendons pas les données de nos utilisateurs)'
      },
      loading: 'Chargement ...',
      generic: {
        delete: 'Supprimer',
        error: "Une erreur s'est produite."
      },
      now_page: {
        back: '← Retourner à la grille complète des programmes',
        title: 'En ce moment à la radio'
      },
      params_page: {
        automatic: 'Automatique',
        automatic_help: 'Basé sur votre type de connexion (ADSL, fibre, 4g ...) et votre bande passante.',
        deactivated: 'Désactivé',
        description: 'Pour réduire les publicités présentes en début de streaming et les délais de chargement le lecteur peut continuer de lire le précédent flux pendant plusieurs minutes quand vous changez de radio ou quand mettez la lecture en pause.',
        duration_10: 'Pendant 10mn',
        duration_30: 'Pendant 30mn',
        no_support: 'Votre navigateur ne supporte pas la détection automatique.',
        save: 'Sauvegarder',
        sub_title: 'Lectures de flux simultanés',
        title: 'Configuration du lecteur',
        two_flux: 'Deux flux simultanés',
        updated: 'Paramètres mis à jour'
      },
      player: {
        autoplay_error: "Votre navigateur n'autorise pas la lecture automatique de médias. Merci de cliquer sur \"Ecouter\" une fois de plus",
        play_error: 'Erreur de lecture',
        placeholder: 'Cliquer sur un logo pour lancer la lecture',
        previous: 'Ecouter {radio} de nouveau',
        save_song: 'Sauvegarder ce titre ({song})',
        song_saved: 'Le titre a été sauvegardé',
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
        preroll_filter: 'Radios avec une publicité au lancement',
        title: 'Toutes les grilles radio, tous les programmes et écoute en ligne',
        today: "Aujourd'hui",
        tomorrow: 'Demain',
        tooltip: 'Plus de radios ici',
        radio_list: {
          page: 'Page des programmes',
          pick_region_title: 'Choisir une région',
          region: {
            modal: {
              close: 'Fermer',
            }
          }
        }
      },
      songs_page: {
        find: 'Rechercher',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: "Vous n'avez pas de titres sauvegardés.",
        title: 'Titres sauvegardés',
      },
      streaming: {
        categories: {
          all_countries: 'Tous les pays',
          favorites: 'Favoris',
          last: 'Radios écoutées dernièrement ...',
        },
        close: 'Retour',
        country: 'Pays',
        country_search_no_result: 'Aucun pays trouvé',
        listeners_title: 'Auditeurs',
        listeners: 'Aucun auditeur actuellement. | Un auditeur actuellement. | {how_many} auditeurs actuellement.',
        more: 'Voir plus',
        no_results: 'Aucune radio',
        play: 'Ecouter {radio}',
        playing: 'Titre',
        random: 'Jouer une radio au hasard',
        search_placeholder: 'Chercher par nom, style, contenu ...',
        stop: 'Stopper',
        sort: {
          name: 'Par ordre alphabétique',
          popularity: 'Par popularité',
          random: 'Par ordre aléatoire',
          last: 'Par dernière écoute'
        },
        title: 'Les radios du monde entier en streaming',
        website: 'Site web'
      },
      toast: {
        home: {
          enabled: "La page a été activée comme page d'accueil.",
          disabled: "La page a été retirée comme page d'accueil."
        }
      }
    },
  },
  en: {
    message: {
      consent: {
        accept: 'Accept',
        allow: 'Prefer personalized ads?',
        deny: 'Deny',
        disclaimer: '(This website does not track its visitors or sell data)'
      },
      loading: 'Loading ...',
      generic: {
        delete: 'Delete',
        error: 'An error occurred.'
      },
      now_page: {
        back: '← Back to radio guide',
        title: 'Currently on the radio'
      },
      params_page: {
        automatic: 'Automatic',
        automatic_help: 'Based on your connection and bandwidth.',
        deactivated: 'Deactivated',
        description: 'To reduce ads at the start of a radio stream and loading times the player can read two simultaneous streams when you switch radio or pause it.',
        duration_10: 'During 10mn',
        duration_30: 'During 30mn',
        no_support: 'Your browser does not support automatic detection.',
        save: 'Save',
        sub_title: 'Stream multiplex',
        title: 'Player parameters',
        two_flux: 'Two simultaneous streams',
        updated: 'Parameters has been updated.'
      },
      player: {
        autoplay_error: 'Your browser does not allow autoplay. Please ckick play one more time',
        play_error: 'Media error',
        placeholder: 'Click on a radio logo to start streaming',
        previous: 'Play {radio} again',
        save_song: 'Save this song ({song})',
        song_saved: 'The song has been saved',
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
        preroll_filter: 'Radios with ads at the start',
        title: 'Radio schedules in France, streaming and more !',
        today: 'Today',
        tomorrow: 'Tomorrow',
        tooltip: 'More radios here',
        radio_list: {
          page: 'Schedule page',
          pick_region_title: 'Select an area',
          region: {
            modal: {
              close: 'Close',
            }
          }
        }
      },
      songs_page: {
        find: 'Search',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: 'You have no songs saved yet.',
        title: 'Saved songs',
      },
      streaming: {
        categories: {
          all_countries: 'All countries',
          favorites: 'Favorites',
          last: 'People currently listen to ...',
        },
        close: 'Back',
        country: 'Country',
        country_search_no_result: 'No country found',
        listeners_title: 'Listeners',
        listeners: 'No listener currently. | Currently one listener. | Currently {how_many} listeners.',
        more: 'See more',
        no_results: 'No radio',
        play: 'Listen to {radio}',
        playing: 'Playing',
        random: 'Play a random radio',
        search_placeholder: 'Search by name, style, content ...',
        stop: 'Stop',
        sort: {
          name: 'By alphabetical order',
          popularity: 'By popularity',
          random: 'By random order',
          last: 'By last played'
        },
        title: 'Stream radios from all over the world!',
        website: 'Website'
      },
      toast: {
        home: {
          enabled: 'This page has been set as homescreen.',
          disabled: 'This page has been removed as homescreen.'
        }
      },
    },
  },
  es: {
    message: {
      consent: {
        accept: 'Aceptar',
        allow: '¿Prefiere los anuncios personalizados?',
        deny: 'Denegar',
        disclaimer: '(Este sitio web no rastrea a sus visitantes ni vende datos)'
      },
      loading: 'Cargando ...',
      generic: {
        delete: 'Suprimir',
        error: 'Se ha producido un error'
      },
      now_page: {
        back: '← Ir al programa Grid de todas las radios.',
        title: 'En este momento en la radio'
      },
      params_page: {
        automatic: 'Automático (',
        automatic_help: 'Basado en su conexión y ancho de banda. ',
        deactivated: 'Desactivado',
        description: 'Para reducir los anuncios al inicio de un flujo de radio y los tiempos de carga, el reproductor puede leer dos flujos simultáneos cuando cambia la radio o la pausa.',
        duration_10: 'Durante 10mn',
        duration_30: 'Durante 30mn',
        no_support: 'Su navegador no admite la detección automática.',
        save: 'Actualizar ',
        sub_title: 'Stream multiplex',
        title: 'Parámetros del reproductor',
        two_flux: 'Dos streams simultáneos.',
        updated: 'Los parámetros se han actualizado.'
      },
      player: {
        autoplay_error: 'Su navegador no permite la reproducción automática de medios. Gracias por hacer clic en "Escuchar" una vez más',
        play_error: 'error de reproducción',
        placeholder: 'Haga clic en un logotipo para reproducir',
        previous: 'Escucha {radio} de nuevo',
        save_song: 'La canción fue salvada ({song})',
        song_saved: 'Le titre a été sauvegardé',
        favorites: {
          add: 'Agregar a los favoritos',
          remove: 'eliminar de los favoritos'
        },
        timer: {
          cancelled: 'El temporizador ha sido cancelado',
          end_in: 'Fin del temporizador en 0 minuto. | Fin del temporizador en {minutes} minuto. | Fin del temporizador en {minutes} minutos.',
          finish: 'Parar la reproducción (temporizador)',
          modal: {
            abrv: 'mn',
            add: 'Agregar',
            cancel: 'Anular',
            close: 'Cerrar',
            length: 'Duración',
            placeholder: 'Minutos',
            quick: 'Selección rápida',
            set: 'Iniciar el temporizador',
            title: 'Temporizador',
            x_minutes: '{minutes} minutos'
          },
          set: 'El temporizador se activa durante 0 minutos | El temporizador se activa durante {minutes} minutos | El temporizador se activa durante {minutes} minutos',
          title: 'Minuteur',
          tooltip: 'Haga clic aquí para activar el temporizador'
        }
      },
      radio_page: {
        back: '← Ir a la programación de todas las emisoras de radio.',
        current: '↓ Ir al programa actual',
        no_schedule: 'Programas no disponibles.',
        play: 'Escuchar {radio}',
        stop: 'Detener',
        title: 'Programas de {radio} y streaming',
        webradios: 'Radios web'
      },
      schedule: {
        no_schedule: 'Programas no disponibles :(',
        no_radio: 'No hay radio en esta categoría',
        no_radio_favorites: 'No tienes emisoras de radio favoritas',
        preroll_filter: 'Radios con publicidad de lanzamiento',
        title: 'Todos los horarios de la radio, todos los programas y la escucha en línea',
        today: 'Hoy en día',
        tomorrow: 'Mañana',
        tooltip: 'Más radios aquí',
        radio_list: {
          page: 'Página de programas',
          pick_region_title: 'Elija una región',
          region: {
            modal: {
              close: 'Cerrar',
            }
          }
        }
      },
      songs_page: {
        find: 'Busque',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'YouTube',
        no_songs: 'Todavía no tienes canciones guardadas.',
        title: 'Canciones guardadas',
      },
      streaming: {
        categories: {
          all_countries: 'Todos los países',
          favorites: 'Favoritos',
          last: 'Radios actualmente escuchadas ...',
        },
        close: 'Atrás',
        country: 'País',
        country_search_no_result: 'No se ha encontrado ningún país',
        listeners_title: 'Oyentes',
        listeners: 'No gente actualmente. | Uno gente actualmente. | {how_many} gentes actualmente.',
        more: 'Ver más',
        no_results: 'No hay radio',
        play: 'Escuchar {radio}',
        playing: 'Título',
        random: 'Reproducción de una radio aleatoria',
        search_placeholder: 'Búsqueda por nombre, estilo y contenido ...',
        stop: 'Detener',
        sort: {
          name: 'Por orden alfabético',
          popularity: 'Por popularidad ',
          random: 'Orden aleatorio',
          last: 'Por la escucha reciente'
        },
        title: 'Emisoras de radio de todo el mundo en streaming',
        website: 'Sitio web'
      },
      toast: {
        home: {
          enabled: 'Esta página se ha establecido como pantalla de inicio.',
          disabled: 'Esta página ha sido eliminada como pantalla de inicio.'
        }
      },
    }
  },
};
