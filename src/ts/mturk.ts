import {
    SendBonusCommand,
    MTurkClient,
    GetAccountBalanceCommand,
    ListHITsCommand,
    ListQualificationTypesCommand,
    ListWorkersWithQualificationTypeCommand,
    AssociateQualificationWithWorkerCommand,
    DisassociateQualificationFromWorkerCommand,
    CreateHITCommand,
    NotifyWorkersCommand,
    NotifyWorkersCommandInput,
    CreateHITCommandInput,
    CreateQualificationTypeCommand,
    GetHITCommand,
    CreateAdditionalAssignmentsForHITCommand,
    ListAssignmentsForHITCommand,
  } from "@aws-sdk/client-mturk";


  const config = require('./config');
  const region =  "us-east-1";
  const sandbox = config.sandbox; // WARNING Setting this to false could costs you money!
  const endpoint = `https://${sandbox ? "mturk-requester-sandbox" : "mturk-requester"}.${region}.amazonaws.com`;

  const MTurk = new MTurkClient({
    region : "us-east-1",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: endpoint,
  });


  export async function getAccountBalance() {
    return (await MTurk.send(new GetAccountBalanceCommand({}))).AvailableBalance;
  }

  /** HITS **/
  export async function listHITs() {
    return await MTurk.send(new ListHITsCommand({}));
  }

  export async function getHIT(HITId: string) {
    return await MTurk.send(
      new GetHITCommand({
        HITId: HITId,
      })
    );
  }

  export async function createHIT(params: CreateHITCommandInput) {
    return await MTurk.send(new CreateHITCommand(params));
  }

  export async function createAdditionalAssignmentsForHIT(
    HITId: string,
    NumberOfAdditionalAssignments: number
  ) {
    return await MTurk.send(
      new CreateAdditionalAssignmentsForHITCommand({
        HITId,
        NumberOfAdditionalAssignments,
      })
    );
  }

//   export async function listAssignmentsForHIT(
//     HITId: string,
//     MaxResults = 100,
//     NextToken = null
//   ) {
//     return await MTurk.send(
//       new ListAssignmentsForHITCommand({
//         HITId,
//         MaxResults,
//         NextToken,
//       })
//     );
//   }



  export async function notifyWorkers(
    WorkerIds: string[],
    Subject: string,
    MessageText: string
  ) {
    return await MTurk.send(
      new NotifyWorkersCommand({
        WorkerIds: WorkerIds,
        Subject: Subject,
        MessageText: MessageText,
      })
    );
  }

  export async function notifyAllWorkers(
    WorkerIds: string[],
    Subject: string,
    MessageText: string
  ) {
    [...Array(Math.ceil(WorkerIds.length / 100))]
      .fill(null)
      .forEach((workers_to_notify, i) => {
        setTimeout(() => {
          console.log(`Notifying group ${i}`);
          notifyWorkers(
            WorkerIds.slice(i * 100, (i + 1) * 100),
            Subject,
            MessageText
          );
        }, i * 50);
      });
    // define WorkerIds into lists of length 100
    // notify each sub list
    // delay notifications by 100ms between each list
  }

  /**  QUALIFICATIONS **/

  /* Qualification Type Querying*/
//   export async function listQualificationTypes(
//     query: string,
//     MustBeOwnedByCaller = true,
//     MustBeRequestable = false,
//     MaxResults = 100
//   ) {
//     let numResults = MaxResults;
//     let nextToken = null;
//     let response = [];
//     while (numResults == MaxResults) {
//       const result = await MTurk.send(
//         new ListQualificationTypesCommand({
//           Query: query,
//           MustBeOwnedByCaller: MustBeOwnedByCaller,
//           MustBeRequestable: MustBeRequestable,
//           MaxResults: MaxResults,
//           NextToken: nextToken,
//         })
//       );
//       nextToken = result.NextToken;
//       numResults = result.NumResults;
//       response = response.concat(result.QualificationTypes);
//     }
//     return response;
//   }

  /* Qualification Creation, Deletion, Listing */
  export async function listAllOwnedQualificationTypes(
    MustBeRequestable: boolean,
    MustBeOwnedByCaller = true,
    MaxResults = 100
  ) {
    const result = await MTurk.send(
      new ListQualificationTypesCommand({
        MustBeRequestable,
        MustBeOwnedByCaller,
        MaxResults,
      })
    );

    console.log(result.QualificationTypes);
    return result.QualificationTypes;
  }

//   export async function listWorkersWithQualificationType(
//     QualificationTypeId: string,
//     MaxResults = 100
//   ) {
//     let numResults = MaxResults;
//     let nextToken = null;
//     let response = [];
//     while (numResults == MaxResults) {
//       const result = await MTurk.send(
//         new ListWorkersWithQualificationTypeCommand({
//           QualificationTypeId: QualificationTypeId,
//           MaxResults: MaxResults,
//           NextToken: nextToken,
//         })
//       );
//       nextToken = result.NextToken;
//       numResults = result.NumResults;
//       response = response.concat(result.Qualifications);
//     }
//     return response;
//   }

  export async function createQualificationType(
    Name: string,
    Description: string,
    Keywords: string,
    QualificationTypeStatus: string
  ) {
    return await MTurk.send(
      new CreateQualificationTypeCommand({
        Name,
        Description,
        Keywords,
        QualificationTypeStatus,
      })
    );
  }

  /* Qualification Interaction With Workers */

  export async function associateQualificationWithWorker(
    QualificationTypeId: string,
    WorkerId: string,
    IntegerValue = 0,
    SendNotification = false
  ) {
    return await MTurk.send(
      new AssociateQualificationWithWorkerCommand({
        QualificationTypeId: QualificationTypeId,
        WorkerId: WorkerId,
        IntegerValue: IntegerValue,
        SendNotification: SendNotification,
      })
    );
  }

  export async function disassociateQualificationWithWorker(
    QualificationTypeId: string,
    WorkerId: string,
    Reason: string
  ) {
    console.log(QualificationTypeId);
    console.log(WorkerId);
    return await MTurk.send(
      new DisassociateQualificationFromWorkerCommand({
        QualificationTypeId: QualificationTypeId,
        WorkerId: WorkerId,
        Reason: Reason,
      })
    );
  }

  export async function bonusWorker(
    WorkerId: string,
    AssignmentId: string,
    BonusAmount: string | number,
    UniqueRequestToken: string,
    Reason: string = ""
  ) {
    return await MTurk.send(
      new SendBonusCommand({
        WorkerId: WorkerId,
        AssignmentId: AssignmentId,
        BonusAmount: String(Number(BonusAmount).toFixed(2)),
        Reason: Reason,
        UniqueRequestToken: UniqueRequestToken,
      })
    )
      .then((response) =>
        console.log(
          `Sent $${String(
            Number(BonusAmount).toFixed(2)
          )} bonus to ${WorkerId} for ${UniqueRequestToken}`
        )
      )
      .catch((err) => {
        if (!err.message.includes("has already been processed"))
          console.log(err.message);
      });
  }
