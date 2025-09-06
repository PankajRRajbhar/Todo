const cron = require("cron")
const Todo = require("../model/todo");
const Users = require("../model/users");
const moment = require("moment")

//runs every minutes
const job = new cron.CronJob('* * * * *', async () => {
    const dueDateTime = moment().startOf("minute").utc();
    const endOfDateTime = moment().endOf("minute").utc();

    console.log(dueDateTime, endOfDateTime);
    
	const reminders = await Todo.find({isDone: false, reminderDatetime: { "$gte": dueDateTime }, reminderDatetime: { "$lt": endOfDateTime }});

    for(const reminder of reminders) {
        const user = await Users.findById(reminder.createdBy);
        sendEmail(reminder, user);
    }
});


function sendEmail(payload, user) {
    console.log("Email for ", payload.title, user.email, user.name)
}

job.start();
module.exports = { job }