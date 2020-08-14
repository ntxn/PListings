import multer from 'multer';
import sharp from 'sharp';
import { AppError } from './errors';
import { ErrMsg } from '../../common';

export const multerUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true);
    else cb(new AppError(ErrMsg.ImageInvalid, 400));
  },
});

export const resizeImage = async (
  file: Buffer,
  options: Record<string, string | number>,
  collection: string,
  filename: string
): Promise<void> => {
  await sharp(file)
    .resize(options)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/${collection}/${filename}`);
};
