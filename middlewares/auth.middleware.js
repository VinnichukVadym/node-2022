const {CError} = require("../errors");
const {authValidator} = require("../validators");
const {userService, tokenService} = require("../services");
const {constants} = require("../constants");
const {OAuth} = require("../db");
const {tokenEnum} = require("../enums");

module.exports = {
    isValidBodyForLogin: (req, res, next) => {
        try {
            const {error, value} = authValidator.isValidBodyForLogin.validate(req.body);

            if (error) {
                return next(new CError('Wrong email or password'));
            }

            req.body = value;
            next();
        } catch (e) {
            next(e);
        }
    },
    isUserPresent: async (req, res, next) => {
        try {
            const {email} = req.body;

            const user = await userService.findOneUser({email});

            if (!user) {
                return next(new CError('Wrong email or password'));
            }

            req.user = user;
            next();
        } catch (e) {
            next(e);
        }

    },
    checkAccessToken: async (req, res, next) => {
        try {
            const access_token = req.get(constants.AUTHORIZATION);

            if (!access_token) {
                return next(new CError('No token', 401));
            }

            tokenService.checkToken(access_token);

            const tokenInfo = await OAuth.findOne({access_token}).populate('userId');

            if (!tokenInfo) {
                return next(new CError('Token not valid', 401));
            }

            req.access_token = tokenInfo.access_token;
            req.user = tokenInfo.userId;

            next();
        } catch (e) {
            next(e);
        }
    },
    checkRefreshToken: async (req, res, next) => {
        try {
            const refresh_token = req.get(constants.AUTHORIZATION);

            if (!refresh_token) {
                return next(new CError('No toke', 401))
            }

            tokenService.checkToken(refresh_token, tokenEnum.REFRESH_TOKEN);

            const tokenInfo = await OAuth.findOne({refresh_token});

            if (!tokenInfo) {
                return next(new CError('Token not valid', 401));
            }

            req.tokenInfo = tokenInfo;
            next();
        } catch (e) {
            next(e);
        }
    },

}