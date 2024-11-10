const express = require('express'); // Required for creating the server. Without it, you can't set up routes or handle requests.
const app = express(); // Initializes the app instance. Needed for route handling and middleware; without it, the server won't function.
const userModel = require('./models/user'); // Allows interaction with the User collection in MongoDB. Without this, you can't create or retrieve user data.
const postModel = require('./models/post'); // Allows interaction with the Post collection. Without this, you can't create or retrieve posts.
const cookieParser = require('cookie-parser'); // Parses cookies in request headers. Without it, cookies (including the auth token) can't be accessed or managed.
const bcrypt = require('bcrypt'); // Used for hashing passwords. Without hashing, passwords are stored as plain text, compromising security.
const jwt = require('jsonwebtoken'); // Manages JSON Web Tokens for authentication. Without JWT, there would be no secure login or session management.
const path = require('path') // Can handle file paths, especially for serving static files, though not crucial here.
const crypto = require('crypto') // Used for generating random filenames for uploaded images. Not essential, but adds a layer of security.
const { log } = require('console');
const upload  = require('./config/multer');

app.set('view engine', 'ejs'); // Enables EJS templates for dynamic HTML. Without setting a view engine, you can't render templates.
app.use(express.json()); // Parses JSON in requests. Necessary for reading JSON data from client. Without it, JSON data won't be accessible in requests.
app.use(express.urlencoded({ extended: true })); // Parses form data. Without it, form data (like login details) won't be readable.
app.use(cookieParser()); // Allows reading cookies from requests. Without it, the JWT token can't be read from cookies for authentication.
app.use(express.static(path.join(__dirname, 'public'))); // Serves static files from the 'public' directory. Without it, CSS and JS files won't load.





app.get('/', (req, res) => {
    res.render("index"); // Renders the home page. Without this route, accessing the root URL results in a "not found" error.
});

app.get("/profile/upload",function(req,res){
    res.render("profileupload")
})

app.post("/upload", isLoggedin, upload.single("image"), async function (req, res) {
    log(req.file);
    // try {
    //     let user = await userModel.findOne({ email: req.user.email });
    //     user.profilePic = req.file.filename;
    //     await user.save();
    //     res.redirect("/profile");
    // } catch (error) {
    //     console.error('Error during file upload:', error);
    //     res.status(500).send('Error uploading file');
    // }
});


app.get('/login', (req, res) => {
    res.render("login"); // Renders the login page. Without it, users can't log in to the app.

});


app.post('/post', isLoggedin, async (req, res) => {
    // Allows users to create posts if logged in. If 'isLoggedin' is missing, unauthorized users could create posts.
    let user = await userModel.findOne({ email: req.user.email }); // Finds logged-in user. Without it, you can't associate the post with a user.
    let { content } = req.body; // Extracts post content. If missing, the app can't retrieve the content of the post.
    let post = await postModel.create({ user: user._id, content: content }); // Creates a post entry. If missing, the post won't be saved to the database.
    user.posts.push(post._id); // Links post to user. Without it, the post won't be tied to the user's profile.
    await user.save(); // Saves user with updated posts. Without it, the relationship between user and post is lost.
    res.redirect('/profile'); // Redirects to profile. Without it, user won't be able to view the post immediately.
});

app.get('/profile', isLoggedin, async (req, res) => {
    // Displays user's profile if logged in. Without 'isLoggedin', any user could view others' profiles.
    let user = await userModel.findOne({ email: req.user.email }).populate('posts'); // Fetches user and posts. Without `populate`, posts won't be displayed.
    res.render("profile", { user: user }); // Renders profile page. If not rendered, users can't see their profile information or posts.
});

app.get('/like/:id', isLoggedin, async (req, res) => {
    // Allows logged-in users to like/unlike posts. Without 'isLoggedin', any user could like/unlike posts.
    let post = await postModel.findOne({ _id: req.params.id }).populate('user'); // Finds the post by ID. Without this, you can't access the specific post to like.
    if (post.likes.indexOf(req.user.userid) === -1) {
        post.likes.push(req.user.userid); // Adds user's ID if not already liked. If missing, the user can't like the post.
    } else {
        post.likes.splice(post.likes.indexOf(req.user.userid), 1); // Removes like if already liked. Without this, the user can't unlike posts.
    }
    await post.save(); // Saves the updated likes. Without this, changes to likes won’t be stored in the database.
    res.redirect("/profile"); // Redirects to profile after liking. Without it, user might stay on the current page without feedback.
});

