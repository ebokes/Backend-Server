const mongoose = require("mongoose"); 


// Define the Course schema
const courseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  title: {
    type: String,
    index: true,
    required: true ['write the title of course'],
  },
  description: {
    type: String,
  },
  language: {
    type: String,
  },
  nameOfSubject: {
    type: Array,    
  },
  paid: {
    type: String,
    enum: ['paid', 'free']
  },
  price:{
    type: Number,
  },
 comments:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: false, 
    },
  ],
  likeAndDislikeUsers:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, 
    },
  ],
  comment_count: { type: Number, default: 0 },
  like_count: { type: Number, default: 0 },
  dislike_count: { type: Number, default: 0 },

},
{
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Course', courseSchema);
