const AWS = require("../aws.config");
const sharp = require("sharp");
const { promisify } = require("util");
const AppError = require("../errors/AppError");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const {
  listObjectsV2,
  deleteObjectsV2,
} = require("../middlewares/s3.middleware");
const Response = require("../utils/Response");

// * GET Post by id
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    Response.send(res, 200, "success", undefined, undefined, { post });
  } catch (e) {
    next(e);
  }
};

// * CREATE post & UPLOAD post image(s)
exports.createPost = async (req, res, next) => {
  try {
    if (!req.files.length === 0)
      return next(
        new AppError(403, "fail", "Please select a post image to upload.")
      );

    const { post_description } = req.body;

    const post = await Post.create({
      post_description,
      post_postedBy: req.user._id,
    });

    const S3 = new AWS.S3();
    const upload = promisify(S3.upload.bind(S3));

    const post_images = [];

    await Promise.all(
      req.files.map(async (file, index) => {
        const post_image = await sharp(file.buffer)
          .resize({
            width: 1080,
            height: 1350,
            fit: "cover",
          })
          .toFormat("jpg")
          .jpeg({ quality: 100 })
          .toBuffer();

        const params = {
          Bucket: process.env.AWS_BUCKET,
          Key: `users/${req.user._id}/posts/${post._id}/${index}.jpg`,
          Body: post_image,
        };

        try {
          const data = await upload(params);
          const url = data.Location;

          post_images.push(url);
        } catch (e) {
          await Post.findByIdAndDelete(post._id);
          return next(e);
        }
      })
    );

    post.post_images = post_images;
    await post.save();

    Response.send(
      res,
      201,
      "sucess",
      "Your post has been shared successfully.",
      undefined,
      { post }
    );
  } catch (e) {
    next(e);
  }
};

// * DELETE post by id
exports.deletePost = async (req, res, next) => {
  try {
    if (!req.params.id)
      return next(
        new AppError(
          403,
          "fail",
          "Please specify which post do you want to delete."
        )
      );

    // List objects under posts/post_id
    const objectsV2 = await listObjectsV2({
      Prefix: `users/${req.user._id}/posts/${req.params.id}`,
    });

    // Delete all objects under post_id
    await deleteObjectsV2(objectsV2);

    // Delete post document
    await Post.findByIdAndDelete(req.params.id);

    // Delete comment document under post
    await Comment.deleteMany({ comment_commentedPost: req.params.id });

    Response.send(res, 204);
  } catch (e) {
    next(e);
  }
};
