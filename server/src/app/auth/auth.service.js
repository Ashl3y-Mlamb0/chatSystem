const User = require("../../models/User"); // Import the User model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Secret for JWT (can be stored in .env file)
const JWT_SECRET = process.env.JWT_SECRET || "secr1e3tToSha!";

const authService = {
  // Register a new user
  register: async (username, email, password) => {
    // Check if the user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new Error("Username or email already taken");
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword, // Store hashed password
    });

    // Save the user to MongoDB
    await newUser.save();
    return { message: "User registered successfully" };
  },

  // Login user
  login: async (username, password) => {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("User not found");
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      {
        expiresIn: "1h", // Token expires in 1 hour
      }
    );

    return {
      message: "Login successful",
      token, // Return the JWT token
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles, // Return user roles if available
      },
    };
  },

  // Verify the JWT token (you can add this method if needed for protected routes)
  verifyToken: async (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (err) {
      throw new Error("Invalid token");
    }
  },
};

module.exports = authService;
