var should = require('should');
var shared = require('../shared');


var initializeServer = function () {
    return new Promise((resolve, reject) => {
        var factory = require('mongo-factory');

        factory.getConnection(shared.config.connectionString)
            .then(db => {

                var controllerOptions = { jwt: { secret: shared.config.jwt.secret } };

                var express = require('express');
                var app = express();
                
                var passport = require('passport');
                app.use(passport.initialize());

                var bodyParser = require('body-parser');
                app.use(bodyParser.urlencoded({ extended: false }));
                app.use(bodyParser.json());

                var morgan = require('morgan');
                app.use(morgan('dev'));

                var AuthenticationController = require('../../src/controllers/authentication-controller');
                app.use('/authenticate', new AuthenticationController(db, controllerOptions).router);

                var AccountController = require('../../src/controllers/account-controller');
                app.use('/accounts', new AccountController(db, controllerOptions).router);

                var MeController = require('../../src/controllers/me-controller');
                app.use('/me', new MeController(db, controllerOptions).router);

                var port = process.env.PORT || shared.config.server.port;
                app.listen(port);
                console.log("Express server listening on port %d in %s mode", port, 'unit-testing');
                resolve(null);
            });
    })
}

before('initialize server', function (done) {
    initializeServer().then(result => {
        done();
    });
})

var test = shared.test;


test('#authenticate', './controllers/authentication-controller');
test('#accounts', './controllers/account-controller');
test('#me', './controllers/me-controller');