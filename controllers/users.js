const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/users');

const connUri = process.env.MONGO_LOCAL_CONN_URL;

module.exports = {
    add: (req, res) => {
        console.log('~~~~connUri', connUri);
        mongoose.connect(connUri, { useNewUrlParser:true }, (err) => {
            let result = {};
            let status = 201;

            if (err) {
                status = 500;
                result.status = status;
                result.error = err;
                return res.status(status).send(result);
            }

            const {name, password} = req.body;
            console.log('name', name);
            console.log('password', password);
            const user = new User({ name: name, password: password }); // document = instance of a model
            // TODO: We can hash the password here before we insert instead of in the model.
            user.save((err, user) => {
                if (err) {
                    console.log('err saving user \n', user, '\n -> err: \n', err);
                    status = 500;
                    result.status = status;
                    result.error = err;
                    return res.status(status).send(result);
                }

                result.status = status;
                result.result = user;
                return res.status(status).send(result);
            });
        });
    },

    login: (req, res) => {
        const {name, password} = req.body;

        mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
            let result = {};
            let status = 200;

            if (err) {
                status = 500;
                result.status = status;
                result.error  = err;
                return res.status(status).send(result);
            }

            User.findOne({name: name}, (err, user) => {
                // console.log('found user? ', user, '\n*** err', err);
                if (err || !user) {
                    status = 404;
                    result.status = status;
                    result.error = err;
                    return res.status(status).send(result);
                }

                // We could compare passwords in our model instead of below
                bcrypt.compare(password, user.password).then(match => {
                    if (!match) {
                        status = 401;
                        result.status = status;
                        result.error  = 'Authentication Error';
                        return res.status(status).send(result);
                    }

                    // Create a token
                    const payload = { user: user.name };
                    const secret = process.env.JWT_SECRET;
                    const options = { expiresIn: '2d', issuer: 'https://simplicity.io' };
                    const token = jwt.sign(payload, secret, options);

                    // console.log('***TOKEN:', token);
                    // console.log('***JWT_SECRET:', secret);

                    result.token = token;
                    result.status = status;
                    result.result = user;

                    return res.status(status).send(result);
                }).catch(err => {
                    status = 500;
                    result.status = status;
                    result.error  = err;
                    return res.status(status).send(result);
                });

            });

        });
    },

    getAll: (req, res) => {
        mongoose.connect(connUri, { useNewUrlParser: true }, (err) => {
            let result = {};
            let status = 200;

            if (err) {
                result.status = status = 500;
                result.error = err;
                return res.status(status).send(result);
            }

            const payload = req.decoded;
            // TODO Log the payload here to verify that it's the same paylaod we used when creating the token
            console.log('PAYLOAD', payload);

            if (payload && payload.user === 'admin') {
                User.find({}, (err, users) => {
                    if (err) {
                        result.status = status = 500;
                        result.error = err;
                        return res.status(status).send(result);
                    }
                    
                    result.status = status;
                    result.result = users
                    return res.status(status).send(result);
                });
            } else {
                result.status = status = 401;
                result.error = 'Authentication Error';
                return res.status(status).send(result);
            }
        });
    }
};