var express = require('express');
const postModel = require('../model/postModel');
var router = express.Router();

router.get('/:id', async function (req, res) {
  var post = await postModel.findById(req.params.id)
  res.json({ post: post });
});

module.exports = router;
