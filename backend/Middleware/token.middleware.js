// Import the accessTokenGenerator function from the Utils directory
const accessTokenGenerator = require('../Utils/accessTokenGenerator');

// Initialize variables to store the access token and its expiration time
let accessToken = null;
let tokenExpirationTime = null;

/**
 * Middleware function to refresh the access token if needed.
 * This function checks whether an access token is available and valid.
 * If not, it generates a new one using the accessTokenGenerator.
 */
async function refreshToken(req, res, next) {
    // Get the current time in milliseconds
    const currentTime = Date.now();

    // Check if the access token is missing, if the expiration time is missing,
    // or if the current time is past the expiration time.
    if (
        !accessToken ||
        !tokenExpirationTime ||
        currentTime >= tokenExpirationTime
    ) {
        try {
            // Generate a new access token
            accessToken = await accessTokenGenerator();

            // Set the expiration time to 23 hours from now
            // This assumes the token is valid for 24 hours and provides a buffer.
            tokenExpirationTime = currentTime + 23 * 60 * 60 * 1000;
        } catch (error) {
            // If token generation fails, respond with a 500 status and an error message
            return res
                .status(500)
                .json({ error: "Failed to refresh access token" });
        }
    }

    // Attach the generated or existing access token to the request object
    req.sandboxAccessToken = accessToken;

    // Call the next middleware or route handler
    next();
}

// Export the refreshToken middleware for use in other parts of the application
module.exports = refreshToken;
