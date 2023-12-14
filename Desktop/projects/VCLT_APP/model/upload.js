import multer from 'multer';
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');
    },
    filename: (req, file, cb) => {
        let ext = path.extname(file.originalname)
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage }).single("profile");

export default upload;