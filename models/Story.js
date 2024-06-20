const mongoose = require("mongoose");

// * Schema Design
const Schema = new mongoose.Schema(
  {
    story_photo: {
      type: String,
    },

    story_storiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A story must belong to a user."],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
    versionKey: false,
  }
);

const Story = mongoose.model("Story", Schema);

module.exports = Story;
