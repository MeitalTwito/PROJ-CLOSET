'use strict';

console.log('Util service loaded');

function _makeId(length = 5) {
  var txt = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return txt;
}

function stringToArray(str) {
  if (!str) return [];
  const arr = str
    .split(',')
    .map(arrItem => arrItem.trim())
    .filter(Boolean);
  return arr;
}
