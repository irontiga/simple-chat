var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var cors = require('cors');
app.use(cors())
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var Mockgoose = require('mockgoose').Mockgoose;
var mockgoose = new Mockgoose(mongoose)

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

var Message = mongoose.model('Message',{
  name : String,
  message : String
})


// var dbUrl = 'mongodb://karma:@ds257981.mlab.com:57981/simple-chat'
var dbUrl = 'mongodb://karma:karma@karma-chat-4hbhj.gcp.mongodb.net:80/chat'

app.get('/messages', (req, res) => {
  Message.find({}).limit(40).exec((err, messages)=> {
    res.send(messages);
  })
})


app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({name: user},(err, messages)=> {
    res.send(messages);
  })
})


app.post('/messages', async (req, res) => {
  try{
    var message = new Message(req.body);

    var savedMessage = await message.save()
      console.log('saved');

    var censored = await Message.findOne({message:'badword'});
      if(censored)
        await Message.remove({_id: censored.id})
      else
        io.emit('message', req.body);
      res.sendStatus(200);
  }
  catch (error){
    res.sendStatus(500);
    return console.log('error',error);
  }
  finally{
    console.log('Message Posted')
  }

})



io.on('connection', () =>{
  console.log('a user is connected')
})

mockgoose.prepareStorage().then(function () {
    mongoose.connect(dbUrl, { useMongoClient: true }, (err) => {
        console.log('mongodb connected', err);
    })
});



var server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port);
});
