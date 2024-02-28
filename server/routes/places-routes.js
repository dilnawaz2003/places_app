const express = require('express');
const checkAuth = require('../middlewares/check-auth');
const placeModel = require('../models/places-model');
const expressValidator = require('express-validator');
const userModel = require('../models/user-model');
const multer = require('multer');
const fs = require('fs');
const { nextTick } = require('process');

const router = express.Router();

const {body,validationResult,query,check} = expressValidator;

const mimi_types = {
    'image/png' : 'png',
    'image/jpg' : 'jpg',
    'image/jpeg' : 'jpeg',
}

const storage = multer.diskStorage(
    {
        destination:(req,file,cb) => {
           return cb(null,'./images/');
        },
        filename:(req,file,cb) => {
           return  cb(null,`${Date.now()}_${file.originalname}`);
        },
        // fileFilter:(req,file,cb) => {
        //     const isValid = !!mimi_types[file.mimetype];
        //     let error = isValid ? null : new Error('Mime type not valid');

        //     return cb(error,isValid);
        // }
        
    }
);

const uploadImage = multer({storage});




router.post(
    '/',
    
    [
        check('title').isString().trim().isLength({min:3}),
        check('description').isString().trim().isLength({min:10}),
        check('address').isString().trim().isLength({min:3}),
    ],
    checkAuth,
    uploadImage.single('image'),
    async(req,res) => {

       
    try{
        // console.log('creating place');
        const errors = validationResult(req);
        console.log(req.query);
        console.log(req.file);

        // console.log(errors);
        if(!errors.isEmpty()) throw new Error('Please Enter Valid Values');

        // res.status(500).json({place:'Hi there'})
        const userFromToken = req.user;
        const {title,description,address} = req.query;

        // console.log(req.formData);
        // console.log(req.file);

        const createdPlace = await placeModel.create({
            ownerId:userFromToken.userId,
            title,
            description,
            address,
            image:req.file.filename,
        });

        

        await userModel.updateOne(
            {_id:userFromToken.userId},
            {$push:{places:createdPlace._id}},
        );

        res.json({place:createdPlace});
        
    }catch(e){
        fs.unlink(req.file.filename || "",(err) => {
            console.log('error unlinking');
        });
        console.log(e.message);
        res.status(500).json({message:e.message ||"Error Createing New Place"});
    }
});



router.get('/:pid', async (req,res) => {
    try{
        const placeId = req.params.pid;


        const place = await  placeModel.findById(placeId);

        res.json(place);
    }catch(e){
        res.status(500).json({message:e.message || "Could not get place"});
    }
});


router.patch(
    '/:pid',
    body('title').isString().trim().isLength({min:3}),
    body('description').isString().trim().isLength({min:10}),
    body('address').isString().trim().isLength({min:3}),
    checkAuth,
    async (req,res) => {
        try{
            const pid = req.params.pid;
            const userFromToken = req.user;



            await placeModel.updateOne(
                {_id:pid,ownerId:userFromToken.userId},
                {$set:{
                    title:req.body.title,
                    description:req.body.description,
                    address:req.body.address,
                }}

            );

            res.json({message:'Succesfully Updated'});

        }catch(e){
            res.status(500).json({message:'Succesfully Updated'});

        }
    }
);



router.delete('/:pid',checkAuth,async (req,res) => {
    try{
        console.log('deleting');
        const placeId = req.params.pid;
        const {userId} = req.user;


        await userModel.updateOne(
            {_id:userId},
            {$pull:{places:placeId}},
        );

        
        const deletedDocument  = await placeModel.findOneAndDelete(
            {_id:placeId,ownerId:userId},
        );

        if(!deletedDocument) throw Error('Place Not Found');
        console.log('deleted');

        res.json(deletedDocument);


    }catch(e){
        console.log('error deleting');
        res.status(500).json({message : e.message || 'Some Thing Went Wrong . please try Again'})
    }
});


// list of all places for specific user.

router.get(
    '/user/:uid',
    checkAuth,
    async (req,res) => {
        try{

            const userId = req.params.uid;
            const places = await placeModel.find({ownerId:userId});
            res.json(places);

        }catch(e){
            res.status(500).json({message:'Could not get places for this user . please try again'});
        }
    }
)

module.exports = router;