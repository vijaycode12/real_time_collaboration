import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

import User from '../models/user.model.js'
import { JWT_SECRET,JWT_EXPIRES_IN } from "../config/env.js";

export const signUp = async(req,res,next)=>{
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const {username,email,password,confirmPassword} = req.body;

        if(password!==confirmPassword){
            const error = new Error('Password does not match');
            error.statusCode=400;
            throw error;
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            const error = new Error('User already exists');
            error.statusCode=409;
            throw error;
        }

        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUsers = await User.create([{ username, email, password: hashedPassword }],{ session });


        const token = jwt.sign({userId:newUsers[0]._id},JWT_SECRET,{expiresIn:JWT_EXPIRES_IN});

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success:true,
            message:'User created successfully',
            data:{
                token,
                user:newUsers[0],
            }
        })
    }catch(error){
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const logIn = async(req,res,next)=>{
    try{
        const {email,password} = req.body;

        if (!email || !password) {
            const error = new Error("Email and password are required");
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findOne({email});

        if(!user){
            const error = new Error('User not found');
            error.statusCode=404;
            throw error;
        }

        if (!user.password) {
            const error = new Error("Password not set for this user");
            error.statusCode = 500;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password,user.password);

        if(!isPasswordValid){
            const error = new Error('Password is not correct');
            error.statusCode=401;
            throw error;
        }

        const token = jwt.sign({userId:user._id},JWT_SECRET,{expiresIn:JWT_EXPIRES_IN});

        //We set token in httponly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,   
            sameSite:'lax',
            maxAge: 1000 * 60 * 60 * 24,
        });


        res.status(200).json({
            success:true,
            message:'User loged in successfully',
            data:{
                token,
                user,
            }
        });
    }catch(error){
        next(error);
    }
}

export const signOut = async(req,res,next)=>{
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',     
    });
    try{
        res.status(200).json({
            success:true,
            message:'Signed out successfully'
        });
    }catch(error){
        next(error);
    }
}

export const getMe = async(req,res)=>{
    if(!req.user){
        return res.status(401).json({success:false,
            message:'Unauthorized'
        });
    }

    return res.json({
        success:true,
        user:{
            username:req.user.username,
            email:req.user.email
        },
    });
}