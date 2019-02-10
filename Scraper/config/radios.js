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
        'mouv'
      ],
    'francebleu':
      [
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
        return radios[collection];
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
