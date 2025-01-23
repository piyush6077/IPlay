//THis is just a wrapper function to handle async functions in express and is used in the controller files

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req,res,next))
               .catch((err)=> next(err))
    }
}

export default asyncHandler;


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)        
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message: error.message
//         })
//     }
// }
