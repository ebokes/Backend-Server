const User = require('../models/user.model');
const { Course } = require('../models/course.model');
const Student = require('../models/student.model');
// const Comment = require('../models/comment.model');
const Payment = require('../models/transaction.model');
const Meeting = require('../models/meeting.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const referralCodeGenerator = require('referral-code-generator');






exports.adminLogin = async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user.roles === "admin") {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Incorrect username or password'
            });
        };
        const isActive = await User.findOne({ _id: user._id });
        if (isActive.isEmailActive === false) {
            return res.status(400).json({
                message: 'Your account is pending. kindly check your email inbox and verify it'
            });
        };
        const token = jwt.sign({
             _id: user._id,
            }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return res.status(200).json({
            message: 'User logged in successfully',
            token,
            user
        });
    }else {
        return res.status(400).json({
            message: 'You are not admin'
        });
    }
    } catch (error) {
        res.status(400).json({
            message: 'Error while logging in',
            error: error.message
        });
    }
};


exports.adminUpdateUserRoles = async (req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles === 'superAdmin') {
            const { email } = req.body;
            const existingUser = await User.findOne({ email: email });
            const newRole = await User.findOneAndUpdate({ _id: existingUser._id }, {
                $set: {
                    roles: "admin"
                }
            });
            return res.status(200).json({
                message: 'User role updated successfully',
                newRole
            });
        } else {
            return res.status(200).json({
                message: 'You can not update this role since you are not a Supper admin'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'User role not updated'
        });
    }
}


// view transaction 
exports.adminViewTransactions = async (req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles === 'admin') {
            const transactions = await Payment.find({})
            .sort({ createdAt: -1 })
            .populate('student', 'name')
            .populate('course', 'title')
            return res.status(200).json({
                transactions
            });
        } else {
            return res.status(200).json({
                message: 'You are not authorized to view this page'
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Transaction not found'
        });
    }
}


// view student 
exports.adminViewStudents = async (req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles === 'admin') {
            const students = await User.find({ roles: "student"})
            .sort({ createdAt: -1 })
            return res.status(200).json({
                students
            });
        } else {
            return res.status(200).json({
                message: 'You are not authorized to view this page'
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Student not found',
            error: error.message
        });
    }
}


// view course 
exports.adminViewCourses = async (req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles === 'admin') {
            const courses = await Course.find({})
            .sort({ createdAt: -1 })
            return res.status(200). json({
                courses
            });
        } else {
            return res.status(200).json({
                message: 'You are not authorized to view this page'
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Course not found'
        });
    }
}


// view comment 
exports.adminViewComments = async (req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles === 'admin') {
            const comments = await Comment.find({})
            .sort({ createdAt: -1 })
            .populate('student', 'name')
            .populate('course', 'title')
            return res.status(200).json({
                comments
            });
        } else {
            return res.status(200).json({
                message: 'You are not authorized to view this page'
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Comment not found'
        });
    }
}

// total student registered 
exports.adminTotalStudent = async (req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);   
        if(userStatus.roles === 'admin') {
            const total = await User.countDocuments({});
            const totalStudent = await User.countDocuments({ roles: 'student'});
            const admin = await User.countDocuments({ roles: 'admin'});
            const it = await User.countDocuments({ roles: 'IT'});
            return res.status(200).json({
                TotalUser: total,
                TotalStudent: totalStudent,
                Admin: admin,
                IT: it
            });
        } else {
            return res.status(200).json({
            message: 'You are not authorized to view this page'
        });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Total student not found',
            error: error.message
        });
    }
};





// total payment 
exports.adminTotalPayment = async (req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles === 'admin') {
            const totalPayment = await Payment.find({
                student: { $exists: true },
                course: { $exists: true },
                paymentMethod: { $exists: true }
            });
            return res.status(200).json({
                total: totalPayment.length,
                totalPayment
            });
        } else {
            return res.status(200).json({
            message: 'You are not authorized to view this page'
        });
    }
    } catch (error) {
        return res.status(500).json({
            message: 'Total payment not found'
        });
    }
};


// view admin profile 
exports.adminViewProfile = async (req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles === 'admin') {
            const { email } = req.body;
            const admin = await User.findOne({ email });
            if(admin) {
                return res.status(200).json({
                    instructor: admin
                });
            } else {
                return res.status(404).json({
                    message: 'Your email is not registered on this platform as Instructor'
                })
            }
        } else {
            return res.status(401).json({
            message: 'You are not authorized to view this page'
        });
    }
    } catch (error) {
        return res.status(501).json({
            message: 'There is an error fetch instructor info',
            error: error.message
        });
    }
};



// view all the instructors/ admin 
exports.adminViewAllInstructors = async (req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles === 'admin') {
            const instructors = await User.find({ roles: "admin"})
           .sort({ createdAt: -1 })
            return res.status(200).json({
                instructors
            });
        } else {
            return res.status(200).json({
            message: 'You are not authorized to view this page'
        });
    }
    } catch (error) {
        return res.status(500).json({
            message: 'Instructor not found'
        });
    }};




// to know the total student registered for a course!!!
exports.adminTotalStudentForCourse = async (req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles === 'admin' || userStatus.roles === 'student'  ||  userStatus.roles === 'IT') {
            const total = await Student.countDocuments({ Course });
            return res.status(200).json({
                totalCourseRegisteredByStudent: total,
            });
        } else {
            return res.status(200).json({
            message: 'You are not authorized to view this page'
        });
    }
    } catch (error) {
        return res.status(500).json({
            message: 'Total student not found',
            error: error.message
        });
    }
};


//? admin schedule google meeting for students 
exports.adminScheduleMeeting = async (req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles === 'admin') {
            const { email, description, date, time, courseName } = req.body;
            const organizerN = await User.findOne({ email }); 
            const linkMeeting = referralCodeGenerator.custom('lowercase', 3, 3, 'lmsore');
            const instructorN = referralCodeGenerator.custom('lowercase', 3, 3, 'instructor');
            const course = await Course.findOne({ course_title: courseName });
            if(organizerN && course){                
            const meeting = await Meeting.create({
                instructor: organizerN.firstName +'' + organizerN.lastName,
                description, 
                instructorId: instructorN,
                courseId: courseName,
                date, 
                time,
                courseName: course.course_title, 
                room : linkMeeting               
            });
            return res.status(201).json({
                message: 'Meeting created successfully',
                meeting
            });
        } else {
            return res.status(404).json({
                message: 'Your email or the course is not registered on this platform'
        })
        }
        } else {
            return res.status(200).json({
            message: 'You are not authorized to view this page'
        });
    }
    } catch (error) {
        return res.status(500).json({
            message: 'Meeting not found',
            error: error.message
        });
    }
};


// ? get user information by email
exports.studentJoinMeeting = async (req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        const userStatus = await User.findById(user._id);
        if(userStatus.roles === 'admin' || userStatus.roles ==='student'  ||  userStatus.roles === 'IT') {
            const { email } = req.body;
            const admin = await User.findOne({ email });
            return res.status(200).json({
                student: admin
            });
        } else {
            return res.status(200).json({
            message: 'You are not student of this institution'
        });
    }
    } catch (error) {
        return res.status(500).json({
            message: 'User not found',
            error: error.message
        });
    }
};