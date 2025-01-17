const User = require('../models/user.model');
const { Course, Module, Quiz } = require('../models/course.model');
const StudentCourse = require('../models/student.model')
const Transaction = require('../models/transaction.model');
const mongoose = require("mongoose");



// student register for course

exports.studentRegisterCourse = async(req, res, next) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const courseId  = req.params.courseId;  
        const course = await Course.findById(courseId);
        if(course.isUploadedCompleted === false ){
            return res.status(400).json({
                message: 'This course not available now'
            })
        }
        const hasStudentRegistered = await StudentCourse.findOne({userId: user._id, courseId: course._id})
        if (hasStudentRegistered){
            return res
            .status(409)
            .json({message: 'You had already enrolled for this course'})
        }       
        const userStatus = await User.findById(user._id);
        if(userStatus.roles === 'student' || userStatus.roles === 'IT' || userStatus.roles === 'admin') {
          if( userStatus.courseLimit === 15) {
            return res.status(400).json({
              message: 'You have reached your limit of 10 courses'
            });
          };
          const link = `<a href="https://decode-mnjh.onrender.com/api/payment/initializedPayment/${courseId}"</a>`;
           
        if(course.isPaid_course === 'paid' ){
            return res.status(401).json({message: `pls, kindly click on the ${link} to pay for this course`})
        }
       const modules = await Module.find({ courseId: courseId })
        const newCourse = await StudentCourse.create({
            courseId: course._id,
            title: course.course_title,
            description: course.course_description,
            image: course.course_image,
            price: course.isPrice_course,
            courseOwnerId: course.userId,
            userId: userStatus._id,  
            module: modules       

        });
        // update the user courseLimit
        const updatedUser = await User.findByIdAndUpdate({_id: userStatus._id}, {
            $inc: {courseLimit: +1}
        },
        {
            new: true
        });
        // update the course's totalRegisteredByStudent
        const totalRegisteredByStudent = await Course.findByIdAndUpdate({_id: courseId}, {
            $inc: {totalRegisteredByStudent: +1}
        }, {
            new: true
        });
        return res.status(200).json({
            message: 'Course registered successfully',
            newCourse
        });
    }else{
        return res.status(400).json({
            message: 'You must be registered student to register course'
        });
    }
    } catch (error) {
        return res.status(400).json({
            message: 'Error while registering course',
            error: error.message
        });
    }
};

// view the registered course by student to see the course details
exports.studentViewCourseDetails = async(req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles ==='student' || userStatus.roles === 'IT' || userStatus.roles === 'admin') {
            const { courseId } = req.params;
            const result = await StudentCourse.find({ courseId: courseId, userId: userStatus._id })
            .select("-title")
            .select("-image")
            .select("-description")
            .select("-__v")
            .select("-_id")
            .select("-module.quizId")
            .select("-module.comments")
            .select("-module.likeAndDislikeUsers")
            .select("-module.commentId")
            .select("-module.createdAt")
            .select("-module.updatedAt")
            .select("-module.comment_count")
            .select("-module.userId")
            .select("-module.courseId")
             
            const updatedCourse = await Course.findByIdAndUpdate({_id: courseId}, {
                $inc: {visitCount: +1}
            }, {
                new: true
            });

            if(Array.isArray(result)&& result.length === 0) {  
                return res.status(404).json({
                    message: 'Course not found, You did not registered for this course'
                });
            }else{
                return res.status(200).json({
                    message: `Student's registered Course details fetched successfully`,                 
                    result,
                });            
        }
    }else{
        return res.status(400).json({
            message: 'You must be registered student to view your course'
        });
    }
    } catch (error) {
        return res.status(400).json({
            message: 'Error while viewing user',
            error: error.message
        });
    }
};


// student view his registered course
exports.studentViewCourse = async(req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        if(user && user.roles.includes('student') || user.roles.includes("IT")) {
            const course = await StudentCourse.find({ userId: user._id })
            .select("-__v")
            return res.status(200).json({
                message: 'Course registered fetched successfully',
                studentRegisteredCourses: course
        });
    }else{
        return res.status(400).json({
            message: 'You must be a registered student to view your course'
        });
    }
    } catch (error) {
        return res.status(400).json({
            message: 'Error while viewing user',
            error: error.message
        });
    }
};




// student view all registered courses

