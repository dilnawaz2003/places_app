const jwt = require('jsonwebtoken');

checkAuth = (req,res,next) => {
    console.log('check auth');
    try{
        const token = req.cookies.token;
        if(token){
            const userData = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
            req.user = userData;
            next();
        }else{
            res.status(500).json({message:"Login Failed."});
        }
        
    }catch(e){
        console.log(e);
        res.status(500).json({message:"Login Failed."});
    }
}

module.exports = checkAuth;