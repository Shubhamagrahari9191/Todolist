import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
    identifier: {
        type: String, // email or phone
        required: true,
        index: true, // Optimizes queries
    },
    code: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: '5m' }, // TTL index: Automatically deletes document after 5 minutes
    },
});

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
