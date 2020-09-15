/* @todo refactor to use an api or just list files */
const radios = {
    'nationwide':
      [
        'rtl',
        'franceinter',
        'rmc',
        'nrj',
        'europe1',
        'franceinfo',
        'nostalgie',
        'funradio',
        'rfm',
        'skyrock',
        'rtl2',
        'virgin',
        'franceculture',
        'francemusique',
        'radioclassique',
        'rireetchansons',
        'radionova',
        'sudradio',
        'ouifm',
        'cherie',
        'mradio',
        'mouv',
        'fip'
      ],
    'francebleu':
      [
          'francebleu_alsace',
          'francebleu_armorique',
          'francebleu_auxerre',
          'francebleu_azur',
          'francebleu_bassenormandie',
          'francebleu_bearn',
          'francebleu_belfortmontbeliard',
          'francebleu_berry',
          'francebleu_besancon',
          'francebleu_bourgogne',
          'francebleu_breizhizel',
          'francebleu_champagneardenne',
          'francebleu_cotentin',
          'francebleu_creuse',
          'francebleu_dromeardeche',
          'francebleu_elsass',
          'francebleu_gardlozere',
          'francebleu_gascogne',
          'francebleu_gironde',
          'francebleu_hautenormandie',
          'francebleu_herault',
          'francebleu_isere',
          'francebleu_larochelle',
          'francebleu_limousin',
          'francebleu_loireocean',
          'francebleu_lorrainenord',
          'francebleu_maine',
          'francebleu_mayenne',
          'francebleu_nord',
          'francebleu_occitanie',
          'francebleu_orleans',
          'francebleu_paris',
          'francebleu_paysbasque',
          'francebleu_paysdauvergne',
          'francebleu_paysdesavoie',
          'francebleu_perigord',
          'francebleu_picardie',
          'francebleu_poitou',
          'francebleu_provence',
          'francebleu_rcfm',
          'francebleu_roussillon',
          'francebleu_saintetienneloire',
          'francebleu_sudlorraine',
          'francebleu_touraine',
          'francebleu_vaucluse',
      ],
    'lesindes':
      [
          'africaradio',
          'alouette',
          'alpes1_grenoble',
          'alpes1_sud',
          'beurfm',
          'contactfm',
          'evasionfm',
          'latina',
          'voltage',
      ],
    'international':
      [
        'couleur3',
        'espace2',
        'la1ere',
        'optionmusique',
        'lapremiere',
        'classic21',
        'vivacite',
        'musiq3'
      ]
};

const radiosModule = {
    radios,
    getCollections() {
        return Object.keys(radios);
    },
    getRadios(collection) {
        return radios[collection];
    },
    getRadiosWithPath(collection) {
        return radios[collection].map(radio => `${collection}/${radio}`);
    },
    getRadioPath(radio) {
        for (let collection in radios) {
            if (radios[collection].indexOf(radio) !== -1) {
                return `${collection}/${radio}`;
            }
        }

        return null;
    }
};

module.exports = radiosModule;
