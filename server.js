'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const { stock, customers } = require('./data/promo');
let valid = true;
let info;
const validateCustomer = (form, res) => {
  customers.forEach(customer => {
    if ((customer.givenName+customer.surname).toLowerCase() === (form.givenName+form.surname).toLowerCase()) {
      res.json({ status: "error", error: 'repeat-customer'});
      valid = false;
    } else if (customer.email.toLowerCase() === form.email.toLowerCase()) {
      res.json({ status: "error", error: 'repeat-customer'});
      valid = false;
    } else if (customer.address.toLowerCase() === form.address.toLowerCase()) {
      res.json({ status: "error", error: 'repeat-customer'})
      valid = false;
    }
  });
}
const validateLocation = (form, res) => {
    if (form.country.toLowerCase() !== 'canada') {
      res.json({ status: "error", error: 'undeliverable'});
      valid=false;
    }
}
const validateStock = (form, res) => {
  if (stock[form.order] === '0' || stock[form.order][form.size] === '0') {
    res.json({ status: "error", error: 'unavailable'});
    valid=false;
  }
}

const validateData = (form, res) => {
  if (form.order === 'undefined' || (form.order === 'shirt' && form.size === 'undefined')) {
    res.json({ status: "error", error: 'missing-data'});
    valid=false;
  }
}

express()
  .use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  })
  .use(morgan('tiny'))
  .use(express.static('public'))
  .use(bodyParser.json())
  .use(express.urlencoded({ extended: false }))
  .set('view engine', 'ejs')

  // endpoints
  .post('/order', (req, res) => {
    validateCustomer(req.body, res);
    if (valid) validateLocation(req.body, res);
    if (valid) validateData(req.body, res);
    if (valid) validateStock(req.body, res);
    if (valid) res.send({ status: 'success' });
    valid = true;
    info = req.body;
  })

  .get('/order-confirmed', (req, res) => {
    res.render('pages/order-confirmed', { info });
  })


  .get('*', (req, res) => res.send('Dang. 404.'))
  .listen(8000, () => console.log(`Listening on port 8000`));
