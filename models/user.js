const mongoose = require("mongoose")

//Mongo DB Schema for User Collection
const UserDetails = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email: {
        type : String,
        unique : true,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    age : {
        type : Number,
        required : true
    },
    gender : {
        type : String,
        required : true
    }
})

const UserInfo = mongoose.model('User', UserDetails, 'users')

module.exports = UserInfo



