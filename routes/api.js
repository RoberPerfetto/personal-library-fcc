/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err,db) => {
        if(err) res.send(err);
        db.collection('library').find({}).toArray((err,doc) => {
          if(err) res.send(err);  
          let resArr = [];
          doc.forEach(element => {
            let tmpObj = {"_id": element._id, "title":element.title, "commentcount": element.comments.length};
            resArr.push(tmpObj);
          });
          res.json(resArr);          
          db.close();
        })
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      
      //response will contain new book object including atleast _id and title
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err,db) => {
        if(err) res.send(err);
        db.collection('library').insertOne({title: title, comments: []}, (err,doc) => {
          if(err) res.send(err); 
          let resObj = {title: doc.ops[0].title, _id: doc.ops[0]._id};       
          res.json(resObj);
          db.close();
        });
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err,db) => {
        if(err) res.send(err);
        db.collection('library').remove((err,doc) => {
          if(err) res.send(err);          
          res.send('<p>complete delete successful</p>');
          db.close();
        });
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if(err) res.send(err);
        db.collection('library').findOne({_id: ObjectId(bookid)}, (err,doc) => {
          if(err) res.send(err);
          if(doc) {
            res.json(doc);
          } else {
            res.send('no book exists');
          }          
        });
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if(err) res.send(err);
        db.collection('library').findAndModify( 
          {_id: ObjectId(bookid)},
          {rating: 1},
          {$push: {comments: comment}}, 
          function (err,doc) {
            if(err) {
              res.send('could not update ');
              db.close();
            } else {
              res.json(doc.value);
              db.close();
            }            
          }
        );
      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err,db) => {
        if(err) res.send(err);
        db.collection('library').remove({_id: ObjectId(bookid)},(err,doc) => {
          if(err) res.send(err);          
          res.send('delete successful');
          db.close();
        });
      })
    });
  
};
