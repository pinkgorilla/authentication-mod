var should = require('should');
var request = require('supertest');
var shared = require('../../shared');
var Map = require('capital-models').map;

var db;
var url = shared.config.server.host + ':' + shared.config.server.port;
var token;
var actor;
var createdData;

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

it('should be able to get list', function (done) {
    request(url)
        .get('/accounts')
        .set('Authorization', 'JWT ' + token)
        .expect(200)
        .end(function (err, response) {
            if (err)
                done(err);
            else {
                var result = response.body;
                should.notEqual(result.apiVersion, "0.0.0", "api version not set");
                result.should.have.property('data');
                result.data.should.instanceOf(Array);
                done();
            }
        });
})

it('should be able to create data', function (done) {
    var inputData = shared.newUser();
    request(url)
        .post('/accounts')
        .set('Authorization', 'JWT ' + token)
        .send(inputData)
        .expect(200)
        .end(function (err, response) {
            if (err)
                done(err);
            else {
                var result = response.body;
                should.notEqual(result.apiVersion, "0.0.0", "api version not set");
                result.should.have.property('data');
                result.data.should.not.instanceOf(Array);
                createdData = result.data;
                createdData.username.should.be.equal(inputData.username);
                createdData._createdBy.should.be.equal(actor.username);
                createdData._updatedBy.should.be.equal(actor.username);
                done();
            }
        });
})

it('should be able to get created data', function (done) {
    request(url)
        .get('/accounts/' + createdData.username)
        .set('Authorization', 'JWT ' + token)
        .expect(200)
        .end(function (err, response) {
            if (err)
                done(err);
            else {
                var result = response.body;
                should.notEqual(result.apiVersion, "0.0.0", "api version not set");
                result.should.have.property('data');
                result.data.should.not.instanceOf(Array);
                result.data.username.should.be.equal(createdData.username);
                done();
            }
        });
})

it('should be able to update created data', function (done) {

    var dataToBeUpdated = createdData;
    dataToBeUpdated.email = dataToBeUpdated.email + '[updated]';
    dataToBeUpdated.name = dataToBeUpdated.name + '[updated]';
    dataToBeUpdated.nik = dataToBeUpdated.nik + '[updated]';
    dataToBeUpdated.initial = dataToBeUpdated.initial + '[updated]';
    dataToBeUpdated.department = dataToBeUpdated.department + '[updated]';
    dataToBeUpdated.gender = dataToBeUpdated.gender == "F" ? "M" : "F";

    request(url)
        .put('/accounts')
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
                should.equal(dataToBeUpdated.email, updatedData.email, "email not match.");
                should.equal(dataToBeUpdated.name, updatedData.name, "name not match.");
                should.equal(dataToBeUpdated.nik, updatedData.nik, "nik not match.");
                should.equal(dataToBeUpdated.initial.toUpperCase(), updatedData.initial.toUpperCase(), "initial not match.");
                should.equal(dataToBeUpdated.department, updatedData.department, "department not match.");
                should.equal(dataToBeUpdated.gender, updatedData.gender, "gender not match.");
                should.notEqual(dataToBeUpdated._stamp, updatedData._stamp, "_stamp must not match.");
                done();
            }
        });
})