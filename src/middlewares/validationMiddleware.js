// src/middlewares/validationMiddleware.js
const Joi = require('joi');
const PLANS = require('../config/plans');

const schema = Joi.object({
    prompt: Joi.string().required(),
});

const validateInput = (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

const signupSchema = Joi.object({
    first_name: Joi.string().trim().required().messages({
        'string.base': 'First name must be a string',
        'string.empty': 'First name cannot be empty',
        'any.required': 'First name is required'
    }),
    last_name: Joi.string().trim().required().messages({
        'string.base': 'Last name must be a string',
        'string.empty': 'Last name cannot be empty',
        'any.required': 'Last name is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required'
    }),
    password: Joi.string()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .message('Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)')
        .required(),
    phone_number: Joi.string().optional(),
});

const validateSignup = (req, res, next) => {
    const { error } = signupSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }
    next();
};

const signinSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required'
    })
});

const validateSignin = (req, res, next) => {
    const { error } = signinSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }
    next();
};

const createSubscriptionSchema = Joi.object({
    plan: Joi.string().required().valid(...Object.values(PLANS)).messages({
        'any.required': 'Plan is required',
        'any.only': `Plan must be one of: ${Object.values(PLANS).join(', ')}`
    }),
    end_date: Joi.date().iso().required().greater('now').messages({
        'date.required': 'End date is required',
        'date.format': 'End date must be a valid ISO 8601 date',
        'date.greater': 'End date must be in the future'
    }),
    start_date: Joi.date().iso().required().greater('now').messages({
        'date.required': 'Start date is required',
        'date.format': 'Start date must be a valid ISO 8601 date',
        'date.greater': 'Start date must be in the future'
    }),
    provider: Joi.string().valid('PayPal', 'Stripe').required().messages({
        'any.required': 'Provider is required',
        'any.only': 'Provider must be either PayPal or Stripe'
    }),
    billing_period: Joi.string().valid('Monthly', 'Yearly').required().messages({
        'any.required': 'Billing period is required',
        'any.only': 'Billing period must be either Monthly or Yearly'
    })
});

const validateCreateSubscription = (req, res, next) => {
    const { error } = createSubscriptionSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }
    next();
};

const updateSubscriptionSchema = Joi.object(
    {
        plan: Joi.string().valid(...Object.values(PLANS)),
        end_date: Joi.date().iso().greater('now'),
        start_date: Joi.date().iso(),
        provider: Joi.string().valid('PayPal', 'Stripe'),
        billing_period: Joi.string().valid('Monthly', 'Yearly')
    }
).or('plan', 'end_date', 'start_date', 'provider', 'billing_period').messages({
    'object.missing': 'At least one of plan or end_date must be provided'
});

const validateUpdateSubscription = (req, res, next) => {
    const { error } = updateSubscriptionSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }
    next();
};

const createCatSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'Name is required'
    }),
    goal: Joi.string().required().messages({
        'any.required': 'Goal is required'
    }),
    photo: Joi.string(),
    issues_faced: Joi.string().allow(''),
    activity_level: Joi.string().required().messages({
        'any.required': 'Activity level is required'
    }),
    gender: Joi.string().valid('Male', 'Female').required().messages({
        'any.required': 'Gender is required',
        'any.only': 'Gender must be either Male or Female'
    }),
    age: Joi.number().integer().required().messages({
        'number.base': 'Age must be a number',
        'number.integer': 'Age must be an integer',
        'any.required': 'Age is required'
    }),
    country: Joi.string().required().messages({
        'any.required': 'Country is required'
    }),
    zipcode: Joi.string().required().messages({
        'any.required': 'Zipcode is required'
    }),
    breed: Joi.string().required().messages({
        'any.required': 'Breed is required'
    }),
    weight: Joi.number().positive().required().messages({
        'number.positive': 'Weight must be a positive number',
        'any.required': 'Weight is required'
    }),
    target_weight: Joi.number().positive().required().messages({
        'number.positive': 'Target weight must be a positive number',
        'any.required': 'Target weight is required'
    }),
    required_progress: Joi.string().required().messages({
        'any.required': 'Required progress is required'
    }),
    check_in_period: Joi.string().valid('Daily', 'Weekly', 'Bi-weekly', 'Monthly').required().messages({
        'any.only': 'Check-in period must be one of: Daily, Weekly, Bi-weekly, Monthly',
        'any.required': 'Check-in period is required'
    }),
    training_days: Joi.string().required().messages({
        'any.required': 'Training days is required'
    }),
    medical_conditions: Joi.string().allow(''),
    medications: Joi.string().allow(''),
    dietary_restrictions: Joi.string().allow(''),
    surgery_history: Joi.string().allow(''),
    items: Joi.string().allow('')
});

const validateCreateCat = (req, res, next) => {
    const { error } = createCatSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }
    next();
};

const updateCatSchema = Joi.object({
    name: Joi.string(),
    goal: Joi.string(),
    photo: Joi.string(),
    issues_faced: Joi.string().allow(''),
    activity_level: Joi.string(),
    gender: Joi.string().valid('Male', 'Female'),
    age: Joi.number().integer(),
    country: Joi.string(),
    zipcode: Joi.string(),
    breed: Joi.string(),
    weight: Joi.number().positive(),
    target_weight: Joi.number().positive(),
    required_progress: Joi.string(),
    check_in_period: Joi.string().valid('Daily', 'Weekly', 'Bi-weekly', 'Monthly'),
    training_days: Joi.string(),
    medical_conditions: Joi.string().allow(''),
    medications: Joi.string().allow(''),
    dietary_restrictions: Joi.string().allow(''),
    surgery_history: Joi.string().allow(''),
    items: Joi.string().allow('')
}).min(1);

const validateUpdateCat = (req, res, next) => {
    const { error } = updateCatSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }
    next();
};

const chatMessageSchema = Joi.object({
    conversation_id: Joi.number().required(),
    content: Joi.string().required(),
    role: Joi.string().valid('user', 'assistant').required()
});

const validateChatMessage = (req, res, next) => {
    const { error } = chatMessageSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ error: errors.join(', ') });
    }
    next();
};

const openaiChatSchema = Joi.object({
    catId: Joi.number().integer().required(),
    messages: Joi.array().items(Joi.object({
        role: Joi.string().valid('user', 'assistant').required(),
        content: Joi.string().required()
    })).min(1).required()
});

const validateOpenAIChat = (req, res, next) => {
    const { error } = openaiChatSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        if (errors.some(err => err.includes('"messages" must contain at least 1 items'))) {
            return res.status(400).json({ error: 'Messages must be a non-empty array' });
        }
        return res.status(400).json({ errors });
    }
    next();
};

const updateConversationSchema = Joi.object({
    started_at: Joi.date().iso(),
    messages: Joi.array().items(Joi.object({
        role: Joi.string().valid('user', 'assistant').required(),
        content: Joi.string().required()
    })).min(1).required()
});

const validateUpdateConversation = (req, res, next) => {
    const { error } = updateConversationSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ errors });
    }
    next();
};

module.exports = { validateInput, validateSignup, validateSignin, validateCreateSubscription, validateUpdateSubscription, validateCreateCat, validateUpdateCat, validateChatMessage, validateOpenAIChat, validateUpdateConversation };
