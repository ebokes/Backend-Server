const Answer = require('../models/answer.model');
const User = require('../models/user.model');
const Questions = require('../models/question.model');


exports.studentViewAnswers = async(req, res) => {
    try {
        const id = req.user;
        const userStatus = await User.findById(id);
        if (userStatus.roles === 'student' || userStatus.roles === 'IT') {
            const answers = await Answer.find({ userId: userStatus._id });
            return res.status(200).json({
                answers: answers
            });
        } else {
            return res.status(400).json({
                error: 'User not active'
            });
        }
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};



// student answer the questions

exports.studentAnswerQuestions = async(req, res) => {
    try {
        const id = req.user;
        const userStatus = await User.findById(id);
        if (userStatus.roles === 'student' || userStatus.roles === 'IT') {
            const questionId = req.params.questionId;
            const questions = await Questions.findById(questionId);
            const { answer } = req.body;
            const rightAnswer = await Answer.create({
                 userId: userStatus._id, 
                 questionId: questions._id,
                 question: questions.question,
                 answer
                });
                if (rightAnswer.answer === questions.correctAnswer) {
                    await User.findByIdAndUpdate(userStatus._id, {
                        $inc: { score: 1 }
                    },
                    {
                        new: true
                    });
                    return res.status(200).json({
                        answer: rightAnswer
                    });
                } else {
                    return res.status(400).json({
                        error: 'Answer is incorrect'
                    });
                }            
        } else {
            return res.status(400).json({
                error: 'You must login to this examination'
            });
        }
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};



