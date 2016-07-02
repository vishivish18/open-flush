var card = require("../../services/cards");
var router = require('express').Router();


router.get('/cards', function(req, res, next) {

    var pack = card.createPack();
    var myPack = card.shufflePack(pack);
    var hand = card.draw(myPack, 15, '', true);
    res.json(hand);
   

})
module.exports = router