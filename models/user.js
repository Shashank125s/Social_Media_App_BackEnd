//first require mongoose
//then create a connection
//then create a schema
//then create a model and export the model
//then require the model in app.js

const mongoose  = require('mongoose');


mongoose.connect('mongodb://localhost:27017/project-1')

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    age: Number,
    email: String,
    password: String,
    profilePic: {
        type: String,
        default :"default.jpg"
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'post'
    }]

})

module.exports = mongoose.model('user', userSchema)
 