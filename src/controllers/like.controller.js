const Course = require('../models/course.model');
const User = require('../models/user.model');
const Comment = require("../models/comment.model");

const Student = require('../models/student.model'); //needed to be able to authorize the the student to like the course

// exports.likeCourse = async (req, res) => {
//     try {
//         const id = req.user;
//         const existingUser = await User.findById(id);
//         const userStatus = await User.findById(existingUser._id);
//         if (userStatus.roles === 'admin' && userStatus.roles === 'student' && userStatus.roles === 'IT') {
//         const _id = req.body._id;
//         const course = await Course.findById( _id );
//         const likecouse = await Course.findOneAndUpdate({ _id: course._id }, { $inc: { like_count: 1 } });
//         if (likecouse) {
//             return res.status(200).json({
//                 message: 'Like added successfully',
//                 course                    
//                 });
//             } 
//         } else {
//             return res.status(400).json({
//                 message: 'you are not allowed to like this course'
//             });
//         }           
//     }catch (error) {
//         return res.status(500).json({
//             message: 'Internal server error',
//             error: error.message
//         });
//     }
// };

/**middleware to like a course students can only like when they haven't like or dislike */
exports.likeCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user._id;
      const course = req.course;
      const { likeAndDislikeUsers } = course;
      // //check if the student exist and he registered for the course
      const student = await Student.find({ userId, courseId });
      if (!student) {
        return res.status(401).json({
          Error: `student with the userId: ${userId} has not been registered for this course`,
        });
      }
      
      /**Check if student already liked or disliked the course */
      const hasLikedCourse = likeAndDislikeUsers.includes(userId);
      if (hasLikedCourse) {
        return res
          .status(409)
          .json({ Error: "you can only like or dislike a course once" });
      }
    
      // if he hasn't liked or disliked the course yet, increment the course like_count and save it
      
      course.likeAndDislikeUsers.push(userId); //add the userId to the list of users that have liked the course
      const courseAfterLiked = await Course.findByIdAndUpdate(
        courseId,{
          new: true, 
          $inc: {like_count: 1},
          $push: {likeAndDislikeUsers: userId},
          title: 1, like_count: 1, dislike_count: 1, likeAndDislikeUsers: 1
        }
      )

      return res.status(200).json({ message: "you like the course", courseAfterLiked });
    } catch (error) {
        console.error(error);
      res.status(500).send({ message: error.message });
    }
}

/**middleware to dislike course students can only dislike when they haven't like or dislike*/
exports.dislikeCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const course = req.course;
    const { likeAndDislikeUsers } = course;
    // //check if the student exist and he registered for the course
    const student = await Student.find({ userId, courseId });
    if (!student) {
      return res.status(401).json({
        Error: `student with the userId: ${userId} has not been registered for this course`,
      });
    }
    /**Check if student already liked or disliked the course */
    const hasLikedCourse = likeAndDislikeUsers.includes(userId);
    if (hasLikedCourse) {
      return res
        .status(409)
        .json({ Error: "you can only like or dislike a course once" });
    }
    // if he hasn't liked or disliked the course yet, increment the course dislike_count
    //add the userId to the list of users that have liked the course
    const courseAfterDisliked = await Course.findByIdAndUpdate(
      courseId,{
        new: true, 
        $inc: {dislike_count: 1},
        $push: {likeAndDislikeUsers: userId},
        title: 1, like_count: 1, dislike_count: 1, likeAndDislikeUsers: 1
      }
    )

    return res.status(200).json({ message: "you dislike the course", courseAfterDisliked });
  } catch (error) {
      console.error(error);
    res.status(500).send({ message: error.message });
  }
}

