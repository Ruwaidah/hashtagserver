import cloudinary from "../cloudinaryConfig.js";

export const imageuploadBuffer = (buffer, folder = "hashtag") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

export const deleteImage = async (publicId) => {
  if (!publicId) return;
  return cloudinary.uploader.destroy(publicId);
};