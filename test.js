var ejs = require('ejs'); // loading EJS into our project

var template = "Hi <%= firstName %>, I can't believe I haven't seen you for <%= numMonthsSinceContact %> months! We really gotta keep in touch better.\nAnyway, hit me up sometime and let's grab a cup of joe.\n David"

var emailTemplate = ejs.render(template, {
    firstName: "Scott",
    numMonthsSinceContact: 0
    })

console.log(emailTemplate)	