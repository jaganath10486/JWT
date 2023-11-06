const dotenv = require('dotenv').config()
const jwt = require("jsonwebtoken");

const jwt_secrete = process.env.JWt_SECRETE_KEY

//Middleware for Protected Endpoints i.e 
//It will check Authorization header of the incoming request and if the incoming request doesnot contain authorization token or if it contains invalid authorization token the middleware wont guve access to the url
//the Middleware verifies the JWT token  
module.exports = async (req, res, next) => {
  try {
    //get the token from the authorization header
    const token = await req.headers.authorization.split(" ")[1];
    //check if the token matches the supposed origin
    const decodedToken = await jwt.verify(token, jwt_secrete);
    // retrieve the user details of the logged in user
    const user = await decodedToken;
    // pass the user down to the endpoints here
    req.user = user;

    next();
    
  } catch (error) {
    res.status(401).json({
      status : "error",
      data : "No Access without Proper JSON Web Token "
    });
  }
};
