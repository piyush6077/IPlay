import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()  

app.use(cors({
    origin: process.env.CORSORIGIN,
    credentials: true
}))

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public")) //here we can store assets on the server that can be accessed by all
app.use(cookieParser())         // TO GET and SET Cookies from the User



//routes import 
import userRouter from "./routes/user.routes.js"


// routes declarations 
app.use("/api/v1/users", userRouter)


export {app}