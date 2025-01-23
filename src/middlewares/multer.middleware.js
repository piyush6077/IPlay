import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req,file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req,file,cb) {
        cb(null, file.originalname)    // Change file name latter to avoid duplication
    }
})
    
export const upload = multer({ storage: storage })