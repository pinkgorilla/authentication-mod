'use strict'
// external deps
var ObjectId = require('mongodb').ObjectId;
var Sha1 = require('sha1');

// internal deps
var Manager = require('mean-toolkit').Manager;
var Map = require('capital-models').map;

// model types
var Account = require('capital-models').identity.Account;
var UserOrganizationInfo = require('capital-models').identity.UserOrganizationInfo;
var UserProfile = require('capital-models').identity.UserProfile;

module.exports = class AccountManager extends Manager {
    constructor(db, user) {
        super(db);
        this.user = user;

        this.accountCollection = this.db.collection(Map.identity.account);
        this.infoCollection = this.db.collection(Map.identity.userOrganizationInfo);
        this.profileCollection = this.db.collection(Map.identity.userProfile);
    }


    read() {
        return new Promise(function (resolve, reject) {
            //1. find and toArray.
            this.accountCollection.find().toArray()
                .then(docs => {
                    //1a. find and toArray success.
                    var promises = [];
                    for (var doc of docs) {
                        promises.push(new Promise((resolve, reject) => {
                            var account = doc;
                            var loadProfile = this.profileCollection.dbSingle({ accountId: new ObjectId(account._id) });
                            var loadInfo = this.infoCollection.dbSingle({ accountId: new ObjectId(account._id) });
                            //2. load profile and info for each account found.
                            Promise.all([loadProfile, loadInfo])
                                .then(results => {
                                    //2a. load profile and info for each account found success.
                                    //resolve.
                                    resolve(Object.assign({}, results[0], results[1], account));
                                })
                                //2b. something is wrong when loading profile and info for each account found.
                                .catch(e => {
                                    reject(e);
                                });
                        }));
                    }

                    //3. load all account set.
                    Promise.all(promises)
                        .then(results => {
                            //3b. load all account set success.
                            //resolve.
                            resolve(results);
                        })
                        //3b. something is wrong when load all account set.
                        .catch(e => {
                            reject(e);
                        });
                })
                //1b. something is wrong when find and toArray.
                .catch(e => {
                    reject(e);
                });

        }.bind(this));
    }

    authenticate(username, password) {
        return new Promise((resolve, reject) => {
            var query = { username: username.toLowerCase(), password: Sha1(password || '') };
            //1. query single data by username and sha1 password.
            this.getByQuery(query)
                .then(result => {
                    var data = {
                        id: result._id,
                        username: result.username,
                        name: result.name,
                        nik: result.nik,
                        initial: result.initial,
                        department: result.department
                    };
                    // resolve user.
                    resolve(data);
                })
                //1b. something is wrong when querying single data by username and sha1 password.
                .catch(e => {
                    reject("invalid username or password");
                });
        });
    }

    get(username) {
        var query = { username: username };
        return this.getByQuery(query);
    }

    create(data) {
        var data = this._getData(data)
        var account = data.account;
        var profile = data.profile;
        var info = data.info;


        return new Promise((resolve, reject) => {
            profile.dob = profile.dob ? new Date(profile.dob) : new Date();
            account.username = account.username.toLowerCase()
            account.password = Sha1(account.password);
            info.initial = (info.initial || '').toUpperCase();

            account.stamp(this.user.username, 'agent');
            profile.stamp(this.user.username, 'agent');
            info.stamp(this.user.username, 'agent');

            //1. ensure index.
            this._ensureIndexes()
                .then(indexResults => {
                    //1a. ensure index success.
                    delete (account._id);
                    //2. insert account.
                    this.accountCollection.dbInsert(account)
                        .then(accountResult => {
                            delete (profile._id);
                            delete (info._id);
                            //2a. insert account success.     
                            profile.accountId = accountResult._id;
                            info.accountId = accountResult._id;

                            var insertProfile = this.profileCollection.dbInsert(profile);
                            var insertInfo = this.infoCollection.dbInsert(info);
                            //3. insert profile & info.
                            Promise.all([insertProfile, insertInfo])
                                .then(results => {
                                    //3a. inser profile & info success.
                                    var data = Object.assign({}, results[1], results[0], accountResult);
                                    data._id = accountResult._id;
                                    //resolve.
                                    resolve(data);
                                })
                                //3b. something is wrong when inserting profile & info.
                                .catch(e => {
                                    reject(e);
                                });
                        })
                        //2b. something is wrong when inserting account.
                        .catch(e => {
                            reject(e);
                        });
                })
                // 1b. something is wrong when ensuring index
                .catch(e => {
                    reject(e);
                });
        });
    }

    update(data) {
        var data = this._getData(data)
        var account = data.account;
        var profile = data.profile;
        var info = data.info;

        var query = { 'username': account.username.toLowerCase() };
        if (account.password && account.password.length > 0)
            account.password = Sha1(account.password);
        else
            delete (account.password);

        return new Promise((resolve, reject) => {

            account.stamp(this.user.username, 'agent');
            //1. update account.
            this.accountCollection.dbUpdate(query, account, true)
                .then(accountResult => {
                    profile.stamp(this.user.username, 'agent');
                    info.stamp(this.user.username, 'agent');
                    //1a. update account success.
                    var updateProfile = new Promise(function (resolve, reject) { resolve(null) });
                    var updateInfo = new Promise(function (resolve, reject) { resolve(null) });
                    if (profile && profile.accountId.toString() == accountResult._id.toString()) {
                        delete (profile._id);
                        profile.accountId = accountResult._id;
                        updateProfile = this.profileCollection.dbUpdate({ accountId: accountResult._id }, profile, true)
                    }
                    if (info && info.accountId.toString() == accountResult._id.toString()) {
                        delete (info._id);
                        info.accountId = accountResult._id;
                        info.initial = (info.initial || '').toUpperCase();
                        updateInfo = this.infoCollection.dbUpdate({ accountId: accountResult._id }, info, true)
                    }
                    //2. update profile and info.
                    Promise.all([updateProfile, updateInfo])
                        .then(results => {
                            //2a. update profile and info success.
                            var data = Object.assign({}, results[1], results[0], accountResult);
                            data._id = accountResult._id;
                            //resolve.
                            resolve(data);
                        })
                        //2b. something is wrong when updating profile and info.
                        .catch(e => {
                            reject(e);
                        });
                })
                //1b. something is wrong when updating account.
                .catch(e => {
                    reject(e);
                });
        });
    }

    getByQuery(query) {
        return new Promise((resolve, reject) => {
            //1. query single data by query.
            this.getAccountByQuery(query)
                .then(account => {
                    //1a. query single data by query success.                    
                    var loadProfile = this.getProfileByQuery({ accountId: account._id });
                    var loadInfo = this.getInfoByQuery({ accountId: account._id });
                    //2. load profile and info.
                    Promise.all([loadProfile, loadInfo])
                        .then(results => {
                            //2a. load profile and info success.
                            var data = Object.assign({}, results[1], results[0], account);
                            data.password = '';
                            //resolve.
                            resolve(data);
                        })
                        //2b. something is wrong when loading profile and info.
                        .catch(e => {
                            reject(e);
                        });
                })
                //1b. something is wrong when querying single data by query.
                .catch(e => {
                    reject(e);
                });
        });
    }

    getAccountByQuery(query) {
        return new Promise((resolve, reject) => {
            //1. query single data by query.
            this.accountCollection.dbSingle(query)
                .then(account => {
                    //1a. query single data by query success.
                    resolve(account);
                })
                //1b. something is wrong when querying single data by query.
                .catch(e => {
                    reject(e);
                });
        });
    }

    getProfileByQuery(query) {
        return new Promise((resolve, reject) => {
            //1. query single data by query.
            this.profileCollection.dbSingle(query)
                .then(info => {
                    //1a. query single data by query success.
                    resolve(info);
                })
                //1b. something is wrong when querying single data by query.
                .catch(e => {
                    reject(e);
                });
        });
    }

    getInfoByQuery(query) {
        return new Promise((resolve, reject) => {
            //1. query single data by query.
            this.infoCollection.dbSingle(query)
                .then(info => {
                    //1a. query single data by query success.
                    resolve(info);
                })
                //1b. something is wrong when querying single data by query.
                .catch(e => {
                    reject(e);
                });
        });
    }

    _ensureIndexes() {
        return new Promise((resolve, reject) => {
            // account indexes
            var accountPromise = this.accountCollection.createIndexes([
                {
                    key: {
                        username: 1
                    },
                    name: "ix_accounts_username",
                    unique: true
                }]);

            // info indexes
            var infoPromise = this.infoCollection.createIndexes([
                {
                    key: {
                        accountId: 1
                    },
                    name: "ix_user-organization-info_accountId",
                    unique: true
                }]);

            // profile indexes
            var profilePromise = this.profileCollection.createIndexes([
                {
                    key: {
                        accountId: 1
                    },
                    name: "ix_user-profile_accountId",
                    unique: true
                }]);

            Promise.all([accountPromise, infoPromise, profilePromise])
                .then(results => resolve(results))
                .catch(e => {
                    reject(e);
                });
        })
    }

    _getData(data) {
        return {
            account: new Account(data),
            profile: new UserProfile(data),
            info: new UserOrganizationInfo(data)
        };
    }
}