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
    return response.status(400).json({
      error: "Usuário não encontrado"
    });
  }

  request.user = user;
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const usernameAlreadyExists = users.some(user => user.username === username);
  if(usernameAlreadyExists) {
    return response.status(400).json({message: "Username already exists"});
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

  response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;