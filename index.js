module.exports = {
    controllers: {
        AuthenticationController: require('./src/controllers/authentication-controller'),
        AccountController: require('./src/controllers/account-controller'),
        MeController: require('./src/controllers/me-controller')
    },
    managers: {
        AccountManager: require('./src/managers/account-manager')
    }

}