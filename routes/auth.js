const router = require("express").Router()
const userModel = require("../model/userModel")
const postModel = require("../model/postModel")

router.get("/", async function (req, res) {
  var email = req.query.email + "@gmail.com"
  var user = await userModel.findOne({ email: email })
  if (user) {
    console.log("user exists")
    return res.json({ user: { email: user.email, role: user.role, savedPosts: user.savedPosts } })
  }
  user = await new userModel({
    email: email,
    role: email !== req.dev ? "client" : "dev",
    createdPosts: [],
    savedPosts: []
  })
  user.save()
  res.json({ user: { email: user.email, role: user.role, savedPosts: user.savedPosts } })
})

router.get("/users/all", async function (req, res) {
  var users = await userModel.find({})
  res.json({ users: users })
})

router.get("/update", async function (req, res) {
  const { email, role } = req.query
  await userModel.findOneAndUpdate({ email: email }, { role: role })
  res.json({ email: email, role: role })
})

router.post("/savePost", async function (req, res) {
  const { id, email } = req.body
  console.log(id, email)
  await userModel.findOneAndUpdate({ email: email }, { $push: { savedPosts: id } })
  res.json({ msg: "saved" })
})

router.post("/unSavePost", async function (req, res) {
  const { id, email } = req.body
  console.log(id, email)
  await userModel.findOneAndUpdate({ email: email }, { $pull: { savedPosts: id } })
  res.json({ msg: "unsaved" })
})

router.get("/getSavedPosts", async function (req, res) {
  const { email, amt } = req.query
  var amt2 = +amt
  var user = await userModel.findOne({ email: email })
  var postsArr = await postModel.find({ "_id": { $in: user.savedPosts.slice(amt2, amt2 + 12) } })
  res.json({ postsArr: postsArr, amt: amt2 + 12, length: user.savedPosts.length })
})

module.exports = router