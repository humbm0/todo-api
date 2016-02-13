var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

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
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if (matchedTodo) {
    res.json(matchedTodo);
    console.log('match found and passed on');
  } else {
    res.status(404).send();
  }
});



app.post('/todos', function(req, res){
  //filters data to be stored
  var body = _.pick(req.body, 'description', 'completed');

  if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
    return res.status(400).send();
  }

  //sets desciption to trimmed value
  body.description = body.description.trim();

  //adds id to todo
  body.id = todoNextId++;

  //pushes to todos array
  todos.push(body);

  res.json(body);
});



app.delete('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if(!matchedTodo){
    res.status(404).json({"error": "No todo found with that id"});
  }else {
    todos = _.without(todos, matchedTodo);
    res.json(matchedTodo);
  }
});


app.put('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  var body = _.pick(req.body, 'description', 'completed');
  var validAttributes = {};

  if(!matchedTodo){
    return res.status(404).send();
  }

  if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
    validAttributes.completed = body.completed;
  }else if(body.hasOwnProperty('completed')){
    return res.status(400).send();
  }

  if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
    validAttributes.desciption = body.desciption;
  }else if(body.hasOwnProperty('desciption')){
    return res.status(400).send();
  }

  _.extend(matchedTodo, validAttributes);
  res.json(matchedTodo);
});



app.listen(PORT, function(){
  console.log('Express listening on PORT ' + PORT);
});
