const fs = require('fs');
const express = require('express');
const app = express();

app.use(express.static("."));

app.get("/", (req, res) => {
    res.sendFile("index.html", { root: __dirname + "/public" });
});

const apiRouter = express.Router();

app.listen(8080, () => console.log('Example app listening on port 8080!'));