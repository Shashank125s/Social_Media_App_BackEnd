const express = require('express'); 
const app = express(); 
const userModel = require('./models/user'); 
const postModel = require('./models/post'); 
const cookieParser = require('cookie-parser'); 
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const path = require('path') 
const crypto = require('crypto') 
const { log } = require('console');
const upload  = require('./config/multer');

app.set('view engine', 'ejs'); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); 
app.use(express.static(path.join(__dirname, 'public'))); 

app.get('/', (req, res) => {
    res.render("index");
});

app.get("/profile/upload",function(req,res){
    res.render("profileupload")
})

app.post("/upload", isLoggedin, upload.single("image"), async function (req, res) {
    log(req.file);
});

app.get('/login', (req, res) => {
    res.render("login");
});

app.post('/post', isLoggedin, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    let { content } = req.body;
    let post = await postModel.create({ user: user._id, content: content });
    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile');
});

app.get('/profile', isLoggedin, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email }).populate('posts');
    res.render("profile", { user: user });
});

app.get('/like/:id', isLoggedin, async (req, res) => {
    let post = await postModel.findOne({ _id: req.params.id }).populate('user');
    if (post.likes.indexOf(req.user.userid) === -1) {
        post.likes.push(req.user.userid);
    } else {
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }
    await post.save();
    res.redirect("/profile");
});

app.get('/edit/:id', isLoggedin, async (req, res) => {
    let post = await postModel.findOne({ _id: req.params.id }).populate('user');
    res.render("edit", { post: post });
});

app.post('/update/:id', isLoggedin, async (req, res) => {
    await postModel.findOneAndUpdate({ _id: req.params.id }, { content: req.body.content });
    res.redirect("/profile");
});

app.post('/register', async (req, res) => {
    let { username, password, name, age, email } = req.body;
    let user = await userModel.findOne({ email: email });
    if (user) {
        return res.status(500).send('User already exists');
    }

    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return res.status(500).send('Error generating salt');
        }
        bcrypt.hash(password, salt, async (err, hash) => {
            if (err) {
                return res.status(500).send('Error hashing password');
            }
            try {
                let newUser = await userModel.create({
                    username,
                    name,
                    age,
                    email,
                    password: hash
                });
                let token = jwt.sign({ email: email, userid: newUser._id }, 'secretkey');
                res.cookie('token', token);
                res.status(200).send('User registered successfully');
            } catch (error) {
                res.status(500).send('Error creating user');
            }
        });
    });
});

app.post('/login', async (req, res) => {
    let { password, email } = req.body;
    let user = await userModel.findOne({ email: email });
    if (!user) {
        return res.status(500).send('Email/Password incorrect');
    }

    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            let token = jwt.sign({ email: email, userid: user._id }, 'secretkey');
            res.cookie('token', token);
            res.status(200).redirect('/profile');
        } else {
            res.status(500).redirect("/login");
        }
    });
});

app.get('/logout', function (req, res) {
    res.cookie('token', '');
    res.redirect('/login');
});

function isLoggedin(req, res, next) {
    let token = req.cookies.token;
    if (!token) {
        return res.status(401).send('Please login first');
    } else {
        let data = jwt.verify(token, 'secretkey');
        req.user = data;
    }
    next();
}

app.listen(3000 ,function(){
    console.log('server is running on port 3000');
});
