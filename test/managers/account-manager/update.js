var should = require('should');
var shared = require('../../shared');

var db;
var manager;
var dataId;

before('connect to db', function (done) {
    var factory = require('mongo-factory');
    factory.getConnection(shared.config.connectionString)
        .then(dbInstance => {
            db = dbInstance;
            var AccountManager = require('../../../src/managers/account-manager');
            manager = new AccountManager(db, shared.user);
            manager.accountCollection.first()
                .then(data => {
                    dataId = data._id;
                    done();
                });
        });
});


it('should success when update data', function (done) {
    manager.getByQuery({ _id: dataId })
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
    manager.getByQuery({ _id: dataId })
        .then(data => {
            should.exist(data);
            var password = data.password;
            data.password = "";
            manager.update(data)
                .then(updatedData => {
                    should.equal(updatedData.password, password, "password should still equal");
                    done();
                })
                .catch(e => {
                    done(e);
                });
        })
        .catch(e => {
            done(e);
        });
})