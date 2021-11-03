// TODO fix running 2 uploads simultaneaously merging the list of images

const router = require("express").Router()
const fs = require("fs")
const multer = require("multer")
const path = require("path")
const fsExtra = require("fs-extra")
const PostModel = require("../model/postModel")
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      if (!fs.existsSync(path.join(__dirname, "/../temp_uploads/"))) {
        fs.mkdirSync(path.join(__dirname, "/../temp_uploads/"));
      }
      callback(null, path.join(__dirname, "/../temp_uploads/"))
    },
    filename: (req, file, callback) => {
      req.files.push(file[0])
      callback(null, file.originalname)
    }
  })
})


const uploadImage = async function (req, res) {
  imgUrl = []
  var i = 0;
  for (var el of req.files) {
    // && ["jpg", "jpeg", "gif", "png", "webp"].includes(el.mimeType)
    if (!el) continue
    try {
      i++
      console.log("preparing upload file " + i)
      console.log(el)
      var response = await req.drive.files.create({
        requestBody: {
          name: el.originalname,
          mimeType: el.mimetype,
          parents: ["1TbzAhzKs_beyGlCGh-NSP4v7CBigeDq8"] // folder id in drive
        },
        media: {
          mimeType: el.mimetype,
          body: fs.createReadStream(el.path)
        }
      })
      console.log("Fetching File Id")
      fileId = response.data.id   // file access
      console.log("creating permissions")
      await req.drive.permissions.create({
        fileId: fileId,
        requestBody: { role: "writer", type: "anyone" }
      })
      imgUrl.push(`https://drive.google.com/thumbnail?id=${fileId}`)
    } catch (err) {
      console.log("error in catch block")
      console.log(err)
      continue
    }
  }
  fsExtra.emptyDir(path.join(__dirname, "/../temp_uploads/"))
  return imgUrl
}


const deleteImage = async function (req, res, imgPath) {
  if (typeof imgPath != "string") {
    for (var element of imgPath) {
      if (element == "") continue
      try {
        await req.drive.files.delete({ fileId: element.split("=")[1] })
      } catch (error) {
        return console.log(error)
      }
    }
  } else {
    try {
      await req.drive.files.delete({
        fileId: imgPath.split("=")[1],
      })
    } catch (error) {
      return console.log(error)
    }
  }
}


router.post("/upload", upload.array("fileInp", 12), async function (req, res) {
  if (!req.query.email) {
    return res.json({ msg: "unathorized" })
  }
  req.files = req.files.filter(el => { return el !== undefined })
  let imgUrl = await uploadImage(req, res)
  console.log("req body", req.body)
  if (!imgUrl) return res.json({ msg: "some error occured" })
  imgUrl.concat(req.body.linkInp)
  imgUrl = imgUrl.filter((el) => { return el != "" })
  var freeShip = JSON.parse(req.body.freeShipInp)
  var post = await new PostModel({
    sno: 1,
    imgPath: imgUrl,
    des: req.body.desInp,
    title: req.body.titleInp,
    price: req.body.priceInp,
    freeShip: freeShip == "" || freeShip === undefined ? false : freeShip,
    active: true,
    category: req.body.categoryInp == "" || req.body.categoryInp === undefined ? "Uncategorised" : req.body.categoryInp
  })
  console.log(post)
  post.save()
  res.json({ post: post })
})


router.delete("/delete/:id", async (req, res) => {
  if (!req.query.email) {
    return res.json({ msg: "unathorized" })
  }
  const { id } = req.params
  var post = await PostModel.findOne({ _id: id })
  console.log(post)
  await deleteImage(req, res, post.imgPath)
  await PostModel.deleteOne({ _id: id })
  res.status(200).json({ deleted: true })
})


router.put("/update/:id", upload.array("imgToAdd", 12), async (req, res) => {
  if (!req.query.email) {
    return res.json({ msg: "unathorized" })
  }
  const { id } = req.params
  const { links, imgToDel, desInp, titleInp, priceInp, freeShipInp, categoryInp } = req.body
  console.log("body ", req.body)
  var updatedLinks = links
  if (req.files.length > 0) {
    var imgUrl = await uploadImage(req, res)
    console.log("imgUrl", imgUrl)
    updatedLinks = updatedLinks.concat(imgUrl)
  }
  if (imgToDel) {
    await deleteImage(req, res, imgToDel)
    updatedLinks = updatedLinks.filter((el) => { return !imgToDel.includes(el) })
  }
  let post = new PostModel({
    _id: id,
    sno: 1,
    imgPath: updatedLinks = updatedLinks.filter((el) => { return el != "" }),
    des: desInp,
    title: titleInp,
    price: priceInp,
    freeShip: freeShipInp == "" || freeShipInp === undefined ? false : freeShipInp,
    active: true,
    category: categoryInp == "" || categoryInp === undefined ? "Uncategorised" : categoryInp
  })
  await PostModel.updateOne({ _id: id }, post)
  res.json(post)
})


module.exports = router