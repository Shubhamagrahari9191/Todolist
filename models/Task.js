import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    userId: {
        type: String, // We'll store the User's _id here as a string referencing the User model
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Please provide a title for this task.'],
    },
    subject: {
        type: String,
    },
    date: {
        type: String, // YYYY-MM-DD
    },
    startTime: {
        type: String, // HH:mm
    },
    endTime: {
        type: String, // HH:mm
    },
    isEvent: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending',
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
