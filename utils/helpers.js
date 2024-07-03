const AWS = require("../aws.config");
const jsonwebtoken = require("jsonwebtoken");

// * S3 Initializing
const S3 = new AWS.S3();

// * Generate JSON Web Token
exports.generateToken = (id) => {
  const token = jsonwebtoken.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

// * Save the token
exports.saveToken = (res, token) =>
  res.cookie("jsonwebtoken", token, {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: false,
    path: "/",
    // secure: true,
  });

// * Comparing Passwords
exports.comparePasswords = async (user, password) =>
  await user.comparePasswords(password, user.user_password);

// * GET AWS S3 Objects
exports.listObjectsV2 = async ({ Prefix }) => {
  return await S3.listObjectsV2({
    Bucket: process.env.AWS_BUCKET,
    Prefix,
  }).promise();
};

// * DELETE S3 Objects
exports.deleteObjectsV2 = async (objectsV2) => {
  if (objectsV2.Contents.length === 0) return;

  return await S3.deleteObjects({
    Bucket: process.env.AWS_BUCKET,
    Delete: {
      Objects: objectsV2.Contents.map((objectV2) => ({ Key: objectV2.Key })),
    },
  }).promise();
};
