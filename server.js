const express = require("express");
const app = express();
const db = require("./db");
require("dotenv").config();
const bodyParser = require('body-parser');
const userRoutes = require("./routes/userRoutes");
const candidateRoutes =require('./routes/candidateRoutes')
const {jwtAuthMiddleware}=require('./jwt')

app.use(bodyParser.json());
app.use("/user", userRoutes);
app.use("/candidate",candidateRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
