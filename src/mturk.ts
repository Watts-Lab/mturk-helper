import {
    SendBonusCommand,
    MTurkClient,
    GetAccountBalanceCommand,
    ListBonusPaymentsCommand,
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
    CreateQualificationTypeCommandInput,
    GetHITCommand,
    CreateAdditionalAssignmentsForHITCommand,
    ListAssignmentsForHITCommand,
    Qualification,
    QualificationType,
    ListQualificationTypesResponse,
    HIT
  } from "@aws-sdk/client-mturk";


  import config from './config.json' assert {type:"json"};
  const region =  "us-east-1";
  const sandbox = config.sandbox; // Setting this to false could costs you money!
  const endpoint = `https://${sandbox ? "mturk-requester-sandbox" : "mturk-requester"}.${region}.amazonaws.com`;

  //console.log(config.accessKeyId);
  const MTurk = new MTurkClient({
    region : "us-east-1",
    credentials: {
      accessKeyId: config.accessKeyID,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: endpoint,
  });

  export async function getAccountBalance() {
    return (await MTurk.send(new GetAccountBalanceCommand({}))).AvailableBalance;
  }


  export async function listHITs():Promise<HIT[]>{
    return await (await MTurk.send(new ListHITsCommand({}))).HITs||[];
  }

  /**
   *
   * @param HITId
   * @returns {Promise<HIT>}
   */
  export async function getHIT(HITId: string) {
    return await(await MTurk.send(
      new GetHITCommand({
        HITId: HITId,
      })
    )).HIT;
  }

  /**
   *
   * @param {CreateHITCommandInput}
   * @returns {Promise<CreateHITCommandOutput>}
   */
  export async function createHIT(params: CreateHITCommandInput) {
    try{
    const x =  await MTurk.send(new CreateHITCommand(params));
    return x;
    } catch(error){
        console.log(error);
    }
  }

  //not tested
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

  /**
   *
   * @param HITId
   * @param MaxResults
   * @param NextToken - Optional
   * @returns
   */
  export async function listAssignmentsForHIT(
    HITId: string,
    MaxResults = 100,
    NextToken? : string
  ) {
    return await MTurk.send(
      new ListAssignmentsForHITCommand({
        HITId,
        MaxResults,
        NextToken,
      })
    );
  }

/**
 *
 * @param WorkerIds
 * @param Subject
 * @param MessageText
 * @returns {Promise<NotifyWorkersCommandOutput[]>}
 */
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

  /**
   * @param {string[]} WorkerIds
   * @param {string} Subject
   * @param {string} MessageText
   * @returns {Promise<NotifyWorkersCommandOutput[]>}
   */
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

/**
 *
 * @param query
 * @param MustBeOwnedByCaller
 * @param MustBeRequestable
 * @param MaxResults
 * @returns {Promise<QualificationType[]>}
 */
  export async function listQualificationTypes(
    query: string,
    MustBeOwnedByCaller = true,
    MustBeRequestable = false,
    MaxResults? : 100
  ) {
    let numResults : number | undefined;
    let nextToken : string | undefined;
    let response : QualificationType[] = [];
    while (numResults == MaxResults) {
      const result = await MTurk.send(
        new ListQualificationTypesCommand({
          Query: query,
          MustBeOwnedByCaller: MustBeOwnedByCaller,
          MustBeRequestable: MustBeRequestable,
          MaxResults: MaxResults,
          NextToken: nextToken,
        })
      );
      nextToken = result.NextToken;
      numResults = result.NumResults;
      let something = response.concat(result.QualificationTypes ? result.QualificationTypes:[] )
      response = something;
    }
    return response;
  }


  /**
   * @param MustBeRequestable \
   * @param MustBeOwnedByCaller
   * @param MaxResults
   * @returns {Promise<QualificationType[]>}
   */
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

    //console.log(result.QualificationTypes);
    return result.QualificationTypes;
  }

  //tested
  /**
    * @param {string} QualificationTypeId
    * @param {MaxResults} MaxResults -optional
    * @returns {Promise<{response: DeleteQualificationTypeCommandOutput, error: Error | undefined}>}
  */
  export async function listWorkersWithQualificationType(
    QualificationTypeId: string,
    MaxResults? : 100
  ) {
    let numResults : number | undefined;
    let nextToken : string | undefined;
    //let returnedArray: [];
    let response : Qualification[];
    response = [];
    while (numResults == MaxResults) {
      const result = await MTurk.send(
        new ListWorkersWithQualificationTypeCommand({
          QualificationTypeId: QualificationTypeId,
          MaxResults: MaxResults,
          NextToken: nextToken //not sure what a pagination token is
        })
      );
      nextToken = result.NextToken;
      numResults = result.NumResults;
      let something = response.concat(result.Qualifications ? result.Qualifications:[] )
      response = something;
    }
    return response;
  }


