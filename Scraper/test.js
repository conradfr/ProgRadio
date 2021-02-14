const commandLineArgs = require('command-line-args');
const optionDefinitions = [
  {name: 'test', alias: 't', type: String, multiple: true},
];
const options = commandLineArgs(optionDefinitions);

if (options['test']) {
  console.log('AAAH ' + options['test']);
} else {
  console.log('YO MAN');
}


