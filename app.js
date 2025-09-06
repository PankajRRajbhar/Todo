require("dotenv").config();
const express = require('express')
const http = require('http')
const mongoose = require("mongoose");
 require("./util/sendReminderEmail")

//database connection
mongoose.connect(process.env.CONNECTION_STRING)


const app = express();

app.use(express.json())

app.use(require("./routes/user"));
app.use(require("./routes/todo"));


//error handling
app.use((err,req,res,next)=> {
    let message = err.message;
    let status = err.status; 
    return res.send({ message, status: status || 500 });
})

const server = http.createServer(app);

server.listen(5000, ()=> {
    console.log("server is up on port 5000")
})