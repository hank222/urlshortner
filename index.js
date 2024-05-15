require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Urlp = require('url-parse');
const app = express();
const mongoose=require('mongoose')
const bodyParser = require("body-parser");
const shortId = require('shortid');
const dns=require('dns');
const { Console } = require('console');
const { hostname } = require('os');
// Basic Configuration
const port = process.env.PORT || 3000;
const TIMEOUT = 10000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

const urlSchema = new mongoose.Schema({
  URL: {
    type: String,
    required: true
  },
  short: {
    type: String,
    required: true
  }
});

let Url=mongoose.model('Url', urlSchema);
let shortInt=0;
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


app.get("/is-mongoose-ok", function (req, res) {
  if (mongoose) {
    res.json({ isMongooseOk: !!mongoose.connection.readyState });
  } else {
    res.json({ isMongooseOk: false });
  }
});



app.post('/api/shorturl',(req,res,next)=>{
  const myRegex= /https:\/\/(www.)?|http:\/\/(www.)?/g;

  const bodyURL=req.body.url;
  const short_url=parseInt(Math.random() * 999999);
  if(!validateUrl(bodyURL))
    res.json({ error: 'invalid url' });  
  else
  {  
  dns.lookup(req.body.url.replace(myRegex,""), (err, address, family) => {
    
    if(err){
      res.json({ error: 'invalid url' });  
    }
    else
    {
      Url.find().exec().then(data=>
        {
          new Url({
            URL:bodyURL,
            short:short_url
          })
          .save()
          .then((data)=>{
            res.json({
              original_url: data.URL,
            short_url: data.short
            })
          })
          .catch(err => {
            res.json(err)
          })
        }
      )
    }
  
  }); 
  }
});


app.get('/api/shorturl/:shortId', function(req, res){
  console.log(req.params.shortId)
  Url.find({short:req.params.shortId}).then((data)=>{
          if(data.length===0){
            res.json({error:"Dosnt exists id"})
          }
          else{
            res.redirect(data[0].URL)
          }    
  }).catch()

})





const validateUrl=(value)=> {
  const myRegex= /https:\/\/|http:\/\//g;
  return myRegex.test(
    value
  );
}