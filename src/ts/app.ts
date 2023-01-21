//Setting up AWS. Docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/MTurk.html
const config = require('./config.json');
import AWS from 'aws-sdk';
const region = "us-east-1";
//const aws_access_key_id = config;
//const aws_secret_access_key = process.env.YOUR_SECRET_KEY;
AWS.config.update ({
  accessKeyId: config.access_key,
  secretAccessKey: config.secret_key,
  region: region,
  sslEnabled: true,
});
const sandbox = true; // WARNING Setting this to false could costs you money!
const endpoint = `https://${
  sandbox ? "mturk-requester-sandbox" : "mturk-requester"
}.${region}.amazonaws.com`;
const mturk = new AWS.MTurk({ endpoint: endpoint });


//Create Local Server through express
const express = require("express");
const app = express();
app.use(express.static("public"));
const listener = app.listen(8080);

console.log("haihai");

//getter command
//List HITs (currently running, expired, done, etc)
/**
 * Returns a list of HITs and their status associated with the current account
 *
 * @param x - The first input number
 * @param y - The second input number
 * @returns The arithmetic mean of `x` and `y`
 *
*/
mturk.listHITs({}, (err: any, data:any) => {
    if (err) console.log(err, err.stack);
    else
      console.log(
        "Active HITs: \n",
        data.HITs.filter((h:any) => h.HITStatus == "Assignable" || h.HITStatus == "Unassignable")
      ); //not sure if leaving err and data types as any are the best practices
      console.log("\nfinished listing.");
  });
console.log("hai");
