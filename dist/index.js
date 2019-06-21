'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _network = require('./network');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.command('new').action(async function (c) {
    var network = new _network.Network();
    await network.create();
});

_commander2.default.command('remove').action(async function (c) {
    await console.log(c + ' ran succesfully');
});

_commander2.default.parse(process.argv);