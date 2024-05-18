const express = require("express");
const rootRouter = require('./routes/index');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());  //cors 
app.use(express.json()); //body parser

app.use("/api/v1", rootRouter);   //This line of code will send all the requests staring with this path to our rootRouter.

app.listen(port);

