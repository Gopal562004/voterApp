const mongoose = require('mongoose');
require('dotenv').config();
//define mongo db connection

//const mongoURL = 'mongodb://localhost:27017/hotels';
const mongoURL=process.env.MONGODB_URL_LOCAL;
mongoose.connect(mongoURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});
const db = mongoose.connection;


db.on('error',(err)=>{
    console.log('error in mongoDB server',err);
});
db.on('disconnected',()=>{
    console.log('disconnected to mongoDB server');
});
db.on('connected',()=>{
    console.log('connected to mongoDB server');
});
module.exports = db;
