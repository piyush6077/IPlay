import mongoose from 'mongoose';
import {DBname} from '../constants.js'

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MongoURI}/${DBname}`)     
        console.log(`\n MongoDB connected : ${connectionInstance.connection.host}`)
    } catch(error){
        console.error("MONGODB connection error : ",error)
        process.exit(1)
    }
}

export default connectDB;


// we can coonect in index throught 
