var should = require('should');
var request = require('supertest');
var shared = require('../../shared');
var Map = require('capital-models').map;

var db;
var url = shared.config.server.host + ':' + shared.config.server.port;

before('connect to db', function (done) {
    var factory = require('mongo-factory');
    factory.getConnection(shared.config.connectionString)
        .then(dbInstance => {
            db = dbInstance;
            done();
        });
});

it("should success to log in", function (done) {
    db.collection(Map.identity.account).dbFirst()
        .then(account => {
            request(url)
                .post('/authenticate')
                .send({ username: account.username, password: 'Standar123' })
                .expect(200)
                .end(function (err, response) {
                    if (err)
                        done(err);
                    else {
                        var result = response.body;

                        should.notEqual(result.apiVersion, "0.0.0", "api version not set");
                        result.should.have.property('data');
                        result.data.should.have.property('token');
                        result.data.should.have.property('user');
                        token = result.data.token;

                        done();
                    }
                });
        });
})