app.get('/edit/:id', isLoggedin, async (req, res) => {
    // Renders the edit page for a specific post. Without 'isLoggedin', unauthorized users could edit posts.
    let post = await postModel.findOne({ _id: req.params.id }).populate('user'); // Finds the post by ID. Without it, the post data for editing won't load.
    res.render("edit", { post: post }); // Renders the edit view. Without this, users won't have a form to edit their post.
});

app.post('/update/:id', isLoggedin, async (req, res) => {
    // Updates the post with new content. Without 'isLoggedin', unauthorized users could update posts.
    await postModel.findOneAndUpdate({ _id: req.params.id }, { content: req.body.content }); // Updates post content. Without it, no changes are saved.
    res.redirect("/profile"); // Redirects to profile. Without it, user may be left on an outdated page.
});

app.post('/register', async (req, res) => {
    // Registers a new user. Without this, users cannot create new accounts.
    let { username, password, name, age, email } = req.body; // Retrieves registration info. Without this, the data can't be saved.
    let user = await userModel.findOne({ email: email }); // Checks if the user already exists. Without this, duplicate accounts may be created.
    if (user) {
        return res.status(500).send('User already exists'); // Sends error if user exists. Without this, duplicate users might cause conflicts.
    }

    bcrypt.genSalt(10, (err, salt) => { // Generates salt for password hashing. Without it, password security is compromised.
        if (err) {
            return res.status(500).send('Error generating salt'); // Error handling for salt generation. Without it, unexpected errors might crash the app.
        }
        bcrypt.hash(password, salt, async (err, hash) => { // Hashes the password with the salt. Without this, passwords would be stored in plaintext.
            if (err) {
                return res.status(500).send('Error hashing password'); // Error handling for hashing. Without it, users could face login issues.
            }
            try {
                let newUser = await userModel.create({
                    username,
                    name,
                    age,
                    email,
                    password: hash // Storing hashed password in the database. Without hashing, passwords are insecure.
                });
                let token = jwt.sign({ email: email, userid: newUser._id }, 'secretkey'); // Generates JWT token for authentication.
                res.cookie('token', token); // Sets JWT in cookies for authentication. Without it, users won’t be recognized across sessions.
                res.status(200).send('User registered successfully'); // Sends success message. Without it, users get no confirmation of registration.
            } catch (error) {
                res.status(500).send('Error creating user'); // Error handling for user creation.
            }
        });
    });
});

app.post('/login', async (req, res) => {
    // Handles user login. Without it, users cannot log in.
    let { password, email } = req.body; // Retrieves login credentials. Without them, login can’t be validated.
    let user = await userModel.findOne({ email: email }); // Finds user by email. Without it, the app can’t verify the user’s identity.
    if (!user) {
        return res.status(500).send('Email/Password incorrect'); // Error if user not found. Without it, login failures go unchecked.
    }

    bcrypt.compare(password, user.password, (err, result) => { // Compares input password with stored hash.
        if (result) {
            let token = jwt.sign({ email: email, userid: user._id }, 'secretkey'); // Issues JWT on successful login.
            res.cookie('token', token); // Sets token in cookies for session management.
            res.status(200).redirect('/profile'); // Redirects to profile page.
        } else {
            res.status(500).redirect("/login"); // Redirects back to login on failure.
        }
    });
});

app.get('/logout', function (req, res) {
    // Clears JWT token for logout. Without it, the user stays logged in.
    res.cookie('token', ''); // Clears token cookie.
    res.redirect('/login'); // Redirects to login page after logout.
});

// Middleware for authenticated access only.
function isLoggedin(req, res, next) {
    let token = req.cookies.token; // Retrieves token from cookies.
    if (!token) {
        return res.status(401).send('Please login first'); // Error if no token is present.
    } else {
        let data = jwt.verify(token, 'secretkey'); // Verifies token.
        req.user = data; // Adds user info to request.
    }
    next(); // Proceeds if authenticated.
}

app.listen(3000 ,function(){
    console.log('server is running on port 3000');
}); // Starts the server. Without this, the app won't listen for incoming requests.
