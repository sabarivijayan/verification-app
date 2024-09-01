const accessTokenGenerator = require('../Utils/accessTokenGenerator')

let accessToken = null;
let tokenExpirationTime = null;

async function refreshToken(req, res, next) {
    const currentTime = Date.now();

    if (
        !accessToken ||
        !tokenExpirationTime ||
        currentTime >= tokenExpirationTime
    ) {
        try {
            accessToken = await accessTokenGenerator();
            // Set expiration time to 23 hours from now (assuming token lasts 24 hours)
            tokenExpirationTime = currentTime + 23 * 60 * 60 * 1000;
        } catch (error) {
            return res
                .status(500)
                .json({ error: "Failed to refresh access token" });
        }
    }

    req.sandboxAccessToken = accessToken;
    next();
}

module.exports = refreshToken;
