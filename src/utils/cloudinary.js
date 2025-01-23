import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null
        // Upload image on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto"
        })
        // files has been uploaded successfully
        console.log("File uploaded successfully on cloudinary",response.url);
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath); // remove the local saved temprory file as the 
        // upload on cloudinary failed
    }
}

export default uploadOnCloudinary;
