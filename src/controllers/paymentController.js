const stripeService = require('../services/stripeService');

const createStripeSubscription = async (req, res) => {
    try {
        const { name, email, paymentMethodId, priceId, trial_end } = req.body;

        const result = await stripeService.createSubscription({
            name,
            email,
            paymentMethodId,
            priceId,
            trial_end
        });

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.status(201).json({ success: true, subscriptionId: result.id });
    } catch (error) {
        console.error("Subscription creation error:", error);
        res.status(500).json({ error: error.message });
    }
};

const cancelStripeSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Subscription ID is required" });
        }

        console.log("id", id);
        const result = await stripeService.cancelSubscription(id);
        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.status(200).json({
            success: true,
            subscriptionId: result.id,
            status: result.status
        });
    } catch (error) {
        console.error("Subscription cancellation error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createStripeSubscription,
    cancelStripeSubscription
}; 