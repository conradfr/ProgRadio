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
        autoplay_error: 'Your browser does not allow autoplay. Please click play one more time',
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
          last: 'People listen to ...',
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
  de: {
    message: {
      consent: {
        accept: 'Akzeptieren',
        allow: 'Bevorzugen Sie personalisierte Werbung? ',
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
        song_saved: 'Das Lied wurde gespeichert',
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
            add: 'Hinzufügen',
            cancel: 'Stornieren',
            close: 'Schliessen',
            length: 'Länge der Zeit',
            placeholder: 'Minuten',
            quick: 'Tastenkürzeleinstellung',
            set: 'Timer einstellen',
            title: 'Timer',
            x_minutes: '{minutes} Minuten'
          },
          set: 'Der Timer wurde auf {minutes} Minute (n) eingestellt',
          title: 'Timer',
          tooltip: 'Klicken Sie hier, um den Timer einzustellen'
        }
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
          last: 'Von zuletzt gespielt'
        },
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
        no_support: 'Seu navegador não suporta a detecção automática. ',
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
        song_saved: 'A música foi salva',
        favorites: {
          add: 'Adicionar aos favoritos',
          remove: 'Remover dos favoritos'
        },
        timer: {
          cancelled: 'O cronômetro foi cancelado',
          end_in: 'O cronômetro termina em 0 minuto | O cronômetro termina em {minutes} minuto | O cronômetro termina em {minutos} minutos',
          finish: 'A reprodução foi interrompida (cronômetro) ',
          modal: {
            abrv: 'n',
            add: 'Adicionar',
            cancel: 'Cancelar',
            close: 'Fechar',
            length: 'Duração do tempo',
            placeholder: 'Minutos',
            quick: 'Configuração de atalho',
            set: 'Definir temporizador',
            title: 'Timer',
            x_minutes: '{minutes} minutos'
          },
          set: 'O cronômetro foi configurado para {minutos} minuto (s)',
          title: 'Timer',
          tooltip: 'Clique aqui para definir o temporizador'
        }
      },
      radio_page: {
        back: '← Voltar ao guia de rádio',
        current: '↓ Ir para o programa atual',
        play: 'Ouça {radio} ',
        stop: 'Parar {radio}',
        no_schedule: 'Programação não disponível',
        title: 'Horário da rádio {rádio}',
        webradios: 'Webrádios'
      },
      schedule: {
        no_schedule: 'Programação não disponível :( ',
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
        find: 'Pesquisar',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: 'Você ainda não tem músicas salvas. ',
        title: 'Músicas salvas',
      },
      streaming: {
        categories: {
          all_countries: 'Todos os países',
          favorites: 'Favoritos',
          last: 'As pessoas estão ouvindo...',
        },
        close: 'Voltar',
        country: 'País',
        country_search_no_result: 'Nenhum país encontrado',
        listeners_title: 'Ouvintes',
        listeners: 'Nenhum ouvinte no momento. | Atualmente, um ouvinte. | Atualmente {how_many} ouvintes.',
        more: 'Veja mais',
        no_results: 'Sem rádio',
        play: 'Ouça {radio} ',
        playing: 'Jogando',
        random: 'Tocar uma rádio aleatória',
        search_placeholder: 'Pesquisar por nome, estilo, conteúdo...',
        stop: 'Parar',
        sort: {
          name: 'Por ordem alfabética',
          popularity: 'Por popularidade',
          random: 'Por ordem aleatória',
          last: 'Por último jogado'
        },
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
        song_saved: 'La canzone è stata salvata',
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
            add: 'Aggiungere',
            cancel: 'Annulla',
            close: 'Chiudi',
            length: 'Durata tempo',
            placeholder: 'Minuti',
            quick: 'Impostazione scorciatoia',
            set: 'Imposta timer',
            title: 'Timer',
            x_minutes: '{minutes} minuti'
          },
          set: 'Il timer è stato impostato su {minutes} minuto/i ',
          title: 'Timer',
          tooltip: 'Clicca qui per impostare il timer'
        }
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
          last: 'Per ultimo giocato'
        },
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
};
