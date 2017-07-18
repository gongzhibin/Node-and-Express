'use strict'
let fortunes = [
    '长风破浪会有时，直挂云帆济沧海',
    '天行健，君子以自强不息；地势坤，君子以厚德载物',
    '此身，此时，此地',
    '问渠那得清如许，为有源头活水来'
];

exports.getFortune = function () {
    let index = Math.floor(Math.random() * fortunes.length);
    return fortunes[index];
};