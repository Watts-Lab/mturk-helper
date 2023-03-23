var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SendBonusCommand, MTurkClient, GetAccountBalanceCommand, ListBonusPaymentsCommand, ListHITsCommand, ListQualificationTypesCommand, ListWorkersWithQualificationTypeCommand, AssociateQualificationWithWorkerCommand, DisassociateQualificationFromWorkerCommand, CreateHITCommand, NotifyWorkersCommand, CreateQualificationTypeCommand, GetHITCommand, CreateAdditionalAssignmentsForHITCommand, ListAssignmentsForHITCommand } from "@aws-sdk/client-mturk";
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
export function getAccountBalance() {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield MTurk.send(new GetAccountBalanceCommand({}))).AvailableBalance;
    });
}
/** tested **/
export function listHITs() {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield (yield MTurk.send(new ListHITsCommand({}))).HITs) || [];
    });
}
export function getHIT(HITId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (yield MTurk.send(new GetHITCommand({
            HITId: HITId,
        }))).HIT;
    });
}
//i think we need to add a date time string to RequesterAnnotation
export function createHIT(params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const x = yield MTurk.send(new CreateHITCommand(params));
            return x;
        }
        catch (error) {
            console.log(error);
        }
    });
}
//not tested
export function createAdditionalAssignmentsForHIT(HITId, NumberOfAdditionalAssignments) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield MTurk.send(new CreateAdditionalAssignmentsForHITCommand({
            HITId,
            NumberOfAdditionalAssignments,
        }));
    });
}
export function listAssignmentsForHIT(HITId, MaxResults = 100, NextToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield MTurk.send(new ListAssignmentsForHITCommand({
            HITId,
            MaxResults,
            NextToken,
        }));
    });
}
export function notifyWorkers(WorkerIds, Subject, MessageText) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield MTurk.send(new NotifyWorkersCommand({
            WorkerIds: WorkerIds,
            Subject: Subject,
            MessageText: MessageText,
        }));
    });
}
export function notifyAllWorkers(WorkerIds, Subject, MessageText) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
/**  QUALIFICATIONS **/
/* Qualification Type Querying*/
//test
export function listQualificationTypes(query, MustBeOwnedByCaller = true, MustBeRequestable = false, MaxResults) {
    return __awaiter(this, void 0, void 0, function* () {
        let numResults;
        let nextToken;
        let response = [];
        while (numResults == MaxResults) {
            const result = yield MTurk.send(new ListQualificationTypesCommand({
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
    });
}
/* Qualification Creation, Deletion, Listing */
//test
export function listAllOwnedQualificationTypes(MustBeRequestable, MustBeOwnedByCaller = true, MaxResults = 100) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield MTurk.send(new ListQualificationTypesCommand({
            MustBeRequestable,
            MustBeOwnedByCaller,
            MaxResults,
        }));
        console.log(result.QualificationTypes);
        return result.QualificationTypes;
    });
}
//test
export function listWorkersWithQualificationType(QualificationTypeId, MaxResults) {
    return __awaiter(this, void 0, void 0, function* () {
        let numResults;
        let nextToken;
        //let returnedArray: [];
        let response;
        response = [];
        while (numResults == MaxResults) {
            const result = yield MTurk.send(new ListWorkersWithQualificationTypeCommand({
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
    });
}
//test
export function createQualificationType(params) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield MTurk.send(new CreateQualificationTypeCommand(params));
    });
}
/* Qualification Interaction With Workers */
//test -
export function associateQualificationWithWorker(QualificationTypeId, WorkerId, IntegerValue = 0, SendNotification = false) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield MTurk.send(new AssociateQualificationWithWorkerCommand({
            QualificationTypeId: QualificationTypeId,
            WorkerId: WorkerId,
            IntegerValue: IntegerValue,
            SendNotification: SendNotification,
        }));
    });
}
//test
export function disassociateQualificationWithWorker(QualificationTypeId, WorkerId, Reason) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(QualificationTypeId);
        console.log(WorkerId);
        return yield MTurk.send(new DisassociateQualificationFromWorkerCommand({
            QualificationTypeId: QualificationTypeId,
            WorkerId: WorkerId,
            Reason: Reason,
        }));
    });
}
//______________________________IMPLEMENT !!!__________-
//function
export function getWorkerAssignments(WorkerId) {
    return getLocalWorkerAssignments(WorkerId);
}
function getLocalWorkerAssignments(WorkerID) {
    return;
}
//worker id FIX it
export function ListBonusPayments(WorkerId, HITId, //optional
Reason) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(WorkerId);
        return yield MTurk.send(new ListBonusPaymentsCommand({
            HITId: HITId,
        }));
    });
}
//implement you own version
export function getWorkerQualifications(WorkerID) {
    return getlocalWorkerQualifications(WorkerID);
}
function getlocalWorkerQualifications(WorkerID) {
    //go through local json fill
    return { Qualification: "ahahaha" };
}
export function bonusWorker(WorkerId, AssignmentId, BonusAmount, UniqueRequestToken, Reason = "") {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield MTurk.send(new SendBonusCommand({
            WorkerId: WorkerId,
            AssignmentId: AssignmentId,
            BonusAmount: String(Number(BonusAmount).toFixed(2)),
            Reason: Reason,
            UniqueRequestToken: UniqueRequestToken,
        }));
        const message = `Sent $${String(Number(BonusAmount).toFixed(2))} bonus to ${WorkerId} for ${UniqueRequestToken}`;
        console.log(message);
        return { response, message };
    });
}
//   export async function bonusWorker(
//     WorkerId: string,
//     AssignmentId: string,
//     BonusAmount: string | number,
//     UniqueRequestToken: string,
//     Reason: string = ""
//   ) {
//     return await MTurk.send(
//       new SendBonusCommand({
//         WorkerId: WorkerId,
//         AssignmentId: AssignmentId,
//         BonusAmount: String(Number(BonusAmount).toFixed(2)),
//         Reason: Reason,
//         UniqueRequestToken: UniqueRequestToken,
//       })
//     )
//       .then((response) =>
//         console.log(
//           `Sent $${String(
//             Number(BonusAmount).toFixed(2)
//           )} bonus to ${WorkerId} for ${UniqueRequestToken}`
//         )
//       )
//       .catch((err) => {
//         if (!err.message.includes("has already been processed"))
//           console.log(err.message);
//       });
//   }
