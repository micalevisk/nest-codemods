var express = require('express')
  , app = express()


app.all('/orgs/(*)')

app.get('/user/:id', function(req, res){
  res.send('viewing ' + req.user.name);
});

app.get('/user/:id/edit', function(req, res){
  res.send('editing ' + req.user.name);
});

app.put('/user/:id', function(req, res){
  res.send('updating ' + req.user.name);
});

app.get('*', function(req, res){
  res.send('what???', 404);
});

app.listen(3000);
