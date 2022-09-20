const router = require("express").Router();
const axios = require('axios')
require("dotenv/config");
const bcryptjs = require('bcryptjs')
const CuisineService = require('../services/cuisine.service')
const {isAuthenticated,isNotAuthenticated} = require('../middlewares/auth.middleware');
const User = require("../models/User.model");
const e = require("express");
const Recipe = require("../models/Recipe.model");
const { db, find } = require("../models/User.model");

const edamamApi = new CuisineService();


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get('/login', isNotAuthenticated, (req,res,next) => {
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

router.get('/register', isNotAuthenticated, (req,res,next) => {
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
    return
  }
  let myHashedPassword = bcryptjs.hashSync(passWord)
  User.create({
    email: eMail,
    username: userName,
    password: myHashedPassword
  })
  .then(data => {
    console.log('New registration data:', data)
    res.redirect('/')
  })
  .catch(err => res.send('Something went wrong', err))
})

router.get('/profile', isAuthenticated, (req,res,next) => {
  Recipe.find({user: req.session.user})
  .then(allSavedData => {
    console.log('All saved data', allSavedData)
  res.render('profile.hbs', {
    user: req.session.user,
    data: allSavedData
  })
})
})

router.get('/logout', (req,res,next) => {
  req.session.destroy()
  res.redirect('/')
})

router.get('/search', (req,res,next) => {
  res.render('search.hbs')
})
router.get("/searchCuisine", (req,res,next) => {
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
    res.render('recipeDetail.hbs', {
      recipeDetail: element,
      uri: uriSplit,
    })
  })
  .catch(err => console.log('Error getting single item:', err))
})

router.post('/profile/create/:id', isAuthenticated, (req,res,next) => {
  let NewRecipeId = req.params.id
  let newLabel = req.body.label
  let newThumbnail = req.body.thumbnail
  Recipe.create({
    label: newLabel,
    thumbnail: newThumbnail,
    apiId: NewRecipeId,
    user: req.session.user
  })
  .then(newRecipeData => {
    console.log('New recipe data:', newRecipeData)
    res.redirect('/profile')
  })
})

router.get('/delete/:id', (req,res,next) => {
  let recipeId = req.params.id
  Recipe.findByIdAndDelete(recipeId)
  .then(deleteData => {
    console.log('Deletion successful', deleteData)
    res.redirect('/profile')
  })
  .catch(err => console.log('Something went wrong deleting', err))
})

module.exports = router;
