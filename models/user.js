const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
        type: String,
        rquired: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('User', userSchema)