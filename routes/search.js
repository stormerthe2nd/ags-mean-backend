var express = require('express');
var router = express.Router();
const postModel = require('../model/postModel');


router.get('/:searchBy/:query', async function (req, res) {
  var searchResults = []
  var query = req.params.query.toLowerCase().trim()
  var searchBy = req.params.searchBy
  var index = +req.query.index
  postModel.find().exec((err, data) => {
    if (searchBy === "Description") {
      data.forEach((post, ind) => {
        if (post.des.toLowerCase().includes(query)) {
          searchResults.push(post)
        }
      })
    } else if (searchBy === "Title") {
      data.forEach(post => {
        post.title.toLowerCase().includes(query) ? searchResults.push(post) : {}
      })
    } else if (searchBy === "Category") {
      data.forEach(post => {
        post.category.toLowerCase().includes(query) ? searchResults.push(post) : {}
      })
    } else if (searchBy === "Date") {
      data.forEach(post => {
        post.updated.toLowerCase().includes(query) ? searchResults.push(post) : {}
      })
    }
    searchResults = searchResults.slice(index, index + 12)
    return res.json({ searchResults: searchResults, index: index, finished: searchResults.length === 0 ? 2 : 0 });
  })
});

module.exports = router;
