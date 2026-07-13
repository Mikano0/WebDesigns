import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session"
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2"
import dotenv from "dotenv";

dotenv.config()

const app = express();
const port = 3000;
const saltRounds = 12;

const dbPassword = process.env.DB_PASSWORD
const secret = process.env.SECRET_SESSION
const dbUser = process.env.DB_USER
const dbHost = process.env.DB_HOST
const database = process.env.DATABASE
const portDB = process.env.PORT
const googleClientID = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET


const db = new pg.Client({
  user: dbUser,
  host: dbHost,
  database: database,
  password: dbPassword,
  port: portDB,
});
db.connect();

app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        maxAge: 1000 * 60 * 60 * 24,
    }
  })
);

app.use(passport.initialize());
app.use(passport.session())


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.get("/secrets", async (req, res) =>{
    console.log(req.user)
    if (req.isAuthenticated()){
        try{
            const result = await db.query("SELECT secret FROM users where id = $1",
                [req.user.id]
            )
            res.render("secrets.ejs",{
                secret: result.rows[0]?.secret})
        } catch (err){
            console.log(err)
        }
    } else{
        res.redirect("/login")
    }
})

app.get("/submit", (req, res) =>{
    if (req.isAuthenticated()){
        res.render("submit.ejs")
    } else{
        res.redirect("/")
    }
})

app.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"],
}))

app.get("/auth/google/secrets", passport.authenticate("google", {
    successRedirect: "/secrets",
    failureRedirect: "/login"
}));

app.get("/logout", (req,res)=>{
    req.logout((err) =>{
        if(err){
            console.log(err)
        }
        res.redirect("/")
    })
})

app.post("/login", passport.authenticate("local",{
    successRedirect: "/secrets",
    failureRedirect: "/login",

}));

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
        return res.send("Email already exists. Try logging in.");
    } 

    const hash = await bcrypt.hash(password, saltRounds);

    const result = await db.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
        [email, hash])

    const user = result.rows[0]
    req.login(user, (err) =>{
        console.log(err)
        res.redirect("/secrets")
    })
    } catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong.");
  }
});

app.post("/submit", async (req,res) => {
    if (!req.isAuthenticated()){
        return res.redirect("/login")
    }

    const secret = req.body.secret
    console.log(secret)

    try{
        await db.query("UPDATE users SET secret = $1 WHERE id = $2",
            [secret, req.user.id]
        )
        res.redirect("/secrets")
    } catch(err){
        console.log(err)
    }
})


passport.use("local", new Strategy(async function verify(username, password, cb){
    const email = username
    console.log( email)

    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
        ]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const storedHashedPassword = user.password;

            const isMatch = await bcrypt.compare(password, storedHashedPassword)
            if (isMatch){
                return cb(null, user)
            } else{
                return cb(null, false)
            }
        } else {
            return cb("User not found")
        }
        } catch (err) {
            console.log(err);
            return cb(err)
    }
}))


passport.use("google", new GoogleStrategy({
    clientID: googleClientID,
    clientSecret: googleClientSecret,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    }, async (accessToken, refreshToken, profile, cb) =>{
        console.log(profile)
        try{
            const result = await db.query("SELECT * FROM users WHERE email = $1",
                [profile.email])
            if (result.rows.length === 0){
                const newUser = await db.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
                    [profile.email, "google"])
                    return cb(null, newUser.rows[0])
            } else{
                //User already in database
                return cb(null, result.rows[0])
            }
        }  catch (err){
            console.log(err)
            return cb(err)
        }
    })
)


passport.serializeUser((user, cb) =>{
    return cb(null, user.id)
})

passport.deserializeUser(async(id, cb) =>{
    try{
        const result = await db.query("SELECT id,email FROM users WHERE id = $1",
            [id]
        );
        return cb(null, result.rows[0]);
    } catch (err){
       return cb(err);
    }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
