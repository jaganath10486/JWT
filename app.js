const express = require("express")
const cors = require("cors") //used to allow requst from cross domain .
const mongoose = require('mongoose') //used to connect mongodb cluster
const routes = require('./routes/user')//routes 

const app = express()

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_DB_URL, {
}).then(() => {console.log("Connected to Mongo DB Successfully")})
.catch(error => {
    console.log(error)
})

//For parsing the req.body of json type
app.use(express.json())
app.use(express.urlencoded({extended : true}))

app.use(cors())

//Routes 
app.use('/api', routes)


//To handle Not exists Endpoints
app.use((req, res) => {
    res.json({"message" : "No End Point Found"});
})


module.exports = app