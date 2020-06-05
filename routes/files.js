const express = require("express");
const fs = require("fs");
const path = require("path");

const uploadFile = require("../controller/fileUploader");
const {
  deleteFilePath,
  showUserFiles,
} = require("../controller/files-dataHandler");
const authenticate = require("../middleware/authenticateSession.js");
const checkAccessAllowed = require("../middleware/checkAccesPrivilages");

const routes = express.Router();

/**
 * Authenticates user, if its session is already availabe or not.
 */
routes.use(authenticate);

routes.get("/", (req, res) => {
  showUserFiles(req.session.userId, res)
    .then(result => {
      data = { arr: result };
      data = JSON.stringify(data);
      console.log(data);
      res.render(path.join(__dirname, "../views/viewFiles"), { data });
    });
});

routes.get("/upload", (req, res) => {
  res.sendFile("upload.html", { root: path.join(__dirname, "../views/") });
});

routes.get("/download/:id", checkAccessAllowed, (req, res) => {
  console.log("download");
  res.download(`./public/${req.session.userId}/${req.params.id}`);
});

routes.post("/upload", function (req, res) {
  if (!req.files) {
    return res.status(400).send({ message: "No files were uploaded" });
  }
  const file = req.files.uploadedFile;
  console.log(file.name);

  if (uploadFile(file, file.name, req.session.userId, path.extname(file.name), Date.now())) {
    return res.send({ message: "File Uploaded Successfully" });
  }
  return res.send({ message: "Internal Server Error " });
});

routes.get("/delete/:id", checkAccessAllowed, (req, res) => {
  try {
    fs.unlinkSync(`./public/${req.session.userId}/${req.params.id}`);
    deleteFilePath(`./public/${req.session.userId}/${req.params.id}`).then((res) => {
      console.log('deleting');
      console.log(res)
    });
    res.send({ message: "Removed Succesfully" });
  } catch (err) {
    res.status(404).send({ message: "File Cannot be deleted", err });
  }
});

module.exports = routes;
