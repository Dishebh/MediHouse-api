const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');

require('dotenv').config();

const baseUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.BASE_URL_PROD
    : process.env.BASE_URL_DEV;

const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, profilePic, password } = req.body;

    const newUser = await User.create({
      name,
      email,
      profilePic,
      password,
    });

    createSendToken(newUser, 201, req, res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error!');
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(500).send('Please provide email and password!');
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(500).send('Incorrect email or password!');
    }

    return createSendToken(user, 200, req, res);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error!');
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now()),
    });

    req.logout();
    res.redirect(`${baseUrl}/dashboard`);

    // res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error!');
  }
};

exports.protect = async (req, res, next) => {
  try {
    // Get token and check if it's there in the req header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res
        .status(401)
        .send('You are not logged in! Please log in to continue');
    }

    // Token verification
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return res
        .status(401)
        .send('The user belonging to this token does not exist');
    }

    // Grant access to the protected route
    req.user = currentUser;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error!');
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error!');
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, {
      name: req.body.name || req.user.name || '',
      email: req.body.email || req.user.email || '',
      phoneNo: req.body.phoneNo || req.user.phoneNo || 0,
      profilePic: req.body.profilePic || req.user.profilePic || '',
      googleId: req.user.googleId || '',
      date: req.user.date || Date.now(),
    });

    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error!');
  }
};
