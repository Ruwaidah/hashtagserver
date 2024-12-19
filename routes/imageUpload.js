import cloud from "cloudinary";

const cloudinary = cloud.v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// ************************ UPLOAD IMAGE ***********************
async function imageupload(data) {
  // if (data.deletePhoto) await deleteImage(data.imagePublicId);
  return cloudinary.uploader.upload(
    // data.file.image.tempFilePath,
    data.image.tempFilePath,
    function (err, result) {
      return result;
    }
  );
}

// *********************** DELETE IMAGE *************************
const deleteImage = (id) => {
  return cloudinary.uploader.destroy(id, function (result) {
    return result;
  });
};

export default { imageupload, deleteImage };