exports.studentViewAllCourse = async(req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles === 'admin' || userStatus.roles === 'student') {
            const courses = await StudentCourse.find({ userId: userStatus._id }).sort({ createdAt: -1 });
            return res.status(200).json({
                message: 'Course registered fetched successfully',
                courses
        });
    }else{
        return res.status(400).json({
            message: 'You must be registered student to view your course'
        });
    }
    } catch (error) {
        return res.status(400).json({
            message: 'Error while viewing user',
            error: error.message
        });
    }
};


// student delete his registered course

exports.studentDeleteCourse = async(req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        const courseId = req.params.courseId;
        if(userStatus.roles === 'student' || userStatus.roles === 'admin') {
            const ownerId = await StudentCourse.find({courseId: courseId, userId: userStatus._id});
            if(Array.isArray(ownerId) && ownerId.length > 0) {
                const course = await StudentCourse.findOneAndDelete({courseId});
                const limitUpdate = await User.findByIdAndUpdate({_id: userStatus._id}, {
                    $inc: {courseLimit: -1}
                }, {
                    new: true
                });
                return res.status(200).json({
                    message: 'Course deleted successfully',
                    course
                });            
            }else{
                return res.status(400).json({
                    message: 'No Course found for delete'
                });
            }
        }else{
            return res.status(400).json({
                message: 'You must be registered student to delete your course'
            });
        }
    } catch (error) {
        return res.status(400).json({
            message: 'Error while deleting course',
            error: error.message
        });
    }
};
  

// student view his paid registered course

exports.studentViewPaidCourse = async(req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles === 'student' || userStatus.roles === 'IT') {
            const course = await Transaction.find({ userId: userStatus._id });
            return res.status(200).json({
                message: 'Course paid for fetched successfully',
                course
        });
    }else{
        return res.status(400).json({
            message: 'You must be registered student to view your course'
        });
    }
    } catch (error) {
        return res.status(400).json({
            message: 'Error while viewing user',
            error: error.message
        });
    }
};


// student update his status or role

exports.studentUpdateStatus = async(req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles === 'student' || userStatus.roles === 'IT') {
            const course = await User.findOneAndUpdate({ userId: userStatus._id }, {
                $set: {
                    role: "IT",
                }
            }, {
                new: true
            });
            return res.status(200).json({
                message: 'Course status updated successfully',
                course
        });
    }else{
        return res.status(400).json({
            message: 'You must be registered student to update your course',
        });
    }
}catch(error) {
        return res.status(400).json({
            message: 'Error while updating course status',
            error: error.message
        });
    }
};


// student update his profile

exports.studentUpdateProfile = async(req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles ==='student' || userStatus.roles === 'IT') {
            const userUpdate = await User.findOneAndUpdate({ userId: userStatus._id }, {
                $set: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    phoneNumber: req.body.phoneNumber,
                    address: req.body.address,
                }
            }, {
                new: true
            });
            return res.status(200).json({
                message: 'Profile updated successfully',
                userUpdate
        });
    }else{
        return res.status(400).json({
            message: 'You must be registered student to update your profile'
        });
    }
    }catch(error) {
        return res.status(400).json({
            message: 'Error while updating profile',
            error: error.message
        });
    }
};

// student update his password

exports.studentUpdatePassword = async(req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles ==='student' || userStatus.roles === 'IT') {
            const userUpdate = await User.findOneAndUpdate({ userId: userStatus._id }, {
                $set: {
                    password: req.body.password,
                }
            }, {
                new: true
            });
            return res.status(200).json({
                message: 'Password updated successfully',
                userUpdate
        });
    }else{
        return res.status(400).json({
            message: 'You must be registered student to update your password'
        });
    }
    }catch(error) {
        return res.status(400).json({
            message: 'Error while updating password',
            error: error.message
        });
    }
};

// student update his role

exports.studentUpdateRole = async(req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles ==='student' || userStatus.roles === 'IT' || userStatus.roles === 'admin') {
            const userUpdate = await User.findOneAndUpdate({ userId: userStatus._id }, {
                $set: {
                    roles: req.body.roles,
                }
            }, {
                new: true
            });
            return res.status(200).json({
                message: 'Role updated successfully',
                userUpdate
        });
    }else{
        return res.status(400).json({
            message: 'You must be registered student to update your role'
        });
    }
    }catch(error) {
        return res.status(400).json({
            message: 'Error while updating role',
            error: error.message
        });
    }
};


