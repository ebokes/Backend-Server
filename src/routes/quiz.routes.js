const express = require('express');
const { auth } = require('../middleware/auth')
const router = express.Router();
const {
  getQuizQuestions,
  getQuizQuestionsById,
  createQuizQuestions,
  updateQuizQuestions,
  deleteQuizQuestions,
  createQuiz,
  createQuizWithQuestions,
  getQuizById,
  submitQuiz,
  getQuizSubmittedById,
} = require("../controllers/quiz.controller");

router.use(auth);
router.get('/getAllQuizzes', getQuizQuestions);
router.get('/viewQuestion/:id', getQuizQuestionsById);
router.post('/createQuiz/:moduleId', createQuizQuestions);
router.put('/updateQuiz/:id', updateQuizQuestions);
router.delete('/deleteQuiz/:id', deleteQuizQuestions);
router.post('/:moduleId', createQuiz)
router.post('/:moduleId/questions', createQuizWithQuestions)
router.get('/:quizId', getQuizById)
router.post('/:quizId/submit', submitQuiz)
router.get('/submit/:submitId', getQuizSubmittedById)


module.exports = router;