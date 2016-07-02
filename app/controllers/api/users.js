var router = require('express').Router()
var User = require('../../models/user')
var bcrypt = require('bcryptjs')
var jwt = require('jwt-simple')
var User = require('../../models/user')
var config = require('../../../config')
router.get('/', function(req, res, next) {

    var auth = jwt.decode(req.headers['x-auth'], config.secret)
    User.findOne({
        username: auth.username
    }, function(err, user) {
        if (err) {
            return next(err)
        }
        console.log("this is the user from USER GET: " + user)        
        res.json(user)


    })
})

router.get('/validate/:id', function(req, res, next) {

    User.findOne({
        _id: req.params.id
    }, function(err, user) {
        if (err) {
            return next(err)
        }
        console.log("this is the user from USER GET: " + user)
        user.update({ verified: true }, function(err, res) {
            console.log(res);
        })
        res.json(user)


    })
})




router.post('/', function(req, res, next) {
    var user = new User({
        name: req.body.name,
        username: req.body.username
    })
    bcrypt.hash(req.body.password, 10, function(err, hash) {
        user.password = hash
        user.save(function(err, user) {
            if (err) {
                console.error(err)
            } 
            res.json(user);

        })
    })

})


module.exports = router
