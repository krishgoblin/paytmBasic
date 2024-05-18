const mongoose = require("mongoose");
const { string, number } = require("zod");
const argon2 = require("argon2");


mongoose.connect("mongodb://localhost:27017/paytm");

const Users = new mongoose.Schema({
    firstname:{
        type: String,
        trim: true,
        required: true
    },

    lastname:{
        type: String,
        trim: true,
        required: true
    },
    
    username:{
        type: String,
        required: true,
        minLength: 3,
        maxLength: 30,
        lowercase: true,
        unique: true,
        trim: true
    },
    
    password:{
        type: String,
        required: true,
        minLength: 6,
    }
});

//Accounts table
const Accounts = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    balance: {
        type: Number,
        required: true
    }
});

// Method to generate Hash from plain text  using argon2
Users.methods.createHash = async function (plainTextPassword) {
    // return password hash
    return await argon2.hash(plainTextPassword);
};

// Method to validate the entered password using argon2
Users.methods.validatePassword = async function (candidatePassword) {
  return await argon2.verify(this.password_hash, candidatePassword)
};

const User = new mongoose.model("User", Users);
const Account = new mongoose.model("Account", Accounts);

module.exports = {
    User,
    Account
}