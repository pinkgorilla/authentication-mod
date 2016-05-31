var should = require('should');
var request = require('supertest');


var initializeServer = function () {
    return new Promise((resolve, reject) => {
        var connectionString = process.env.connectionString;
        var jwtSecret = process.env.jwtSecret;
        
        var factory = require('mongo-factory');

        factory.getConnection(connectionString)
            .then(db => {

                var express = require('express');
                var app = express();

                var jwt = require('mean-toolkit').passport.jwt;
                jwt.strategy(function (payload, done) {
                    return done(null, payload.user);
                }, jwtSecret);

                var morgan = require('morgan');
                app.use(morgan('dev'));

                var AccountController = require('../src/controllers/account-controller');
                app.use('/accounts', new AccountController(db, jwt).router);

                var port = process.env.PORT || 3000;
                app.listen(port);
                resolve(app);
            });
    })
}

describe('#account-controller', function () {

    this.timeout(2 * 60000);
    var url = 'http://localhost:3000';
    before('initialize server', function (done) {
        initializeServer().then(app => {
            done();
        });
    })

    it('should be okay', function (done) {

        request(url)
            .get('/accounts')
            .expect(200)
            .end(function (err, response) {
                if (err)
                    done(err);
                else {
                    console.log(response.body)
                    done();
                }
            });
    })
});