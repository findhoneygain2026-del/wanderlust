const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js')
const listingsRouter = require('./routes/listing.js')
const reviewsRouter = require('./routes/review.js')
const session = require('express-session')
const {MongoStore} = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user.js')
const userRouter = require('./routes/user.js')
require('dotenv').config();
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const dbUrl = process.env.ATLASDB_URL;

main().then(()=>{
    console.log("connected to DB"); 
}).catch(err =>{
    console.log(err);
})
async function main(){
    await mongoose.connect(dbUrl)
}

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,'/public')));

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret : process.env.SECRET
    },
    touchAfter : 24*60*60,
})

store.on("error",function(e){
    console.log("SESSION STORE ERROR",e);
})

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})
app.get('/', (req, res) => {
  res.redirect('/listings');
});
app.use("/listings",listingsRouter);
app.use('/listings/:id/reviews',reviewsRouter);
app.use('/',userRouter);

app.all("/*splat",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
})

app.use((err,req,res,next)=>{
    let {status = 500,message = "Something went wrong"} = err;
    console.error(err);
    res.status(status).render('listings/error',{message});
})

app.listen(3000,()=>{
    console.log('server is linsting to port 3000')
})