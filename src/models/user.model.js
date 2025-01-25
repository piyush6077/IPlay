import mongoose , { Schema } from "mongoose";
import jwt from "jsonwebtoken"; 
import bcrypt from "bcrypt"
import dotenv from "dotenv";
dotenv.config();

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        lowercase:true,
        trime: true,
        index: true    // Indexing the username field for faster search
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase:true,
        trime: true,
    },
    fullname: {
        type: String,
        required: true,
        trime: true,
        index: true
    },
    avatar: {
        type: String,    //Cloudinary url
        required: true,
    },
    coverImage: {
        type: String,    //Cloudinary url
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true , "Password is required"],
    },
    refreshToken: {
        type: String,
    }
},
{
    timestamps: true
})



userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

// userSchema.methods.isPasswordCorrect


userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password , this.password)
}



// Refresh token and access token 
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);