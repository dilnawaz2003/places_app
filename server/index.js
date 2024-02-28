
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const userRouter = require('./routes/user-routes');
const placesRouter = require('./routes/places-routes');
const bodyParser = require('body-parser');


const app = express();



app.use((req,res,next) => {
    
    // res.header("Access-Control-Allow-Origin", "http://localhost:3000/");
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Access-Control-Allow-Credentials");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods","GET, POST, DELETE, PATCH")
    next();
});

app.use(express.json());
app.use(cookieParser());
app.use(express.static('images'))

app.use('/api/users/',userRouter);
app.use('/api/places/',placesRouter);







const main = async () => {
    try{
       await  mongoose.connect("mongodb://127.0.0.1:27017/places-app")
       app.listen(5000,(req,res) => console.log('listining')
    )
    }catch(e){
        console.log(e);
        console.log('error connecting database');
    }
}

main();
