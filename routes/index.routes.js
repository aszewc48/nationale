const router = require("express").Router();
const axios = require('axios')
require("dotenv/config");
const bcryptjs = require('bcryptjs')
const CuisineService = require('../services/cuisine.service')
const {isAuthenticated,isNotAuthenticated} = require('../middlewares/auth.middleware');
const User = require("../models/User.model");
const e = require("express");

const edamamApi = new CuisineService();


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get('/login', (req,res,next) => {
  res.render('login.hbs')
})

router.post('/login', isNotAuthenticated, (req,res,next) => {
  let userName = req.body.username
  let passWord = req.body.password
  User.findOne({
    username: userName
  })
  .then(foundUser => {
    if(!foundUser) {
      res.send('Username or password incorrect')
      return
    }
    const isValidPassword = bcryptjs.compareSync(passWord, foundUser.password)
    if(!isValidPassword) {
      res.send('Username or password incorrect')
      return
    }
    req.session.user = foundUser
    res.redirect('/profile')
  })
})

router.get('/register', (req,res,next) => {
  res.render('register.hbs')
})

router.post('/register', (req,res,next) => {
  let passWord = req.body.password
  console.log('Password:',passWord)
  let passWordConfirm = req.body.passwordConfirm
  console.log('Password Confirm:', passWordConfirm)
  if(passWord != passWordConfirm) {
    res.send('Please make sure passwords match when registering')
    return
  } else if(passWord.length < 4) {
    res.send('Must insert at least four characters into password field')
    return
  }
  let eMail = req.body.email
  if(!eMail.includes('@') || !eMail.includes('.com')){
  res.send('Email must be in correct format')
  return
  }
  let userName = req.body.username
  if(userName.length < 4) {
    res.send('Must insert at least four characters into username field')
  }
  let myHashedPassword = bcryptjs.hashSync(passWord)
  User.create({
    email: eMail,
    username: userName,
    password: myHashedPassword
  })
  .then(data => {
    console.log('New registration data:', data)
    res.redirect('/login')
  })
  .catch(err => res.send('Something went wrong', err))
})

router.get('/profile', isAuthenticated, (req,res,next) => {
  res.render('profile.hbs', {user: req.session.user})
})

router.get("/getFoodCountry", (req,res,next) => {
  let foodName = req.query.name
  console.log('food data:', foodName)
  let foodCuisine = req.query.cuisine
  edamamApi.getCuisine(foodName, foodCuisine)
  .then(result => {
    console.log('Data for food country:', result.data)
    const idArray = result.data.hits.map(element => {
      let uri = element.recipe.uri.split('#recipe_')[1];
      let label = element.recipe.label
      let thumbnail = element.recipe.images.THUMBNAIL.url
      return {
        uri,
        label,
        thumbnail
      }
    })
    // res.send(idArray)
    res.render('searchResults.hbs', { searchResult: idArray})
  })
  .catch(err => console.log('Error getting food country data:', err))
})

router.get('/recipeDetail/:id', (req,res,next) => {
  let recipeId = req.params.id
  edamamApi.getSingleItem(recipeId)
  .then(result => {
    console.log('Data getting single item:', result.data)
    let element = result.data.recipe
    let uriSplit = element.uri.split('#recipe_')[1]
    console.log(uriSplit)
    // res.send(result.data.recipe)
    res.render('recipeDetail.hbs', {recipeDetail: element})
  })
  .catch(err => console.log('Error getting single item:', err))
})

router.post('/profile/create/:id', (req,res,next) => {
  res.send('We made it')
})

module.exports = router;
