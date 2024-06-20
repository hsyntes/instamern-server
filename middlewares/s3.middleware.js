const AWS = require("../aws.config");

// * S3 Initializing
const S3 = new AWS.S3();

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
