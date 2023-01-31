import { SendBonusCommand, MTurkClient, GetAccountBalanceCommand, ListHITsCommand, ListQualificationTypesCommand, ListWorkersWithQualificationTypeCommand, AssociateQualificationWithWorkerCommand, DisassociateQualificationFromWorkerCommand, CreateHITCommand, NotifyWorkersCommand, CreateQualificationTypeCommand, GetHITCommand, CreateAdditionalAssignmentsForHITCommand, ListAssignmentsForHITCommand, } from "@aws-sdk/client-mturk";
import config from './config.json' assert { type: "json" };
const region = "us-east-1";
const sandbox = config.sandbox; // WARNING Setting this to false could costs you money!
const endpoint = `https://${sandbox ? "mturk-requester-sandbox" : "mturk-requester"}.${region}.amazonaws.com`;
//console.log(config.accessKeyId);
const MTurk = new MTurkClient({
    region: "us-east-1",
    credentials: {
        accessKeyId: config.accessKeyID,
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
export async function getHIT(HITId) {
    return await MTurk.send(new GetHITCommand({
        HITId: HITId,
    }));
}
export async function createHIT(params) {
    return await MTurk.send(new CreateHITCommand(params));
}
export async function createAdditionalAssignmentsForHIT(HITId, NumberOfAdditionalAssignments) {
    return await MTurk.send(new CreateAdditionalAssignmentsForHITCommand({
        HITId,
        NumberOfAdditionalAssignments,
    }));
}
export async function listAssignmentsForHIT(HITId, MaxResults = 100, NextToken) {
    return await MTurk.send(new ListAssignmentsForHITCommand({
        HITId,
        MaxResults,
        NextToken,
    }));
}
export async function notifyWorkers(WorkerIds, Subject, MessageText) {
    return await MTurk.send(new NotifyWorkersCommand({
        WorkerIds: WorkerIds,
        Subject: Subject,
        MessageText: MessageText,
    }));
}
export async function notifyAllWorkers(WorkerIds, Subject, MessageText) {
    [...Array(Math.ceil(WorkerIds.length / 100))]
        .fill(null)
        .forEach((workers_to_notify, i) => {
        setTimeout(() => {
            console.log(`Notifying group ${i}`);
            notifyWorkers(WorkerIds.slice(i * 100, (i + 1) * 100), Subject, MessageText);
        }, i * 50);
    });
    // define WorkerIds into lists of length 100
    // notify each sub list
    // delay notifications by 100ms between each list
}
/**  QUALIFICATIONS **/
/* Qualification Type Querying*/
export async function listQualificationTypes(query, MustBeOwnedByCaller = true, MustBeRequestable = false, MaxResults = 100) {
    let numResults;
    let nextToken;
    let response = [];
    while (numResults == MaxResults) {
        const result = await MTurk.send(new ListQualificationTypesCommand({
            Query: query,
            MustBeOwnedByCaller: MustBeOwnedByCaller,
            MustBeRequestable: MustBeRequestable,
            MaxResults: MaxResults,
            NextToken: nextToken,
        }));
        nextToken = result.NextToken;
        numResults = result.NumResults;
        let something = response.concat(result.QualificationTypes ? result.QualificationTypes : []);
        response = something;
    }
    return response;
}
/* Qualification Creation, Deletion, Listing */
export async function listAllOwnedQualificationTypes(MustBeRequestable, MustBeOwnedByCaller = true, MaxResults = 100) {
    const result = await MTurk.send(new ListQualificationTypesCommand({
        MustBeRequestable,
        MustBeOwnedByCaller,
        MaxResults,
    }));
    console.log(result.QualificationTypes);
    return result.QualificationTypes;
}
export async function listWorkersWithQualificationType(QualificationTypeId, MaxResults = 100) {
    let numResults;
    let nextToken;
    //let returnedArray: [];
    let response;
    response = [];
    while (numResults == MaxResults) {
        const result = await MTurk.send(new ListWorkersWithQualificationTypeCommand({
            QualificationTypeId: QualificationTypeId,
            MaxResults: MaxResults,
            NextToken: nextToken //not sure what a pagination token is
        }));
        nextToken = result.NextToken;
        numResults = result.NumResults;
        let something = response.concat(result.Qualifications ? result.Qualifications : []);
        response = something;
    }
    return response;
}
export async function createQualificationType(Name, Description, Keywords, QualificationTypeStatus) {
    return await MTurk.send(new CreateQualificationTypeCommand({
        Name,
        Description,
        Keywords,
        QualificationTypeStatus,
    }));
}
/* Qualification Interaction With Workers */
export async function associateQualificationWithWorker(QualificationTypeId, WorkerId, IntegerValue = 0, SendNotification = false) {
    return await MTurk.send(new AssociateQualificationWithWorkerCommand({
        QualificationTypeId: QualificationTypeId,
        WorkerId: WorkerId,
        IntegerValue: IntegerValue,
        SendNotification: SendNotification,
    }));
}
export async function disassociateQualificationWithWorker(QualificationTypeId, WorkerId, Reason) {
    console.log(QualificationTypeId);
    console.log(WorkerId);
    return await MTurk.send(new DisassociateQualificationFromWorkerCommand({
        QualificationTypeId: QualificationTypeId,
        WorkerId: WorkerId,
        Reason: Reason,
    }));
}
export async function bonusWorker(WorkerId, AssignmentId, BonusAmount, UniqueRequestToken, Reason = "") {
    return await MTurk.send(new SendBonusCommand({
        WorkerId: WorkerId,
        AssignmentId: AssignmentId,
        BonusAmount: String(Number(BonusAmount).toFixed(2)),
        Reason: Reason,
        UniqueRequestToken: UniqueRequestToken,
    }))
        .then((response) => console.log(`Sent $${String(Number(BonusAmount).toFixed(2))} bonus to ${WorkerId} for ${UniqueRequestToken}`))
        .catch((err) => {
        if (!err.message.includes("has already been processed"))
            console.log(err.message);
    });
}
