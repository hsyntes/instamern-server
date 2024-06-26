const Story = require("../models/Story");
const AppError = require("../errors/AppError");
const AWS = require("../aws.config");
const sharp = require("sharp");
const Response = require("../utils/Response");

// * CREATE Story
exports.createStory = async (req, res, next) => {
  try {
    if (!req.file || req.file.fieldname !== "story_photo")
      return next(
        new AppError(403, "fail", "Please select a photo to upload your story.")
      );

    const story = await Story.create({
      story_storiedBy: req.user._id,
    });

    const story_photo = await sharp(req.file.buffer)
      .resize({
        width: 1080,
        height: 1920,
        fit: "cover",
      })
      .toFormat("jpg")
      .jpeg({ quality: 100 })
      .toBuffer();

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `users/${req.user._id}/stories/${
        story._id
      }/${Date.now().toString()}.jpg`,
      Body: story_photo,
    };

    const S3 = new AWS.S3();

    try {
      S3.upload(params, async (err, data) => {
        if (err) {
          await Story.findByIdAndDelete(story._id);
          return next(
            new AppError(422, "fail", `Story couldn't upload: ${err}`)
          );
        }

        const url = data.Location;

        story.story_photo = url;
        await story.save();

        Response.send(
          res,
          201,
          "success",
          "Your story has been uploaded successfully.",
          undefined,
          { story }
        );
      });
    } catch (e) {
      next(e);
    }
  } catch (e) {
    next(e);
  }
};

// * DELETE story
exports.deleteStory = async (req, res, next) => {
  try {
    await Story.findByIdAndDelete(req.params.id);
    Response.send(res, 204);
  } catch (e) {
    next(e);
  }
};
