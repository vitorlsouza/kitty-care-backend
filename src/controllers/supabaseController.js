const supabaseService = require("../services/supabaseService");
const openaiService = require("../services/openaiService");

const signup = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    try {
        const { token, expiresIn } = await supabaseService.signupUser(
            first_name,
            last_name,
            email,
            password
        );
        res.status(201).json({ token, expiresIn });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            if (error.message === "Email already exists") {
                res.status(409).json({ error: "Email already in use" });
            } else if (
                error.message === "Invalid email format" ||
                error.message.startsWith("Password must be")
            ) {
                res.status(400).json({ error: error.message });
            } else {
                console.error(error);
                res.status(500).json({ error: "An unexpected error occurred" });
            }
        } else {
            console.error(error);
            res.status(500).json({ error: "An unexpected error occurred" });
        }
    }
};

const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await supabaseService.signinUser(email, password);

        if (result.error) {
            // Return the specific error to the client
            return res.status(401).json({ error: `${result.error}` });
        }

        res.json(result);
    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ error: "An error occurred during signin" });
    }
};

const getSubscription = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await supabaseService.getSubscription(userId);

        if (result.message) {
            return res.status(404).json({ message: result.message });
        }

        res.json(result);
    } catch (error) {
        console.error("Get subscription error:", error);
        res
            .status(500)
            .json({ error: "An error occurred while fetching the subscription" });
    }
};

const createSubscription = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { plan, end_date } = req.body;

        const subscription = await supabaseService.createSubscription(
            userId,
            plan,
            end_date
        );
        res.status(201).json(subscription);
    } catch (error) {
        if (error.message === "User already has a subscription") {
            res.status(400).json({ error: error.message });
        } else {
            console.error("Create subscription error:", error);
            res
                .status(500)
                .json({ error: "An error occurred while creating the subscription" });
        }
    }
};

const updateSubscription = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { plan, end_date } = req.body;

        const subscription = await supabaseService.updateSubscription(
            userId,
            plan,
            end_date
        );
        res.json(subscription);
    } catch (error) {
        if (error.message === "Subscription not found or user not authorized") {
            res.status(404).json({ error: error.message });
        } else {
            console.error("Update subscription error:", error);
            res
                .status(500)
                .json({ error: "An error occurred while updating the subscription" });
        }
    }
};

const deleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await supabaseService.deleteSubscription(id, userId);

        if (result.error) {
            return res.status(result.status).json({ error: result.error });
        }

        res.status(200).json({ message: "Subscription successfully deleted" });
    } catch (error) {
        console.error("Error in deleteSubscription controller:", error);
        if (error.message === "Subscription not found") {
            res.status(404).json({ error: "Subscription not found" });
        } else {
            res
                .status(500)
                .json({ error: "An error occurred while deleting the subscription" });
        }
    }
};

const getCats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await supabaseService.getCats(userId);

        if (result.message) {
            return res.status(404).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error("Get cats error:", error);
        res
            .status(500)
            .json({ error: "An error occurred while fetching the cats" });
    }
};

const createCat = async (req, res) => {
    try {
        const userId = req.user.userId;
        const catData = req.body;

        const cat = await supabaseService.createCat(userId, catData);

        const aiRecommendations = await openaiService.getRecommendations(cat);
        const updatedCat = await supabaseService.updateCatRecommendations(
            cat.id,
            aiRecommendations
        );

        res.status(201).json(updatedCat);
    } catch (error) {
        console.error("Create cat error:", error);
        res.status(500).json({ error: "An error occurred while creating the cat" });
    }
};

const updateCat = async (req, res) => {
    try {
        const userId = req.user.userId;
        const catId = req.params.id;
        const catData = req.body;

        const updatedCat = await supabaseService.updateCat(catId, userId, catData);
        res.json(updatedCat);
    } catch (error) {
        console.error("Update cat error:", error);
        if (error.message === "Cat not found or user not authorized") {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: "An error occurred while updating the cat" });
        }
    }
};

const deleteCat = async (req, res) => {
    try {
        const userId = req.user.userId;
        const catId = req.params.id;

        const result = await supabaseService.deleteCat(catId, userId);

        if (!result.success) {
            return res.status(result.status).json({ error: result.error });
        }

        res.status(200).json({ message: result.message });
    } catch (error) {
        console.error("Delete cat error:", error);
        res.status(500).json({ error: "An error occurred while deleting the cat" });
    }
};

const getConversations = async (req, res) => {
    try {
        const userId = req.user.userId;
        const conversations = await supabaseService.getConversations(userId);

        if (conversations.message) {
            return res.status(404).json({ message: conversations.message });
        }

        res.status(200).json(conversations);
    } catch (error) {
        console.error("Get conversations error:", error);
        res.status(500).json({ error: "An error occurred while fetching the conversations" });
    }
};

const postChatMessage = async (req, res) => {
    try {
        const { conversation_id, content, role } = req.body;
        const user_id = req.user.userId;

        // Check if the user exists
        const userExists = await supabaseService.checkUserExists(user_id);
        if (!userExists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await supabaseService.handleChatMessage(conversation_id, user_id, content, role);

        res.status(201).json(result);
    } catch (error) {
        console.error("Post chat message error:", error);
        if (error.message === "Conversation not found") {
            res.status(404).json({ error: error.message });
        } else {
            // Change this line to return 500 for unexpected errors
            res.status(500).json({ error: 'An error occurred while processing the chat message' });
        }
    }
};

const deleteConversation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const conversationId = req.params.id;

        const result = await supabaseService.deleteConversation(conversationId, userId);

        if (!result.success) {
            return res.status(result.status).json({ error: result.error });
        }

        res.status(200).json({ message: result.message });
    } catch (error) {
        console.error("Delete conversation error:", error);
        res.status(500).json({ error: "An error occurred while deleting the conversation" });
    }
};

const createConversation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const startedAt = new Date().toISOString();

        const conversation = await supabaseService.createNewConversation(userId, startedAt);

        res.status(201).json({ conversation_id: conversation.id });
    } catch (error) {
        console.error("Create conversation error:", error);
        res.status(500).json({ error: "An error occurred while creating the conversation" });
    }
};

const updateConversation = async (req, res) => {
    try {
        const conversationId = req.params.id;
        const userId = req.user.userId;
        const conversationData = req.body;

        const updatedConversation = await supabaseService.updateConversation(conversationId, userId, conversationData);
        res.status(200).json(updatedConversation);
    } catch (error) {
        console.error("Update conversation error:", error);
        res.status(500).json({ error: "An error occurred while updating the conversation" });
    }
};

module.exports = {
    signup,
    signin,
    getSubscription,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    getCats,
    createCat,
    updateCat,
    deleteCat,
    getConversations,
    postChatMessage,
    deleteConversation,
    createConversation,
    updateConversation
};
