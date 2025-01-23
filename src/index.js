import connectDB from './db/db.js';
import dotenv from 'dotenv';
import {app} from './app.js';


dotenv.config({
    path: './env'
});

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on port 
            ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGODB connection error : ",err)
})




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