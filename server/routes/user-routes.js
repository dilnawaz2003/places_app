const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('dotenv');
const expressValidator = require('express-validator');
const multer = require('multer');


const userModel = require('../models/user-model');
const checkAuth = require('../middlewares/check-auth');
env.config();



const router = express.Router();
const {body , validationResult} = expressValidator;



const storage = multer.diskStorage(
    {
        destination:(req,file,cb) => {
           return cb(null,'./images/');
        },
        filename:(req,file,cb) => {
           return  cb(null,`${Date.now()}_${file.originalname}`);
        },
    }
);


const uploadImage = multer({storage});


router.post('/profile-image' ,checkAuth,uploadImage.single('image'),async(req,res) => {

    try{
        console.log('profile image');
        const userFromToken = req.user;

        await userModel.updateOne(
            {_id:userFromToken.userId},
           {$set:{
            image:req.file.filename,
           }}
        );

        res.json({message:'profile image set'});
    }catch(e){
        console.log(e);
        res.status(500).json({message:'could not profile image set'});

    }
})
router.get('/user',checkAuth,async (req,res) => {
    console.log('getting one  user');
    try{
        const userFromToken =  req.user;

        const user = await userModel.findOne({_id:userFromToken.userId});

        if(!user) throw new Error('User not found');

        res.json(user);
    }catch(e){
        console.log('error getting one user');
        console.log(e);
        res.status(500).json({message:e.message});
    }
});

router.get('/',async (req,res) => {
    console.log('getting users');
    try{
        const allUsers = await userModel.find({});
        res.json(allUsers);
    }catch(e){
        res.status(500).json({message:'Could not get users'});
    }
});




router.post('/signup',[
    body('email','please enter valid email').isString().isEmail(),
    body('password','please enter valid password').isString().isLength({min:5}),
    body('userName','please enter valid user name').isString().isLength({min:3}),

],async (req,res) => {

    console.log('sign up 1 ');
    console.log(req.body);

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors.array());
        return  res.status(422).json({errorMsg:errors.array()});
        
    }
    const {
        userName,
        email,
        password,
    } = req.body;


    

    try{
        const existingUser = await userModel.findOne({email:email})

        if(existingUser){
            console.log('user Already Exist');
            res.status(500).json({message:"User Already Exist"});
        }
        else{
            const createdUser = await  userModel.create(
                {
                    userName,
                    email,
                    password:bcrypt.hashSync(password,12),
                    places:[],
                }
            );

            const token =jwt.sign(
                {
                    userId:createdUser._id,
                    email:createdUser.email,
                },
                process.env.ACCESS_TOKEN_SECRET,
                (err,token) => {
                    if(err) throw new Error('Signup failed');
                    res.cookie('token',token).json({message:'Signup Successful',user:createdUser});
                }
            );
            
        }
    }catch{
        res.status(500).json({message:"Signup Failed.plz try again"}); 
    }
});


router.post(
    '/login',
    [
        body('email','please enter valid email').isString().isEmail(),
        body('password','please enter valid password').isString().isLength({min:5}),
    ],
    
    async (req,res) => {
        console.log(req.body);
        try{
            const {email , password} = req.body;

            const existingUser = await userModel.findOne({email,email});

            if(!existingUser) throw new Error('please Enter Valid Email or Password');

            const passIsOK = await  bcrypt.compare(password,existingUser.password);

            if(!passIsOK) throw new Error('please Enter Valid Email or Password');

            jwt.sign(
                {
                    userId:existingUser._id,
                    email:existingUser.email,
                },
                process.env.ACCESS_TOKEN_SECRET,
                (err,token) => {
                    if(err) throw new Error('Login failed');
                    res.cookie('token',token).json({
                        message:'login Successful',
                        user:existingUser
                    });
                }
            );
        }catch(e){
            console.log('error login');
            res.status(500).json({message:e.message});
        }
    }
);



router.post('/logout',checkAuth,async (req,res) => {
    try{
        res.cookie('token','').json({message:'user loged out'});
    }catch(e){
        res.status(500).json({message:e.message || 'Could not log user out'});
    }
});
module.exports = router;
