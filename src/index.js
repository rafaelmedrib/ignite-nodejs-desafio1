const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const res = require('express/lib/response');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(404).json({
      error: "user not found"
    });
  }

  request.user = user;
  next();
}

function checkTodoExists(request, response, next) {
  const { todos } = request.user;
  const todoId = request.params.id;
  const todoExists = todos.some(todo => todo.id === todoId);
  if(!todoExists) {
    return response.status(404).json({error: "todo not found"});
  }

  request.id = todoId;
  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const usernameAlreadyExists = users.some(user => user.username === username);
  if(usernameAlreadyExists) {
    return response.status(400).json({error: "Username already exists"});
  }
  
  const newUser = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  
  const { todos } = request.user;

  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { todos } = request.user;
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, checkTodoExists, (request, response) => {
  const { todos } = request.user;
  const { title, deadline } = request.body;
  const todoToBeUpdated = todos.find(todo => todo.id === request.id);
  todoToBeUpdated.title = title
  todoToBeUpdated.deadline = deadline
  
  return response.json(todoToBeUpdated);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkTodoExists, (request, response) => {
  const { todos } = request.user;
  const checkedTodo = todos.find(todo => todo.id === request.id);
  checkedTodo.done = true;

  return response.json(checkedTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkTodoExists, (request, response) => {
  const { todos } = request.user;
  const todoToBeDeleted = todos.find(todo => todo.id === request.id);
  todos.splice(todos.indexOf(todoToBeDeleted), 1);

  return response.status(204).send();
});

module.exports = app;