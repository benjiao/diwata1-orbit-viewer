var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Diwata 1 Orbit Viewer' });
});

/* GET orbital decay reports generator */
router.get('/decay', function(req, res, next) {
    res.render('decay', { title: 'Diwata 1 - Orbital Decay Reports'})
});

module.exports = router;
