var test = require('./shared').test; 

describe('#authentication-mod', function(){
    this.timeout(2 * 60000); 
      
    test('#account-manager:create', './managers/account-manager/create.js');
    test('#account-manager:update', './managers/account-manager/update.js');
    test('#controllers', './controllers');
})