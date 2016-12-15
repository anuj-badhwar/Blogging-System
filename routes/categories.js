var express = require('express');
var router = express.Router();

var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

// A D D  C A T E G O R I E S
router.get('/add', function(req, res, next) {
  res.render('addcategory',{
      'Title': 'Add Category'
  });
});

router.post('/add', function(req, res, next) {
  //Get form values
  var name = req.body.name;

  if(req.file){
    var mainimage = req.file.filename;
  }
  else{
    var mainimage = 'noimage.jpg';
  }

  //Form Validation
  req.checkBody('name','Name Field is Required!').notEmpty();

  //Check errors
  var errors = req.validationErrors();

  if(errors){
    res.render('addcategory',{
      "errors":errors
    });
  }
  else{
    var posts = db.get('categories');
    posts.insert({
      "name":name
    },function(err,post){

      if(err){
        res.send(err);
      }
      else{
        req.flash('success','Category Added!');
        res.location('/');
        res.redirect('/');
      }
    });
  }

});

module.exports = router;
