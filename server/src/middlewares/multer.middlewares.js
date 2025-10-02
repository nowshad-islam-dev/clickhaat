const multer = require('multer');
const { nanoid } = require('nanoid');
const path = require('node:path');
const fs = require('node:fs');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${nanoid()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type.'));
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

exports.uploadSingle = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ message: err.message });
    } else if (err) {
      res.status(400).json({ message: err.message });
    }
    next();
  });
};

exports.uploadArray =
  (fieldName, maxCount = 5) =>
  (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };
