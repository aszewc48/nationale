const axios = require('axios')

const myCuisineKeys = {
     
}

class CuisineService{
    constructor(){
        this.myAxios = axios.create({
            baseURL: 'https://api.edamam.com/api/recipes/v2',
            
        })
    }
getCuisine(cuisineName,cuisineType){
    return this.myAxios.get('', {
        params: {
            app_id: process.env.CLIENT_ID,
            app_key: process.env.CLIENT_SECRET,
            q: cuisineName,
            type: 'public',
            cuisineType: cuisineType,
            random: true
         }
    })
}

getAllCuisines(){
    return this.myAxios.get('all', myCuisineKeys)
}
}


module.exports = CuisineService