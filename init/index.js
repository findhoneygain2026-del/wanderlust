const mongoose = require('mongoose');
const initData = require("./data.js");
const Listing = require('../models/listing.js');

const Mongo_Url = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("connected to DB");
}).catch(err =>{
    console.log(err);
})
async function main(){
    await mongoose.connect(Mongo_Url)
}

const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner : "6a4bbdb728c1917e94478c66"}));
    await Listing.insertMany(initData.data);
    console.log('data was initialized');
}
initDB();