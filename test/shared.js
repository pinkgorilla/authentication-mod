exports.test = function (name, path) {
    describe(name, function () {
        require(path);
    })
}

exports.config = {
    connectionString: process.env.DB_CONNECTIONSTRING,
    server: {
        host: 'localhost',
        port: 3000,
    },
    jwt: {
        secret: process.env.AUTH_SECRET
    }
};

exports.user = {
    username: 'unit-test'
};


exports.newUser = function () {

    var date = new Date();
    var code = date.getTime().toString(16);
    var newData = {
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
    return newData;
}