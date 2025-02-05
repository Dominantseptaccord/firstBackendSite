    const mongoose = require("mongoose");

    const schema = new mongoose.Schema({
        userName: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 20,
            trim: true,
            validate: {
                validator: function(value){
                    const nameRegex = /^[a-zA-Z\s]*$/;  
                    return nameRegex.test(value);   
                },
                message: "Lol"
            }
        },
        emailName: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
        },
        direction: {  
            type: String,
            required: true 
        },
        twoFactorSecret: {
            type: String, 
            required: false
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorTempSecret: {
            type: String
        }
    });
    const Data = mongoose.model("Data", schema); 
    module.exports = Data;