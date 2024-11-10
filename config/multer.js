


const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const uploadPath = path.join(__dirname, '..', 'uploads');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploadPath')
    },
    filename: function (req, file, cb) {
     crypto.randomBytes(15 , function(err,name){
       const fn = name.toString('hex') + path.extname(file.originalname);
       cb(null, fn)
     })
    }
  })
  
  const upload = multer({ storage: storage })

module.exports = upload
