var should = require('should');

var user = {
    username: 'unit-test'
};

// types
var AccountManager = require('../src/managers/account-manager');

// tests
var createTest = require('./account-manager/create.test');

describe('#account-manager', function () {
    this.timeout(2 * 60000);
    var db;
    var manager;

    before('connect to db', function (done) {
        var connectionString = process.env.connectionString; 
        var factory = require('mongo-factory');
        factory.getConnection(connectionString)
            .then(dbInstance => {
                db = dbInstance;
                manager = new AccountManager(db, user);
                done();
            });
    });


    describe('#create account', function () {
        var inputData;
        var createdData;

        before('initialize input data', function () {
            var date = new Date();
            var code = date.getTime().toString(16);
            inputData = {
                // account
                username: code,
                password: "Standar123",
                email: code + "@unit-test.com",
                // info
                nik: code,
                initial: "ABC",
                department: "quality-control",
                // profile
                name: "unit test - " + code,
                dob: date,
                gender: "M"
            };
        })

        it('should success with normal data', function (done) {
            manager.create(inputData)
                .then(data => {
                    createdData = data;
                    createdData.should.have.property('_id');
                    done();
                })
                .catch(e => done(e));
        })

        it('should fail with when create duplicate data', function () {
            manager.create(inputData)
                .then(data => {
                    throw "should fail";
                })
                .catch(e => {
                    done();
                });
        })

        it('should success when get account by id', function (done) {
            manager.getAccountByQuery({ _id: createdData._id })
                .then(account => {
                    account.should.have.property('_id');
                    done();
                })
                .catch(e => done(e));
        })

        it('should success when get profile by accountId', function (done) {
            manager.getProfileByQuery({ accountId: createdData._id })
                .then(profile => {
                    profile.should.have.property('_id');
                    done();
                })
                .catch(e => done(e));
        })

        it('should success when get info by accountId', function (done) {
            manager.getInfoByQuery({ accountId: createdData._id })
                .then(info => {
                    info.should.have.property('_id');
                    done();
                })
                .catch(e => done(e));
        });


        describe("#update account", function () {
            var dataToBeUpdated;
            it('should success when update data', function (done) {
                manager.getByQuery({ _id: createdData._id })
                    .then(data => {
                        should.exist(data);
                        // update data.
                        dataToBeUpdated = data;
                        dataToBeUpdated.email = dataToBeUpdated.email + '[updated]';
                        dataToBeUpdated.name = dataToBeUpdated.name + '[updated]';
                        dataToBeUpdated.nik = dataToBeUpdated.nik + '[updated]';
                        dataToBeUpdated.initial = dataToBeUpdated.initial + '[updated]';
                        dataToBeUpdated.department = dataToBeUpdated.department + '[updated]';
                        dataToBeUpdated.gender = dataToBeUpdated.gender == "F" ? "M" : "F";

                        manager.update(dataToBeUpdated)
                            .then(updatedData => {
                                should.equal(dataToBeUpdated.email, updatedData.email, "email not match.");
                                should.equal(dataToBeUpdated.name, updatedData.name, "name not match.");
                                should.equal(dataToBeUpdated.nik, updatedData.nik, "nik not match.");
                                should.equal(dataToBeUpdated.initial.toUpperCase(), updatedData.initial.toUpperCase(), "initial not match.");
                                should.equal(dataToBeUpdated.department, updatedData.department, "department not match.");
                                should.equal(dataToBeUpdated.gender, updatedData.gender, "gender not match.");
                                should.notEqual(dataToBeUpdated._stamp, updatedData._stamp, "_stamp must not match."); 
                                done();
                            })
                            .catch(e => done(e));
                    })
                    .catch(e => done(e));
            });

            it('should fail when update with outdated _stamp', function (done) {
                manager.update(dataToBeUpdated)
                    .then(updatedData => {
                        should.fail('no error was thrown when it should have been')
                        done();
                    })
                    .catch(e => done());
            });

            it('should not update password when password is blank', function () {
                manager.getByQuery({ _id: createdData._id })
                    .then(data => {
                        should.exist(data);
                        var password = data.password;
                        data.password = "";
                        manager.update(data)
                            .then(updatedData => {
                                should.equal(updatedData.password, password, "password should still equal");
                                done();
                            })
                            .catch(e => done(e));
                    })
                    .catch(e => done(e));
            })
        });
    })
})