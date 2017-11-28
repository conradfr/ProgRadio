const getScrap = dateObj => {
    return Promise.resolve([
        {
            title: 'Dummy',
            schedule_start: dateObj.toISOString(),
            schedule_end: dateObj.add(1, 'hours').toISOString(),
            timezone: 'Europe/Paris'
        }
    ]);
};

const scrapModule = {
    getName: 'dummy',
    getScrap
};

module.exports = scrapModule;
