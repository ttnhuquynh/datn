const bcrypt = require("bcrypt");
const generateTokenAndSetCookie = require("../config/generateToken");
const User = require("../models/userModel");

const signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, avatar } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords don't match" });
    }

    const user = await User.findOne({ username });

    if (user) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // HASH PASSWORD HERE
    // const saltRounds = 10;
    // const hashedPassword = bcrypt.hashSync(password, saltRounds);

    // https://avatar-placeholder.iran.liara.run/
    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = new User({
      username,
      email,
      password,
      avatar: avatar ? avatar : girlProfilePic,
    });

    if (newUser) {
      // Generate JWT token here
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        avatar: newUser.avatar,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    // const isPasswordCorrect = bcrypt.compareSync(password, user.password);


    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      email: user.email,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const editProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = await User.findById(req.user._id);
    user.username = username; // update username
    user.avatar = avatar; // update avatar
    await user.save();
    res.status(200).json({ message: "Profile updated successfully" });  
  } catch (error) {
    console.log("Error in editProfile controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { signup, login, logout, editProfile };
