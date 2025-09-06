const User = require("../model/users");
const Joi = require('joi')
const bcrypt = require('bcrypt');
const Jwt = require("jsonwebtoken");

const validateRegister = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
})

const validateLogin = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
})


exports.register = async (req, res, next) => {
    try {
        const { body: payload } = req;

        const validationResult = validateRegister.validate(payload);

        if (validationResult.error) return res.send({ status: 422, message: "Invalid payload" });

        const isUserExists = await User.findOne({ email: payload.email });
        if (isUserExists) return res.send({ status: 400, message: "User already exists." });

        payload.password = bcrypt.hashSync(payload.password, 10);
        const user = new User(payload);
        await user.save();

        return res.send({ status: 200, message: "User registered" });

    } catch (error) {
        console.log(error)
        next(error);
    }
}


exports.login = async (req, res, next) => {
    try {
        const { body: payload } = req;
        const validationResult = validateLogin.validate(payload);

        if (validationResult.error)
            return res.send({ status: 422, message: "Invalid payload" });

        const isUserExists = await User.findOne({ email: payload.email });

        if (!isUserExists || !bcrypt.compareSync(payload.password, isUserExists.password))
            return res.send({ status: 401, message: "Invalid email or password" });

        const token = Jwt.sign({ email: payload.email }, process.env.JWT_SECRET);
        return res.send({ message: "Logged in", status: 200, data: { token, userId: isUserExists._id }});
    } catch (error) {
        next(error);
    }
}
