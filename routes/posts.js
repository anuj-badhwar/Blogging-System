var express = require('express');
var router = express.Router();

var multer = require('multer');
var upload = multer({ dest: './public/images/' })

var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

// A D D  P O S T
router.get('/add', function(req, res, next) {
    var categories = db.get('categories');

    categories.find({},{},function(err,categories){
      res.render('addpost',{
        'title':'Add Post',
        'categories':categories
      })
    })
});

router.get('/show/:id',function(req,res){
  var id = req.params.id;
  var posts = db.get('posts');

  posts.findById(id,function(err,post){
    res.render('show',{
      'post':post
    });
  })
});

router.post('/add',upload.single('mainimage'), function(req, res, next) {
  //Get form values
  var title = req.body.title;
  var category = req.body.category;
  var body = req.body.body;
  var author = req.body.author;
  var date = new Date();

  if(req.file){
    var mainimage = req.file.filename;
  }
  else{
    var mainimage = 'noimage.jpg';
  }

  //Form Validation
  req.checkBody('title','Title Field is Required!').notEmpty();
  req.checkBody('body','Body field is required!').notEmpty();

  //Check errors
  var errors = req.validationErrors();

  if(errors){
    res.render('addpost',{
      "errors":errors
    });
  }
  else{
    var posts = db.get('posts');
    posts.insert({
      "title":title,
      "body":body,
      "category":category,
      "date":date,
      "author":author,
      "mainimage":mainimage
    },function(err,post){

      if(err){
        res.send(err);
      }
      else{
        req.flash('success','Post Added!');
        res.location('/');
        res.redirect('/');
      }
    });
  }

});

router.post('/addcomment', function(req, res, next) {
  //Get form values
  var name = req.body.name;
  var email = req.body.email;
  var postid = req.body.postid;
  var body = req.body.body;
  var commentdate = new Date();

  //Form Validation
  req.checkBody('name','Title Field is Required!').notEmpty();
  req.checkBody('email','Email field is required but never Displayed').notEmpty();
    req.checkBody('email','Please enter a valid Email').isEmail();
  req.checkBody('body','Body field is required!').notEmpty();
  //Check errors
  var errors = req.validationErrors();

  if(errors){
    var posts = db.get('posts');
      posts.findById(postid,function(err,post){
              res.render('show',{
                "error":errors,
                "post":post
              })
      });
  }

  else{
    var comment = {
      "name":name,
      "email":email,
      "body":body,
      "commentdate":commentdate
    }

    var posts = db.get('posts');

    posts.update({
      "_id":postid
    },{
      $push:{
        "comments":comment
      }
    },function(err,doc){
      if(err){
        throw err;
      }
      else{
        req.flash("success","Comment Added");
        res.location('/posts/show/'+postid);
        res.redirect('/posts/show/'+postid);
      }
    });
  }

});


module.exports = router;
