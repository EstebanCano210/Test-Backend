import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'tmp/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${file.originalname}`;
    cb(null, name);
  }
});

const subirArchivo = multer({ storage });

export default subirArchivo;
