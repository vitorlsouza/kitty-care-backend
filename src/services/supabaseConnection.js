const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const { SUPABASE_URL, SUPABASE_ANON_KEY } = require('../config/config');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = supabase;

module.exports.createUserInDatabase = async (first_name, last_name, email, hashedPassword, phone_number = null) => {
  const { data, error } = await supabase.from('users').insert({
    first_name: first_name,
    last_name: last_name,
    email: email,
    password: hashedPassword,
    phone_number: phone_number
  }).select().single();

  if (error) throw error;
  return data;
};

module.exports.findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;
  return data;
};

module.exports.getSubscriptionByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, plan, end_date, start_date, provider, billing_period')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data;
};

module.exports.checkExistingSubscription = async (userId) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data !== null;
};

module.exports.createSubscriptionForUserId = async (userId, id, plan, endDate, startDate, provider, billingPeriod) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      id: id,
      user_id: userId,
      plan: plan,
      end_date: endDate,
      start_date: startDate,
      provider: provider,
      billing_period: billingPeriod
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports.updateSubscriptionForUserId = async (subscriptionId, userId, plan, endDate, startDate, provider, billingPeriod) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ plan, end_date: endDate, start_date: startDate, provider, billing_period: billingPeriod })
    .eq('id', subscriptionId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return null;
  return data;
};

module.exports.deleteSubscriptionForUserId = async (subscriptionId, userId) => {
  // First, check if the subscription exists and belongs to the user
  const { data: existingSubscription, error: checkError } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('id', subscriptionId)
    .eq('user_id', userId)
    .single();

  if (checkError) {
    if (checkError.code === 'PGRST116') {
      return { error: 'not_found' };
    }
    throw checkError;
  }

  if (!existingSubscription) {
    return { error: 'not_authorized' };
  }

  // If the subscription exists and belongs to the user, delete it
  const { error: deleteError } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', subscriptionId)
    .eq('user_id', userId);

  if (deleteError) throw deleteError;
  return { success: true };
};

module.exports.getCatDetailsById = async (userId, catId) => {
  const { data, error } = await supabase
    .from('cats')
    .select('*')
    .eq('id', catId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

module.exports.getCatsByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('cats')
    .select('id, name, photo, goals, issues_faced, required_progress, food_bowls, treats, playtime')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};

module.exports.createCatByUserId = async (userId, catData) => {
  const { data, error } = await supabase.from('cats').insert({ ...catData, user_id: userId }).select().single();
  if (error) throw error;
  return data;
};

module.exports.updateCatRecommendationsByCatId = async (catId, recommendations) => {
  const { food_bowls, treats, playtime } = recommendations;

  const { data, error } = await supabase
    .from('cats')
    .update({ food_bowls, treats, playtime })
    .eq('id', catId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

module.exports.updateCatById = async (catId, userId, catData) => {
  const { data, error } = await supabase
    .from('cats')
    .update(catData)
    .eq('id', catId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return null;
  return data;
};

module.exports.deleteCatById = async (catId, userId) => {
  // First, check if the cat exists and belongs to the user
  const { data: existingCat, error: checkError } = await supabase
    .from('cats')
    .select('id')
    .eq('id', catId)
    .eq('user_id', userId)
    .single();

  if (checkError) {
    if (checkError.code === 'PGRST116') {
      return { error: 'not_found' };
    }
    throw checkError;
  }

  if (!existingCat) {
    return { error: 'not_authorized' };
  }

  // If the cat exists and belongs to the user, delete it
  const { error: deleteError } = await supabase
    .from('cats')
    .delete()
    .eq('id', catId)
    .eq('user_id', userId);

  if (deleteError) throw deleteError;
  return { success: true };
};

module.exports.getConversationsByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
            id,
            started_at,
            messages (
                content,
                role,
                timestamp
            )
        `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return data;
};

module.exports.getConversationsByConversationId = async (userId, conversationId) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
            id,
            started_at,
            messages (
                content,
                role,
                timestamp
            )
        `)
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

module.exports.createConversation = async (userId, startedAt) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, started_at: startedAt })
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports.createMessage = async (conversation_id, user_id, content, role) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversation_id,
      user_id: user_id,
      content: content,
      role: role,
    })
    .select()
    .single();

  if (error) {
    console.error("Error in createMessage:", error);
    throw error;
  }
  return data;
};

module.exports.getConversationById = async (conversationId) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (error) return null;
  return data;
};

module.exports.findUserById = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
};

module.exports.deleteConversationById = async (conversationId, userId) => {
  const { data: existingConversation, error: checkError } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (checkError) {
    if (checkError.code === 'PGRST116') {
      return { error: 'not_found' };
    }
    throw checkError;
  }

  if (!existingConversation) {
    return { error: 'not_authorized' };
  }

  // If the conversation exists and belongs to the user, delete it and its messages
  const { error: deleteMessagesError } = await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', conversationId);

  if (deleteMessagesError) throw deleteMessagesError;

  const { error: deleteConversationError } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', userId);

  if (deleteConversationError) throw deleteConversationError;
  return { success: true };
};

