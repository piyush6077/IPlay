import connectDB from './db/db.js';
import dotenv from 'dotenv';

dotenv.config();

connectDB();

// import express from 'express';
// const app = express();

// ;( async ()=>{
//     try {
//         await mongoose.connect(`${process.env.
//             MongoURI}/${DBname}`)
//             app.on("error",(error)=>{
//                 console.log("ERR", error);
//                 throw error
//             })

//             app.listen(process.env.PORT,()=>{
//                 console.log(`Server is running on port ${process.env.PORT}`)
//             })
//     }catch (error) {
//         console.error(error)
//         throw err 
//     }
// })()