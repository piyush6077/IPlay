import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/User.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from"../utils/ApiError.js"
import uploadOnCloudinary from "../utils/cloudinary.js"

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
    const existedUser = await User.findOne({
        $or: [
            { email },
            { username }
        ]
    })

    if (existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }


    //Images 
    // multer add some fields to the request object
    const avatarLocalPath = req.files?.avatar[0]?.path; // path of the file
    // console.log(req.files)
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // Check for images available or not
    if (!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    

    if (!avatar){
        throw new ApiError(400, "Avatar upload failed")
    }


    // Create user object
    const user = await User.create({
        fullname, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password, 
        username: username.toLowerCase()
    })

    // Remove password and refresh token from the response
    const createdUser = await User.findById(user._id).select("-password -refreshToken")


    // Check for user creation 
    if(!createdUser){
        throw new ApiError(500 , "Something went wrong while Registration")
    }

    //return response
    return res.status(201).json(
        new ApiResponse(200, createdUser , "User registered Successfully")
    )
})


export {registerUser}
