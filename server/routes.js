// Routes.js - Módulo de rutas
const express = require('express');
const router = express.Router();
const push = require('./push');


const messages = [
  {
    _id: 'xxxx',
    user: 'spiderman',
    message: 'hola mundo'
  },

];




// Get mensajes
router.get('/', function (req, res) {
  // res.json('Obteniendo mensajes');
  res.json(messages);
});

//Post mensaje
router.post('/', function (req, res) {
  const message = {
    message: req.body.message,
    user: req.body.user
  };
  messages.push(message);

  console.log(messages);
  console.log(messages);

  res.json({
    ok: true,
    message
  });
});

//Almacenar la suscripcion
router.post('/subscribe', (req, res) => {
  const suscripcion = req.body;
  push.addSubscription(suscripcion);
  res.json('subscribe');
});

//Almacenar la suscripcion
router.get('/key', (req, res) => {
  const key = push.getKey();
  res.send( key );
});

//Enviar una notificacion push a las personas que queramos
router.post('/push', (req, res) => {
  const post = {
    title: req.body.title,
    body: req.body.body,
    user: req.body.user
  };
  push.sendPush(post);

  res.json(post);
});



module.exports = router;
