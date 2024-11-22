const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  createUserInDatabase,
  findUserByEmail,
  getSubscriptionByUserId,
  checkExistingSubscription,
  createSubscriptionForUserId,
  updateSubscriptionForUserId,
  deleteSubscriptionForUserId,
  getCatsByUserId,
  createCatByUserId,
  updateCatRecommendationsByCatId,
  updateCatById,
  deleteCatById,
  getConversationsByUserId,
  createConversation,
  createMessage,
  getConversationById,
  findUserById,
  deleteConversationById,
  getCatDetailsById,
  getConversationsByConversationId,
  updateConversationById,
  uploadPhotoToSupabase,
  savePasswordResetToken,
  findPasswordResetToken,
  updateUserPassword,
  deletePasswordResetToken,
  resetPasswordForEmail,
} = require("./supabaseConnection");
const { JWT_SECRET } = require("../config/config");
const openaiService = require('./openaiService');
const { emailTransfer } = require("../config/email");
const { getResetPasswordHtmlTemplate } = require('../config/email');

const signupUser = async (first_name, last_name, email, password, phone_number) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await createUserInDatabase(
      first_name,
      last_name,
      email,
      hashedPassword,
      phone_number
    );
    if (!user) {
      throw new Error("Failed to create user");
    }

    const full_name = `${first_name} ${last_name}`;
    const expiresIn = "1h";
    const token = jwt.sign({ userId: user.id, email: user.email, full_name: full_name }, JWT_SECRET, { expiresIn });

    return { token, expiresIn };
  } catch (error) {
    if (
      error.message.includes("duplicate key value violates unique constraint")
    ) {
      throw new Error("Email already exists");
    }
    throw error;
  }
};

const signinUser = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) {
    // Instead of throwing an error, we'll return a specific message
    return { error: "User not found" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    // Return a different message for incorrect password
    return { error: "Incorrect password" };
  }

  const full_name = `${user.first_name} ${user.last_name}`;
  const expiresIn = "1h";
  const token = jwt.sign({ userId: user.id, email: user.email, full_name: full_name }, JWT_SECRET, { expiresIn });

  return { token, expiresIn };
};

const getSubscription = async (userId) => {
  const subscription = await getSubscriptionByUserId(userId);
  if (!subscription) {
    return { message: "No subscription found for this user." };
  }
  return subscription;
};

const createSubscription = async (userId, id, plan, endDate, startDate, provider, billingPeriod) => {
  try {
    const hasSubscription = await checkExistingSubscription(userId);
    if (hasSubscription) {
      return { success: false, error: 'User already has a subscription' };
    }

    const subscription = await createSubscriptionForUserId(userId, id, plan, endDate, startDate, provider, billingPeriod);
    return { success: true, data: subscription };
  } catch (error) {
    throw error;
  }
};

const updateSubscription = async (subscriptionId, userId, plan, endDate, startDate, provider, billingPeriod) => {
  const subscription = await updateSubscriptionForUserId(subscriptionId, userId, plan, endDate, startDate, provider, billingPeriod);
  if (!subscription) {
    throw new Error("Subscription not found");
  }
  return subscription;
};

const deleteSubscription = async (subscriptionId, userId) => {
  const result = await deleteSubscriptionForUserId(subscriptionId, userId);

  if (result.error === "not_found") {
    return { success: false, error: "Subscription not found", status: 404 };
  } else if (result.error === "not_authorized") {
    return {
      success: false,
      error: "User not authorized to delete this subscription",
      status: 403,
    };
  } else if (!result.success) {
    return {
      success: false,
      error: "Failed to delete subscription",
      status: 500,
    };
  }

  return {
    success: true,
    message: "Subscription deleted successfully",
    status: 200,
  };
};

const getCatDetails = async (userId, catId) => {
  try {
    const cat = await getCatDetailsById(userId, catId);
    if (!cat) {
      throw new Error("Cat not found");
    }
    return cat;
  } catch (error) {
    throw error;
  }
};

const getCats = async (userId) => {
  try {
    const cats = await getCatsByUserId(userId);
    return cats.length > 0 ? cats : { message: "No cats found for this user." };
  } catch (error) {
    throw error;
  }
};

const createCat = async (userId, catData) => {
  try {
    const cat = await createCatByUserId(userId, catData);
    return cat;
  } catch (error) {
    throw error;
  }
};

const uploadPhoto = async (catId, photoData) => {
  try {
    if (!photoData) {
      throw new Error('Invalid photo data');
    }
    const result = await uploadPhotoToSupabase(catId, photoData);
    return result;
  } catch (error) {
    throw error;
  }
};

const updateCatRecommendations = async (catId, recommendations) => {
  const cat = await updateCatRecommendationsByCatId(catId, recommendations);
  return cat;
};

const updateCat = async (catId, userId, catData) => {
  const updatedCat = await updateCatById(catId, userId, catData);
  if (!updatedCat) {
    throw new Error("Cat not found");
  }

  // Check if we need to update AI recommendations
  if (catData.weight || catData.target_weight || catData.activity_level) {
    const aiRecommendations = await openaiService.getRecommendations(updatedCat);
    const finalUpdatedCat = await updateCatRecommendationsByCatId(catId, aiRecommendations);
    return finalUpdatedCat;
  }

  return updatedCat;
};

const deleteCat = async (catId, userId) => {
  const result = await deleteCatById(catId, userId);

  if (result.error === "not_found") {
    return { success: false, error: "Cat not found", status: 404 };
  } else if (result.error === "not_authorized") {
    return {
      success: false,
      error: "User not authorized to delete this cat",
      status: 403,
    };
  } else if (!result.success) {
    return {
      success: false,
      error: "Failed to delete cat",
      status: 500,
    };
  }

  return {
    success: true,
    message: "Cat deleted successfully",
    status: 200,
  };
};

