
'use strict'
var AccountManager = require('../managers/account-manager');

module.exports = class AccountController {

    constructor(db, jwt) {
        this.db = this.db;
        this.jwt = jwt;
        var express = require('express');
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        // middlewares. 
        // this.router.use(service.version.bind(service));
        this.router.all('*', this.jwt.authenticate({ session: false }));

        // routes.
        // POST:/
        this.router.post('/', (request, response, next) => {
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
        this.router.get('/', (request, response, next) => {
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
        this.router.put('/', (request, response, next) => {
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
        this.router.get('/:username', (request, response, next) => {
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
        this.router.delete('/:username', (request, response, next) => {
            next("not implemented");
        }); 
    }
};