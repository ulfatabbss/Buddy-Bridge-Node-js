const User = require("../models/userModel");
const accountSid = "AC3d453bc9c39269da8d59aaad72d589a5"; // Use environment variables for sensitive data
const authToken = "76f71f04cf13ed23e2e50ee69f3512de";
const twilioClient = require('twilio')(accountSid, authToken);

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
// Send OTP function (update this based on your implementation)
async function sendOTP(phoneNumber, otp) {
  twilioClient.messages
    .create({
      body: `Your verification code is: ${otp}`,
      messagingServiceSid: 'MG492c74914ffc587d5bfd3ac20dd12ce0',
      // from: process.env.TWILIO_PHONE_NUMBER, // Use an environment variable here
      to: phoneNumber,
    })

  // Implement logic to send OTP to the user's phone number
  console.log(`Sending OTP ${otp} to ${phoneNumber}`);
  // You might use a third-party service or another mechanism for sending OTPs
}
module.exports.confirmRegistration = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  // Step 1: Find the user by phone number
  const user = await User.findOne({ phoneNumber });

  if (!user) {
    return res.status(404).send({
      statusCode: 404,
      error: "User not found."
    });
  }
  // console.log(user);
  // Step 2: Verify the entered OTP directly from the user's record
  if (user.otpHash !== otp) {
    // Handle OTP verification failure
    return res.status(400).send({
      statusCode: 400,
      error: "Invalid OTP. Registration failed."
    });
  }
  user.isNumberVerified = true;
  // Step 3: Update user profile or perform any other necessary actions
  await user.save();
  // ... Update user profile as needed
  console.log(user);
  // Step 4: Return success response to the client
  return res.status(200).send({
    data: user,
    statusCode: 200,
    message: "Registration completed successfully."
  })
};

module.exports.register = async (req, res) => {
  const { phoneNumber } = req.body;

  // Step 1: Check if user with the provided phone number already exists
  const existedUser = await User.findOne({ phoneNumber });

  if (existedUser) {
    // Change the error response
    return res.send({
      statusCode: 409,
      error: "User with this phone number already exists",
      data: []
    });
  }

  // Step 2: Generate OTP
  const otp = generateOTP();

  // Step 3: Save user details with the generated OTP
  const user = await User.create({
    phoneNumber,
    otpHash: otp,
  });

  // Step 4: Send the OTP to the user's phone number (implement this function)
  await sendOTP(phoneNumber, otp);

  // Step 5: Return success response to the client
  return res.send({
    statusCode: 200,
    message: "OTP send successfully."
  });
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "_id",
      "avatar",
      "phoneNumber",
      "username",
      "bio"
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};

module.exports.completeUserProfile = async (req, res) => {
  const { name, bio } = req.body;
  const userId = req.body.id;

  // Check if the user's phone number is verified
  const user = await User.findById(userId);
  console.log(user);
  if (!user || !user.isNumberVerified) {
    return res.status(404).send({
      statusCode: 404,
      error: "User not found."
    });
  }

  // Update the user's profile details
  user.username = name;
  user.bio = bio;

  // Check if the user has uploaded a new avatar
  if (req.file?.filename) {
    const avatarUrl = getStaticFilePath(req, req.file.filename);
    const avatarLocalPath = getLocalPath(req.file.filename);

    // Remove the old avatar
    removeLocalFile(user.avatar.localPath);

    // Update the user's avatar
    user.avatar = {
      url: avatarUrl,
      localPath: avatarLocalPath,
    };
  }

  // Save the updated user profile
  const updatedUser = await user.save({ validateBeforeSave: false });

  return res.send({
    statusCode: 200,
    data: updatedUser, // Use the updated user's ID
    message: "User profile completed successfully."
  });
};
module.exports.resendOtpVerification = (async (req, res) => {
  const { phoneNumber } = req.user;

  const user = await User.findOne({ phoneNumber });

  if (!user) {
    return res.status(404).send({
      statusCode: 404,
      error: "User not found."
    });
  }

  // Check if the phone number is already verified
  if (user.isNumberVerified) {
    throw new ApiError(409, "Phone number is already verified!");
  }

  // Generate a new OTP
  const otp = generateOTP();

  // Update the user's OTP in the database
  user.otpHash = otp;
  await user.save({ validateBeforeSave: false });

  // Send the new OTP to the user's phone number
  await sendOTP(phoneNumber, otp);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "New OTP has been sent to your phone number"));
});

// Replace the old export with the new one