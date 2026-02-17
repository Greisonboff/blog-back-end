const express = require('express');
const router = express.Router();

router.use('/', require('./getAllPosts'));
router.use('/', require('./getMyPosts'));
router.use('/', require('./createPost'));
router.use('/', require('./likePost'));
router.use('/', require('./comment/commentPost'));
router.use('/', require('./comment/commentPostEdit'));
router.use('/', require('./comment/commentPostDelete'));
router.use('/', require('./updatePost'));
router.use('/', require('./deletePost'));

module.exports = router;
