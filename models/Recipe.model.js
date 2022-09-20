const { Schema, model } = require("mongoose");


const recipeSchema = new Schema(
  {
    label: String,
    thumbnail: String,
    apiId: String,
    user: String
  },
);

const Recipe = model("Recipe", recipeSchema);

module.exports = Recipe;
