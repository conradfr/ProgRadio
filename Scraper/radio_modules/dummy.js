const getScrap = dateObj => {
    return Promise.resolve([
        {
            title: 'Dummy',
            date_time_start: dateObj.toISOString(),
            date_time_end_end: dateObj.add(1, 'hours').toISOString(),
            timezone: 'Europe/Paris'
        }
    ]);
};

const scrapModule = {
    getName: 'dummy',
    getScrap
};

module.exports = scrapModule;
