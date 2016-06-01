'use strict'
var Controller = require('mean-toolkit').Controller;
var AccountManager = require('../managers/account-manager');

module.exports = class AuthenticationController extends Controller {

    constructor(db, options) {
        super("1.0.0", options);
        this.db = db;
    }

    initializeRouter(router) {

        var jwt = require('jsonwebtoken');
        var passportLocal = require('mean-toolkit').passport.local;
        passportLocal.strategy((username, password, done) => {
            var accountManager = new AccountManager(this.db);
            accountManager.authenticate(username, password)
                .then(user => {
                    done(null, user);
                })
                .catch(e => {
                    done(null, false);
                    // reject("Authentication failed. Invalid username or password");
                });
        });


        // routes.
        // POST:/
        router.post('/', passportLocal.authenticate({ session: false }), (request, response, next) => {
            var user = request.user;
            var tokenOption = { expiresIn: this.options.jwt.expiresIn };

            var token = jwt.sign({ user: user }, this.options.jwt.secret, tokenOption);
            var data = {
                token: token,
                user: user
            };

            response.locals.data = data;
            next();
        });
    }
};