//tested
/**
* @param {string} QualificationTypeId
* @returns {Promise<{response: DeleteQualificationTypeCommandOutput, message: string}>}
*/
  export async function createQualificationType(
    params: CreateQualificationTypeCommandInput
  ) {
    return await MTurk.send(
      new CreateQualificationTypeCommand(params)
    );
  }

  /* Qualification Interaction With Workers */
  //tested
  /**
   * @param {string} QualificationTypeId
    * @param {string} WorkerId
    * @param {number} IntegerValue
    * @param {boolean} SendNotification
    * @returns {Promise<{response: AssociateQualificationWithWorkerCommandOutput, message: string}>}
  */
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


//tested
/**
* @param {string} QualificationTypeId
* @param {string} WorkerId
* @param {string} Reason
* @returns {Promise<{response: DisassociateQualificationFromWorkerCommandOutput, message: string}>}
*/
  export async function disassociateQualificationWithWorker(
    QualificationTypeId: string,
    WorkerId: string,
    Reason: string
  ) {
    //console.log(QualificationTypeId);
    //console.log(WorkerId);
    return await MTurk.send(
      new DisassociateQualificationFromWorkerCommand({
        QualificationTypeId: QualificationTypeId,
        WorkerId: WorkerId,
        Reason: Reason,
      })
    );
  }
//__________IMPLEMENT !!!__________
// export function getWorkerAssignments(
//     WorkerId: string
// ){
//     return getLocalWorkerAssignments(WorkerId);
// }

// function getLocalWorkerAssignments(
//     WorkerID:String
// ){
//     return;
// }

/**
 * @param {string} WorkerId
 * @param {string} HITId - optional
 * @param {string} Reason
 * @returns {Promise<{response: ListBonusPaymentsCommandOutput, message: string}>}
 */
  export async function ListBonusPayments(
    WorkerId: string,
    HITId: string, //optional
    Reason: string
  ) {
    //console.log(WorkerId);

    return await MTurk.send(
      new ListBonusPaymentsCommand({
        HITId: HITId,
      })
    );
  }

//implement you own version
export function getWorkerQualifications(
    WorkerID: "abababab",
){
    return getlocalWorkerQualifications(WorkerID);
}

function getlocalWorkerQualifications(
    WorkerID:string
){
    //go through local json fill
    return {Qualification:"ahahaha"}

}


/**
 * @param {string} WorkerId
 * @param {string} AssignmentId
 * @param {string | number} BonusAmount
 * @param {string} UniqueRequestToken
 * @param {string} Reason
 * @returns {Promise<{response: SendBonusCommandOutput, message: string}>}
 */
export async function bonusWorker(
    WorkerId: string,
    AssignmentId: string,
    BonusAmount: string | number,
    UniqueRequestToken: string,
    Reason: string = ""
  ) {
    const response = await MTurk.send(
      new SendBonusCommand({
        WorkerId: WorkerId,
        AssignmentId: AssignmentId,
        BonusAmount: String(Number(BonusAmount).toFixed(2)),
        Reason: Reason,
        UniqueRequestToken: UniqueRequestToken,
      })
    );

    const message = `Sent $${String(
      Number(BonusAmount).toFixed(2)
    )} bonus to ${WorkerId} for ${UniqueRequestToken}`;

    //console.log(message);
    return {response, message};
  }

