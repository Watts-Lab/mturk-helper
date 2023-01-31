/** @format */
import * as mturk from "./mturk.js" ;
import { readFile } from "fs/promises";
//import { json, urlencoded } from "body-parser";
import {parse} from "csv-parse";

const pilot_date = "2023-01-17";


const parseCSV = (csvData: string): Promise<[object]> => {
    return new Promise((resolve, reject) => {
      parse(csvData, { columns: true }, (err, JSONData) => {
        if (err) reject(err);
        resolve(JSONData);
      });
    });
  };

async function main() {
  try {
    console.log(await mturk.getAccountBalance());
    let params = {
        AssignmentDurationInSeconds: 60 * 30,
        Description: "STRING_VALUE",
        LifetimeInSeconds: 60 * 60,
        Reward: "0.01", //this is how much the hit will pay out to a worker. We try to pay $15/hour.
        Title: "Answer a quick question",
        AutoApprovalDelayInSeconds: 60 * 60 * 2,
        Keywords: "question, answer, research, etc",
        MaxAssignments: 10,
        QualificationRequirements: [], // add 'qualification' in the brackets to enable it.
        Question: `
          <ExternalQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd">
            <ExternalURL>https://${process.env.PROJECT_DOMAIN}.glitch.me</ExternalURL>
            <FrameHeight>400</FrameHeight>
          </ExternalQuestion>
        `,
      };
    console.log(await mturk.createHIT(params));
    console.log(await mturk.listHITs());
    console.log(await mturk.listWorkersWithQualificationType("xxxx"));//

    
    // const bonus_worker_list = await readFile("payments_01_17.csv")
    //   .then((buffer) => buffer.toString())
    //   .then(parseCSV);

    // Bonus each worker in bonus_workers the amount in the bonus column
    // bonus_worker_list.forEach((individual, index) =>
    //   setTimeout(() => {
    //     bonusWorker(
    //       individual.WorkerId,
    //       individual.assignment_id,
    //       individual.bonus,
    //       `${individual.WorkerId} ${pilot_date} pilot`,
    //       `Bonus for games on ${pilot_date}`
    //     );
    //   }, index * 100)
    // );






    // Expects a CSV with format: WorkerID,Subject,MessageText
    // const notify_worker_list = await readFile("---.csv")
    //   .then((buffer) => buffer.toString())
    //   .then(parseCSV);

    // // Used slice to manage who to notify, but we can do this from the used file instead.
    // notify_worker_list.forEach((individual, index) =>
    //   setTimeout(() => {
    //     notifyWorkers(
    //       [individual.WorkerId], // notify expects a list of workers.
    //       individual.Subject,
    //       individual.MessageText
    //     )
    //       .then((response) =>
    //         response.NotifyWorkersFailureStatuses.forEach((worker_response) =>
    //           console.log(
    //             `${worker_response.WorkerId},"${
    //               worker_response.NotifyWorkersFailureCode
    //             }","${worker_response.NotifyWorkersFailureMessage}",${Date()}`
    //           )
    //         )
    //       )
    //       .catch((err) =>
    //         console.log(`${individual.WorkerId},${err.TurkErrorCode}`)
    //       );
    //   }, index * 100)
    // );
  } catch (error) {
    console.error(error);
  }
}

main();
