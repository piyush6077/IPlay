import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/User.model.js"

const registerUser = asyncHandler(async (req, res)=>{
    // Take data from the user
    // ? validation - not empty
    // check if data is available in db : username,email
    // check for images, check for avatar 
    // upload them to cloudinary , avatar 
    // create user object - create entry in db 
    // remove password and refresh token field from response 
    // check for user creation 
    // return response

    // user details - from user [frontend]
    const {fullname , email , username , password} = req.body
    console.log("email : ",email)

    //Validation

    // if (fullname ==="" || ){
    //     throw new ApiError(400, "fullname is required")
    // }

    // some return true
    if (
        [fullname , email , username , password].some((field)=>field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists
    const existedUser = User.findOne({
        $or: [
            { email },
            { username }
        ]
    })

    if (existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }
})


export {registerUser}
