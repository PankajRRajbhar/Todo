const mongoose = require("mongoose")

const TodoSchema = new mongoose.Schema( {
    title: String,
    description: String,
    dueDate: Date,
    createdBy: mongoose.Schema.ObjectId,
    isDone: { type: Boolean, default: false },
    reminderDatetime: Date
}, {  timestamps: true });


module.exports = mongoose.model("todo", TodoSchema)