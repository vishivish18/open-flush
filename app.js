"use-strict"

var express = require('express');
var router = express.Router(); // get an instance of the express Router
var morgan = require('morgan');
var passport = require('passport');
var session  = require('express-session');

var bodyParser = require('body-parser');
var app = express();
require('./config/passport')(passport);
//app.use(morgan('dev'));
app.use(session({ secret: 'thisshouldbeasecret' })); // session secret
app.use(passport.initialize());
app.use(passport.session());


app.use('/api/route', router);
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies
//app.use(require('./config/auth'))

app.use('/api/users', require('./app/controllers/api/users'))
app.use('/api/sessions', require('./app/controllers/api/sessions'))
app.use('/', require('./app/controllers/static'))

var port = process.env.PORT || 1900
var server = app.listen(port, function() {
    console.log('Magic begins at port ', port);
});
