const express = require('express')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const dotenv = require('dotenv').config();

//user schema and authentication middleware 
const userSchema = require('../models/user')
const authentication = require('../middlewares/authentication')

//jwt secrete key and refresh key which are used to generate tokems.
const jwt_secrete = process.env.JWT_SECRETE_KEY
const refreshJwtSecret = process.env.REFRESH_SECRETE_KEY

//to creates routes
const routes = express.Router()

//sign up endpoint Create Operations
routes.post('/sign-up', async (req, res) => {
    //used try and catch block to handle exceptions like if email or password or details were not there
    try {
        console.log(req.body);
        const { name, email, password, age, gender } = req.body
        //storing the password in encrypt form.
        const encryptedPassword = await bcrypt.hash(password, 10);

        const user = {
            name,
            email,
            password: encryptedPassword,
            age,
            gender
        }

        try {
            //we will verify if already any email exists if exists we wont create account
            const check = await userSchema.findOne({ email: user.email })
            if (check) {
                res.json({ "msg": "Account Already Exists" });
            }
            else {
                await userSchema.insertMany([user])
                res.json({ "msg": "Accounted Created Successfully" })
            }
        }
        catch (e) {
            console.log(e)
            res.json({ "msg": "Eror In Creating Account" })
        }
    }
    catch (err) {
        res.status(400).json({ "msg": "Bad Request" })
    }

})

//Sign-in endpoint upon successfull sign in it will return the JWT and Refresh Token
routes.post('/sign-in', async (req, res) => {
    const user = req.body
    try {
        const check = await userSchema.findOne({ email: user.email })
        if (check) {
            const check1 = await bcrypt.compare(user.password, check.password)
            if (check1) {
                //we will generate jwt token with experies of 10mins and using email 
                const token = jwt.sign({ email: user.email }, jwt_secrete, { expiresIn: '10m' })
                //generate refresh Token with expery 1d
                const refreshToken = jwt.sign({ email: user.email }, refreshJwtSecret, { expiresIn: '1d' })
                return res.json({ status: "exists", jwt: token, refrehToken : refreshToken });
            }
            else {
                return res.json({ status: "WrongPassword", data: "WrongPassword" })
            }
        }
        else {
            return res.json({ status: "notexists", data: "notexists" })
        }
    }
    catch (e) {
        res.status(400).json({ "status": "Bad Request" })
    }
})

//Protected Routes cannot access without JSON Web Token Read Operation 
//Read Operation
routes.get('/profile', authentication, async (req, res) => {
    try {
        console.log(req.user)
        const user = await userSchema.findOne({ email: req.user.email })
        if (user) {
            res.json({ status: "ok", data: user })
        }
        else {
            res.json({ status: "NO Account Found", data: "No Account Found" })
        }
    }
    catch (err) {
        res.json({ status: "error", data: "Error Occured" })
    }
})

//User Profile that allows edit of email and basic details like age name etc. Edit Operation
//If is protected Endpoint and User can update his details not somebody this ensure Authentication and Authorization.
routes.put('/profile', authentication, async (req, res) => {
    try {
        //If User tries to update email then we have to verify whether there is already email exists if no email eixts then only we will update the email
        if (req.body['email']) {
            const user = await userSchema.findOne({ email: req.body['email'] })
            //if email exists
            if (user) {
                res.json({ "status": "Not Updated", data: "Becasue the New Email ALready Exists Change Email or just update basic details like age gender" })
            }
        }
        //first we will find the document based on the email and update the details that user wants to update and returns the updated details.
        await userSchema.findOneAndUpdate(
            { email: req.user.email },
            { ...req.body },
            { new: true }, 
            (err, result) => {
              if (err) {
                res.json({"status" : "data is not updated"})
              } else {
                console.log('Updated user:', result);
                res.json({"status" : "update succesffully", data : result})
              }
            }
          );
    }
    catch (err) {
        console.log(err);
    }
})

//Endpoint for deleting the user in the database It accepts the JWT if the JWT is now there or invalid token then the middleware wont allow the request
//It is protected Endpoint and Delete Operation
routes.delete('/profile', authentication, async (req, res) => {
    //Try and Cactch to handle any exceptional case and this wont stop the running the program
    try {
        //Find and Delete the User
        await userSchema.findOneAndDelete({ email: req.user.email })
            .then((result) => {
                res.json({ "status": "Deleted", "msg": "Deleted Successfully!!" })
            })
            .catch((err) => {
                res.json({ "status": "Not Deleted", "msg": "Not Deleted try after some time" })
            })
    }
    catch
    {
        res.status(400).json("Bad Request");
    }

})


//To generate Fresh JSON WebToken if JWT token is experied iT acceepts the Refresh Token and generate JSON Web Token:
//Refresh Token experies on one day and JSON Web Token experies on 10 mins

routes.post('/get-jwt', async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is required.' });
    }

    jwt.verify(refreshToken, refreshJwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid refresh token.' });
        }

        // If the refresh token is valid, generate a new access token for the user
        const newAccessToken = jwt.sign({ email: user.email }, jwt_secrete, { expiresIn: '10m' });

        res.json({ accessToken: newAccessToken });
    });
})



module.exports = routes