const userModel = require('../models/user-model');
const placeModel = require('../models/places-model');


placeModel.pre('removeMany',async (next) => {
    console.log('pre called');
    userModel.updateOne(
        {_id:this.ownerid},
        {$pull:{places:this._id}},
    );
    next();
});