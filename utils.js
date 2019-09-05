const jwt = require('jsonwebtoken');

module.exports = {
    validateToken: (req, res, next) => {
        const authorizationHeader = req.headers.authorization;
        let result;

        if (!authorizationHeader) {
            result = {
                error: 'Authentication Error. Token Required',
                status: 401
            };

            return res.status(401).send(result);
        }

        const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
        const options = {
            expiresIn: '2d',
            // maxAge: '60s',
            issuer: 'https://simplicity.io'
        };

        try {
            // Verify makes sure that the token hasn't expired and had been issued by us
            result = jwt.verify(token, process.env.JWT_SECRET, options);

            console.log('req.decoded before:', req.decoded);
            // Let's attach the decoded token to the requst object
            req.decoded = result
            console.log('req.decoded after:', req.decoded);

            // We call next to pass execution to the subsequent middleware
            return next();
        } catch (err) {
            throw new Error(err);
        }
    }
};