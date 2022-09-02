const router = require('express').Router();

const { insertCertification } = require('../controllers/certification_controller');

router.route('/admin/certification').post(insertCertification);

module.exports = router;
