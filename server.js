const app = require("./app")
const dotenv = require('dotenv').config()
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
    console.log('listening to port ', PORT);
})
