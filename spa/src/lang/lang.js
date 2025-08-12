// todo modularize

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
  },
  tr: {
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
        save_song_not_logged: 'Sauvegarder ce titre (utilisateurs connectés uniquement)',
        save_song_no_title: 'Sauvegarder ce titre (titre non disponible)',
        song_saved: 'Le titre a été sauvegardé.',
        favorites: {
          add: 'Ajouter aux favoris',
          remove: 'Retirer des favoris'
        },
        output: {
          choose: 'Sélectionner une sortie audio',
          choose_label: 'Choisir une sortie audio:',
          save: 'Sauvegarder comme sortie par défaut',
          pause_if_disconnect: 'Arrêter la lecture si la sortie est déconnectée',
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
        listeners: 'Aucun auditeur actuellement. | Un auditeur actuellement. | {count} auditeurs actuellement.',
        more: 'Voir plus',
        no_results: 'Aucune radio',
        play: 'Ecouter {radio}',
        playing: 'Titre',
        playing_errors: 'Des erreurs de lecture ont été rapportées pour cette radio.',
        history: 'Derniers titres:',
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
        save_song_not_logged: 'Save this song (logged users only)',
        save_song_no_title: 'Save this song (no title)',
        song_saved: 'The song has been saved.',
        favorites: {
          add: 'Add to favorites',
          remove: 'Remove from favorites'
        },
        output: {
          choose: 'Select an audio output',
          choose_label: 'Choose an audio output:',
          save: 'Save as default output',
          pause_if_disconnect: 'Stop playback if output is disconnected'
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
        listeners: 'No listener currently. | Currently one listener. | Currently {count} listeners.',
        more: 'See more',
        no_results: 'No radio',
        play: 'Listen to {radio}',
        playing: 'Playing',
        playing_errors: 'Playing errors have been reported for this radio.',
        history: 'Last songs:',
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
        accept: 'Sí',
        allow: '¿Preferir anuncios personalizados?',
        deny: 'No',
        disclaimer: '(No vendemos los datos de nuestros usuarios)'
      },
      loading: 'Cargando...',
      generic: {
        delete: 'Eliminar',
        error: 'Ha ocurrido un error.'
      },
      now_page: {
        back: '← Volver a la parrilla completa de programas',
        title: 'En este momento en la radio'
      },
      params_page: {
        automatic: 'Automático',
        automatic_help: 'Basado en tu tipo de conexión (ADSL, fibra, 4G...) y tu ancho de banda.',
        deactivated: 'Desactivado',
        description: 'Para reducir los anuncios presentes al inicio del streaming y los tiempos de carga, el reproductor puede continuar reproduciendo el flujo anterior durante varios minutos cuando cambias de radio o cuando pones la reproducción en pausa.',
        duration_10: 'Durante 10 minutos',
        duration_30: 'Durante 30 minutos',
        no_support: 'Tu navegador no soporta la detección automática.',
        save: 'Guardar',
        sub_title: 'Reproducciones de flujos simultáneos',
        title: 'Configuración del reproductor',
        two_flux: 'Dos flujos simultáneos',
        updated: 'Configuración actualizada'
      },
      player: {
        autoplay_error: 'Tu navegador no permite la reproducción automática de medios. Por favor, haz clic en "Escuchar" nuevamente.',
        play_error: 'Error de reproducción',
        placeholder: 'Haz clic en un logo para iniciar la reproducción',
        previous: 'Escuchar {radio} de nuevo',
        save_song: 'Guardar esta canción ({song})',
        save_song_not_logged: 'Guardar esta canción (solo usuarios conectados)',
        save_song_no_title: 'Guardar esta canción (título no disponible)',
        song_saved: 'La canción ha sido guardada.',
        favorites: {
          add: 'Añadir a favoritos',
          remove: 'Eliminar de favoritos'
        },
        output: {
          choose: 'Seleccionar una salida de audio',
          choose_label: 'Elegir una salida de audio:',
          save: 'Guardar como salida predeterminada',
          pause_if_disconnect: 'Detener la reproducción si la salida se desconecta',
        },
        timer: {
          cancelled: 'El temporizador ha sido cancelado',
          end_in: 'Fin del temporizador en 0 minuto | Fin del temporizador en {minutes} minuto | Fin del temporizador en {minutes} minutos',
          finish: 'Detener la reproducción (temporizador)',
          modal: {
            abrv: 'min',
            cancel: 'Cancelar el temporizador',
            close: 'Cerrar',
            length: 'Duración',
            placeholder: 'Minutos',
            quick: 'Selección rápida',
            set: 'Iniciar el temporizador',
            title: 'Temporizador',
            x_minutes: '{minutes} minutos',
            x_hours: '{hours} horas'
          },
          set: 'El temporizador está activado para 0 minuto | El temporizador está activado para {minutes} minuto | El temporizador está activado para {minutes} minutos',
          title: 'Temporizador',
          tooltip: 'Haz clic aquí para activar el temporizador'
        },
        video: {
          title: 'Reproductor de video'
        },
      },
      radio_page: {
        back: '← Volver a la parrilla completa de programas',
        current: '↓ Ir al programa en curso',
        no_schedule: 'Programas no disponibles.',
        play: 'Escuchar {radio}',
        stop: 'Detener {radio}',
        title: 'Los programas y streaming de {radio}',
        webradios: 'Radios web'
      },
      schedule: {
        no_schedule: 'Programas no disponibles :(',
        no_radio: 'No hay radios en esta categoría',
        no_radio_favorites: 'No tienes radios favoritas',
        preroll_filter: 'Radios con publicidad al inicio',
        title: 'Todas las parrillas de radio, todos los programas y escucha en línea',
        today: 'Hoy',
        tomorrow: 'Mañana',
        tooltip: 'Más radios aquí',
        radio_list: {
          page: 'Página de programas',
          pick_region_title: 'Elegir una región',
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
        find: 'Buscar',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: 'No tienes canciones guardadas.',
        title: 'Canciones guardadas',
      },
      streaming: {
        categories: {
          all_countries: 'Todos los países',
          favorites: 'Favoritos',
          last: 'La gente está escuchando...',
          history: 'Mi historial'
        },
        close: 'Volver',
        country: 'País',
        country_search_no_result: 'Ningún país encontrado',
        listeners_title: 'Oyentes',
        listeners: 'Ningún oyente actualmente. | Un oyente actualmente. | {count} oyentes actualmente.',
        more: 'Ver más',
        no_results: 'Ninguna radio',
        play: 'Escuchar {radio}',
        playing: 'Título',
        playing_errors: 'Se han reportado errores de reproducción para esta radio.',
        history: 'Últimos títulos:',
        random: 'Reproducir una radio al azar',
        search_placeholder: 'Buscar por nombre, estilo, contenido...',
        stop: 'Detener',
        sort: {
          name: 'Por orden alfabético',
          popularity: 'Por popularidad',
          random: 'Por orden aleatorio',
          last: 'Por última escucha (mundo)',
          user_last: 'Por última escucha (yo)'
        },
        suggest: 'Sugerir una modificación',
        title: 'Las radios de todo el mundo en streaming',
        website: 'Sitio web'
      },
      toast: {
        home: {
          enabled: 'La página ha sido activada como página de inicio.',
          disabled: 'La página ha sido retirada como página de inicio.'
        }
      }
    },
  },
  de: {
    message: {
      consent: {
        accept: 'Ja',
        allow: 'Personalisierte Werbung bevorzugen?',
        deny: 'Nein',
        disclaimer: '(Wir verkaufen die Daten unserer Nutzer nicht)'
      },
      loading: 'Lädt...',
      generic: {
        delete: 'Löschen',
        error: 'Ein Fehler ist aufgetreten.'
      },
      now_page: {
        back: '← Zurück zur vollständigen Programmübersicht',
        title: 'Aktuell im Radio'
      },
      params_page: {
        automatic: 'Automatisch',
        automatic_help: 'Basierend auf Ihrer Verbindungsart (ADSL, Glasfaser, 4G...) und Ihrer Bandbreite.',
        deactivated: 'Deaktiviert',
        description: 'Um die Werbung am Anfang des Streamings und die Ladezeiten zu reduzieren, kann der Player den vorherigen Stream für mehrere Minuten weiter abspielen, wenn Sie den Sender wechseln oder die Wiedergabe pausieren.',
        duration_10: 'Für 10 Minuten',
        duration_30: 'Für 30 Minuten',
        no_support: 'Ihr Browser unterstützt die automatische Erkennung nicht.',
        save: 'Speichern',
        sub_title: 'Gleichzeitige Stream-Wiedergaben',
        title: 'Player-Konfiguration',
        two_flux: 'Zwei gleichzeitige Streams',
        updated: 'Einstellungen aktualisiert'
      },
      player: {
        autoplay_error: 'Ihr Browser erlaubt keine automatische Medienwiedergabe. Bitte klicken Sie erneut auf "Hören".',
        play_error: 'Wiedergabefehler',
        placeholder: 'Klicken Sie auf ein Logo, um die Wiedergabe zu starten',
        previous: '{radio} erneut hören',
        save_song: 'Diesen Titel speichern ({song})',
        save_song_not_logged: 'Diesen Titel speichern (nur für angemeldete Benutzer)',
        save_song_no_title: 'Diesen Titel speichern (Titel nicht verfügbar)',
        song_saved: 'Der Titel wurde gespeichert.',
        favorites: {
          add: 'Zu Favoriten hinzufügen',
          remove: 'Aus Favoriten entfernen'
        },
        output: {
          choose: 'Audioausgang auswählen',
          choose_label: 'Audioausgang wählen:',
          save: 'Als Standardausgang speichern',
          pause_if_disconnect: 'Wiedergabe stoppen, wenn der Ausgang getrennt wird',
        },
        timer: {
          cancelled: 'Der Timer wurde abgebrochen',
          end_in: 'Timer endet in 0 Minute | Timer endet in {minutes} Minute | Timer endet in {minutes} Minuten',
          finish: 'Wiedergabe stoppen (Timer)',
          modal: {
            abrv: 'Min',
            cancel: 'Timer abbrechen',
            close: 'Schließen',
            length: 'Dauer',
            placeholder: 'Minuten',
            quick: 'Schnellauswahl',
            set: 'Timer starten',
            title: 'Timer',
            x_minutes: '{minutes} Minuten',
            x_hours: '{hours} Stunden'
          },
          set: 'Der Timer ist für 0 Minute aktiviert | Der Timer ist für {minutes} Minute aktiviert | Der Timer ist für {minutes} Minuten aktiviert',
          title: 'Timer',
          tooltip: 'Hier klicken, um den Timer zu aktivieren'
        },
        video: {
          title: 'Video-Player'
        },
      },
      radio_page: {
        back: '← Zurück zur vollständigen Programmübersicht',
        current: '↓ Zur aktuellen Sendung gehen',
        no_schedule: 'Programme nicht verfügbar.',
        play: '{radio} hören',
        stop: '{radio} stoppen',
        title: 'Programme und Streaming von {radio}',
        webradios: 'Webradios'
      },
      schedule: {
        no_schedule: 'Programme nicht verfügbar :(',
        no_radio: 'Kein Radio in dieser Kategorie',
        no_radio_favorites: 'Sie haben keine Lieblingsradios',
        preroll_filter: 'Radios mit Werbung beim Start',
        title: 'Alle Radioprogramme und Online-Hörfunk',
        today: 'Heute',
        tomorrow: 'Morgen',
        tooltip: 'Mehr Radios hier',
        radio_list: {
          page: 'Programmseite',
          pick_region_title: 'Region auswählen',
          region: {
            modal: {
              close: 'Schließen',
            }
          }
        }
      },
      songs_page: {
        buy: 'Kaufen',
        buy_amazon: 'Amazon',
        find: 'Suchen',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: 'Sie haben keine gespeicherten Titel.',
        title: 'Gespeicherte Titel',
      },
      streaming: {
        categories: {
          all_countries: 'Alle Länder',
          favorites: 'Favoriten',
          last: 'Die Leute hören...',
          history: 'Mein Verlauf'
        },
        close: 'Zurück',
        country: 'Land',
        country_search_no_result: 'Kein Land gefunden',
        listeners_title: 'Hörer',
        listeners: 'Derzeit keine Hörer. | Derzeit ein Hörer. | Derzeit {count} Hörer.',
        more: 'Mehr anzeigen',
        no_results: 'Kein Radio',
        play: '{radio} hören',
        playing: 'Titel',
        playing_errors: 'Für diesen Radiosender wurden Wiedergabefehler gemeldet.',
        history: 'Letzte Titel:',
        random: 'Zufälliges Radio abspielen',
        search_placeholder: 'Nach Name, Stil, Inhalt suchen...',
        stop: 'Stoppen',
        sort: {
          name: 'Alphabetisch',
          popularity: 'Nach Beliebtheit',
          random: 'Zufällig',
          last: 'Nach letztem Hören (Welt)',
          user_last: 'Nach letztem Hören (ich)'
        },
        suggest: 'Änderung vorschlagen',
        title: 'Radios aus aller Welt im Streaming',
        website: 'Website'
      },
      toast: {
        home: {
          enabled: 'Die Seite wurde als Startseite aktiviert.',
          disabled: 'Die Seite wurde als Startseite deaktiviert.'
        }
      }
    },
  },
  pt: {
    message: {
      consent: {
        accept: 'Sim',
        allow: 'Preferir anúncios personalizados?',
        deny: 'Não',
        disclaimer: '(Não vendemos os dados dos nossos utilizadores)'
      },
      loading: 'A carregar...',
      generic: {
        delete: 'Eliminar',
        error: 'Ocorreu um erro.'
      },
      now_page: {
        back: '← Voltar à grelha completa de programas',
        title: 'Neste momento na rádio'
      },
      params_page: {
        automatic: 'Automático',
        automatic_help: 'Com base no seu tipo de ligação (ADSL, fibra, 4G...) e na sua largura de banda.',
        deactivated: 'Desativado',
        description: 'Para reduzir os anúncios presentes no início da transmissão e os tempos de carregamento, o leitor pode continuar a reproduzir o fluxo anterior durante vários minutos quando mudar de rádio ou quando pausar a reprodução.',
        duration_10: 'Durante 10 minutos',
        duration_30: 'Durante 30 minutos',
        no_support: 'O seu navegador não suporta a deteção automática.',
        save: 'Guardar',
        sub_title: 'Reproduções de fluxos simultâneos',
        title: 'Configuração do leitor',
        two_flux: 'Dois fluxos simultâneos',
        updated: 'Definições atualizadas'
      },
      player: {
        autoplay_error: 'O seu navegador não permite a reprodução automática de mídia. Por favor, clique em "Ouvir" novamente.',
        play_error: 'Erro de reprodução',
        placeholder: 'Clique num logótipo para iniciar a reprodução',
        previous: 'Ouvir {radio} novamente',
        save_song: 'Guardar esta faixa ({song})',
        save_song_not_logged: 'Guardar esta faixa (apenas utilizadores conectados)',
        save_song_no_title: 'Guardar esta faixa (título não disponível)',
        song_saved: 'A faixa foi guardada.',
        favorites: {
          add: 'Adicionar aos favoritos',
          remove: 'Remover dos favoritos'
        },
        output: {
          choose: 'Selecionar uma saída de áudio',
          choose_label: 'Escolher uma saída de áudio:',
          save: 'Guardar como saída padrão',
          pause_if_disconnect: 'Parar a reprodução se a saída for desconectada',
        },
        timer: {
          cancelled: 'O temporizador foi cancelado',
          end_in: 'Temporizador termina em 0 minuto | Temporizador termina em {minutes} minuto | Temporizador termina em {minutes} minutos',
          finish: 'Parar reprodução (temporizador)',
          modal: {
            abrv: 'min',
            cancel: 'Cancelar temporizador',
            close: 'Fechar',
            length: 'Duração',
            placeholder: 'Minutos',
            quick: 'Seleção rápida',
            set: 'Iniciar temporizador',
            title: 'Temporizador',
            x_minutes: '{minutes} minutos',
            x_hours: '{hours} horas'
          },
          set: 'O temporizador está ativado para 0 minuto | O temporizador está ativado para {minutes} minuto | O temporizador está ativado para {minutes} minutos',
          title: 'Temporizador',
          tooltip: 'Clique aqui para ativar o temporizador'
        },
        video: {
          title: 'Leitor de vídeo'
        },
      },
      radio_page: {
        back: '← Voltar à grelha completa de programas',
        current: '↓ Ir para o programa em curso',
        no_schedule: 'Programas não disponíveis.',
        play: 'Ouvir {radio}',
        stop: 'Parar {radio}',
        title: 'Os programas e transmissão de {radio}',
        webradios: 'Rádios web'
      },
      schedule: {
        no_schedule: 'Programas não disponíveis :(',
        no_radio: 'Nenhuma rádio nesta categoria',
        no_radio_favorites: 'Não tem rádios favoritas',
        preroll_filter: 'Rádios com publicidade no início',
        title: 'Todas as grelhas de rádio, todos os programas e audição online',
        today: 'Hoje',
        tomorrow: 'Amanhã',
        tooltip: 'Mais rádios aqui',
        radio_list: {
          page: 'Página de programas',
          pick_region_title: 'Escolher uma região',
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
        find: 'Procurar',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: 'Não tem faixas guardadas.',
        title: 'Faixas guardadas',
      },
      streaming: {
        categories: {
          all_countries: 'Todos os países',
          favorites: 'Favoritos',
          last: 'As pessoas estão a ouvir...',
          history: 'O meu histórico'
        },
        close: 'Voltar',
        country: 'País',
        country_search_no_result: 'Nenhum país encontrado',
        listeners_title: 'Ouvintes',
        listeners: 'Nenhum ouvinte no momento. | Um ouvinte no momento. | {count} ouvintes no momento.',
        more: 'Ver mais',
        no_results: 'Nenhuma rádio',
        play: 'Ouvir {radio}',
        playing: 'Título',
        playing_errors: 'Foram reportados erros de reprodução para esta rádio.',
        history: 'Últimas faixas:',
        random: 'Reproduzir uma rádio aleatória',
        search_placeholder: 'Procurar por nome, estilo, conteúdo...',
        stop: 'Parar',
        sort: {
          name: 'Por ordem alfabética',
          popularity: 'Por popularidade',
          random: 'Por ordem aleatória',
          last: 'Por última audição (mundo)',
          user_last: 'Por última audição (eu)'
        },
        suggest: 'Sugerir uma alteração',
        title: 'As rádios de todo o mundo em streaming',
        website: 'Site'
      },
      toast: {
        home: {
          enabled: 'A página foi ativada como página inicial.',
          disabled: 'A página foi removida como página inicial.'
        }
      }
    },
  },
  it: {
    message: {
      consent: {
        accept: 'Sì',
        allow: 'Preferisci annunci personalizzati?',
        deny: 'No',
        disclaimer: '(Non vendiamo i dati dei nostri utenti)'
      },
      loading: 'Caricamento...',
      generic: {
        delete: 'Elimina',
        error: 'Si è verificato un errore.'
      },
      now_page: {
        back: '← Torna alla griglia completa dei programmi',
        title: 'In onda ora'
      },
      params_page: {
        automatic: 'Automatico',
        automatic_help: 'In base al tipo di connessione (ADSL, fibra, 4G...) e alla tua larghezza di banda.',
        deactivated: 'Disattivato',
        description: 'Per ridurre gli annunci presenti all\'inizio dello streaming e i tempi di caricamento, il lettore può continuare a riprodurre il flusso precedente per diversi minuti quando cambi stazione o metti in pausa la riproduzione.',
        duration_10: 'Per 10 minuti',
        duration_30: 'Per 30 minuti',
        no_support: 'Il tuo browser non supporta il rilevamento automatico.',
        save: 'Salva',
        sub_title: 'Riproduzioni di flussi simultanei',
        title: 'Configurazione del lettore',
        two_flux: 'Due flussi simultanei',
        updated: 'Impostazioni aggiornate'
      },
      player: {
        autoplay_error: 'Il tuo browser non consente la riproduzione automatica dei media. Per favore, clicca su "Ascolta" nuovamente.',
        play_error: 'Errore di riproduzione',
        placeholder: 'Clicca su un logo per avviare la riproduzione',
        previous: 'Ascolta di nuovo {radio}',
        save_song: 'Salva questo brano ({song})',
        save_song_not_logged: 'Salva questo brano (solo utenti connessi)',
        save_song_no_title: 'Salva questo brano (titolo non disponibile)',
        song_saved: 'Il brano è stato salvato.',
        favorites: {
          add: 'Aggiungi ai preferiti',
          remove: 'Rimuovi dai preferiti'
        },
        output: {
          choose: 'Seleziona un\'uscita audio',
          choose_label: 'Scegli un\'uscita audio:',
          save: 'Salva come uscita predefinita',
          pause_if_disconnect: 'Interrompi la riproduzione se l\'uscita viene disconnessa',
        },
        timer: {
          cancelled: 'Il timer è stato annullato',
          end_in: 'Timer termina in 0 minuto | Timer termina in {minutes} minuto | Timer termina in {minutes} minuti',
          finish: 'Interrompi la riproduzione (timer)',
          modal: {
            abrv: 'min',
            cancel: 'Annulla timer',
            close: 'Chiudi',
            length: 'Durata',
            placeholder: 'Minuti',
            quick: 'Selezione rapida',
            set: 'Avvia timer',
            title: 'Timer',
            x_minutes: '{minutes} minuti',
            x_hours: '{hours} ore'
          },
          set: 'Il timer è attivato per 0 minuto | Il timer è attivato per {minutes} minuto | Il timer è attivato per {minutes} minuti',
          title: 'Timer',
          tooltip: 'Clicca qui per attivare il timer'
        },
        video: {
          title: 'Lettore video'
        },
      },
      radio_page: {
        back: '← Torna alla griglia completa dei programmi',
        current: '↓ Vai al programma in onda',
        no_schedule: 'Programmi non disponibili.',
        play: 'Ascolta {radio}',
        stop: 'Ferma {radio}',
        title: 'I programmi e lo streaming di {radio}',
        webradios: 'Radio web'
      },
      schedule: {
        no_schedule: 'Programmi non disponibili :(',
        no_radio: 'Nessuna radio in questa categoria',
        no_radio_favorites: 'Non hai radio preferite',
        preroll_filter: 'Radio con pubblicità all\'avvio',
        title: 'Tutte le griglie radio, tutti i programmi e ascolto online',
        today: 'Oggi',
        tomorrow: 'Domani',
        tooltip: 'Altre radio qui',
        radio_list: {
          page: 'Pagina dei programmi',
          pick_region_title: 'Scegli una regione',
          region: {
            modal: {
              close: 'Chiudi',
            }
          }
        }
      },
      songs_page: {
        buy: 'Acquista',
        buy_amazon: 'Amazon',
        find: 'Cerca',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: 'Non hai brani salvati.',
        title: 'Brani salvati',
      },
      streaming: {
        categories: {
          all_countries: 'Tutti i paesi',
          favorites: 'Preferiti',
          last: 'Le persone stanno ascoltando...',
          history: 'La mia cronologia'
        },
        close: 'Indietro',
        country: 'Paese',
        country_search_no_result: 'Nessun paese trovato',
        listeners_title: 'Ascoltatori',
        listeners: 'Nessun ascoltatore al momento. | Un ascoltatore al momento. | {count} ascoltatori al momento.',
        more: 'Vedi di più',
        no_results: 'Nessuna radio',
        play: 'Ascolta {radio}',
        playing: 'Titolo',
        playing_errors: 'Sono stati segnalati errori di riproduzione per questa radio.',
        history: 'Ultimi titoli:',
        random: 'Riproduci una radio casuale',
        search_placeholder: 'Cerca per nome, stile, contenuto...',
        stop: 'Ferma',
        sort: {
          name: 'In ordine alfabetico',
          popularity: 'Per popolarità',
          random: 'In ordine casuale',
          last: 'Per ultimo ascolto (mondo)',
          user_last: 'Per ultimo ascolto (io)'
        },
        suggest: 'Suggerisci una modifica',
        title: 'Le radio di tutto il mondo in streaming',
        website: 'Sito web'
      },
      toast: {
        home: {
          enabled: 'La pagina è stata impostata come homepage.',
          disabled: 'La pagina è stata rimossa come homepage.'
        }
      }
    },
  },
  pl: {
    message: {
      consent: {
        accept: 'Tak',
        allow: 'Wolisz reklamy spersonalizowane?',
        deny: 'Nie',
        disclaimer: '(Nie sprzedajemy danych naszych użytkowników)'
      },
      loading: 'Ładowanie...',
      generic: {
        delete: 'Usuń',
        error: 'Wystąpił błąd.'
      },
      now_page: {
        back: '← Powrót do pełnej siatki programów',
        title: 'Teraz w radiu'
      },
      params_page: {
        automatic: 'Automatycznie',
        automatic_help: 'Na podstawie typu połączenia (ADSL, światłowód, 4G...) i przepustowości.',
        deactivated: 'Wyłączone',
        description: 'Aby zmniejszyć liczbę reklam na początku strumieniowania i czasów ładowania, odtwarzacz może kontynuować odtwarzanie poprzedniego strumienia przez kilka minut, gdy zmienisz stację lub wstrzymasz odtwarzanie.',
        duration_10: 'Przez 10 minut',
        duration_30: 'Przez 30 minut',
        no_support: 'Twoja przeglądarka nie obsługuje automatycznego wykrywania.',
        save: 'Zapisz',
        sub_title: 'Odtwarzanie wielu strumieni jednocześnie',
        title: 'Konfiguracja odtwarzacza',
        two_flux: 'Dwa strumienie jednocześnie',
        updated: 'Ustawienia zaktualizowane'
      },
      player: {
        autoplay_error: 'Twoja przeglądarka nie zezwala na automatyczne odtwarzanie multimediów. Proszę kliknąć "Słuchaj" ponownie.',
        play_error: 'Błąd odtwarzania',
        placeholder: 'Kliknij logo, aby rozpocząć odtwarzanie',
        previous: 'Słuchaj ponownie {radio}',
        save_song: 'Zapisz ten utwór ({song})',
        save_song_not_logged: 'Zapisz ten utwór (tylko dla zalogowanych użytkowników)',
        save_song_no_title: 'Zapisz ten utwór (tytuł niedostępny)',
        song_saved: 'Utwór został zapisany.',
        favorites: {
          add: 'Dodaj do ulubionych',
          remove: 'Usuń z ulubionych'
        },
        output: {
          choose: 'Wybierz wyjście audio',
          choose_label: 'Wybierz wyjście audio:',
          save: 'Zapisz jako domyślne wyjście',
          pause_if_disconnect: 'Zatrzymaj odtwarzanie, jeśli wyjście zostanie rozłączone',
        },
        timer: {
          cancelled: 'Minutnik został anulowany',
          end_in: 'Minutnik kończy się za 0 minutę | Minutnik kończy się za {minutes} minutę | Minutnik kończy się za {minutes} minuty',
          finish: 'Zatrzymaj odtwarzanie (minutnik)',
          modal: {
            abrv: 'min',
            cancel: 'Anuluj minutnik',
            close: 'Zamknij',
            length: 'Czas trwania',
            placeholder: 'Minuty',
            quick: 'Szybki wybór',
            set: 'Uruchom minutnik',
            title: 'Minutnik',
            x_minutes: '{minutes} minut',
            x_hours: '{hours} godzin'
          },
          set: 'Minutnik jest ustawiony na 0 minutę | Minutnik jest ustawiony na {minutes} minutę | Minutnik jest ustawiony na {minutes} minuty',
          title: 'Minutnik',
          tooltip: 'Kliknij tutaj, aby uruchomić minutnik'
        },
        video: {
          title: 'Odtwarzacz wideo'
        },
      },
      radio_page: {
        back: '← Powrót do pełnej siatki programów',
        current: '↓ Przejdź do aktualnej audycji',
        no_schedule: 'Programy niedostępne.',
        play: 'Słuchaj {radio}',
        stop: 'Zatrzymaj {radio}',
        title: 'Programy i strumieniowanie {radio}',
        webradios: 'Radia internetowe'
      },
      schedule: {
        no_schedule: 'Programy niedostępne :(',
        no_radio: 'Brak radia w tej kategorii',
        no_radio_favorites: 'Nie masz ulubionych stacji radiowych',
        preroll_filter: 'Radia z reklamami na starcie',
        title: 'Wszystkie siatki radiowe, wszystkie programy i słuchanie online',
        today: 'Dziś',
        tomorrow: 'Jutro',
        tooltip: 'Więcej stacji tutaj',
        radio_list: {
          page: 'Strona programów',
          pick_region_title: 'Wybierz region',
          region: {
            modal: {
              close: 'Zamknij',
            }
          }
        }
      },
      songs_page: {
        buy: 'Kup',
        buy_amazon: 'Amazon',
        find: 'Znajdź',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: 'Nie masz zapisanych utworów.',
        title: 'Zapisane utwory',
      },
      streaming: {
        categories: {
          all_countries: 'Wszystkie kraje',
          favorites: 'Ulubione',
          last: 'Ludzie słuchają...',
          history: 'Moja historia'
        },
        close: 'Powrót',
        country: 'Kraj',
        country_search_no_result: 'Nie znaleziono kraju',
        listeners_title: 'Słuchacze',
        listeners: 'Obecnie brak słuchaczy. | Obecnie jeden słuchacz. | Obecnie {count} słuchaczy.',
        more: 'Zobacz więcej',
        no_results: 'Brak radia',
        play: 'Słuchaj {radio}',
        playing: 'Tytuł',
        playing_errors: 'Zgłoszono błędy odtwarzania dla tej stacji radiowej.',
        history: 'Ostatnie utwory:',
        random: 'Odtwórz losowe radio',
        search_placeholder: 'Szukaj po nazwie, stylu, treści...',
        stop: 'Zatrzymaj',
        sort: {
          name: 'W porządku alfabetycznym',
          popularity: 'Wg popularności',
          random: 'W porządku losowym',
          last: 'Wg ostatniego odsłuchu (świat)',
          user_last: 'Wg ostatniego odsłuchu (ja)'
        },
        suggest: 'Zasugeruj zmianę',
        title: 'Radia z całego świata w strumieniu',
        website: 'Strona internetowa'
      },
      toast: {
        home: {
          enabled: 'Strona została ustawiona jako strona główna.',
          disabled: 'Strona została usunięta jako strona główna.'
        }
      }
    },
  },
  el: {
    message: {
      consent: {
        accept: 'Ναι',
        allow: 'Προτιμάτε προσαρμοσμένες διαφημίσεις;',
        deny: 'Όχι',
        disclaimer: '(Δεν πουλάμε τα δεδομένα των χρηστών μας)'
      },
      loading: 'Φόρτωση...',
      generic: {
        delete: 'Διαγραφή',
        error: 'Προέκυψε σφάλμα.'
      },
      now_page: {
        back: '← Επιστροφή στο πλήρες πρόγραμμα',
        title: 'Τώρα στο ραδιόφωνο'
      },
      params_page: {
        automatic: 'Αυτόματο',
        automatic_help: 'Βάσει του τύπου σύνδεσης (ADSL, ίνες, 4G...) και του εύρους ζώνης σας.',
        deactivated: 'Απενεργοποιημένο',
        description: 'Για να μειώσετε τις διαφημίσεις στην αρχή του streaming και τους χρόνους φόρτωσης, ο παίκτης μπορεί να συνεχίσει να αναπαράγει την προηγούμενη ροή για λίγα λεπτά όταν αλλάξετε σταθμό ή βάλετε παύση στην αναπαραγωγή.',
        duration_10: 'Για 10 λεπτά',
        duration_30: 'Για 30 λεπτά',
        no_support: 'Ο περιηγητής σας δεν υποστηρίζει αυτόματη ανίχνευση.',
        save: 'Αποθήκευση',
        sub_title: 'Σύγχρονες αναπαραγωγές ροών',
        title: 'Ρύθμιση παίκτη',
        two_flux: 'Δύο σύγχρονες ροές',
        updated: 'Οι ρυθμίσεις ενημερώθηκαν'
      },
      player: {
        autoplay_error: 'Ο περιηγητής σας δεν επιτρέπει την αυτόματη αναπαραγωγή πολυμέσων. Παρακαλώ κάντε κλικ στο "Άκουσε" ξανά.',
        play_error: 'Σφάλμα αναπαραγωγής',
        placeholder: 'Κάντε κλικ σε ένα λογότυπο για να ξεκινήσετε την αναπαραγωγή',
        previous: 'Άκουσε ξανά {radio}',
        save_song: 'Αποθήκευση αυτού του τραγουδιού ({song})',
        save_song_not_logged: 'Αποθήκευση αυτού του τραγουδιού (μόνο για συνδεδεμένους χρήστες)',
        save_song_no_title: 'Αποθήκευση αυτού του τραγουδιού (τίτλος μη διαθέσιμος)',
        song_saved: 'Το τραγούδι αποθηκεύτηκε.',
        favorites: {
          add: 'Προσθήκη στα αγαπημένα',
          remove: 'Αφαίρεση από τα αγαπημένα'
        },
        output: {
          choose: 'Επιλέξτε έξοδο ήχου',
          choose_label: 'Επιλέξτε έξοδο ήχου:',
          save: 'Αποθήκευση ως προεπιλεγμένη έξοδο',
          pause_if_disconnect: 'Διακοπή αναπαραγωγής αν η έξοδος αποσυνδεθεί',
        },
        timer: {
          cancelled: 'Ο χρονόμετρος ακυρώθηκε',
          end_in: 'Ο χρονόμετρος τελειώνει σε 0 λεπτό | Ο χρονόμετρος τελειώνει σε {minutes} λεπτό | Ο χρονόμετρος τελειώνει σε {minutes} λεπτά',
          finish: 'Διακοπή αναπαραγωγής (χρονόμετρος)',
          modal: {
            abrv: 'λεπ',
            cancel: 'Ακύρωση χρονομέτρου',
            close: 'Κλείσιμο',
            length: 'Διάρκεια',
            placeholder: 'Λεπτά',
            quick: 'Γρήγορη επιλογή',
            set: 'Εκκίνηση χρονομέτρου',
            title: 'Χρονόμετρος',
            x_minutes: '{minutes} λεπτά',
            x_hours: '{hours} ώρες'
          },
          set: 'Ο χρονόμετρος είναι ενεργοποιημένος για 0 λεπτό | Ο χρονόμετρος είναι ενεργοποιημένος για {minutes} λεπτό | Ο χρονόμετρος είναι ενεργοποιημένος για {minutes} λεπτά',
          title: 'Χρονόμετρος',
          tooltip: 'Κάντε κλικ εδώ για να ενεργοποιήσετε τον χρονόμετρο'
        },
        video: {
          title: 'Παίκτης βίντεο'
        },
      },
      radio_page: {
        back: '← Επιστροφή στο πλήρες πρόγραμμα',
        current: '↓ Μετάβαση στην τρέχουσα εκπομπή',
        no_schedule: 'Πρόγραμμα μη διαθέσιμο.',
        play: 'Άκουσε {radio}',
        stop: 'Σταμάτα {radio}',
        title: 'Τα προγράμματα και το streaming του {radio}',
        webradios: 'Διαδικτυακά ραδιόφωνα'
      },
      schedule: {
        no_schedule: 'Πρόγραμμα μη διαθέσιμο :(',
        no_radio: 'Κανένα ραδιόφωνο σε αυτή την κατηγορία',
        no_radio_favorites: 'Δεν έχετε αγαπημένα ραδιόφωνα',
        preroll_filter: 'Ραδιόφωνα με διαφημίσεις στην εκκίνηση',
        title: 'Όλα τα προγράμματα ραδιοφώνου και η ακρόαση online',
        today: 'Σήμερα',
        tomorrow: 'Αύριο',
        tooltip: 'Περισσότερα ραδιόφωνα εδώ',
        radio_list: {
          page: 'Σελίδα προγράμματος',
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
        no_songs: 'Δεν έχετε αποθηκευμένα τραγούδια.',
        title: 'Αποθηκευμένα τραγούδια',
      },
      streaming: {
        categories: {
          all_countries: 'Όλες οι χώρες',
          favorites: 'Αγαπημένα',
          last: 'Οι άνθρωποι ακούνε...',
          history: 'Το ιστορικό μου'
        },
        close: 'Επιστροφή',
        country: 'Χώρα',
        country_search_no_result: 'Δεν βρέθηκε χώρα',
        listeners_title: 'Ακροατές',
        listeners: 'Κανένας ακροατής αυτή τη στιγμή. | Ένας ακροατής αυτή τη στιγμή. | {count} ακροατές αυτή τη στιγμή.',
        more: 'Δείτε περισσότερα',
        no_results: 'Κανένα ραδιόφωνο',
        play: 'Άκουσε {radio}',
        playing: 'Τίτλος',
        playing_errors: 'Αναφέρθηκαν σφάλματα αναπαραγωγής για αυτόν τον ραδιοφωνικό σταθμό.',
        history: 'Τελευταία τραγούδια:',
        random: 'Αναπαραγωγή τυχαίου ραδιοφώνου',
        search_placeholder: 'Αναζήτηση με όνομα, στυλ, περιεχόμενο...',
        stop: 'Σταμάτα',
        sort: {
          name: 'Κατά αλφαβητική σειρά',
          popularity: 'Κατά δημοτικότητα',
          random: 'Κατά τυχαία σειρά',
          last: 'Κατά τελευταία ακρόαση (κόσμος)',
          user_last: 'Κατά τελευταία ακρόαση (εγώ)'
        },
        suggest: 'Προτείνετε μια αλλαγή',
        title: 'Τα ραδιόφωνα από όλο τον κόσμο σε streaming',
        website: 'Ιστοσελίδα'
      },
      toast: {
        home: {
          enabled: 'Η σελίδα έχει οριστεί ως αρχική σελίδα.',
          disabled: 'Η σελίδα έχει αφαιρεθεί ως αρχική σελίδα.'
        }
      }
    },
  },
  ar: {
    message: {
      consent: {
        accept: 'نعم',
        allow: 'تفضل الإعلانات المخصصة؟',
        deny: 'لا',
        disclaimer: '(لا نبيع بيانات مستخدمينا)'
      },
      loading: 'جار التحميل...',
      generic: {
        delete: 'حذف',
        error: 'حدث خطأ.'
      },
      now_page: {
        back: '← العودة إلى جدول البرامج الكامل',
        title: 'الآن على الراديو'
      },
      params_page: {
        automatic: 'تلقائي',
        automatic_help: 'بناءً على نوع الاتصال الخاص بك (ADSL، الألياف الضوئية، 4G...) وعرض النطاق الترددي لديك.',
        deactivated: 'معطل',
        description: 'لتقليل الإعلانات الموجودة في بداية البث وأوقات التحميل، يمكن للمشغل مواصلة تشغيل التدفق السابق لعدة دقائق عند تغيير المحطة أو إيقاف التشغيل مؤقتًا.',
        duration_10: 'لمدة 10 دقائق',
        duration_30: 'لمدة 30 دقيقة',
        no_support: 'متصفحك لا يدعم الكشف التلقائي.',
        save: 'حفظ',
        sub_title: 'تشغيل تدفقات متزامنة',
        title: 'إعدادات المشغل',
        two_flux: 'تدفقان متزامنان',
        updated: 'تم تحديث الإعدادات'
      },
      player: {
        autoplay_error: 'متصفحك لا يسمح بتشغيل الوسائط تلقائيًا. يرجى النقر على "استمع" مرة أخرى.',
        play_error: 'خطأ في التشغيل',
        placeholder: 'انقر على شعار لبدء التشغيل',
        previous: 'استمع إلى {radio} مرة أخرى',
        save_song: 'حفظ هذا الأغنية ({song})',
        save_song_not_logged: 'حفظ هذا الأغنية (فقط للمستخدمين المتصلين)',
        save_song_no_title: 'حفظ هذا الأغنية (العنوان غير متوفر)',
        song_saved: 'تم حفظ الأغنية.',
        favorites: {
          add: 'إضافة إلى المفضلة',
          remove: 'إزالة من المفضلة'
        },
        output: {
          choose: 'اختر مخرج صوت',
          choose_label: 'اختر مخرج صوت:',
          save: 'حفظ كمخرج افتراضي',
          pause_if_disconnect: 'إيقاف التشغيل إذا تم فصل المخرج',
        },
        timer: {
          cancelled: 'تم إلغاء المؤقت',
          end_in: 'ينتهي المؤقت في 0 دقيقة | ينتهي المؤقت في {minutes} دقيقة | ينتهي المؤقت في {minutes} دقيقة',
          finish: 'إيقاف التشغيل (المؤقت)',
          modal: {
            abrv: 'دقيقة',
            cancel: 'إلغاء المؤقت',
            close: 'إغلاق',
            length: 'المدة',
            placeholder: 'دقائق',
            quick: 'اختيار سريع',
            set: 'تشغيل المؤقت',
            title: 'المؤقت',
            x_minutes: '{minutes} دقائق',
            x_hours: '{hours} ساعات'
          },
          set: 'المؤقت مفعل لمدة 0 دقيقة | المؤقت مفعل لمدة {minutes} دقيقة | المؤقت مفعل لمدة {minutes} دقيقة',
          title: 'المؤقت',
          tooltip: 'انقر هنا لتفعيل المؤقت'
        },
        video: {
          title: 'مشغل الفيديو'
        },
      },
      radio_page: {
        back: '← العودة إلى جدول البرامج الكامل',
        current: '↓ الانتقال إلى البرنامج الحالي',
        no_schedule: 'البرامج غير متوفرة.',
        play: 'استمع إلى {radio}',
        stop: 'إيقاف {radio}',
        title: 'برامج وبث {radio}',
        webradios: 'راديو الويب'
      },
      schedule: {
        no_schedule: 'البرامج غير متوفرة :(',
        no_radio: 'لا توجد محطات في هذه الفئة',
        no_radio_favorites: 'ليس لديك محطات مفضلة',
        preroll_filter: 'المحطات التي تحتوي على إعلانات في البداية',
        title: 'جميع جداول الراديو والبرامج والاستماع عبر الإنترنت',
        today: 'اليوم',
        tomorrow: 'غدًا',
        tooltip: 'المزيد من المحطات هنا',
        radio_list: {
          page: 'صفحة البرامج',
          pick_region_title: 'اختر منطقة',
          region: {
            modal: {
              close: 'إغلاق',
            }
          }
        }
      },
      songs_page: {
        buy: 'شراء',
        buy_amazon: 'أمازون',
        find: 'بحث',
        find_deezer: 'ديزر',
        find_spotify: 'سبوتيفاي',
        find_youtube: 'يوتيوب',
        no_songs: 'ليس لديك أغانٍ محفوظة.',
        title: 'الأغاني المحفوظة',
      },
      streaming: {
        categories: {
          all_countries: 'جميع البلدان',
          favorites: 'المفضلة',
          last: 'الناس يستمعون...',
          history: 'سجلي'
        },
        close: 'رجوع',
        country: 'البلد',
        country_search_no_result: 'لم يتم العثور على بلد',
        listeners_title: 'المستمعون',
        listeners: 'لا يوجد مستمعون حاليًا. | مستمع واحد حاليًا. | {count} مستمعين حاليًا.',
        more: 'عرض المزيد',
        no_results: 'لا توجد محطات',
        play: 'استمع إلى {radio}',
        playing: 'العنوان',
        playing_errors: 'تم الإبلاغ عن أخطاء في التشغيل لهذا الراديو.',
        history: 'آخر الأغاني:',
        random: 'تشغيل محطة عشوائية',
        search_placeholder: 'البحث بالاسم أو النوع أو المحتوى...',
        stop: 'إيقاف',
        sort: {
          name: 'بالترتيب الأبجدي',
          popularity: 'بالشعبية',
          random: 'بترتيب عشوائي',
          last: 'بالاستماع الأخير (العالم)',
          user_last: 'بالاستماع الأخير (أنا)'
        },
        suggest: 'اقترح تعديل',
        title: 'محطات الراديو من جميع أنحاء العالم بث مباشر',
        website: 'الموقع الإلكتروني'
      },
      toast: {
        home: {
          enabled: 'تم تعيين الصفحة كصفحة رئيسية.',
          disabled: 'تمت إزالة الصفحة كصفحة رئيسية.'
        }
      }
    },
  },
  ro: {
    message: {
      consent: {
        accept: 'Da',
        allow: 'Preferi reclamele personalizate?',
        deny: 'Nu',
        disclaimer: '(Nu vindem datele utilizatorilor noștri)'
      },
      loading: 'Se încarcă...',
      generic: {
        delete: 'Șterge',
        error: 'A apărut o eroare.'
      },
      now_page: {
        back: '← Înapoi la grila completă de programe',
        title: 'Acum la radio'
      },
      params_page: {
        automatic: 'Automat',
        automatic_help: 'Pe baza tipului dvs. de conexiune (ADSL, fibră, 4G...) și a lățimii de bandă.',
        deactivated: 'Dezactivat',
        description: 'Pentru a reduce reclamelor prezente la începutul streaming-ului și timpilor de încărcare, player-ul poate continua să redea fluxul anterior pentru câteva minute atunci când schimbați stația sau când puneți pe pauză redarea.',
        duration_10: 'Pentru 10 minute',
        duration_30: 'Pentru 30 de minute',
        no_support: 'Browser-ul dvs. nu suportă detectarea automată.',
        save: 'Salvează',
        sub_title: 'Redări simultane de fluxuri',
        title: 'Configurarea player-ului',
        two_flux: 'Două fluxuri simultane',
        updated: 'Setările au fost actualizate'
      },
      player: {
        autoplay_error: 'Browser-ul dvs. nu permite redarea automată a mediilor. Vă rugăm să faceți clic pe "Ascultă" din nou.',
        play_error: 'Eroare de redare',
        placeholder: 'Faceți clic pe un logo pentru a începe redarea',
        previous: 'Ascultă din nou {radio}',
        save_song: 'Salvează această piesă ({song})',
        save_song_not_logged: 'Salvează această piesă (doar pentru utilizatorii conectați)',
        save_song_no_title: 'Salvează această piesă (titlu indisponibil)',
        song_saved: 'Piesa a fost salvată.',
        favorites: {
          add: 'Adaugă la favorite',
          remove: 'Elimină din favorite'
        },
        output: {
          choose: 'Alege o ieșire audio',
          choose_label: 'Alegeți o ieșire audio:',
          save: 'Salvează ca ieșire implicită',
          pause_if_disconnect: 'Oprește redarea dacă ieșirea este deconectată',
        },
        timer: {
          cancelled: 'Ceasul a fost anulat',
          end_in: 'Ceasul se termină în 0 minut | Ceasul se termină în {minutes} minut | Ceasul se termină în {minutes} minute',
          finish: 'Oprește redarea (ceas)',
          modal: {
            abrv: 'min',
            cancel: 'Anulează ceasul',
            close: 'Închide',
            length: 'Durată',
            placeholder: 'Minute',
            quick: 'Selectare rapidă',
            set: 'Pornește ceasul',
            title: 'Ceas',
            x_minutes: '{minutes} minute',
            x_hours: '{hours} ore'
          },
          set: 'Ceasul este activat pentru 0 minut | Ceasul este activat pentru {minutes} minut | Ceasul este activat pentru {minutes} minute',
          title: 'Ceas',
          tooltip: 'Faceți clic aici pentru a activa ceasul'
        },
        video: {
          title: 'Player video'
        },
      },
      radio_page: {
        back: '← Înapoi la grila completă de programe',
        current: '↓ Mergi la emisiunea curentă',
        no_schedule: 'Programe indisponibile.',
        play: 'Ascultă {radio}',
        stop: 'Oprește {radio}',
        title: 'Programul și streaming-ul {radio}',
        webradios: 'Radio web'
      },
      schedule: {
        no_schedule: 'Programe indisponibile :(',
        no_radio: 'Niciun radio în această categorie',
        no_radio_favorites: 'Nu aveți posturi de radio favorite',
        preroll_filter: 'Radiouri cu reclame la pornire',
        title: 'Toate grilele radio, toate programele și ascultarea online',
        today: 'Astăzi',
        tomorrow: 'Mâine',
        tooltip: 'Mai multe radiouri aici',
        radio_list: {
          page: 'Pagina programelor',
          pick_region_title: 'Alegeți o regiune',
          region: {
            modal: {
              close: 'Închide',
            }
          }
        }
      },
      songs_page: {
        buy: 'Cumpără',
        buy_amazon: 'Amazon',
        find: 'Caută',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: 'Nu aveți piese salvate.',
        title: 'Piese salvate',
      },
      streaming: {
        categories: {
          all_countries: 'Toate țările',
          favorites: 'Favorite',
          last: 'Oamenii ascultă...',
          history: 'Istoricul meu'
        },
        close: 'Înapoi',
        country: 'Țară',
        country_search_no_result: 'Nicio țară găsită',
        listeners_title: 'Ascultători',
        listeners: 'Niciun ascultător în prezent. | Un ascultător în prezent. | {count} ascultători în prezent.',
        more: 'Vezi mai multe',
        no_results: 'Niciun radio',
        play: 'Ascultă {radio}',
        playing: 'Titlu',
        playing_errors: 'Descoperă mai multe radiouri, caută după țară și stiluri muzicale ...',
        history: 'Ultimele piese:',
        random: 'Redă un radio aleatoriu',
        search_placeholder: 'Caută după nume, stil, conținut...',
        stop: 'Oprește',
        sort: {
          name: 'În ordine alfabetică',
          popularity: 'După popularitate',
          random: 'În ordine aleatorie',
          last: 'După ultima ascultare (lume)',
          user_last: 'După ultima ascultare (eu)'
        },
        suggest: 'Sugerează o modificare',
        title: 'Radiourile din întreaga lume în streaming',
        website: 'Site web'
      },
      toast: {
        home: {
          enabled: 'Pagina a fost activată ca pagină principală.',
          disabled: 'Pagina a fost dezactivată ca pagină principală.'
        }
      }
    },
  },
  hu: {
    message: {
      consent: {
        accept: 'Igen',
        allow: 'Szeretnék személyre szabott hirdetéseket?',
        deny: 'Nem',
        disclaimer: '(Nem adjuk el az ügyfeleink adatait)'
      },
      loading: 'Betöltés...',
      generic: {
        delete: 'Törlés',
        error: 'Hiba történt.'
      },
      now_page: {
        back: '← Vissza a teljes műsorrácsra',
        title: 'Most a rádióban'
      },
      params_page: {
        automatic: 'Automatikus',
        automatic_help: 'A kapcsolat típusa (ADSL, optikai kábel, 4G...) és a sávszélesség alapján.',
        deactivated: 'Kikapcsolva',
        description: 'A streaming kezdetén megjelenő hirdetések és a betöltési idők csökkentése érdekében a lejátszó tovább játszhatja az előző adását néhány percig, amikor rádióállomást vált vagy szüneteltet.',
        duration_10: '10 percig',
        duration_30: '30 percig',
        no_support: 'A böngészője nem támogatja az automatikus észlelést.',
        save: 'Mentés',
        sub_title: 'Egyidejű adások lejátszása',
        title: 'Lejátszó beállításai',
        two_flux: 'Két egyidejű adás',
        updated: 'Beállítások frissítve'
      },
      player: {
        autoplay_error: 'A böngészője nem engedélyezi a média automatikus lejátszását. Kérjük, kattintson újra a "Hallgasson" gombra.',
        play_error: 'Lejátszási hiba',
        placeholder: 'Kattintson egy logóra a lejátszás elindításához',
        previous: 'Hallgassa újra a {radio}-t',
        save_song: 'Mentse ezt a dalt ({song})',
        save_song_not_logged: 'Mentse ezt a dalt (csak bejelentkezett felhasználók)',
        save_song_no_title: 'Mentse ezt a dalt (cím nem elérhető)',
        song_saved: 'A dal mentve.',
        favorites: {
          add: 'Hozzáadás a kedvencekhez',
          remove: 'Eltávolítás a kedvencek közül'
        },
        output: {
          choose: 'Válasszon hangkimenetet',
          choose_label: 'Válasszon hangkimenetet:',
          save: 'Mentés alapértelmezett kimenetként',
          pause_if_disconnect: 'Lejátszás leállítása, ha a kimenet lecsatlakozik',
        },
        timer: {
          cancelled: 'Az időzítő törölve',
          end_in: 'Az időzítő 0 perc múlva lejár | Az időzítő {minutes} perc múlva lejár | Az időzítő {minutes} perc múlva lejár',
          finish: 'Lejátszás leállítása (időzítő)',
          modal: {
            abrv: 'perc',
            cancel: 'Időzítő törlése',
            close: 'Bezárás',
            length: 'Időtartam',
            placeholder: 'Perc',
            quick: 'Gyors választás',
            set: 'Időzítő indítása',
            title: 'Időzítő',
            x_minutes: '{minutes} perc',
            x_hours: '{hours} óra'
          },
          set: 'Az időzítő 0 percre van beállítva | Az időzítő {minutes} percre van beállítva | Az időzítő {minutes} percre van beállítva',
          title: 'Időzítő',
          tooltip: 'Kattintson ide az időzítő bekapcsolásához'
        },
        video: {
          title: 'Videó lejátszó'
        },
      },
      radio_page: {
        back: '← Vissza a teljes műsorrácsra',
        current: '↓ Ugrás a jelenlegi műsorra',
        no_schedule: 'Műsorok nem elérhetők.',
        play: 'Hallgassa a {radio}-t',
        stop: 'Állítsa le a {radio}-t',
        title: 'A {radio} műsorai és streamingje',
        webradios: 'Webrádiók'
      },
      schedule: {
        no_schedule: 'Műsorok nem elérhetők :(',
        no_radio: 'Nincs rádió ebben a kategóriában',
        no_radio_favorites: 'Nincsenek kedvenc rádióállomásai',
        preroll_filter: 'Rádiók reklámmal a kezdetén',
        title: 'Minden rádió műsora és online hallgatása',
        today: 'Ma',
        tomorrow: 'Holnap',
        tooltip: 'További rádiók itt',
        radio_list: {
          page: 'Műsorok oldala',
          pick_region_title: 'Válasszon régiót',
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
        no_songs: 'Nincsenek mentett dalok.',
        title: 'Mentett dalok',
      },
      streaming: {
        categories: {
          all_countries: 'Minden ország',
          favorites: 'Kedvencek',
          last: 'Emberek hallgatnak...',
          history: 'Előzményeim'
        },
        close: 'Vissza',
        country: 'Ország',
        country_search_no_result: 'Nem található ország',
        listeners_title: 'Hallgatók',
        listeners: 'Jelenleg nincs hallgató. | Jelenleg egy hallgató van. | Jelenleg {count} hallgató van.',
        more: 'Több megtekintése',
        no_results: 'Nincs rádió',
        play: 'Hallgassa a {radio}-t',
        playing: 'Cím',
        playing_errors: 'Lejátszási hibák jelentettek be ehhez a rádióhoz.',
        history: 'Utolsó dalok:',
        random: 'Véletlenszerű rádió lejátszása',
        search_placeholder: 'Keresés név, stílus, tartalom szerint...',
        stop: 'Leállítás',
        sort: {
          name: 'ABC sorrendben',
          popularity: 'Népszerűség szerint',
          random: 'Véletlenszerű sorrendben',
          last: 'Utolsó hallgatás szerint (világ)',
          user_last: 'Utolsó hallgatás szerint (én)'
        },
        suggest: 'Javasoljon egy módosítást',
        title: 'A világ rádiói streamingben',
        website: 'Weboldal'
      },
      toast: {
        home: {
          enabled: 'Az oldal be van kapcsolva, mint kezdőoldal.',
          disabled: 'Az oldal ki van kapcsolva, mint kezdőoldal.'
        }
      }
    },
  },
  tr: {
    message: {
      consent: {
        accept: 'Evet',
        allow: 'Kişiselleştirilmiş reklamları tercih ediyor musunuz?',
        deny: 'Hayır',
        disclaimer: '(Kullanıcı verilerimizi satmıyoruz)'
      },
      loading: 'Yükleniyor...',
      generic: {
        delete: 'Sil',
        error: 'Bir hata oluştu.'
      },
      now_page: {
        back: '← Tam program ızgarasına dön',
        title: 'Şimdi radyoda'
      },
      params_page: {
        automatic: 'Otomatik',
        automatic_help: 'Bağlantı türüne (ADSL, fiber, 4G...) ve bant genişliğinize göre.',
        deactivated: 'Devre dışı',
        description: 'Akışın başlangıcındaki reklamları ve yükleme sürelerini azaltmak için, oynatıcı radyo değiştirdiğinizde veya oynatmayı duraklatırken birkaç dakika boyunca önceki akışı çalmaya devam edebilir.',
        duration_10: '10 dakika boyunca',
        duration_30: '30 dakika boyunca',
        no_support: 'Tarayıcınız otomatik algılamayı desteklemiyor.',
        save: 'Kaydet',
        sub_title: 'Eşzamanlı akışları oynatma',
        title: 'Oynatıcı ayarları',
        two_flux: 'İki eşzamanlı akış',
        updated: 'Ayarlar güncellendi'
      },
      player: {
        autoplay_error: 'Tarayıcınız otomatik medya oynatmayı desteklemiyor. Lütfen "Dinle"ye tekrar tıklayın.',
        play_error: 'Oynatma hatası',
        placeholder: 'Oynatmaya başlamak için bir logo tıklayın',
        previous: '{radio}yu tekrar dinle',
        save_song: 'Bu şarkıyı kaydet ({song})',
        save_song_not_logged: 'Bu şarkıyı kaydet (sadece giriş yapan kullanıcılar)',
        save_song_no_title: 'Bu şarkıyı kaydet (başlık mevcut değil)',
        song_saved: 'Şarkı kaydedildi.',
        favorites: {
          add: 'Favorilere ekle',
          remove: 'Favorilerden kaldır'
        },
        output: {
          choose: 'Ses çıkışı seçin',
          choose_label: 'Ses çıkışı seçin:',
          save: 'Varsayılan çıkış olarak kaydet',
          pause_if_disconnect: 'Çıkış bağlantısı kesildiğinde oynatmayı durdur',
        },
        timer: {
          cancelled: 'Zamanlayıcı iptal edildi',
          end_in: 'Zamanlayıcı 0 dakika içinde biter | Zamanlayıcı {minutes} dakika içinde biter | Zamanlayıcı {minutes} dakika içinde biter',
          finish: 'Oynatmayı durdur (zamanlayıcı)',
          modal: {
            abrv: 'dk',
            cancel: 'Zamanlayıcıyı iptal et',
            close: 'Kapat',
            length: 'Süre',
            placeholder: 'Dakika',
            quick: 'Hızlı seçim',
            set: 'Zamanlayıcıyı başlat',
            title: 'Zamanlayıcı',
            x_minutes: '{minutes} dakika',
            x_hours: '{hours} saat'
          },
          set: 'Zamanlayıcı 0 dakika için ayarlandı | Zamanlayıcı {minutes} dakika için ayarlandı | Zamanlayıcı {minutes} dakika için ayarlandı',
          title: 'Zamanlayıcı',
          tooltip: 'Zamanlayıcıyı etkinleştirmek için buraya tıklayın'
        },
        video: {
          title: 'Video oynatıcı'
        },
      },
      radio_page: {
        back: '← Tam program ızgarasına dön',
        current: '↓ Mevcut programı görüntüle',
        no_schedule: 'Programlar mevcut değil.',
        play: '{radio}yu dinle',
        stop: '{radio}yu durdur',
        title: '{radio} programları ve yayını',
        webradios: 'Web radyoları'
      },
      schedule: {
        no_schedule: 'Programlar mevcut değil :(',
        no_radio: 'Bu kategoride radyo yok',
        no_radio_favorites: 'Favori radyonuz yok',
        preroll_filter: 'Başlangıçta reklam içeren radyolar',
        title: 'Tüm radyo programları ve çevrimiçi dinleme',
        today: 'Bugün',
        tomorrow: 'Yarın',
        tooltip: 'Burada daha fazla radyo',
        radio_list: {
          page: 'Program sayfası',
          pick_region_title: 'Bir bölge seçin',
          region: {
            modal: {
              close: 'Kapat',
            }
          }
        }
      },
      songs_page: {
        buy: 'Satın al',
        buy_amazon: 'Amazon',
        find: 'Bul',
        find_deezer: 'Deezer',
        find_spotify: 'Spotify',
        find_youtube: 'Youtube',
        no_songs: 'Kaydedilmiş şarkınız yok.',
        title: 'Kaydedilmiş şarkılar',
      },
      streaming: {
        categories: {
          all_countries: 'Tüm ülkeler',
          favorites: 'Favoriler',
          last: 'İnsanlar dinliyor...',
          history: 'Geçmişim'
        },
        close: 'Geri',
        country: 'Ülke',
        country_search_no_result: 'Ülke bulunamadı',
        listeners_title: 'Dinleyiciler',
        listeners: 'Şu anda dinleyici yok. | Şu anda bir dinleyici var. | Şu anda {count} dinleyici var.',
        more: 'Daha fazla göster',
        no_results: 'Radyo yok',
        play: '{radio}yu dinle',
        playing: 'Başlık',
        playing_errors: 'Bu radyo için oynatma hataları bildirildi.',
        history: 'Son şarkılar:',
        random: 'Rastgele bir radyo oynat',
        search_placeholder: 'İsim, stil, içerik ile ara...',
        stop: 'Durdur',
        sort: {
          name: 'Alfabetik sıraya göre',
          popularity: 'Popülerliğe göre',
          random: 'Rastgele sıraya göre',
          last: 'Son dinlemeye göre (dünya)',
          user_last: 'Son dinlemeye göre (ben)'
        },
        suggest: 'Bir değişiklik öner',
        title: 'Dünyanın radyoları yayında',
        website: 'Web sitesi'
      },
      toast: {
        home: {
          enabled: 'Sayfa ana sayfa olarak etkinleştirildi.',
          disabled: 'Sayfa ana sayfa olarak devre dışı bırakıldı.'
        }
      }
    },
  }
};
