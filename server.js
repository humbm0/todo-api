var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Todo API Root')
});



app.get('/todos', function(req, res) {
  var query = req.query;
  var where = {};

  if(query.hasOwnProperty('completed') && query.completed === 'true'){
    where.completed = true;
  }else if (query.hasOwnProperty('completed') && query.completed === 'false') {
    where.completed = false;
  }

  if(query.hasOwnProperty('q') && query.q.length > 0){
    where.description = {
      $like: '%' + query.q + '%'
    };
  }

  db.todo.findAll({where: where}).then(function(todos) {
    res.json(todos);
  }, function(e) {
    res.status(500).send();
  });
});



app.get('/todos/:id', function(req, res) {
  // res.send('id given was ' + req.params.id);
  var todoId = parseInt(req.params.id, 10);

  db.todo.findById(todoId).then(function(todo){
    if(!!todo){
      res.json(todo.toJSON());
    }else{
      res.status(404).send();
    }
  }, function(e){
    res.status(500).send();
  });
});



app.post('/todos', function(req, res){
  //filters data to be stored
  var body = _.pick(req.body, 'description', 'completed');

  db.todo.create(body).then(function(todo){
    res.json(todo.toJSON());
  }, function(e){
    res.status(400).json(e);
  });
});



app.delete('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id, 10);

  db.todo.destroy({
    where: {
      id: todoId
    }
  }).then(function(rowsDeleted) {
    if(rowsDeleted === 0){
      res.status(404).json({
        error: 'No todo with id'
      });
    }else{

      res.status(200).json({
        success: 'todo with id: ' + todoId + ' deleted'
      });
    }
  }, function(e){
    res.status(500).send();
  });
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

db.sequelize.sync().then(function(){
  app.listen(PORT, function(){
    console.log('Express listening on PORT ' + PORT);
  });
});
