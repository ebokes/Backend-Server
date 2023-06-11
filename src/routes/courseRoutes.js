const express = require("express");
const courseCrtl = require('../controllers/courseCtrl');
const storage = require('../utils/multer');
const router = express.Router();

router.post('/add-course', courseCrtl.addCourse)


router.post('/uploadVideo/:id', storage.videoMulter.array("videofile"), courseCrtl.uploadVideos);
router.post('/uploadAudio/:id', storage.audioMulter.array("audiofile"), courseCrtl.uploadAudios);
router.post('/uploadDocs/:id', storage.docsMulter.array("docsfile"), courseCrtl.uploadDocs);
router.post('/uploadImage/:id', storage.inmageMulter.array("imagefile"), courseCrtl.uploadImage);

//To get course videos and a single video
router.get('/:courseId/videos', courseCrtl.getCourseVideos);
router.get('/:courseId/videos/:videoId', courseCrtl.getCourseVideos);
router.get('/getaCourse/:courseId', courseCrtl.getaCourse);
router.get('/getallCourse', courseCrtl.getAllCourse);



module.exports = router;