
var express = require('express');
var router = express.Router();

var AccountManager = require('../managers/account-manager');


var jwt = require('mean-toolkit').passport.jwt;


module.exports = function (jwt) {

    // middlewares. 
    router.use(service.version.bind(service));
    router.all('*', jwt.authenticate({ session: false }));

    // routes.
    // POST:/
    router.post('/', (request, response, next) => {
        this.connectDb(config.connectionString)
            .then(db => {
                var user = request.user;
                var accountManager = new AccountManager(db, user);
                accountManager.create(request.body)
                    .then(result => {
                        response.locals.data = result;
                        next();
                    })
                    .catch(e => next(e));
            })
            .catch(e => next(e));
    });

    // GET :/
    router.get('/', (request, response, next) => {
        this.connectDb(config.connectionString)
            .then(db => {
                var user = request.user;
                var accountManager = new AccountManager(db, user);
                accountManager.read()
                    .then(result => {
                        response.locals.data = result;
                        next();
                    })
                    .catch(e => next(e));
            })
            .catch(e => next(e));
    });

    // PUT :/
    router.put('/', (request, response, next) => {
        this.connectDb(config.connectionString)
            .then(db => {
                var user = request.user;
                var accountManager = new AccountManager(db, user);
                accountManager.update(request.body)
                    .then(result => {
                        response.locals.data = result;
                        next();
                    })
                    .catch(e => next(e));
            })
            .catch(e => next(e));
    });

    // GET :/username
    router.get('/:username', (request, response, next) => {
        var username = request.params.username;
        this.connectDb(config.connectionString)
            .then(db => {
                var user = request.user;
                var accountManager = new AccountManager(db, user);
                accountManager.get(username)
                    .then(result => {
                        response.locals.data = result;
                        next();
                    })
                    .catch(e => next(e));
            })
            .catch(e => next(e));
    });

    // DELETE:/username
    router.delete('/:username', (request, response, next) => {
        next("not implemented");
    });

    return router;
};