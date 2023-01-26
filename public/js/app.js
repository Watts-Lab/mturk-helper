//Setting up AWS. Docs: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/MTurk.html
//const config = require('./config.json');
import * as config from './config.json' assert { type: "json" };
import AWS from 'aws-sdk';
const region = "us-east-1";
//const aws_access_key_id = config;
//const aws_secret_access_key = process.env.YOUR_SECRET_KEY;
AWS.config.update({
    accessKeyId: config.access_key,
    secretAccessKey: config.secret_key,
    region: region,
    sslEnabled: true,
});
const sandbox = true; // WARNING Setting this to false could costs you money!
const endpoint = `https://${sandbox ? "mturk-requester-sandbox" : "mturk-requester"}.${region}.amazonaws.com`;
const mturk = new AWS.MTurk({ endpoint: endpoint });
//Create Local Server through express
const express = require("express");
const app = express();
app.use(express.static("public"));
app.listen(8080);
console.log("haihai, connected to server");
//getter command
//not really needed aways
/**
 * @returns The account balance
 *
*/
mturk.getAccountBalance((err, data) => {
    if (err)
        console.log(err, err.stack);
    else
        console.log("Balance:", data.AvailableBalance); // successful response
});
const params = {
    AssignmentDurationInSeconds: 60 * 30,
    Description: "STRING_VALUE",
    LifetimeInSeconds: 60 * 60,
    Reward: "0.01",
    Title: "Answer a quick question",
    AutoApprovalDelayInSeconds: 60 * 60 * 2,
    Keywords: "question, answer, research, etc",
    MaxAssignments: 10,
    QualificationRequirements: [],
    Question: `
        <ExternalQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd">
        <ExternalURL>https://${process.env.PROJECT_DOMAIN}.glitch.me</ExternalURL>
        <FrameHeight>400</FrameHeight>
        </ExternalQuestion>
    `,
};
// This will create a new hit based on the params above
mturk.createHIT(params, (err, data) => {
    if (err)
        console.log(err, err.stack);
    else {
        console.log(data);
        // This makes the HIT url and prints it
        const hitURL = `https://${sandbox ? "workersandbox" : "worker"}.mturk.com/projects/${data.HIT.HITGroupId}/tasks`;
        console.log("\nA task was created at:", hitURL);
    }
});
//List HITs (currently running, expired, done, etc)
/**
 * Returns a list of HITs and their status associated with the current account
 *
*/
// export async function getAccountBalance() {
//     return (await MTurk.send(new GetAccountBalanceCommand({}))).AvailableBalance;
// }
mturk.listHITs({}, (err, data) => {
    if (err)
        console.log(err, err.stack);
    else
        console.log("Active HITs: \n", data.HITs.filter((h) => h.HITStatus == "Assignable" || h.HITStatus == "Unassignable")); //not sure if leaving err and data types as any are the best practices
    console.log("\nfinished listing.");
});