// count the total number of students registered 

exports.studentCount = async(req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles ==='student' || userStatus.roles === 'IT' || userStatus.roles === 'admin') {
            const count = await StudentCourse.find({ }).count();
            return res.status(200).json({
                message: 'Total number of students registered fetched successfully',
                count
        });
    }else{
        return res.status(400).json({
            message: 'You must be registered student to view your course'
        });
    }
    } catch (error) {
        return res.status(400).json({
            message: 'Error while viewing user',
            error: error.message
        });
    }
};

// count the total number of students paid for his registered course

exports.studentPaidCount = async(req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles ==='student' || userStatus.roles === 'IT' || userStatus.roles === 'admin') {
            const count = await Transaction.find({ userId: userStatus._id }).count();
            return res.status(200).json({
                message: 'Total number of students paid for his registered course fetched successfully',
                count
        });
    }else{
        return res.status(400).json({
            message: 'You must be registered student to view your course'
        });
    }
    } catch (error) {
        return res.status(400).json({
            message: 'Error while viewing user',
            error: error.message
        });
    }
};

// count the total number of students registered in a specific course

exports.studentCourseCount = async(req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles ==='student' || userStatus.roles === 'IT' || userStatus.roles === 'admin') {
            const courseId = req.params.courseId;
            const count = await StudentCourse.find({ courseId: courseId }).count();
            return res.status(200).json({
                message: 'Total number of students registered in a specific course fetched successfully',
                count
        });
    }else{
        return res.status(400).json({
            message: 'You must be registered student to view your course'
        });
    }
    } catch (error) {
        return res.status(400).json({
            message: 'Error while viewing user',
            error: error.message
        });
    }
};

// student update only the picture of his profile 

exports.studentUpdateProfilePicture = async(req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles ==='student' || userStatus.roles === 'IT') {
            if(req.file){
                const picture = req.file.picture;        
            const userUpdate = await User.findOneAndUpdate({ userId: userStatus._id }, {
                $set: {
                    picture: picture,
                }
            }, {
                new: true
            });
        }
            return res.status(200).json({
                message: 'Profile picture updated successfully',
        });
    }else{
        return res.status(400).json({
            message: 'You must be registered student to update your profile picture'
        });
    }
    }catch(error) {
        return res.status(400).json({
            message: 'Error while updating profile picture',
            error: error.message
        });
    }
};


// course skill level (beginner, immediate, pro ) 

exports.courseSkillLevel = async(req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles ==='student' || userStatus.roles === 'IT') {
            const courseId = req.params.courseId;
            const skillLevel = await CourseSkillLevel.find({ courseId: courseId }).count();
            return res.status(200).json({
                message: 'Total number of students paid for the registered course fetched successfully',
                skillLevel
        });
    }else{
        return res.status(400).json({
            message: 'You must be registered student to view your course'
        });
    }
    } catch (error) {
        return res.status(400).json({
            message: 'Error while viewing user',
            error: error.message
        });
    }
};


// student update his profile picture (beginner, immediate, pro )

exports.studentTotalRegisteredCourse = async(req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles ==='student' || userStatus.roles === 'IT' ) {
            const skillLevel = await StudentCourse.find({ userId: userStatus._id });
            return res.status(200).json({
                message: 'Total number of the registered course fetched successfully for the student',
                totalNumberRegisterCourse: skillLevel.length,
                studentRegisteredCourse: skillLevel
        });
    }else{
        return res.status(400).json({
            message: 'You must be registered student to view your course'
        });
    }
    } catch (error) {
        return res.status(400).json({
            message: 'Error while viewing user',
            error: error.message
        });
    }
};



