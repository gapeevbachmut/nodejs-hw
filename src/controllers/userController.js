import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const updateUserAvatar = async (req, res, next) => {
  if (!req.file) {
    next(createHttpError(400, 'No file'));
    return;
  }
  //   властивість req.file у терміналі
  // console.log(req.file);

  const result = await saveFileToCloudinary(req.file.buffer);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: result.secure_url },
    { new: true },
  );

  res.status(200).json({ url: user.avatar });
};