/**Get all likes of a course */
exports.getLikes = async (req, res) => {
  try{
    const { courseId} = req.params;
  const userId = req.user._id;

  const course = await Course.findById(courseId, 'title like_count dislike_count likeAndDislikeUsers'); //fetch the course to like
  if (!course) {
    return res.status(404).json({ error: "course not found" });
  }

   res.status(200).json({message: 'success', course});
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};

/**like a comment by registered users */
exports.likeComment = async (req, res) => {
  try {
    const {commentId} = req.params;
      const comment = await Comment.findById(commentId);
      if(!comment) {
        return res
        .status(404)
        .json({message: " comment not found"})
      }
    const  course  = await Course.findById(comment.courseId);
    const userId = req.user._id;
    // //check if the student exist and he registered for the course
    const student = await Student.find({ userId, courseId: course._id });
    if (!student) {
      return res.status(401).json({
        Error: `student with the userId: ${userId} has not been registered for this course`,
      });
    }

    const { likeAndDislikeUsers } = course;

    /**Check if student already liked or disliked the course */
    const hasLikedCourse = likeAndDislikeUsers.includes(userId)
    if (hasLikedCourse) {
      return res
        .status(409)
        .json({ Error: "you can only like or dislike a comment once" });
    }
    // if he hasn't liked or disliked the comment yet, increment the course like_count and save it
    comment.like_count +=1;

    comment.likeBy.push(userId); //add the userId to the list of users that have liked the comment
    comment.save({ new: true });

    return res.status(200).json({ message: "you like the course", course });
  } catch (error) {
      console.error(error);
    res.status(500).send({ message: error.message });
  }
}

/**Dislike a comment by registered users */
exports.dislikeComment = async (req, res) => {
  try {
    const {commentId} = req.params;
      const comment = await Comment.findById(commentId);
      if(!comment) {
        return res
        .status(404)
        .json({message: " comment not found"})
      }
    const  course  = await Course.findById(comment.courseId);
    const userId = req.user._id;
    // //check if the student exist and he registered for the course
    const student = await Student.find({ userId, courseId: course._id });
    if (!student) {
      return res.status(401).json({
        Error: `student with the userId: ${userId} has not been registered for this course`,
      });
    }

    const { likeAndDislikeUsers } = course;

    /**Check if student already liked or disliked the course */
    const hasLikedCourse = likeAndDislikeUsers.includes(userId)
    if (hasLikedCourse) {
      return res
        .status(409)
        .json({ Error: "you can only like or dislike a comment once" });
    }
    // if he hasn't liked or disliked the comment yet, increment the course dislike_count and save it
    comment.dislike_count +=1;

    comment.dislikeBy.push(userId); //add the userId to the list of users that have disliked the comment
    comment.save({ new: true });

    return res.status(200).json({ message: "you dislike the comment", course });
  } catch (error) {
      console.error(error);
    res.status(500).send({ message: error.message });
  }
}

/**Get the total likes or dislikes of a comment together with the email of the likers */
exports.getCommentLikes = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(
      commentId,
      "_id like_count dislike_count likeAndUnlikeUsers likeBy"
    ).populate(likeBy, "email"); //only return user email and likes information

    if (!comment) {
      return res.status(404).json({ message: " comment not found" });
    }
    const  course  = await Course.findById(comment.courseId);
  

    return res.status(200).json({ message: "you like the course", course });
  } catch (error) {
      console.error(error);
    res.status(500).send({ message: error.message });
  }
}

exports.test = async (req, res) => {
  // return res.status(200).send({ message: 'hello world from here' });
  const { courseId} = req.params;
  const userId = req.user._id;
    
  const s = await Student.find({ userId })
  return res.send({s})
    if(req.query.c){
        const c = await Course.findById(courseId, '_id title description comment_count' )
    return res.status(200).send({ message: 'hello world from here', c });
    }
    // const s = await Student.find({}, '_id registeredCourses userId')
    // const userId = req.user._id;
    const student = await Student.findOne({ userId });
    const u = await User.findOne({})

    student.registeredCourses.pop(courseId);
    // await student.save()
    res.status(200).send({ message: 'hello world from here', u });

    
}
