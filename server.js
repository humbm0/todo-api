var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Todo API Root')
});

app.get('/todos', function(req, res) {
  res.json(todos);
});
app.get('/todos/:id', function(req, res) {
  // res.send('id given was ' + req.params.id);
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo;

  for (i = 0; i < todos.length; i++) {
    if(todos[i].id === todoId){
      matchedTodo = todos[i];
      console.log('match found');
    }
  };

  if (matchedTodo) {
    res.json(matchedTodo);
    console.log('match found and passed on');
  } else {
    res.status(404).send();
  }

});

app.post('/todos', function(req, res){
  var body = req.body;

  //adds id to todo
  body.id = todoNextId++;

  //pushes to todos array
  todos.push(body);

  res.json(body);
});

app.listen(PORT, function(){
  console.log('Express listening on PORT ' + PORT);
});
