import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from"../utils/ApiError.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
// import { MdYoutubeSearchedFor } from "react-icons/md";
import jwt from "jsonwebtoken"

//method to generate access and refreshtoken

const generateAccessTokenAndRefreshToken = async (userId)=> {
    try {
        const user = await User.findOne({_id: userId})
        console.log(userId)
        console.log(user)
        if(!user){
           throw new ApiError(400, "User not found");
        } 
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //save refresh token in db
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        //we did validateBeforeSave: false because we are not updating the user object and carious  models need to be 
    
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }

}

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

const loginUser = asyncHandler(async (req, res)=>{
    // take data from the user
    // username or email
    // validation - not empty
    // check if user exists
    // pasword check
    // access and refesh token
    // send cookie
    // return response

    const {username, email , password} = req.body

    //validation
    if (!username && !email){
        throw new ApiError(400, "Username or Email is required")
    }

    if (!password){
        throw new ApiError(400, "Password is required")
    }

    // check if user exists
    const user = await User.findOne({
        $or: [
            {username},
            {email}
        ]
    })

    if (!user){
        throw new ApiError(404, "User not found")
    }

    //check password
    const isPasswordVaild = await user.isPasswordCorrect(password)

    if(!isPasswordVaild){
        throw new ApiError(401, "Password is incorrect")
    }

    //access and refresh token 
    const {accessToken , refreshToken} = await generateAccessTokenAndRefreshToken(user._id) 

    //send cookie
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "user Logged In SuccessFully"
        )
    )
})

// logout
const logoutUser = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("regreshToken", options)
    .json(new ApiResponse(200 , {}, "User logged Out"))
})

//refresh token get the refresh token if access token or session is not ther 
const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401 , "Unauthorized User/Token")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid Refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid refresh Token")
    }

})

const changeCurrentPassword = asyncHandler( async (req,res)=>{
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400 , "Invalid Old Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {} , "Password change successfully "))
})

const getCurrentUser = asyncHandler( async (req,res)=>{
    return res
    .status(200)
    .json(200 , req.user , "current user fetched succesfully")
})

const updateAccountDetails = asyncHandler( async(req,req)=>{

    const {fullname, email} = req.body;

    if(!fullname || !email){
        throw new ApiError(400 , "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname:fullname,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 , user, "Your account detial updated successfully "))
})

const updateAvatar = asyncHandler( async(req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400 , "avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar")
    }

    // update 
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(200 , user, "Avatar changed successfully")
})

const updateCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocal = req.file?.path

    if(!coverImageLocal){
        throw new ApiError(400, "coverImage file is missing ")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocal)

    if(!coverImage.url){
        throw new ApiError(400 , "Error while uploading coverImage")
    }

    const user = await User.findOneAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200 , user , "Cover Image Updated Sucessfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage
}
