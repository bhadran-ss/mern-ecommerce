import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connection created in db...");
}).catch(err=> {
    console.log("Connection not created..", err);
})