const router = require('express').Router();

const { insertPerson } = require('../controllers/person_controller');

router.route('/admin/person').post(insertPerson);

module.exports = router;
