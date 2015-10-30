var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('cUs1A56odFwLyTOVB2p_Tg');

var fs = require('fs');
var ejs = require('ejs');

var tumblr = require('tumblr.js');
var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.html', 'utf8');

//Authenticate via OAuth
var jesspark = tumblr.createClient({
  consumer_key: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  consumer_secret: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  token: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  token_secret: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
});

//parse through file and separate contacts into individual objects
function csvParse(fileContent) {
	var lines = fileContent.split('\n');
	var contacts = [];
	for (var i = 1; i < lines.length; i++) {
		var line = lines[i].split(',');
		var info = {};
		info.firstName = line[0];
		info.lastName = line[1];
		info.numMonthsSinceContact = line[2];
		info.emailAddress = line[3];
		contacts.push(info);
	}
	return contacts;
}

//no longer needed with ejs...
// addressBook.forEach(function(person) {
// 	var firstName = person["firstName"];
// 	var numMonthsSinceContact = person["numMonthsSinceContact"];
// 	var tempCopy = emailTemplate;
// 	tempCopy = tempCopy.replace(/FIRST_NAME/gi, firstName).replace(/NUM_MONTHS_SINCE_CONTACT/gi, numMonthsSinceContact);
// 	console.log(tempCopy);
// });

//go through blog posts and save recent in last 7 days into latestPosts array
jesspark.posts('wonmivscode.tumblr.com', function(error, blog){
	//array of most recent posts
	var latestPosts = [];
	//check for most recent posts in last seven days
	blog.posts.forEach(function(post) {
		var titleAndPost = {};
		var today = Date.parse(new Date());
	  	var current = Date.parse(post.date);
	  	if ((today - current) < 518400000) {
	  		titleAndPost.title = post.title;
	  		titleAndPost.href = post.post_url;
	  		latestPosts.push(titleAndPost);
	  	}
	});

	//call csvParse on file with contact list
	addressBook = csvParse(csvFile);

	addressBook.forEach(function(friend) {
		firstName = friend['firstName'];
		numMonthsSinceContact = friend['numMonthsSinceContact'];
		tempCopy = emailTemplate;
		
		//call ejs.render on emailTemplate to replace firstName, numMonthsSinceContact, and latestPosts
		var customizedTemplate = ejs.render(tempCopy, 
		   { firstName: firstName,  
		     numMonthsSinceContact: numMonthsSinceContact,
		     latestPosts: latestPosts
		   });
		sendEmail(firstName, friend['emailAddress'], "Jessica Wonmi Park", "wonmipark@gmail.com", "testing123", customizedTemplate);	
	});
});

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
	var message = {
	    "html": message_html,
	    "subject": subject,
	    "from_email": from_email,
	    "from_name": from_name,
	    "to": [{
	            "email": to_email,
	            "name": to_name
	        }],
	    "important": false,
	    "track_opens": true,    
	    "auto_html": false,
	    "preserve_recipients": true,
	    "merge": false,
	    "tags": [
	        "Fullstack_Tumblrmailer_Workshop"
	    ]    
	};
	var async = false;
	var ip_pool = "Main Pool";
	mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
	    	      
	}, function(e) {
	    // Mandrill returns the error as an object with name and message keys
	    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
	});
}