module.exports.updateConversationById = async (conversationId, userId, started_at) => {
  const { data, error } = await supabase
    .from('conversations')
    .update({ started_at })
    .eq('id', conversationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports.uploadPhotoToSupabase = async (catId, photoData) => {
  if (!photoData) {
    throw new Error('Invalid photo data');
  }

  try {
    const fileExt = photoData.originalname.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `cat-photos/${catId}/${fileName}`;

    const buffer = Buffer.from(photoData.buffer);

    const { data, error } = await supabase.storage
      .from('Cats')
      .upload(filePath, buffer, {
        contentType: photoData.mimetype,
        upsert: false
      });

    if (error) {
      throw error;
    }
    const { data: { publicUrl } } = supabase.storage
      .from('Cats')
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: publicUrl
    };
  } catch (error) {
    throw new Error(`Failed to upload photo: ${error.message}`);
  }
};


module.exports.savePasswordResetToken = async (userId, token, expires) => {
  const { data, error } = await supabase.from("password_reset_tokens").insert({
    user_id: userId,
    token: token,
    expires: new Date(expires),
  });

  if (error) throw error;
  return data;
};

module.exports.findPasswordResetToken = async (token) => {
  const { data, error } = await supabase
    .from("password_reset_tokens")
    .select("user_id, expires")
    .eq("token", token)
    .single();

  if (error) return null;
  return data;
};

module.exports.updateUserPassword = async (userId, hashedPassword) => {
  const { data, error } = await supabase
    .from("users")
    .update({ password: hashedPassword })
    .eq("id", userId);

  if (error) throw error;
  return data;
};

module.exports.deletePasswordResetToken = async (token) => {
  const { error } = await supabase
    .from("password_reset_tokens")
    .delete()
    .eq("token", token);

  if (error) throw error;
  return { success: true };
};

module.exports.resetPasswordForEmail = async (email, token) => {
  // try {
  //   console.log("Email:", email);
  //   const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  //   //function is working correctly but in reality the email is not sent to mailbox. I will show you
  //   //function worked correctly but...

  //   console.log("Data:", data);
  //   if (error) throw error;
  //   return data;
  // } catch (err) {
  //   console.error("Password reset error:", err);
  //   throw err;
  // }

  // Create a transporter using SMTP details
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // e.g., smtp.mailtrap.io
    port: 587, // or 465 for secure,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'noreply@kittycareapp.com', // Your SMTP user
      pass: 'zwbq qqza djqs iuql', // Your SMTP password
    },
    logger: true,
    debug: true,
    connectionTimeout: 10000, // example of increasing timeout
    tls: {
      ciphers: 'SSLv3'
    }
  });

  // Define email content
  let mailOptions = {
    from: '"Kitty Care App" <noreply@kittycareapp.com>',
    to: email,
    subject: 'Password Reset',
    html: getHtmlTemplate(token), // Generate the HTML using the token
  };

  // Send mail
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error occurred: ', error);
  }
};

function getHtmlTemplate(token) {
  const cliUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  const resetLink = `${cliUrl}/reset-password?token=${token}`; // Your reset link
  return `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Password Reset</title>
    </head>

    <body
        style="width: 100%; height: 100%; margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
        <table width="100%" cellspacing="0" cellpadding="0" border="0"
            style="background-color: #f5f5f5; margin: 0; padding: 0; width: 100%; height: 100%;">
            <tr>
                <td align="center" style="padding: 20px;">
                    <table style="max-width: 700px; width: 100%; text-align: center;">
                        <!-- Header with Logo -->
                        <tr>
                            <td style="padding: 30px 0;">
                                <img src="https://flpayif.stripocdn.email/content/guids/CABINET_96e4ae211adee07311e554c4273ffe1ff40f2ad1112c01c052932c2ce82cf820/images/66ffff3c572c0bae3c48532a_image_12.png" alt="Logo" style="max-width: 200px; display: block; margin: 0 auto;">
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td>
                                <div
                                    style="background: #ffffff; margin: 0 auto; border-radius: 10px; padding: 20px; color: #333333; text-align: center;">
                                    <h1 style="font-size: 46px; margin-bottom: 15px; color: #333333;">Password Reset</h1>
                                    <p style="text-align: left; margin: 15px 0; font-size: 16px;">
                                        After you click the button, you'll be asked to complete the following steps:
                                    </p>
                                    <ol style="text-align: left; margin: 20px auto; padding-left: 50px; font-size: 16px;">
                                        <li style="margin-bottom: 10px;">Enter a new password.</li>
                                        <li style="margin-bottom: 10px;">Confirm your new password.</li>
                                        <li style="margin-bottom: 10px;">Click Submit.</li>
                                    </ol>
                                    <a href="${resetLink}" target="_blank"
                                        style="display: inline-block; background: #ff8706; color: #fff; text-decoration: none; padding: 10px 30px; font-size: 20px; border-radius: 6px; margin-top: 20px;">RESET
                                        YOUR PASSWORD</a>
                                    <h3 style="color: #333333; margin-top: 20px;">This link is valid for one use only and
                                        expires in 2 hours.</h3>
                                    <p style="text-align: center; margin: 15px 0; font-size: 14px;">
                                        If you didn't request to reset your password, please disregard this message or
                                        contact our customer service department.
                                    </p>
                                </div>

                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px; text-align: center; font-size: 12px; color: #cccccc;">
                                <p style="margin: 0;">No longer want to receive these emails? <a href="#"
                                        style="color: #cccccc; text-decoration: underline;">Unsubscribe</a>.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>

    </html>
  `;
}