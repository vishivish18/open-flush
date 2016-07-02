function createPack() {
    var suits = new Array("C", "D", "H", "S");
    var pack = new Array();
    var n = 52;
    var index = n / suits.length;

    var count = 0;
    for (i = 0; i <= 3; i++)
        for (j = 2; j <= index +1 ; j++)
            pack[count++] = suits[i] + j;

    return pack;
}

function shufflePack(pack) {
    var i = pack.length,
        j, tempi, tempj;
    if (i === 0) return false;
    while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        tempi = pack[i];
        tempj = pack[j];
        pack[i] = tempj;
        pack[j] = tempi;
    }
    return pack;
}

function draw(pack, amount, hand, initial) {
    var cards = new Array();
    cards = pack.slice(0, amount);

    pack.splice(0, amount);

    if (!initial) {
        hand.push.apply(hand, cards);
    }

    return cards;
}

function playCard(amount, hand, index) {
    hand.splice(index, amount)
    return hand;
}

exports.createPack = createPack;
exports.shufflePack = shufflePack;
exports.draw = draw;
exports.playCard = playCard;