const getConversations = async (userId) => {
  try {
    const conversations = await getConversationsByUserId(userId);
    return conversations.length > 0 ? conversations : { message: "No conversations found for this user." };
  } catch (error) {
    throw error;
  }
};

const handleChatMessage = async (conversation_id, user_id, content, role) => {
  try {
    // First, check if the conversation exists
    const conversationExists = await checkConversationExists(conversation_id);
    if (!conversationExists) {
      throw new Error('Conversation not found');
    }

    const newMessage = await createMessage(conversation_id, user_id, content, role);

    return {
      conversation_id: conversation_id,
      message: newMessage
    };
  } catch (error) {
    console.error("Error in handleChatMessage:", error);
    throw error;
  }
};

const checkUserExists = async (userId) => {
  const user = await findUserById(userId);
  return user !== null;
};

const checkConversationExists = async (conversationId) => {
  const conversation = await getConversationById(conversationId);
  return conversation !== null;
};

const deleteConversation = async (conversationId, userId) => {
  const result = await deleteConversationById(conversationId, userId);

  if (result.error === "not_found") {
    return { success: false, error: "Conversation not found", status: 404 };
  } else if (result.error === "not_authorized") {
    return {
      success: false,
      error: "User not authorized to delete this conversation",
      status: 403,
    };
  } else if (!result.success) {
    return {
      success: false,
      error: "Failed to delete conversation",
      status: 500,
    };
  }

  return {
    success: true,
    message: "Conversation deleted successfully",
    status: 200,
  };
};

const createNewConversation = async (userId, startedAt) => {
  try {
    const conversation = await createConversation(userId, startedAt);
    return conversation;
  } catch (error) {
    console.error("Error in createNewConversation:", error);
    throw error;
  }
};

const updateConversation = async (conversationId, userId, messages) => {
  try {
    for (const message of messages) {
      await createMessage(conversationId, userId, message.content, message.role);
    }

    return { success: true, message: "Conversation updated successfully" };
  } catch (error) {
    if (error.message.includes("messages_conversation_id_fkey")) {
      return null; // This will be caught in the controller and return a 404
    }
    throw error;
  }
};

const getConversationByConversationId = async (userId, conversationId) => {
  try {
    const conversation = await getConversationsByConversationId(userId, conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    return conversation;
  } catch (error) {
    if (error.code === 'PGRST116') {
      return null; // Conversation not found
    }
    throw error;
  }
};

const requestPasswordReset = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) {
    return { error: true, message: "User not found" };
  }

  const expiresIn = "1h";
  const full_name = user.first_name + user.last_name;
  const token = jwt.sign({ userId: user.id, email: user.email, full_name: full_name }, JWT_SECRET, { expiresIn });

  // Calculate expiration timestamp
  const unit = expiresIn.slice(-1);
  let value = parseInt(expiresIn.slice(0, -1)); // Change `const` to `let`

  switch (unit) {
    case 'd':
      value = value * 24 * 60 * 60 * 1000; // Days to milliseconds
      break;
    case 'h':
      value = value * 60 * 60 * 1000; // Hours to milliseconds
      break;
    case 'm':
      value = value * 60 * 1000; // Minutes to milliseconds
      break;
    case 's':
      value = value * 1000; // Seconds to milliseconds
      break;
    default:
      value = value * 60 * 60 * 1000; // Default to hours if no unit is found
      break;
  }

  console.log(unit, value);

  // Check if value is a valid number
  if (isNaN(value)) {
    return { error: true, message: "Invalid expiration time format" };
  }

  const expirationTime = new Date(Date.now() + value); // Calculate expiration time

  // If expirationTime is invalid
  if (isNaN(expirationTime.getTime())) {
    return { error: true, message: "Invalid expiration time" };
  }

  // Save token and expiration in the database (pseudo-code)
  await savePasswordResetToken(user.id, token, expirationTime);

  // Send email (pseudo-code)
  let mailOptions = {
    from: `"Kitty Care App" <${process.env.SMTP_USERNAME}>`,
    to: user.email,
    subject: 'Password Reset',
    html: getResetPasswordHtmlTemplate(token), // Generate the HTML using the token
  };

  // Send mail
  try {
    let info = await emailTransfer.sendMail(mailOptions);
    console.log("Email sent", info);
    return { success: true, message: "Password reset email sent" };
  } catch (error) {
    console.error('Error occurred: ', error);
    return { error: true, message: "Failed to send email" };
  }
};

const resetPassword = async (token, newPassword) => {
  // Find token in the database and check expiration (pseudo-code)
  const resetToken = await findPasswordResetToken(token);
  console.log(resetToken, resetToken.expires);

  if (!resetToken || resetToken.expires < Date.now()) {
    // throw new Error("Token is invalid or has expired");
    return { success: false, message: "Token is invalid or has expired" }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(resetToken.user_id, hashedPassword);

  // Optionally, delete the token after use
  await deletePasswordResetToken(token);

  return { success: true, message: "Password has been reset" };
};

module.exports = {
  signupUser,
  signinUser,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getCats,
  createCat,
  updateCatRecommendations,
  updateCat,
  deleteCat,
  getConversations,
  handleChatMessage,
  checkUserExists,
  checkConversationExists,
  deleteConversation,
  getCatDetails,
  createNewConversation,
  updateConversation,
  createConversation,
  getConversationByConversationId,
  uploadPhoto,
  requestPasswordReset,
  resetPassword,
};
