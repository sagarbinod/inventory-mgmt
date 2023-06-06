const mongoose=require("mongoose");
const validator=require("validator");
const bcrypt = require('bcrypt');

const userSchema=mongoose.Schema({
    email : {
        type: String,
        required: true,
        unique: true,
        validate :{
            validator : validator.isEmail,
            message: "Email is not valid"

        }
    },
    password: {
        type: String,
        required: true,
        validate: validator.isStrongPassword
    },
    isAdmin : {
        type: Boolean,
        default : false
    },
    name :{
        type: String,
        required : true
    }
});

userSchema.pre("save", async function(next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt)
    next();
});

const userModel= mongoose.model('user',userSchema);

module.exports =userModel;