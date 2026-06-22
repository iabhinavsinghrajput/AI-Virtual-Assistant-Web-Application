import multer from "multer"
import os from "os"

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, os.tmpdir())
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})

const upload=multer({storage})
export default upload