// userController.js (ES Module)

import userModel from '../model/User.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utility/sendEmail.js';
import OTPModel from '../model/OTP.js';

export const registration = async (req, res) => {
  try {
    const reqBody = req.body;
    await userModel.create(reqBody);
    res.json({ status: 'Success', message: 'Registration Completed' });
  } catch (error) {
    res.json({ status: 'Failed', message: error });
  }
};

export const login = async (req, res) => {
  try {
    const reqBody = req.body;
    const user = await userModel.find(reqBody);
    if (user.length > 0) {
      const PayLoad = {
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        data: reqBody.email,
      };
      const token = jwt.sign(PayLoad, 'secret123');
      res.json({ status: 'Success', message: 'User Found', token });
    } else {
      res.json({ status: 'Failed', message: 'User not found' });
    }
  } catch (error) {
    res.json({ status: 'Failed', message: error });
  }
};

export const profileUpdate = async (req, res) => {
  try {
    const { email } = req.params;
    const reqBody = req.body;
    await userModel.updateOne({  email }, reqBody);
    res.json({ status: 'Success', message: 'Profile Updated' });
  } catch (error) {
    res.json({ status: 'Failed', message: error });
  }
};

export const profileDelete = async (req, res) => {
  try {
    const { email } = req.params;
    await userModel.deleteOne({ email });
    res.json({ status: 'Success', message: 'Profile Deleted' });
  } catch (error) {
    res.json({ status: 'Failed', message: error });
  }
};

export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ status: 'Failed', message: 'Email is required' });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 'Failed', message: 'User not found' });
    }

    res.json({ status: 'Success', data: user });
  } catch (error) {
    res.json({ status: 'Failed', message: error });
  }
};

export const profileDetails = async (req, res) => {
  try {
    const email = req.headers['email'];
    const result = await userModel.find({ email });
    res.json({ status: 'Success', data: result });
  } catch (error) {
    res.json({ status: 'Failed', message: error });
  }
};

export const viewUserList = async (req, res) => {
  try {
    const result = await userModel.find();
    res.json({ status: 'Success', data: result });
  } catch (error) {
    res.json({ status: 'Failed', message: error });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await userModel.find({ email });

    if (user.length > 0) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      await sendEmail(email, `Your PIN is = ${otp}`, 'Article Management Code');
      await OTPModel.create({ email, otp, status: 'Active' });
      res.json({ status: 'Success', message: 'OTP Sent' });
    } else {
      res.json({ status: 'Failed', message: 'No User Found' });
    }
  } catch (error) {
    res.json({ status: 'Failed', message: error });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.params;
    const user = await OTPModel.find({ email, otp, status: 'Active' });

    if (user.length > 0) {
      await OTPModel.updateOne({ email, otp }, { status: 'Verified' });
      res.json({ status: 'Success', message: 'Code Verified' });
    } else {
      res.json({ status: 'Failed', message: 'Invalid Code' });
    }
  } catch (error) {
    res.json({ status: 'Failed', message: error });
  }
};

export const passwordReset = async (req, res) => {
  try {
    const { email, otp, password } = req.params;
    const user = await OTPModel.find({ email, otp, status: 'Verified' });

    if (user.length > 0) {
      await OTPModel.deleteOne({ email, otp });
      await userModel.updateOne({ email }, { password });
      res.json({ status: 'Success', message: 'Password Updated' });
    } else {
      res.json({ status: 'Failed', message: 'Invalid Request' });
    }
  } catch (error) {
    res.json({ status: 'Failed', message: error });
  }
};
