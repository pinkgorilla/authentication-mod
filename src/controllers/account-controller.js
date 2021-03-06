'use strict'
var Controller = require('mean-toolkit').Controller;
var AccountManager = require('../managers/account-manager');

module.exports = class AccountController extends Controller {

    constructor(db, options) {
        super("1.0.0", options);
        this.db = db;
    }

    initializeRouter(router) {

        var jwt = require('mean-toolkit').passport.jwt;
        jwt.strategy(function (payload, done) {
            return done(null, payload.user);
        }, this.options.jwt.secret);

        // middlewares. 
        router.all('*', jwt.authenticate({ session: false }));

        // routes.
        // POST:/
        router.post('/', (request, response, next) => {
            var user = request.user;
            var accountManager = new AccountManager(this.db, user);
            accountManager.create(request.body)
                .then(result => {
                    response.locals.data = result;
                    next();
                })
                .catch(e => next(e));
        });

        // GET :/
        router.get('/', (request, response, next) => {
            var user = request.user;
            var accountManager = new AccountManager(this.db, user);
            accountManager.read()
                .then(result => {
                    response.locals.data = result;
                    next();
                })
                .catch(e => next(e));
        });

        // PUT :/
        router.put('/', (request, response, next) => {
            var user = request.user;
            var accountManager = new AccountManager(this.db, user);
            accountManager.update(request.body)
                .then(result => {
                    response.locals.data = result;
                    next();
                })
                .catch(e => next(e));
        });

        // GET :/username
        router.get('/:username', (request, response, next) => {
            var username = request.params.username;
            var user = request.user;
            var accountManager = new AccountManager(this.db, user);
            accountManager.get(username)
                .then(result => {
                    response.locals.data = result;
                    next();
                })
                .catch(e => next(e));
        });

        // DELETE:/username
        router.delete('/:username', (request, response, next) => {
            next("not implemented");
        });
    }
};