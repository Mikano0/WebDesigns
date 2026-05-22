import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

let authorised = false;

function checkPassword(req, res, next) {
    if (req.body?.password === "ILoveProgramming") {
        authorised = true;
    }
    next();
}

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(checkPassword);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/check", (req, res) => {
    if (authorised) {
        res.sendFile(__dirname + "/public/secret.html");   
    } else{
        res.sendFile(__dirname + "/public/index.html");
        
    }
});


app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

//To see how the final website should work, run "node solution.js".
//Make sure you have installed all the dependencies with "npm i".
//The password is ILoveProgramming
