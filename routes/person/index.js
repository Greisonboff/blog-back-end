const express = require('express');
const router = express.Router();

router.use('/', require('./isAuth'));
router.use('/', require('./create'));
router.use('/', require('./getAll'));
router.use('/', require('./getById'));
router.use('/', require('./update'));
router.use('/', require('./delete'));
router.use('/', require('./login'));
router.use('/', require('./logout'));

module.exports = router;
