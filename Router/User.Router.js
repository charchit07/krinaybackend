const express = require("express");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const userRouter = express.Router();

const { validate: validateEmail } = require("email-validator");

userRouter.post("/register", async (req, res) => {
  const { name, last_name, email, password, phone } = req.body;

  // Regular expression for validating phone numbers
  const phoneRegex = /^[0-9]{10}$/;

  try {
    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).send({ msg: "Invalid email format" });
    }

    // Validate phone number format
    if (!phoneRegex.test(phone)) {
      return res
        .status(400)
        .send({
          msg: "Invalid phone number format. Phone number should be 10 digits.",
        });
    }

    // Check if user with the provided email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .send({ msg: "User already registered with this email" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user using Prisma client
    const newUser = await prisma.user.create({
      data: {
        name,
        last_name,
        email,
        password: hashedPassword,
        phone,
      },
    });

    res.send({ msg: "New user has been registered", user: newUser });
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong", error: error.message });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email using Prisma client
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      // Compare hashed password
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          // Generate JWT token
          const token = jwt.sign({ userID: user.id }, process.env.SECRETKEY);
          res.send({ msg: "Login Successful", token: token });
        } else {
          res.status(401).send({ msg: "Wrong Credentials" });
        }
      });
    } else {
      res.status(401).send({ msg: "Wrong Credentials" });
    }
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong", error: error.message });
  }
});

module.exports = userRouter;
