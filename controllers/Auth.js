var mongoose = require('mongoose');
const appError = require('../core/app-error');
const core = require('../core/core');

module.exports = function () {
    var jwt = require('jsonwebtoken');
    var User = mongoose.model('User');
    var coreObj = new core();

    function generatePassword(val) {
        var d = new Date().getTime();
        var stringgen;
        if (val == '1') {
            stringgen = 'xxxxxxxx';
        } else if (val == '2') {
            stringgen = 'xxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx';
        }
        var uuid = stringgen.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    this.Login = async function (data, options) {

        const security = coreObj.getEnvironmentVariable('security');
        let userresult = await User.findOne({ email: data.email, password: data.password });
        if (userresult) {
            if (security && security.generate)   {
                var token = jwt.sign({ id: userresult.id }, security.secret, {
                    expiresIn: security.time // expires in 24 hours
                });
                return { user: userresult, tokenId: token };
            } else {
                return userresult
            }
        }
        else {
            throw new appError("ACC001");
        }
    }



    this.Register = async function (data, options) {
        let fined = await User.find({ email: data.email });
        if (fined.length > 0) {
            throw new appError("ACC002");
        } else {
            var user = new User(data);
            let userresult = await user.save(user);
            if (userresult) {
                delete userresult.password;
                var token = jwt.sign({ id: userresult.id }, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                return { user: userresult, tokenId: token };
            }
        }
    }

    this.Logout = async function (data, options) {
        //decrpt password 
        let result = await Token.remove({ token_id: data.tokenId })
        return ({ message: "Token Delete Successfully" });
    }

}