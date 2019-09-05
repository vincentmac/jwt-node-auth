const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const environment = process.env.NODE_ENV;
const stage = require('../config')[environment];
// console.log('******STAGE ', stage);

// schema maps to a collection
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: 'String',
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: 'String',
        required: true,
        trim: true
    }
});

// encrypt password before save
userSchema.pre('save', function(next) {
    const user = this;
    console.log('save this', this);

    if (!user.isModified || !user.isNew)
        return next();

    bcrypt.hash(user.password, stage.saltingRounds, (err, hash) => {
        if (err) {
            console.log('Error hashing password for user', user.name);
            return next(err);
        }
        
        user.password = hash;
        next();
    });
});


module.exports = mongoose.model('User', userSchema);