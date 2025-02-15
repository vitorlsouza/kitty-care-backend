const passport = require("passport");
const jwt = require("jsonwebtoken");
const { CLIENT_URL } = require("../config/config");

const authController = {
    googleAuth: passport.authenticate("google", {
        scope: ["profile", "email"],
        session: true,
    }),

    googleCallback: [
        passport.authenticate("google", {
            failureRedirect: `${CLIENT_URL}/login`,
            failureMessage: true,
        }),
        (req, res) => {
            if (!req.user) {
                return res.redirect(
                    `${CLIENT_URL}/login?error=Authentication failed`
                );
            }

            const token = jwt.sign(
                {
                    email: req.user.email,
                    name: req.user.name,
                    picture: req.user.picture,
                },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            const redirectUrl = new URL(`${CLIENT_URL}/auth/callback`);
            redirectUrl.searchParams.append("token", token);
            redirectUrl.searchParams.append("name", req.user.name);
            redirectUrl.searchParams.append("email", req.user.email);
            redirectUrl.searchParams.append("expiresIn", "86400");
            redirectUrl.searchParams.append("photo", req.user.picture || "");

            res.redirect(redirectUrl.toString());
        },
    ],

    logout: (req, res) => {
        try {
            req.logout(function (err) {
                if (err) {
                    console.error("Logout error:", err);
                    return res.status(500).json({
                        error: "Error logging out",
                        message: err.message,
                    });
                }

                if (req.session) {
                    req.session.destroy((sessionErr) => {
                        if (sessionErr) {
                            console.error(
                                "Session destruction error:",
                                sessionErr
                            );
                        }
                        res.json({
                            success: true,
                            message: "Logged out successfully",
                        });
                    });
                } else {
                    res.json({
                        success: true,
                        message: "Logged out successfully",
                    });
                }
            });
        } catch (error) {
            console.error("Logout error:", error);
            res.status(500).json({
                error: "Error logging out",
                message: error.message,
            });
        }
    },
};

module.exports = authController;
