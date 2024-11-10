//first require mongoose
//then create a connection
//then create a schema
//then create a model and export the model
//then require the model in app.js

const mongoose  = require('mongoose');



const postSchema = mongoose.Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    date:{
        type:Date,
        default:Date.now
    },
    content:String,
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user'
    }]
    
   

})

module.exports = mongoose.model('post', postSchema)