exports.markComplete = async (req, res) => {

    try {
        const userId = req.user;

        // Check if the user exists and has the required permissions
        const user = await User.findById(userId);
        if (!user || !(user.roles === 'student' || user.roles === 'IT' || user.roles === 'admin')) {
            return res.status(403).json({
                message: 'Forbidden: You do not have the necessary permissions to mark a module as watched.'
            });
        }

        const { courseId, moduleId } = req.params;

        // Check if the student is enrolled in the specified course
        const student = await StudentCourse.findOne({ userId, courseId });
        if (!student) {
            return res.status(404).json({
                message: 'Course not found, or you are not enrolled in this course.'
            });
        }

        // Update isCompleted to true for the specific module
        const updatedStudent = await StudentCourse.findOneAndUpdate(
            { userId, courseId },
            { $set: { 'module.$[elem].isCompleted': true } },
            { arrayFilters: [{ 'elem._id': mongoose.Types.ObjectId(moduleId) }], new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({
                message: 'Module not found in the specified course.'
            });
        }

        return res.status(200).json({
            message: 'Module marked as watched successfully.',
            updatedStudent
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
};


// mark the student learning progress in the course modules
exports.studentCourseProgress = async (req, res) => {
    try {
        const userId = req.user;
        const user = await User.findById(userId);
        if (user.roles.includes('admin') || user.roles.includes('student')) {
            const { courseId } = req.params;
            const studentStudyTrack = await StudentCourse.findOne({ userId: user._id, courseId });
            if(studentStudyTrack) { 
                if (studentStudyTrack.module.every(module => module.isCompleted === true )){ 
                    const progress = studentStudyTrack.module.map(module => module.isCompleted === true? 20 : 0);
                    const totalModules = progress.reduce((a, b) => a + b, 0);                 
                    const updatedProgress = await StudentCourse.findOneAndUpdate(
                        { userId: user._id, courseId },
                        { $set: { isCourseCompleted: true } },
                        { new: true }
                    );
                    return res.status(200).json({
                        message: 'Course progress updated successfully',
                        updatedProgress,
                        totalModules
                    }); 
                } else {
                    return res.status(400).json({
                        message: 'You have not completed all the modules in this course yet'
                    });
                }
            } else {
                return res.status(403).json({
                    message: 'Forbidden: You do not have the necessary permissions to access this resource.'
                });
            }
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Error while updating student course progress',
            error: error.message
        });
    }
}


exports.studentTotalCourseProgress = async (req, res) => {
    try {
        const userId = req.user;
        const user = await User.findById(userId);
        if (user.roles.includes('admin') || user.roles.includes('student')) {
            const studentCourses = await StudentCourse.find({ userId: user._id });
            
            if (studentCourses.length > 0) {
                let totalProgress = 0;
                let totalCompletedModules = 0;

                studentCourses.forEach(course => {
                    if (course.module && Array.isArray(course.module)) {
                        const completedModules = course.module.filter(module => module.isCompleted).length;
                        totalCompletedModules += completedModules;
                        totalProgress += completedModules * 20;  
                    }
                });

                if (totalProgress > 0) {
                    return res.status(200).json({
                        message: 'Course progress updated successfully',
                        totalCourseProgress: totalProgress,
                        totalModulesCompleted: totalCompletedModules
                    });
                } else {
                    return res.status(400).json({
                        message: 'You have not completed any modules in your courses yet'
                    });
                }
            } else {
                return res.status(404).json({
                    message: 'No courses found for the user.'
                });
            }
        } else {
            return res.status(403).json({
                message: 'Forbidden: You do not have the necessary permissions to access this resource.'
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Error while updating student course progress',
            error: error.message
        });
    }
};


exports.studentLeaderboard = async (req, res) => {
    try {
        const userId = req.user;
        const user = await User.findById(userId);
        if (user.roles.includes('admin')) { 
            const leaderboard = await StudentCourse.aggregate([
                { $unwind: "$module" },
                { $match: { "module.isCompleted": true } },
                { $group: { _id: "$userId", completedModules: { $sum: 1 } } },
                {
                    $lookup: {
                        from: "users", 
                        localField: "_id", 
                        foreignField: "_id", 
                        as: "userDetails"
                    }
                },
                { $unwind: "$userDetails" },
                { $sort: { completedModules: -1 } },
                { $limit: 10 },
                { $project: { _id: 0, first_name: "$userDetails.firstName", last_name: "$userDetails.lastName", completedModules: 1 } }
            ]);

        if (leaderboard.length > 0) {
            return res.status(200).json({
                message: 'Leaderboard retrieved successfully',
                leaderboard
            });
        } else {
            return res.status(404).json({
                message: 'No data available for the leaderboard.'
            });
        }
    }else{
           return res.status(403).json({
                message: 'Access denied. Only admins can access the leaderboard.'
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving leaderboard',
            error: error.message
        });
    }
};

