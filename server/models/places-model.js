const mongoose = require('mongoose');

const placeScehma = mongoose.Schema(
    {
        ownerId:{
            required:true,
            type:mongoose.Types.ObjectId,
            ref:'User',
            cascadeDelete:true,
        },
        title:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        address:{
            type:String,
            required:true,
        },
        image:{
            required:true,
            type:String
        }

    }
);


placeScehma.pre('findOneAndDelete', { document: true, query: false },async (next) => {
    console.log('pre called');
   
    next();
});

const placeModel = mongoose.model('Place',placeScehma);

module.exports = placeModel;