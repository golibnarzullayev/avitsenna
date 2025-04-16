import multer from "multer";
import path from "path";

const storage = (folder: string) => {
  return multer.diskStorage({
    destination: `./public/uploads/${folder}`,
    filename: function (_, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });
};

function checkFileType(
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extname) {
    return cb(null, true);
  } else {
    return cb(
      new Error(
        "Fayl yuklashda xatolik yuz berdi qayta urining! Fayl tipi .jpeg, .jpg, .png, .gif formatlarda bo'lishi kerak"
      )
    );
  }
}

export const upload = (folder: string) => {
  return multer({
    storage: storage(folder),
    limits: { fileSize: 50000000 },
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  });
};
