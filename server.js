var express = require('express');
var app = express();
var path = require('path');
var mongo = require("mongodb").MongoClient;
var dburl = 'mongodb://imgabstraction:freecodecamp@ds021689.mlab.com:21689/imgabstraction';
var GoogleSearch = require('google-search');
var googleSearch = new GoogleSearch({
  key: 'AIzaSyAuWRw6WGr8HB75Kzt8HYtwOSfVOqYuvZs',
  cx: '009114193757195798197:tlgcoymbxlw'
});


app.get('/api/imagesearch/:query(*)',function(req,res){

  var query = req.params.query;
  var qoffset =req.query.offset ? req.query.offset : 1;
  var date =new Date().toISOString();
  console.log(query);
  
  if (query != "favicon.ico"){      
    googleSearch.build({
          q: query,
          start: 2,
          num: qoffset, // Number of search results to return between 1 and 10, inclusive 
          searchType: 'image',
           siteSearch: "www.google.com" // Restricts results to URLs from a specified site 
      }, function(error, response) {
          
      
        res.send(response.items.map(function(items){
                return {
                    url: items.link,
                    snippet: items.snippet,
                    thumbnail: items.image.thumbnailLink,
                    context: items.image.contextLink
          
                }
            }))
    });
    
       mongo.connect(dburl, function (err, db) {
            if (err) {
                  res.end('Unable to connect to the mongoDB server. Error:');
                  return console.log(err);
          
            } else {
                  console.log('Connection established to', dburl);
                  var imgsearchList = db.collection('imgabstraction');
                  imgsearchList.insert([{term: query, when: date}],function(error, results){
            
                 });
              
                db.close();
            }
          });
  
   }else{
        res.send("Format queries correctly");
   }
 
}); 
  
    
app.get('/api/latest', function(req,res){
 
   mongo.connect(dburl, function (err, db) {
      if (err) throw err;
          db.collection("imgabstraction").find({}).sort({_id: -1}).limit(10).toArray(function(err, result) {
            if (err) throw err;
            res.send(result);
            db.close();
          });
    });  
 }); 
  
app.get('/', function(req,res){
   var fileName = path.join(__dirname, '/views/index.html');
    res.sendFile(fileName, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', fileName);
    }
  });

}); 


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
