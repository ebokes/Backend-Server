const courseRoutes = require('./course.route');
const userRoutes = require('./user.route');
const studentRoutes = require('./student.route');
const commentRoutes = require('./comment.route');
const likeRoutes = require('./like.route');
const tutorRoutes = require('./tutor.route');


module.exports = function bootStrap(app){
    // Add all routes here...
    app.get('/api/test', (req, res, next) =>{
        res.send('This is to tests')
    })
    app.use('/api/courses', courseRoutes);
    app.use('/api/account', userRoutes);
    app.use('/api/comments', commentRoutes);
    app.use('/api/likes', likeRoutes);
    app.use('/api/students', studentRoutes);
    app.use('/api/tutors', tutorRoutes);



}