const multer = require('multer');
const { nanoid } = require('nanoid');
const ImageKit = require('imagekit');
const sharp = require('sharp');
const { imageRules } = require('../media-config/imageRules');
const AppError = require('../utils/AppError');

const client = new ImageKit({
  publicKey: process.env['IMAGEKIT_PUBLIC_KEY'],
  privateKey: process.env['IMAGEKIT_PRIVATE_KEY'],
  urlEndpoint: process.env['IMAGEKIT_URL_ENDPOINT'],
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Switch to memoryStorage to temporary store
// images in ram before uploading to imagekit
const storage = multer.memoryStorage();

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
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 Mb
});

// Upload to imagekit
async function uploadToImagekit(file, folderName) {
  const fileName = `${nanoid()}.jpeg}`;

  const uploadResponse = await client.upload({
    // Direct buffer upload
    file: file.buffer,
    fileName,
    useUniqueFileName: true,
    folder: folderName,
  });

  return uploadResponse;
}

exports.uploadSingle = (fieldName, folderName) => (req, res, next) => {
  upload.single(fieldName)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      throw new AppError(err.message, 400);
    } else if (err) {
      throw new AppError(err.message, 400);
    }

    if (req.file) {
      const rules = imageRules[folderName] || imageRules.default;

      // Using memoryStorage gives direct acces to file.buffer
      const processedBuffer = await sharp(req.file.buffer)
        .resize(rules.width, rules.height, { fit: 'inside' })
        .jpeg({ quality: rules.quality })
        .toBuffer();

      // Upload processed buffer to ImageKit
      // No temp file created on disk
      // No cleanup required
      const result = await uploadToImagekit(
        {
          buffer: processedBuffer,
          originalname: req.file.originalname,
          mimetype: 'image/jpeg',
        },
        folderName
      );
      // Attach the url to req object
      req.fileUrl = result.url;
    }
    return next();
  });
};

exports.uploadArray =
  (fieldName, folderName, maxCount = 5) =>
  (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        throw new AppError(err.message, 400);
      } else if (err) {
        throw new AppError(err.message, 400);
      }

      if (req.files && req.files.length > 0) {
        const rules = imageRules[folderName] || imageRules.default;

        // Map files to async uploads and await all
        const uploadPromises = req.files.map(async (file) => {
          const processedBuffer = await sharp(file.buffer)
            .resize(rules.width, rules.height, { fit: 'inside' })
            .jpeg({ quality: rules.quality })
            .toBuffer();

          const result = await uploadToImagekit(
            {
              buffer: processedBuffer,
              originalname: file.originalname,
              mimetype: 'image/jpeg',
            },
            folderName
          );

          return result.url;
        });

        const fileUrls = await Promise.all(uploadPromises);
        req.fileUrls = fileUrls;
      }
      return next();
    });
  };
