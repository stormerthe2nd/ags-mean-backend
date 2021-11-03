var express = require('express');
const postModel = require('../model/postModel');
var router = express.Router();

router.get('/', async function (req, res) {
  try {
    var postsArr = await postModel.find({ category: req.query.cat }, null, { limit: 10 })
    return res.json({ data: postsArr });
  } catch (error) {
    console.log(error)
    return res.json({ data: [], error: error })
  }
});

module.exports = router;
