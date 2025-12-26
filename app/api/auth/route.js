import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Otp from '@/models/Otp';
import nodemailer from 'nodemailer';

export async function POST(request) {
    const body = await request.json();
    const { action, username, password, email, phone, otp, identifier } = body;

    // Connect to Database
    await dbConnect();

    // Helper to generate and save OTP
    async function generateAndSaveOtp(targetIdentifier) {
        // Generate Token
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB (Upsert: Update if exists, otherwise create)
        // Set expiry to 5 minutes from now
        const expiry = new Date(Date.now() + 5 * 60 * 1000);

        await Otp.findOneAndUpdate(
            { identifier: targetIdentifier },
            { code, expiresAt: expiry },
            { upsert: true, new: true }
        );

        console.log(`[OTP SYSTEM] (${action}) OTP for ${targetIdentifier}: ${code}`);

        // Send Email if credentials exist
        if (targetIdentifier.includes('@') && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: targetIdentifier,
                    subject: 'Your OTP Code',
                    text: `Your OTP code is: ${code}. It expires in 5 minutes.`,
                    html: `<p>Your OTP code is: <strong>${code}</strong></p><p>It expires in 5 minutes.</p>`
                });
                console.log(`[EMAIL SENT] OTP sent to ${targetIdentifier}`);
            } catch (emailError) {
                console.error('[EMAIL ERROR] Failed to send email:', emailError);
            }
        }
    }

    if (action === 'send-otp') {
        const { type } = body; // 'register' or 'reset'

        if (!identifier) return NextResponse.json({ error: 'Identifier required' }, { status: 400 });

        // Check if User exists
        const existingUser = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        });

        if (type === 'register') {
            if (existingUser) {
                return NextResponse.json({ error: 'User already exists with this email/phone' }, { status: 400 });
            }
            await generateAndSaveOtp(identifier);
            return NextResponse.json({ message: 'OTP sent for registration' });
        }

        if (type === 'reset') {
            if (!existingUser) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            await generateAndSaveOtp(identifier);
            return NextResponse.json({ message: 'OTP sent for reset' });
        }

        return NextResponse.json({ error: 'Invalid OTP type' }, { status: 400 });
    }

    if (action === 'register') {
        const { otp } = body;
        const targetIdentifier = email || phone;

        // Verify OTP
        const otpRecord = await Otp.findOne({ identifier: targetIdentifier, code: otp });

        if (!otpRecord) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        if (new Date() > otpRecord.expiresAt) return NextResponse.json({ error: 'OTP expired' }, { status: 400 });

        // Check Username Uniqueness
        const userExists = await User.findOne({ username });
        if (userExists) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }

        // Check if Email or Phone is already occupied by another user
        // (This prevents the E11000 Duplicate Key error)
        if (email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return NextResponse.json({ error: 'Email already registered. Please login.' }, { status: 400 });
            }
        }
        if (phone) {
            const phoneExists = await User.findOne({ phone });
            if (phoneExists) {
                return NextResponse.json({ error: 'Phone number already used. Please login.' }, { status: 400 });
            }
        }

        // Create User
        const newUser = await User.create({
            username,
            password,
            email: email || undefined,
            phone: phone || undefined
        });

        // Delete OTP
        await Otp.deleteOne({ identifier: targetIdentifier });

        // Build response object (convert _id to id for frontend compatibility)
        const userResp = {
            id: newUser._id.toString(),
            username: newUser.username,
            email: newUser.email,
            phone: newUser.phone
        };

        return NextResponse.json({ user: userResp });
    }

    if (action === 'login') {
        const user = await User.findOne({ username, password });
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const userResp = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            phone: user.phone
        };

        return NextResponse.json({ user: userResp });
    }

    if (action === 'reset-password') {
        // Verify OTP
        const otpRecord = await Otp.findOne({ identifier: identifier, code: otp });

        if (!otpRecord) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        if (new Date() > otpRecord.expiresAt) return NextResponse.json({ error: 'OTP expired' }, { status: 400 });

        // Find and Update User
        // Note: findOneAndUpdate doesn't trigger save hooks unless configured, but simple update is fine here
        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        user.password = password;
        await user.save();

        // Delete OTP
        await Otp.deleteOne({ identifier: identifier });

        return NextResponse.json({ message: 'Password reset successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
