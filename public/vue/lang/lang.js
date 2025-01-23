// todo modularize

/* eslint-disable max-len */

export const dateTimeFormats = {
  fr: {
    date_title: { year: 'numeric', month: 'long', day: 'numeric' }
  },
  en: {
    date_title: { year: 'numeric', month: 'short', day: 'numeric' }
  },
  es: {
    date_title: { year: 'numeric', month: 'long', day: 'numeric' }
  },
  de: {
    date_title: { year: 'numeric', month: 'long', day: 'numeric' }
  },
  pt: {
    date_title: { year: 'numeric', month: 'long', day: 'numeric' }
  },
  it: {
    date_title: { year: 'numeric', month: 'long', day: 'numeric' }
  },
  el: {
    date_title: { year: 'numeric', month: 'long', day: 'numeric' }
  },
  pl: {
    date_title: { year: 'numeric', month: 'long', day: 'numeric' }
  },
  ar: {
    date_title: { year: 'numeric', month: 'long', day: 'numeric' }
  },
  ro: {
    date_title: { year: 'numeric', month: 'long', day: 'numeric' }
  },
  hu: {
    date_title: { year: 'numeric', month: 'long', day: 'numeric' }
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
        song_saved: 'Le titre a été sauvegardé.',
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
            cancel: 'Annuler le minuteur',
            close: 'Fermer',
            length: 'Durée',
            placeholder: 'Minutes',
            quick: 'Sélection rapide',
            set: 'Lancer le minuteur',
            title: 'Minuteur',
            x_minutes: '{minutes} minutes',
            x_hours: '{hours} heures'
          },
          set: 'Le minuteur est activé pour 0 minute | Le minuteur est activé pour {minutes} minute |Le minuteur est activé pour {minutes} minutes',
          title: 'Minuteur',
          tooltip: 'Cliquer ici pour activer le minuteur'
        },
        video: {
          title: 'Player vidéo'
        },
      },
      radio_page: {
        back: '← Retourner à la grille complète des programmes',
        current: '↓ Aller à l\'émission en cours',
        no_schedule: 'Programmes non disponibles.',
        play: 'Ecouter {radio}',
        stop: 'Stopper {radio}',
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
        buy: 'Acheter',
        buy_amazon: 'Amazon',
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
          last: 'Les gens écoutent ...',
          history: 'Mon historique'
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
          last: 'Par dernière écoute (monde)',
          user_last: 'Par dernière écoute (moi)'
        },
        suggest: 'Suggérer une modification',
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
        autoplay_error: 'Your browser does not allow autoplay. Please click play one more time',
        play_error: 'Media error',
        placeholder: 'Click on a radio logo to start streaming',
        previous: 'Play {radio} again',
        save_song: 'Save this song ({song})',
        song_saved: 'The song has been saved.',
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
            cancel: 'Cancel the timer',
            close: 'Close',
            length: 'Time length',
            placeholder: 'Minutes',
            quick: 'Shortcut setting',
            set: 'Set timer',
            title: 'Timer',
            x_minutes: '{minutes} minutes',
            x_hours: '{hours} hours'
          },
          set: 'Timer has been set to {minutes} minute(s)',
          title: 'Timer',
          tooltip: 'Click here to set the timer'
        },
        video: {
          title: 'Video player'
        },
      },
      radio_page: {
        back: '← Back to radio guide',
        current: '↓ Go to current show',
        play: 'Listen to {radio}',
        stop: 'Stop {radio}',
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
        buy: 'Buy',
        buy_amazon: 'Amazon',
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
          last: 'People are listening to...',
          history: 'My history',
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
          last: 'By last played (world)',
          user_last: 'By last played (me)'
        },
        suggest: 'Suggest a modification',
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
        automatic_help: 'Basado en su conexión y ancho de banda.',
        deactivated: 'Desactivado',
        description: 'Para reducir los anuncios al inicio de un flujo de radio y los tiempos de carga, el reproductor puede leer dos flujos simultáneos cuando cambia la radio o la pausa.',
        duration_10: 'Durante 10mn',
        duration_30: 'Durante 30mn',
        no_support: 'Su navegador no admite la detección automática.',
        save: 'Actualizar',
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
        song_saved: 'La canción fue salvada.',
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
            cancel: 'Cancela el temporizador',
            close: 'Cerrar',
            length: 'Duración',
            placeholder: 'Minutos',
            quick: 'Selección rápida',
            set: 'Iniciar el temporizador',
            title: 'Temporizador',
            x_minutes: '{minutes} minutos',
            x_hours: '{hours} horas'
          },
          set: 'El temporizador se activa durante 0 minutos | El temporizador se activa durante {minutes} minutos | El temporizador se activa durante {minutes} minutos',
          title: 'Minuteur',
          tooltip: 'Haga clic aquí para activar el temporizador'
        },
        video: {
          title: 'Reproductor de video'
        },
      },
      radio_page: {
        back: '← Ir a la programación de todas las emisoras de radio.',
        current: '↓ Ir al programa actual',
        no_schedule: 'Programas no disponibles.',
        play: 'Escuchar {radio}',
        stop: 'Detener {radio}',
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
        buy: 'Comprar',
        buy_amazon: 'Amazon',
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
          last: 'La gente escucha...',
          history: 'Mi historia',
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
          popularity: 'Por popularidad',
          random: 'Orden aleatorio',
          last: 'Por última vez jugado (mundo)',
          user_last: 'Por última vez jugado (yo)'
        },
        suggest: 'Sugerir una modificación',
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
  de: {
    message: {
      consent: {
        accept: 'Akzeptieren',
        allow: 'Bevorzugen Sie personalisierte Werbung?',
        deny: 'Verweigern',
        disclaimer: '(Diese Website verfolgt ihre Besucher nicht und verkauft keine Daten)'
      },
      loading: 'Wird geladen...',
      generic: {
        delete: 'Löschen',
        error: 'Es ist ein Fehler aufgetreten.'
      },
      now_page: {
        back: '← Zurück zum Radioguide',
        title: 'Aktuell im Radio'
      },
      params_page: {
        automatic: 'Automatisch',
        automatic_help: 'Basierend auf Ihrer Verbindung und Bandbreite.',
        deactivated: 'Deaktiviert',
        description: 'Um die Werbung zu Beginn eines Radiostreams und die Ladezeiten zu reduzieren, kann der Player zwei Streams gleichzeitig lesen, wenn Sie das Radio umschalten oder pausieren.',
        duration_10: 'Während 10 Minuten',
        duration_30: 'Während 30 Minuten',
        no_support: 'Ihr Browser unterstützt keine automatische Erkennung.',
        save: 'Speichern',
        sub_title: 'Multiplex streamen',
        title: 'Spielerparameter',
        two_flux: 'Zwei gleichzeitige Streams',
        updated: 'Die Parameter wurden aktualisiert.'
      },
      player: {
        autoplay_error: 'Ihr Browser erlaubt kein Autoplay. Bitte klicken Sie noch einmal auf Play.',
        play_error: 'Medienfehler',
        placeholder: 'Klicken Sie auf ein Radio-Logo, um das Streaming zu starten',
        previous: '{radio} erneut abspielen',
        save_song: 'Dieses Lied speichern ({song})',
        song_saved: 'Das Lied wurde gespeichert.',
        favorites: {
          add: 'Zu den Favoriten hinzufügen',
          remove: 'Aus den Favoriten entfernen'
        },
        timer: {
          cancelled: 'Der Timer wurde storniert',
          end_in: 'Timer endet in 0 Minute | Timer endet in {minutes} Minute | Timer endet in {minutes} Minuten',
          finish: 'Wiedergabe gestoppt (Timer)',
          modal: {
            abrv: 'mn',
            cancel: 'Stornieren Sie den Timer',
            close: 'Schliessen',
            length: 'Länge der Zeit',
            placeholder: 'Minuten',
            quick: 'Tastenkürzeleinstellung',
            set: 'Timer einstellen',
            title: 'Timer',
            x_minutes: '{minutes} Minuten',
            x_hours: '{hours} Stunden'
          },
          set: 'Der Timer wurde auf {minutes} Minute (n) eingestellt',
          title: 'Timer',
          tooltip: 'Klicken Sie hier, um den Timer einzustellen'
        },
        video: {
          title: 'Videoplayer'
        },
      },
      radio_page: {
        back: '← Zurück zum Radioguide',
        current: '↓ Gehe zur aktuellen Sendung',
        play: '{radio} hören',
        stop: 'Stoppen {radio}',
        no_schedule: 'Zeitplan nicht verfügbar',
        title: 'Zeitplan des Radios {radio}',
        webradios: 'Webradios'
      },
      schedule: {
        no_schedule: 'Zeitplan nicht verfügbar :(',
        no_radio: 'Kein Radio in dieser Sammlung',
        no_radio_favorites: 'Sie haben keine Lieblingsradios',
        preroll_filter: 'Radios mit Werbung am Anfang',
        title: 'Radioprogramme in Frankreich, Streaming und mehr!',
        today: 'Heute',
        tomorrow: 'Morgen',
        tooltip: 'Weitere Radios hier',
        radio_list: {
          page: 'Seite „Zeitplan“',
          pick_region_title: 'Wählen Sie einen Bereich',
          region: {
            modal: {
              close: 'Schliessen',
            }
          }
        }
      },
      songs_page: {
        buy: 'Kaufen',
        buy_amazon: 'Amazon',
        find: 'Search',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: 'You have no songs saved yet.',
        title: 'Saved songs',
      },
      streaming: {
        categories: {
          all_countries: 'Alle Länder',
          favorites: 'Favoriten',
          last: 'Die Leute hören gerade ...',
          history: 'Meine Geschichte',
        },
        close: 'Zurück',
        country: 'Land',
        country_search_no_result: 'Kein Land gefunden',
        listeners_title: 'Zuhörer',
        listeners: 'Derzeit kein Zuhörer. | Derzeit ein Zuhörer. | Derzeit {how_many} Zuhörer.',
        more: 'Mehr sehen',
        no_results: 'Kein Radio',
        play: '{radio} anhören',
        playing: 'Spielend',
        random: 'Spiel ein zufälliges Radio',
        search_placeholder: 'Suche nach Name, Stil, Inhalt...',
        stop: 'Stopp',
        sort: {
          name: 'In alphabetischer Reihenfolge',
          popularity: 'Nach Beliebtheit',
          random: 'In zufälliger Reihenfolge',
          last: 'Von zuletzt gespielt (Welt)',
          user_last: 'Zuletzt gespielt (ich)'
        },
        suggest: 'Schlagen Sie eine Änderung vor',
        title: 'Streame Radios aus der ganzen Welt!',
        website: 'Webseite'
      },
      toast: {
        home: {
          enabled: 'Diese Seite wurde als Homescreen eingerichtet.',
          disabled: 'Diese Seite wurde als Homescreen entfernt.'
        }
      },
    },
  },
  pt: {
    message: {
      consent: {
        accept: 'Aceitar',
        allow: 'Prefere anúncios personalizados?',
        deny: 'Negar',
        disclaimer: '(Este site não rastreia seus visitantes nem vende dados)'
      },
      loading: 'Carregando...',
      generic: {
        delete: 'Excluir',
        error: 'Ocorreu um erro.'
      },
      now_page: {
        back: '← Voltar ao guia de rádio',
        title: 'Atualmente no rádio'
      },
      params_page: {
        automatic: 'Automático',
        automatic_help: 'Com base na sua conexão e largura de banda.',
        deactivated: 'Desativado',
        description: 'Para reduzir os anúncios no início de uma transmissão de rádio e o tempo de carregamento, o player pode ler duas transmissões simultâneas quando você troca ou pausa o rádio.',
        duration_10: 'Durante 10 min',
        duration_30: 'Durante 30 min',
        no_support: 'Seu navegador não suporta a detecção automática.',
        save: 'Salvar',
        sub_title: 'Transmissão múltipla',
        title: 'Parâmetros do jogador',
        two_flux: 'Dois fluxos simultâneos',
        updated: 'Os parâmetros foram atualizados. '
      },
      player: {
        autoplay_error: 'Seu navegador não permite a reprodução automática.',
        play_error: 'Erro de mídia',
        placeholder: 'Clique no logotipo de uma rádio para começar a transmitir',
        previous: 'Toque {radio} novamente',
        save_song: 'Salve esta música ({song})',
        song_saved: 'A música foi salva.',
        favorites: {
          add: 'Adicionar aos favoritos',
          remove: 'Remover dos favoritos'
        },
        timer: {
          cancelled: 'O cronômetro foi cancelado',
          end_in: 'O cronômetro termina em 0 minuto | O cronômetro termina em {minutes} minuto | O cronômetro termina em {minutos} minutos',
          finish: 'A reprodução foi interrompida (cronômetro)',
          modal: {
            abrv: 'n',
            cancel: 'Cancele o cronômetro',
            close: 'Fechar',
            length: 'Duração do tempo',
            placeholder: 'Minutos',
            quick: 'Configuração de atalho',
            set: 'Definir temporizador',
            title: 'Timer',
            x_minutes: '{minutes} minutos',
            x_hours: '{hours} horas'
          },
          set: 'O cronômetro foi configurado para {minutos} minuto (s)',
          title: 'Timer',
          tooltip: 'Clique aqui para definir o temporizador'
        },
        video: {
          title: 'Player de vídeo'
        },
      },
      radio_page: {
        back: '← Voltar ao guia de rádio',
        current: '↓ Ir para o programa atual',
        play: 'Ouça {radio}',
        stop: 'Parar {radio}',
        no_schedule: 'Programação não disponível',
        title: 'Horário da rádio {rádio}',
        webradios: 'Webrádios'
      },
      schedule: {
        no_schedule: 'Programação não disponível :(',
        no_radio: 'Não há rádio nesta coleção',
        no_radio_favorites: 'Você não tem rádios favoritas',
        preroll_filter: 'Rádios com anúncios no início',
        title: 'Horários de rádio na França, streaming e muito mais!',
        today: 'Hoje',
        tomorrow: 'Amanhã',
        tooltip: 'Mais rádios aqui',
        radio_list: {
          page: 'Página de programação',
          pick_region_title: 'Selecione uma área',
          region: {
            modal: {
              close: 'Fechar',
            }
          }
        }
      },
      songs_page: {
        buy: 'Comprar',
        buy_amazon: 'Amazon',
        find: 'Pesquisar',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: 'Você ainda não tem músicas salvas.',
        title: 'Músicas salvas',
      },
      streaming: {
        categories: {
          all_countries: 'Todos os países',
          favorites: 'Favoritos',
          last: 'As pessoas estão ouvindo...',
          history: 'Minha história',
        },
        close: 'Voltar',
        country: 'País',
        country_search_no_result: 'Nenhum país encontrado',
        listeners_title: 'Ouvintes',
        listeners: 'Nenhum ouvinte no momento. | Atualmente, um ouvinte. | Atualmente {how_many} ouvintes.',
        more: 'Veja mais',
        no_results: 'Sem rádio',
        play: 'Ouça {radio}',
        playing: 'Jogando',
        random: 'Tocar uma rádio aleatória',
        search_placeholder: 'Pesquisar por nome, estilo, conteúdo...',
        stop: 'Parar',
        sort: {
          name: 'Por ordem alfabética',
          popularity: 'Por popularidade',
          random: 'Por ordem aleatória',
          last: 'Por último jogado (mundo)',
          user_last: 'Por último jogado (eu)'
        },
        suggest: 'Sugira uma modificação',
        title: 'Transmita rádios de todo o mundo!',
        website: 'Site'
      },
      toast: {
        home: {
          enabled: 'Esta página foi configurada como tela inicial.',
          disabled: 'Esta página foi removida como tela inicial.'
        }
      },
    },
  },
  it: {
    message: {
      consent: {
        accept: 'Accetta',
        allow: 'Preferisce gli annunci personalizzati?',
        deny: 'Negare',
        disclaimer: '(Questo sito web non traccia i suoi visitatori né vende dati)'
      },
      loading: 'Caricamento in corso...',
      generic: {
        delete: 'Elimina',
        error: 'Si è verificato un errore.'
      },
      now_page: {
        back: '← Torna alla radioguida',
        title: 'Attualmente alla radio'
      },
      params_page: {
        automatic: 'Automatico',
        automatic_help: 'In base alla sua connessione e larghezza di banda.',
        deactivated: 'Disattivato',
        description: 'Per ridurre gli annunci all\'inizio di uno streaming radiofonico e i tempi di caricamento, il lettore può leggere due stream simultaneamente quando cambia radio o la mette in pausa.',
        duration_10: 'Durante 10 min',
        duration_30: 'Durante 30 mi',
        no_support: 'Il suo browser non supporta il rilevamento automatico.',
        save: 'Salva',
        sub_title: 'Stream multiplex',
        title: 'Parametri del giocatore',
        two_flux: 'Due stream simultanei',
        updated: 'I parametri sono stati aggiornati.'
      },
      player: {
        autoplay_error: 'Il suo browser non consente la riproduzione automatica. Per favore faccia clic su Riproduci ancora una volta',
        play_error: 'Errore media',
        placeholder: 'Fare clic sul logo di una radio per iniziare lo streaming',
        previous: 'Riproduci {radio} di nuovo',
        save_song: 'Salva questo brano ({song})',
        song_saved: 'La canzone è stata salvata.',
        favorites: {
          add: 'Aggiungi ai preferiti',
          remove: 'Rimuovi dai preferiti'
        },
        timer: {
          cancelled: 'Il timer è stato annullato',
          end_in: 'Il timer termina tra 0 minuti | Il timer termina tra {minutes} minuto | Il timer termina tra {minutes} minuti',
          finish: 'Gioco interrotto (timer)',
          modal: {
            abrv: 'mn',
            cancel: 'Annulla il timer',
            close: 'Chiudi',
            length: 'Durata tempo',
            placeholder: 'Minuti',
            quick: 'Impostazione scorciatoia',
            set: 'Imposta timer',
            title: 'Timer',
            x_minutes: '{minutes} minuti',
            x_hours: '{hours} ore'
          },
          set: 'Il timer è stato impostato su {minutes} minuto/i',
          title: 'Timer',
          tooltip: 'Clicca qui per impostare il timer'
        },
        video: {
          title: 'Lettore video'
        },
      },
      radio_page: {
        back: '← Back to radio guide',
        current: '↓ Go to current show',
        play: 'Listen to {radio}',
        stop: 'Stop {radio}',
        no_schedule: 'Schedule not available',
        title: 'Schedule of the radio {radio}',
        webradios: 'Webradios'
      },
      schedule: {
        no_schedule: 'Programma non disponibile :(',
        no_radio: 'Nessuna radio in questa collezione',
        no_radio_favorites: 'Non ha radio preferite',
        preroll_filter: 'Radio con pubblicità all\'inizio',
        title: 'Programmazioni radiofoniche in Francia, streaming e altro ancora!',
        today: 'Oggi',
        tomorrow: 'Domani',
        tooltip: 'Altre radio qui',
        radio_list: {
          page: 'Pagina di programmazione',
          pick_region_title: 'Seleziona un\'area',
          region: {
            modal: {
              close: 'Chiudi',
            }
          }
        }
      },
      songs_page: {
        buy: 'Comperare',
        buy_amazon: 'Amazon',
        find: 'Cerca',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: 'Non ha ancora nessuna canzone salvata.',
        title: 'Canzoni salvate',
      },
      streaming: {
        categories: {
          all_countries: 'Tutti i paesi',
          favorites: 'Preferiti',
          last: 'La gente ascolta...',
          history: 'La mia storia',
        },
        close: 'Indietro',
        country: 'Paese',
        country_search_no_result: 'Nessun Paese trovato',
        listeners_title: 'Ascoltatori',
        listeners: 'Nessun ascoltatore al momento. | Attualmente un ascoltatore. | Attualmente {how_many} ascoltatori.',
        more: 'Vedi di più',
        no_results: 'Nessuna radio',
        play: 'Ascolta {radio}',
        playing: 'Giocando',
        random: 'Riproduci una radio a caso',
        search_placeholder: 'Ricerca per nome, stile, contenuto...',
        stop: 'Stop',
        sort: {
          name: 'In ordine alfabetico',
          popularity: 'Per popolarità',
          random: 'Per ordine casuale',
          last: 'Per ultima giocata (mondo)',
          user_last: 'Per ultimo giocato (io)'
        },
        suggest: 'Suggerisci una modifica',
        title: 'Stream radios from all over the world!',
        website: 'Sito web'
      },
      toast: {
        home: {
          enabled: 'Questa pagina è stata impostata come schermata iniziale.',
          disabled: 'Questa pagina è stata rimossa dalla schermata iniziale'
        }
      },
    },
  },
  pl: {
    message: {
      consent: {
        accept: 'Zaakceptuj',
        allow: 'Wolisz spersonalizowane reklamy?',
        deny: 'Zaprzecza',
        disclaimer: '(Ta strona internetowa nie śledzi odwiedzających ani nie sprzedaje danych)'
      },
      loading: 'Ładowanie...',
      generic: {
        delete: 'Usuń',
        error: 'Wystąpił błąd.'
      },
      now_page: {
        back: '← Powrót do przewodnika radiowego',
        title: 'Obecnie w radiu'
      },
      params_page: {
        automatic: 'Automatyczny',
        automatic_help: 'W zależności od połączenia i przepustowości.',
        deactivated: 'Dezaktywowany',
        description: 'Aby zmniejszyć liczbę reklam na początku strumienia radiowego i czasu ładowania, odtwarzacz może odczytać dwa jednoczesne strumienie podczas przełączania radia lub wstrzymania.',
        duration_10: 'W ciągu 10 minut',
        duration_30: 'W ciągu 30 minut',
        no_support: 'Twoja przeglądarka nie obsługuje automatycznego wykrywania.',
        save: 'Zapisz',
        sub_title: 'Multipleks strumieniowy',
        title: 'Parametry odtwarzacza',
        two_flux: 'Dwa jednoczesne strumienie',
        updated: 'Parametry zostały zaktualizowane.'
      },
      player: {
        autoplay_error: 'Twoja przeglądarka nie zezwala na automatyczne odtwarzanie. Proszę kliknąć zagraj jeszcze raz',
        play_error: 'Błąd mediów',
        placeholder: 'Kliknij logo radia, aby rozpocząć transmisję strumieniową',
        previous: 'Odtwórz {radio} ponownie',
        save_song: 'Zapisz tę piosenkę ({song})',
        song_save: 'Piosenka została zapisana',
        favorites: {
          add: 'Dodaj do ulubionych',
          remove: 'Usuń z ulubiony'
        },
        timer: {
          cancelled: 'Timer został anulowany',
          end_in: 'Timer kończy się w ciągu 0 minut | Timer kończy się w {minutes} minucie | Timer kończy się w {minutes} minutach',
          finish: 'Odtwarzanie zatrzymane (timer)',
          modal: {
            abrv: 'min',
            cancel: 'Anuluj timer',
            close: 'Zamknij',
            length: 'Długość czasu',
            placeholder: 'Minuty',
            quick: 'Ustawienie skrótu',
            set: 'Ustaw timer',
            title: 'Timer',
            x_minutes: '{minutes} minuty',
            x_hours: '{hours} godziny'
          },
          set: 'Timer został ustawiony na {minutes} minutę',
          title: 'Timer',
          tooltip: 'Kliknij tutaj, aby ustawić timer'
        },
        video: {
          title: 'Odtwarzacz wideo'
        },
      },
      radio_page: {
        back: '← Powrót do przewodnika radiowego',
        current: '↓ Przejdź do bieżącego pokazu',
        play: 'Słuchaj {radio}',
        stop: 'Zatrzymaj {radio}',
        no_schedule: 'Harmonogram niedostępny',
        title: 'Harmonogram radia {radio}',
        webradios: 'Radia internetowe'
      },
      schedule: {
        no_schedule: 'Harmonogram niedostępny :(',
        no_radio: 'Brak radia w tej kolekcji',
        no_radio_favorites: 'Nie masz ulubionych radiów',
        preroll_filter: 'Radia z reklamami na startu',
        title: 'Rozkłady radiowe we Francji, transmisje strumieniowe i nie tylko!',
        today: 'Dzisiaj',
        tomorrow: 'Jutro',
        tooltip: 'Więcej radia tutaj',
        radio_list: {
          page: 'Strona harmonogramu',
          pick_region_title: 'Wybierz obszar',
          region: {
            modal: {
              close: 'Zamknij',
            }
          }
        }
      },
      songs_page: {
        buy: 'Kupić',
        buy_amazon: 'Amazon',
        find: 'Szukaj',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: 'Nie masz jeszcze zapisanych utworów.',
        title: 'Zapisane piosenki',
      },
      streaming: {
        categories: {
          all_countries: 'Wszystkie kraje',
          favorites: 'Ulubione',
          last: 'Ludzie słuchają...',
          history: 'Moja historia',
        },
        close: 'Powrót',
        country: 'Kraj',
        country_search_no_result: 'Nie znaleziono kraju',
        listeners_title: 'Słuchacze',
        listeners: 'Obecnie nie ma słuchacza. | Obecnie jeden słuchacz. | Obecnie słuchacze {how_many}.',
        more: 'Zobacz więcej',
        no_results: 'Brak radia',
        play: 'Słuchaj {radio}',
        playing: 'Odtwarzanie',
        random: 'Odtwórz losowe radio',
        search_placeholder: 'Szukaj według nazwy, stylu, zawartości...',
        stop: 'Zatrzymaj',
        sort: {
          name: 'Według kolejności alfabetycznej',
          popularity: 'Według popularności',
          random: 'W kolejności losowej',
          last: 'Ostatnio odtwarzane przez (świat)',
          user_last: 'Ostatnio odtwarzane przez (mi)'
        },
        suggest: 'Zaproponuj modyfikację',
        title: 'Przesyłaj strumieniowo radia z całego świata!',
        website: 'Strona'
      },
      toast: {
        home: {
          enabled: 'Ta strona została ustawiona jako ekran główny.',
          disabled: 'Ta strona została usunięta jako ekran główny.'
        }
      },
    },
  },
  el: {
    message: {
      consent: {
        accept: 'Αποδοχή',
        allow: 'Προτιμάτε εξατομικευμένες διαφημίσεις;',
        deny: 'Αρνήσου',
        disclaimer: '(Αυτός ο ιστότοπος δεν παρακολουθεί τους επισκέπτες του ή πωλεί δεδομένα)'
      },
      loading: 'Φόρτωση...',
      generic: {
        delete: 'Διαγραφή',
        error: 'Παρουσιάστηκε σφάλμα.'
      },
      now_page: {
        back: '← Επιστροφή στον οδηγό ραδιοφωνίας',
        title: 'Αυτή τη στιγμή στο ραδιόφωνο'
      },
      params_page: {
        automatic: 'Αυτόματη',
        automatic_help: 'Με βάση τη σύνδεσή σας και το εύρος ζώνης.',
        deactivated: 'Απενεργοποιημένο',
        description: 'Για να μειώσετε τις διαφημίσεις κατά την έναρξη μιας ροής ραδιοφώνου και τους χρόνους φόρτωσης, η συσκευή αναπαραγωγής μπορεί να διαβάσει δύο ταυτόχρονες ροές όταν αλλάζετε ραδιόφωνο ή διακόπτετε το ραδιόφωνο.',
        duration_10: 'Κατά τη διάρκεια 10 λεπτών',
        duration_30: 'Κατά τη διάρκεια 30 λεπτών',
        no_support: 'Το πρόγραμμα περιήγησής σας δεν υποστηρίζει αυτόματη ανίχνευση.',
        save: 'Αποθήκευση',
        sub_title: 'Πολυπλέκτης ροής',
        title: 'Παράμετροι παίχτης',
        two_flux: 'Δύο ταυτόχρονες ροές',
        updated: 'Οι παράμετροι έχουν ενημερωθεί.'
      },
      player: {
        autoplay_error: 'Το πρόγραμμα περιήγησής σας δεν επιτρέπει την αυτόματη αναπαραγωγή. Παρακαλώ κάντε κλικ στην αναπαραγωγή για άλλη μια φορά.',
        play_error: 'Σφάλμα μέσου',
        placeholder: 'Κάντε κλικ σε ένα λογότυπο ραδιοφώνου για να ξεκινήσετε τη ροή',
        previous: 'Παίξτε ξανά το {radio}',
        save_song: 'Αποθηκεύστε αυτό το τραγούδι ({τραγούδι})',
        song_save: 'Το τραγούδι έχει αποθηκευτεί.',
        favorites: {
          add: 'Προσθήκη στα αγαπημένα',
          remove: 'Αφαίρεση από τα αγαπημένα'
        },
        timer: {
          cancelled: 'Ο χρονοδιακόπτης ακυρώθηκε',
          end_in: 'Ο χρονοδιακόπτης τελειώνει σε 0 λεπτά | Ο χρονοδιακόπτης τελειώνει σε {minutes} λεπτά | Ο χρονοδιακόπτης τελειώνει σε {minutes} λεπτά',
          finish: 'Η αναπαραγωγή σταμάτησε (χρονοδιακόπτης)',
          modal: {
            abrv: 'λ.',
            cancel: 'Ακυρώστε το χρονόμετρο',
            close: 'Κλείσιμο',
            length: 'Διάρκεια χρονικής',
            placeholder: 'Λεπτά',
            quick: 'Ρύθμιση συντομεύσεων',
            set: 'Ορισμός χρονοδιακόπτης',
            title: 'Χρονοδιακόπτης',
            x_minutes: '{minutes} λεπτά',
            x_hours: '{hours} ώρες'
          },
          set: 'Ο χρονοδιακόπτης έχει ρυθμιστεί σε {minutes} λεπτών',
          title: 'Χρονοδιακόπτης',
          tooltip: 'Κάντε κλικ εδώ για να ορίσετε το χρονοδιακόπτη'
        },
        video: {
          title: 'Βίντεο'
        },
      },
      radio_page: {
        back: '← Επιστροφή στον οδηγό ραδιοφωνίας',
        current: '↓ Μετάβαση στην τρέχουσα εκπομπή',
        play: 'Ακούστε το {radio}',
        stop: 'Σταματήστε {radio}',
        no_schedule: 'Το πρόγραμμα δεν είναι διαθέσιμο',
        title: 'Πρόγραμμα του ραδιοφώνου {radio}',
        webradios: 'Διαδικτυακά ραδιόφωνο'
      },
      schedule: {
        no_schedule: 'Το πρόγραμμα δεν είναι διαθέσιμο :(',
        no_radio: 'Δεν υπάρχει ραδιόφωνο σε αυτή τη συλλογή',
        no_radio_favorites: 'Δεν έχετε αγαπημένα ραδιόφωνα',
        preroll_filter: 'Ραδιόφωνα με διαφημίσεις στην αρχή',
        title: 'Ραδιοφωνικά προγράμματα στη Γαλλία, streaming και πολλά άλλα!',
        today: 'Σήμερα',
        tomorrow: 'Αύριο',
        tooltip: 'Περισσότερα ραδιόφωνα εδώ',
        radio_list: {
          page: 'Σελίδα χρονοδιαγράμματος',
          pick_region_title: 'Επιλέξτε περιοχή',
          region: {
            modal: {
              close: 'Κλείσιμο',
            }
          }
        }
      },
      songs_page: {
        buy: 'Αγορά',
        buy_amazon: 'Amazon',
        find: 'Αναζήτηση',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: 'Δεν έχετε αποθηκεύσει ακόμα τραγούδια.',
        title: 'Αποθηκευμένα τραγούδια',
      },
      streaming: {
        categories: {
          all_countries: 'Όλες οι χώρες',
          favorites: 'Αγαπημένα',
          last: 'Οι άνθρωποι ακούνε...',
          history: 'Η ιστορία μου',
        },
        close: 'Πίσω',
        country: 'Χώρα',
        country_search_no_result: 'Δεν βρέθηκε χώρα',
        listeners_title: 'Ακροατές',
        listeners: 'Δεν υπάρχει ακροατής προς το παρόν. | Αυτήν τη στιγμή ένας ακροατής. | Αυτή τη στιγμή {how_many} ακροατές.',
        more: 'Δείτε περισσότερα',
        no_results: 'Χωρίς ραδιόφωνο',
        play: 'Ακούστε το {ραδιόφωνο}',
        playing: 'Παίζοντας',
        random: 'Αναπαραγωγή τυχαίου ραδιοφώνου',
        search_placeholder: 'Αναζήτηση με βάση το όνομα, το στυλ, το περιεχόμενο...',
        stop: 'Σταματήστε',
        sort: {
          name: 'Κατά αλφαβητική σειρά',
          popularity: 'Με δημοτικότητα',
          random: 'Με τυχαία διατάξη',
          last: 'Ανά τελευταία αναπαραγωγή (κόσμος)',
          user_last: 'Με τελευταία αναπαραγωγή (εγώ)'
        },
        suggest: 'Προτείνετε μια τροποποίηση',
        title: 'Μεταδώστε ραδιόφωνα από όλο τον κόσμο!',
        website: 'Ιστότοπος'
      },
      toast: {
        home: {
          enabled: 'Αυτή η σελίδα έχει οριστεί ως αρχική οθόνη.',
          disabled: 'Αυτή η σελίδα έχει αφαιρεθεί ως αρχική οθόνη.'
        }
      },
    },
  },
  ar: {
    message: {
      consent: {
        accept: 'نعم',
        allow: 'هل تفضل الإعلانات المخصصة؟',
        deny: 'لا',
        disclaimer: '(نحن لا نبيع بيانات مستخدمينا)'
      },
      loading: 'جاري التحميل...',
      generic: {
        delete: 'إزالة',
        error: 'لقد حدث خطأ'
      },
      now_page: {
        back: 'ارجع إلى جدول البرنامج الكامل',
        title: 'الآن على الراديو'
      },
      params_page: {
        automatic: 'تلقائي',
        automatic_help: 'استنادًا إلى نوع الاتصال الخاص بك (ADSL، الألياف، 4G...) والنطاق الترددي الخاص بك.',
        deactivated: 'تم إلغاء تنشيطه',
        description: 'لتقليل الإعلانات في بداية البث وأوقات التحميل، يمكن للاعب الاستمرار في تشغيل البث السابق لعدة دقائق عند تغيير الراديو أو إيقاف التشغيل مؤقتًا.',
        duration_10: 'لمدة 10 دقائق',
        duration_30: 'لمدة 30 دقيقة',
        no_support: 'متصفحك لا يدعم الاكتشاف التلقائي.',
        save: 'وفر',
        sub_title: 'قراءات البث المتزامنة',
        title: 'إعداد المشغل',
        two_flux: 'تدفقان متزامنان',
        updated: 'تم تحديث الإعدادات'
      },
      player: {
        autoplay_error: 'ا يسمح المستعرض الخاص بك بتشغيل الوسائط تلقائيًا. يرجى النقر فوق «استمع» مرة أخرى',
        play_error: 'خطأ في القراءة',
        placeholder: 'انقر فوق الشعار لبدء القراءة',
        previous: 'استمع إلى {radio} مرة أخرى',
        save_song: 'احفظ هذا المسار ({song})',
        song_saved: 'تم حفظ العنوان',
        favorites: {
          add: 'إضافة إلى المفضلة',
          remove: 'إزالة من المفضلة'
        },
        timer: {
          cancelled: 'تم إلغاء جهاز ضبط الوقت',
          end_in: 'ينتهي المؤقِّت في 0 دقيقة | ينتهي المؤقِّت بـ {minutes} | ينتهي المؤقِّت بـ {minutes} دقيقة',
          finish: 'توقف عن القراءة (مؤقت)',
          modal: {
            abrv: 'دقائق',
            cancel: 'إلغاء المؤقت',
            close: 'المدّة',
            length: 'المدّة',
            placeholder: 'الدقائق',
            quick: 'اختيار سريع',
            set: 'ابدأ جهاز ضبط الوقت',
            title: 'جهاز ضبط الوقت',
            x_minutes: 'الدقائق {minutes}',
            x_hours: '{hours} ساعات'
          },
          set: 'المؤقِّت قيد التشغيل لمدة 0 دقيقة | المؤقِّت قيد التشغيل لمدة {minutes} دقيقة |المؤقِّت قيد التشغيل لمدة {minutes}',
          title: 'جهاز ضبط الوقت',
          tooltip: 'انقر هنا لتنشيط جهاز ضبط الوقت'
        },
        video: {
          title: 'مشغل فديوهات'
        },
      },
      radio_page: {
        back: 'ارجع إلى جدول البرنامج الكامل',
        current: ' انتقل إلى العرض الحالي ↓',
        no_schedule: 'البرامج غير متوفرة.',
        play: 'استمع إلى {radio}',
        stop: 'إيقاف {radio}',
        title: 'برامج {radio} والبث',
        webradios: 'أجهزة راديو الويب'
      },
      schedule: {
        no_schedule: 'البرامج غير متوفرة',
        no_radio: 'لا يوجد راديو في هذه الفئة',
        no_radio_favorites: 'ليس لديك محطات راديو مفضلة',
        preroll_filter: 'أجهزة راديو مع إعلان عند الإطلاق',
        title: 'جميع محطات الراديو وجميع البرامج والاستماع عبر الإنترنت',
        today: 'اليوم',
        tomorrow: 'غدًا',
        tooltip: 'المزيد من أجهزة الراديو هنا',
        radio_list: {
          page: 'صفحة البرامج',
          pick_region_title: 'اختر منطقة',
          region: {
            modal: {
              close: 'أغلق',
            }
          }
        }
      },
      songs_page: {
        buy: 'شراء',
        buy_amazon: 'Amazon',
        find: 'ابحث',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: 'ليس لديك أي أغاني محفوظة.',
        title: 'العناوين المحفوظة',
      },
      streaming: {
        categories: {
          all_countries: 'جميع البلدان',
          favorites: 'مفضلات',
          last: 'الناس يستمعون...',
          history: 'التاريخ الخاص بي',
        },
        close: 'العودة',
        country: 'البلدان',
        country_search_no_result: 'لم يتم العثور على أي بلد',
        listeners_title: 'مدققو حسابات',
        listeners: 'لا يوجد مستمعون حاليًا. | مستمع واحد حاليًا. | {how_many} مستمعين حاليًا.',
        more: 'شاهد المزيد',
        no_results: 'لا يوجد راديو',
        play: 'استمع إلى {radio}',
        playing: 'العنوان',
        random: 'قم بتشغيل راديو عشوائي',
        search_placeholder: 'البحث بالاسم والأسلوب والمحتوى...',
        stop: 'سدادة',
        sort: {
          name: 'بالترتيب الأبجدي',
          popularity: 'حسب الشعبية',
          random: 'بترتيب عشوائي',
          last: 'حسب آخر مباراة (العالم)',
          user_last: 'حسب آخر مباراة (أنا)'
        },
        suggest: 'قترح تعديلً',
        title: 'بث محطات الراديو من جميع أنحاء العالم',
        website: 'الموقع الإلكتروني'
      },
      toast: {
        home: {
          enabled: 'تم تنشيط الصفحة كصفحة رئيسية.',
          disabled: 'تمت إزالة الصفحة كصفحة رئيسية.'
        }
      }
    },
  },
  ro: {
    message: {
      consent: {
        accept: 'Da',
        allow: 'Preferați pub-urile personalizate?',
        deny: 'Nu',
        disclaimer: '(Nu vindem datele utilizatorilor noștri)'
      },
      loading: 'Se încarcă... ',
      generic: {
        delete: 'Șterge',
        error: 'A apărut o eroare.'
      },
      now_page: {
        back: '← Reveniți la programul complet al programelor',
        title: 'Chiar acum la radio'
      },
      params_page: {
        automatic: 'Automat',
        automatic_help: 'Pe baza tipului de conexiune (ADSL, fibră, 4g...) și lățimii de bandă.',
        deactivated: 'Dezactivat',
        description: 'Pentru a reduce anunțurile la începutul streamingului și timpii de încărcare, playerul poate continua să redea fluxul anterior timp de câteva minute atunci când schimbați radioul sau când întrerupeți redarea.',
        duration_10: 'Timp de 10 mine',
        duration_30: 'Timp de 30 de mine',
        no_support: 'Browserul dvs. nu acceptă detectarea automată. ',
        save: 'Salvează',
        sub_title: 'Citiri simultane în flux',
        title: 'Configurarea cititorului',
        two_flux: 'Două fluxuri simultane',
        updated: 'Setări actualizate'
      },
      player: {
        autoplay_error: "Votre navigateur n'autorise pas la lecture automatique de médias. Merci de cliquer sur \"Ecouter\" une fois de plus",
        play_error: 'Erreur de lecture',
        placeholder: 'Cliquer sur un logo pour lancer la lecture',
        previous: 'Ecouter {radio} de nouveau',
        save_song: 'Sauvegarder ce titre ({song})',
        song_saved: 'Le titre a été sauvegardé.',
        favorites: {
          add: 'Ajouter aux favoris',
          remove: 'Retirer des favoris'
        },
        timer: {
          cancelled: 'Le minuteur a été annulé',
          end_in: 'Cronometrul se termină în 0 minute | Cronometrul se termină în {minute} minute | Cronometrul se termină în {minute} minute',
          finish: 'Opriți redarea (temporizator) ',
          modal: {
            abrv: 'mn',
            cancel: 'Anulați cronometrul',
            close: 'Închidere',
            length: 'Durată',
            placeholder: 'Minute',
            quick: 'Selectare rapidă',
            set: 'Porniți temporizatorul',
            title: 'Cronometru',
            x_minutes: '{minutes} minute',
            x_hours: '{hours} ore'
          },
          set: 'Cronometrul este pornit timp de 0 minute | Cronometrul este pornit pentru {minute} minut |Cronometrul este pornit pentru {minute} minute',
          title: 'Cronometru',
          tooltip: 'Faceți clic aici pentru a activa cronometrul'
        },
        video: {
          title: 'Video player'
        },
      },
      radio_page: {
        back: '← Reveniți la programul complet al programelor',
        current: '↓ Du-te la spectacolul curent',
        no_schedule: 'Programele nu sunt disponibile. ',
        play: 'Ascultă {radio} ',
        stop: 'Opriți {radio} ',
        title: 'Programele și streamingul {radio} ',
        webradios: 'Radiouri web'
      },
      schedule: {
        no_schedule: 'Programele nu sunt disponibile :(',
        no_radio: 'Nu există radio în această categorie',
        no_radio_favorite: 'Nu aveți radiouri preferate',
        preroll_filter: 'Radiouri cu anunț la lansare',
        title: 'Toate programele radio, toate programele și ascultarea online',
        today: 'Astăzi',
        tomorrow: 'Mâine',
        tooltip: 'Mai multe radiouri aici',
        radio_list: {
          page: 'Pagina programe',
          pick_region_title: 'Alegeți o regiune',
          region: {
            modal: {
              close: 'Închidere',
            }
          }
        }
      },
      songs_page: {
        buy: 'Cumpără',
        buy_amazon: 'Amazon',
        find: 'Căutare',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'YouTube',
        no_songs: 'Nu aveți nicio melodie salvată.',
        title: 'Titluri salvate',
      },
      streaming: {
        categories: {
          all_countries: 'Toate țările',
          favorites: 'Favorite',
          last: 'Oamenii ascultă...',
          history: 'Istoria mea'
        },
        close: 'Înapoi',
        country: 'Țară',
        country_search_no_result: 'Nicio țară găsită',
        listeners_title: 'Ascultători',
        listeners: 'Nu există ascultători momentan. | Un ascultător în prezent. | {how_many} ascultători în prezent.',
        more: 'Vezi mai multe',
        no_results: 'Fără radio',
        play: 'Ascultă {radio}',
        playing: 'Title',
        random: 'Redați un radio aleator',
        search_placeholder: 'Căutaţi după nume, stil, conţinut...',
        stop: 'Stop',
        sort: {
          name: 'În ordine alfabetică',
          popularity: 'După popularitate',
          random: 'În ordine aleatorie',
          last: 'După ultima dată jucat (lume)',
          user_last: 'De ultima dată jucat (eu)'
        },
        suggest: 'Sugerați o schimbare',
        title: 'Posturi de radio din întreaga lume difuzează în flux',
        website: 'Site'
      },
      toast: {
        home: {
          enabled: 'Pagina a fost activată ca pagină de pornire.',
          disabled: 'Pagina a fost eliminată ca pagină de pornire.'
        }
      }
    },
  },
  hu: {
    message: {
      consent: {
        accept: 'Igen',
        allow: 'Személyre szabott hirdetések preferálása?',
        deny: 'Nem',
        disclaimer: '(Nem adjuk el felhasználóink adatait)'
      },
      loading: 'Betöltés...',
      generic: {
        delete: 'Törlés',
        error: 'Hiba történt.'
      },
      now_page: {
        back: '← Vissza a teljes műsortervhez',
        title: 'Most a rádióban'
      },
      params_page: {
        automatic: 'Automatikus',
        automatic_help: 'A kapcsolat típusa alapján (ADSL, optikai, 4G...) és sávszélesség szerint.',
        deactivated: 'Kikapcsolva',
        description: 'A stream elején lévő hirdetések és betöltési idő csökkentése érdekében a lejátszó folytathatja az előző adás lejátszását néhány percig, amikor rádiót vált vagy szünetet tart.',
        duration_10: '10 percig',
        duration_30: '30 percig',
        no_support: 'A böngésző nem támogatja az automatikus érzékelést.',
        save: 'Mentés',
        sub_title: 'Egyidejű stream lejátszások',
        title: 'Lejátszó beállítások',
        two_flux: 'Két egyidejű stream',
        updated: 'Beállítások frissítve'
      },
      player: {
        autoplay_error: 'A böngésző nem engedélyezi az automatikus lejátszást. Kérjük, kattintson ismét a "Hallgatás" gombra',
        play_error: 'Lejátszási hiba',
        placeholder: 'Kattintson egy logóra a lejátszáshoz',
        previous: '{radio} újrahallgatása',
        save_song: 'Zeneszám mentése ({song})',
        song_saved: 'A zeneszám mentésre került.',
        favorites: {
          add: 'Hozzáadás a kedvencekhez',
          remove: 'Eltávolítás a kedvencekből'
        },
        timer: {
          cancelled: 'Időzítő törölve',
          end_in: 'Időzítő lejár 0 perc múlva | Időzítő lejár {minutes} perc múlva | Időzítő lejár {minutes} perc múlva',
          finish: 'Lejátszás leállítva (időzítő)',
          modal: {
            abrv: 'p',
            cancel: 'Időzítő törlése',
            close: 'Bezárás',
            length: 'Időtartam',
            placeholder: 'Percek',
            quick: 'Gyors választás',
            set: 'Időzítő indítása',
            title: 'Időzítő',
            x_minutes: '{minutes} perc',
            x_hours: '{hours} óra'
          },
          set: 'Időzítő 0 percre állítva | Időzítő {minutes} percre állítva | Időzítő {minutes} percre állítva',
          title: 'Időzítő',
          tooltip: 'Kattintson ide az időzítő aktiválásához'
        },
        video: {
          title: 'Videó lejátszó'
        },
      },
      radio_page: {
        back: '← Vissza a teljes műsortervhez',
        current: '↓ Ugrás a jelenlegi műsorhoz',
        no_schedule: 'Műsorok nem elérhetőek.',
        play: '{radio} hallgatása',
        stop: '{radio} leállítása',
        title: '{radio} műsorai és streamelése',
        webradios: 'Webrrádiók'
      },
      schedule: {
        no_schedule: 'Műsorok nem elérhetőek :(',
        no_radio: 'Nincs rádió ebben a kategóriában',
        no_radio_favorites: 'Nincsenek kedvenc rádióállomásai',
        preroll_filter: 'Rádiók indítási hirdetéssel',
        title: 'Minden rádiócsatorna, minden műsor és online hallgatás',
        today: 'Ma',
        tomorrow: 'Holnap',
        tooltip: 'Több rádió itt',
        radio_list: {
          page: 'Műsorok oldala',
          pick_region_title: 'Régió választása',
          region: {
            modal: {
              close: 'Bezárás',
            }
          }
        }
      },
      songs_page: {
        buy: 'Vásárlás',
        buy_amazon: 'Amazon',
        find: 'Keresés',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: 'Nincsenek mentett zeneszámok.',
        title: 'Mentett zeneszámok',
      },
      streaming: {
        categories: {
          all_countries: 'Minden ország',
          favorites: 'Kedvencek',
          last: 'Emberek hallgatják...',
          history: 'Saját előzmények'
        },
        close: 'Vissza',
        country: 'Ország',
        country_search_no_result: 'Nem találhatók országok',
        listeners_title: 'Hallgatók',
        listeners: 'Jelenleg nincs hallgató. | Jelenleg egy hallgató. | Jelenleg {how_many} hallgató.',
        more: 'Több megtekintése',
        no_results: 'Nincs rádió',
        play: '{radio} hallgatása',
        playing: 'Zeneszám',
        random: 'Véletlenszerű rádió lejátszása',
        search_placeholder: 'Keresés név, stílus, tartalom alapján...',
        stop: 'Leállítás',
        sort: {
          name: 'ABC sorrendben',
          popularity: 'Népszerűség alapján',
          random: 'Véletlenszerű sorrendben',
          last: 'Utolsó hallgatás alapján (világ)',
          user_last: 'Utolsó hallgatás alapján (saját)'
        },
        suggest: 'Módosítási javaslat',
        title: 'Világ rádióinak streamelése',
        website: 'Weboldal'
      },
      toast: {
        home: {
          enabled: 'Az oldal beállítva kezdőlapként.',
          disabled: 'Az oldal eltávolítva kezdőlapként.'
        }
      }
    },
  },
};
