const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
    adminUpdateUserRoles, 
    adminViewTransactions,
    adminViewStudents,
    adminViewCourses,
    adminViewComments,
    adminTotalStudent,
    adminTotalPayment,
    adminLogin,
    adminViewProfile,
    adminViewAllInstructors,
    adminTotalStudentForCourse,
    studentJoinMeeting,
    adminScheduleMeeting ,
    adminGetRoomId,
    studentViewAllMeeting,
    studentTotalStudentForCourse,
    studentPayForMeeting,
    studentPaid,
    tutorViewHisMeeting,
    adminViewAllMeetings,
    blockTutorAccount
  } = require('../controllers/admin.controller');

router.post('/adminSignIn', adminLogin);
router.post('/joinmeeting/:roomId', studentJoinMeeting );
router.post('/adminScheduleMeeting', adminScheduleMeeting  );
router.use(auth);
router.put('/roles', adminUpdateUserRoles);
router.get('/viewTransaction', adminViewTransactions );
router.get('/ViewStudent', adminViewStudents  );
router.get('/viewCourse', adminViewCourses  );
router.get('/viewComment', adminViewComments  );
router.get('/totalStudent', adminTotalStudent   );
router.get('/viewTotalPayment', adminTotalPayment  );
router.get('/ViewInstructorProfile/:userId', adminViewProfile  );
router.get('/viewAllInstructors', adminViewAllInstructors)
router.get('/totalStudentRegisteredForCourse', adminTotalStudentForCourse);
router.get('/getRoomId', studentViewAllMeeting);
router.get('/totalStudentRegiesteredForACourse/:courseId', studentTotalStudentForCourse);
router.get('/tutorViewOwnMeetings', tutorViewHisMeeting);
router.get('/adminViewAllOnlineMeetings', adminViewAllMeetings);
router.put('/blockTutorAccount/:tutorId', blockTutorAccount);


// payment for the video tutor
router.post('/paymentInitialized/:roomId', studentPayForMeeting)
router.post('/receivingPayment', studentPaid);

module.exports = router;