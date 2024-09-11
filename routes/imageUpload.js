const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// ************************ UPLOAD IMAGE ***********************
async function imageupload(id, file, del) {
  if (del) await deleteImage(id);
  return cloudinary.uploader.upload(
    file.image.tempFilePath,
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

module.exports = { imageupload, deleteImage };
