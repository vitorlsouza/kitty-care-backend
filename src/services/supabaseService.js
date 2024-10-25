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
    getCatDetailsById
} = require("./supabaseConnection");
const { JWT_SECRET } = require("../config/config");
const openaiService = require('./openaiService');

const signupUser = async (first_name, last_name, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await createUserInDatabase(
            first_name,
            last_name,
            email,
            hashedPassword
        );
        if (!user) {
            throw new Error("Failed to create user");
        }

        const expiresIn = "1h";
        const token = jwt.sign({ userId: user.ID }, JWT_SECRET, { expiresIn });

        return { token, expiresIn }; // Return token and expiresIn directly
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

    const expiresIn = "1h";
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn });

    return { token, expiresIn };
};

const getSubscription = async (userId) => {
    const subscription = await getSubscriptionByUserId(userId);
    if (!subscription) {
        return { message: "No subscription found for this user." };
    }
    return subscription;
};

const createSubscription = async (userId, plan, endDate) => {
    const hasExistingSubscription = await checkExistingSubscription(userId);
    if (hasExistingSubscription) {
        throw new Error("User already has a subscription");
    }

    const subscription = await createSubscriptionForUserId(userId, plan, endDate);
    return subscription;
};

const updateSubscription = async (userId, plan, endDate) => {
    const subscription = await updateSubscriptionForUserId(userId, plan, endDate);
    if (!subscription) {
        throw new Error("Subscription not found or user not authorized");
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

const updateCatRecommendations = async (catId, recommendations) => {
    const cat = await updateCatRecommendationsByCatId(catId, recommendations);
    return cat;
};

const updateCat = async (catId, userId, catData) => {
    const updatedCat = await updateCatById(catId, userId, catData);
    if (!updatedCat) {
        throw new Error("Cat not found or user not authorized");
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
        return conversations.map(conv => ({
            conversation_id: conv.id,
            started_at: conv.started_at,
            messages: conv.messages
        }));
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
    createNewConversation
};
