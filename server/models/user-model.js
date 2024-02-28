const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        userName:{
            required:true,
            type:String,
        },
        email:{
            required:true,
            type:String,
            unique:true,
        },
        password:{
            required:true,
            type:String,
            unique:true,
        },
        places:{
            type:[{type : mongoose.Types.ObjectId, ref:'Place',}],
            required:false,
            
        },
        image:{
            type:String,
        }
    }
);


const userModel = mongoose.model('User',userSchema);


module.exports = userModel;
