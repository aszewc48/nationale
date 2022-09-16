const router = require("express").Router();
const axios = require('axios')
require("dotenv/config");
const CuisineService = require('../services/cuisine.service')

const edamamApi = new CuisineService();


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/getFoodCountry", (req,res,next) => {
  let foodName = req.query.name
  console.log('food data:', foodName)
  let foodCuisine = req.query.cuisine
  edamamApi.getCuisine(foodName, foodCuisine)
  .then(result => {
    console.log('Data for food country:', result.data)
    // res.send(result.data.hits)
    res.render('searchResults.hbs', { searchResult: result.data.hits})
  })
  .catch(err => console.log('Error getting food country data:', err))
})

module.exports = router;
