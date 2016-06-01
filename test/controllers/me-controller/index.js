var should = require('should');
var request = require('supertest');
var shared = require('../../shared');
var Map = require('capital-models').map;

var db;
var url = shared.config.server.host + ':' + shared.config.server.port;
var token;
var actor;
var signedInUser;

before('authorize', function (done) {
    var factory = require('mongo-factory');
    factory.getConnection(shared.config.connectionString)
        .then(dbInstance => {
            dbInstance.collection(Map.identity.account).dbFirst()
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
                                token = result.data.token;
                                actor = result.data.user;
                                done();
                            }
                        });
                });
        });
});

it('should be able to get data', function (done) {
    request(url)
        .get('/me')
        .set('Authorization', 'JWT ' + token)
        .expect(200)
        .end(function (err, response) {
            if (err)
                done(err);
            else {
                var result = response.body;
                should.notEqual(result.apiVersion, "0.0.0", "api version not set");
                result.should.have.property('data');
                result.data.should.not.be.instanceOf(Array);
                signedInUser = result.data;
                signedInUser.username.should.equal(actor.username);
                done();
            }
        });
})

it('should be able to update data', function (done) {

    var dataToBeUpdated = signedInUser;
    dataToBeUpdated.email = dataToBeUpdated.email + '[updated]';
    dataToBeUpdated.name = dataToBeUpdated.name + '[updated]';
    dataToBeUpdated.nik = dataToBeUpdated.nik + '[updated]';
    dataToBeUpdated.initial = dataToBeUpdated.initial + '[updated]';
    dataToBeUpdated.department = dataToBeUpdated.department + '[updated]';
    dataToBeUpdated.gender = dataToBeUpdated.gender == "F" ? "M" : "F";

    request(url)
        .put('/me')
        .set('Authorization', 'JWT ' + token)
        .send(dataToBeUpdated)
        .expect(200)
        .end(function (err, response) {
            if (err)
                done(err);
            else {
                var result = response.body;
                should.notEqual(result.apiVersion, "0.0.0", "api version not set");
                result.should.have.property('data');
                result.data.should.not.instanceOf(Array);
                var updatedData = result.data;
                updatedData.email.should.equal(dataToBeUpdated.email, "email not match.");
                updatedData.name.should.equal(dataToBeUpdated.name, "name not match.");
                updatedData.nik.should.equal(dataToBeUpdated.nik, "nik not match.");
                updatedData.initial.toUpperCase().should.equal(dataToBeUpdated.initial.toUpperCase(), "initial not match.");
                updatedData.department.should.equal(dataToBeUpdated.department, "department not match.");
                updatedData.gender.should.equal(dataToBeUpdated.gender, "gender not match.");
                updatedData._stamp.should.not.equal(dataToBeUpdated._stamp, "_stamp must not match.");
                updatedData._updatedBy.should.be.equal(actor.username,"_updatedBy not equal actor username");
                done();
            }
        });
})