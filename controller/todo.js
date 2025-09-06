const Joi = require('joi')
const moment = require("moment");
const Todo = require("../model/todo");

const validateCreate = Joi.object({
    title: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(2).required(),
    dueDate: Joi.date().raw().required(),
    reminderDatetime: Joi.date().raw()
})

const validateUpdate = Joi.object({
    id: Joi.string().hex().required(),
    title: Joi.string().min(2).max(100),
    description: Joi.string().min(2),
    reminderDatetime: Joi.date().raw()
});

const getTodoValidation = Joi.object({
    date: Joi.date().raw(),
    page: Joi.number().min(1).integer(),
    per_page: Joi.number().min(1).integer(),
});

const toggleValidation = Joi.object({
    id: Joi.string().hex().required(),
});

const validateDelete = Joi.object({
    id: Joi.string().hex().required(),
})

exports.create = async (req, res, next) => {
    try {
        let { body: payload, user } = req;
        const validationResult = validateCreate.validate(payload);
        if (validationResult.error) return res.send({ status: 422, message: "Invalid payload" });
        if(moment().isAfter(payload.dueDate) || (payload.reminderDatetime &&  moment().isAfter(payload.reminderDatetime))) 
            return res.send({ status: 422, message: "Duedate or reminder date cannot be of past date" });
        
        payload = {...payload, createdBy: user._id };
        const todo = new Todo(payload);
        await todo.save();
        return res.send({ status: 200, message: "Todo Created", data: todo });
    } catch (error) {
        console.log(error)
        next(error);
    }
}


exports.update = async (req, res, next) => {
    try {
        let { body: payload, user } = req;
        const validationResult = validateUpdate.validate(payload);
        if (validationResult.error) return res.send({ status: 422, message: "Invalid payload" });

        if(moment().isAfter(payload.dueDate) || (payload.reminderDatetime &&  moment().isAfter(payload.reminderDatetime))) 
            return res.send({ status: 422, message: "Duedate or reminder date cannot be of past date" });

        const isTodoExists = await Todo.findOne({ _id: payload.id, createdBy: user._id});        
        if(!isTodoExists) return res.send({ status: 422, message: "Invalid todo" });
        payload = {...payload, createdBy: user._id };

        await Todo.findByIdAndUpdate(payload.id, {$set: payload}, { _id: isTodoExists._id});
        return res.send({ status: 200, message: "Todo Updated" });
    } catch (error) {   
        console.log(error)
        next(error);
    }
}


exports.delete = async (req, res, next) => {
    try {
        let { query: payload, user } = req;
        const validationResult = validateDelete.validate(payload);
        if (validationResult.error) return res.send({ status: 422, message: "Invalid payload" });
        
        const isTodoExists = await Todo.findOne({_id: payload.id, createdBy: user._id});
        if(!isTodoExists) return res.send({ status: 422, message: "Invalid todo" });

        if(moment(isTodoExists.dueDate).utc().isBetween(moment().startOf("d").utc(), moment().endOf("d").utc(), null, '[]'))      
            return res.send({ status: 422, message: "Can only delete the record on due date." });
        
        return res.send({ status: 200, message: "Todo deleted." });
    } catch (error) {
        console.log(error)
        next(error);
    }
}

exports.getAll = async (req, res, next) => {
    try {   
        const { query: payload, user } = req;
        const validationResult = getTodoValidation.validate(payload);
        if (validationResult.error) return res.send({ status: 422, message: "Invalid payload" });

        let datePayload = {};
        if(payload.date) {
            let startDate =  moment(payload.date).startOf("D").utc();
            let endDate =  moment(payload.date).endOf("D").utc() 
            datePayload ={ dueDate: { "$gte": startDate }, dueDate: { "$lt": endDate }} 
        }
        const { page = 1, per_page=10 } = payload;
        const count = await Todo.countDocuments({ createdBy: user._id, ...datePayload});
        const todos = await Todo.find({ createdBy: user._id, ...datePayload}).limit(per_page).skip((page-1) *  per_page);
        const response = { message: "Todo list.", data: todos, pages: Math.ceil(count / per_page), page };
        return res.send(response)
    } catch (error) {
        console.log(error)
        next(error);
    }
}

exports.toggleDone = async (req, res, next) => {
    try {
        let { query: payload, user } = req;
        const validationResult = toggleValidation.validate(payload);
        if (validationResult.error) return res.send({ status: 422, message: "Invalid payload" });

        const isTodoExists = await Todo.findOne({_id: payload.id, createdBy: user._id});
        if(!isTodoExists) return res.send({ status: 422, message: "Invalid todo" });
        payload = {...payload, createdBy: user._id };

        await Todo.findByIdAndUpdate(payload.id, {$set: { isDone: !isTodoExists.isDone }}, { _id: isTodoExists._id});
        return res.send({ status: 200, message: "Todo status toggled." });
    } catch (error) {
        console.log(error)
        next(error);
    }
}
