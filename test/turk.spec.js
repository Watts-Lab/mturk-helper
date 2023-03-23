//import * as mturk from "../mturk.ts" ;
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { expect } from "chai";
import * as mturk from "../src/mturk.js";
describe("insanity test", function () {
    it("test is running", function () {
        const a = true;
        expect(a).equal(true);
    });
});
describe("HIT Assignment Creation", function () {
    return __awaiter(this, void 0, void 0, function* () {
        let HITId;
        //before(async function() {
        it("should create a HIT", function () {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const HITParams = {
                    AssignmentDurationInSeconds: 60,
                    Description: "Test HIT",
                    LifetimeInSeconds: 60 * 60,
                    Reward: "0.08",
                    Title: "API Test",
                    AutoApprovalDelayInSeconds: 3,
                    Keywords: "test",
                    MaxAssignments: 1,
                    QualificationRequirements: [],
                    Question: `
        <ExternalQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd">
          <ExternalURL>https://watts-lab.github.io/deliberation-portal/participate</ExternalURL>
          <FrameHeight>400</FrameHeight>
        </ExternalQuestion>
      `,
                };
                const res = yield mturk.createHIT(HITParams);
                HITId = (_a = res === null || res === void 0 ? void 0 : res.HIT) === null || _a === void 0 ? void 0 : _a.HITId;
                yield mturk.createHIT(HITParams).then((res) => function () {
                    var _a, _b, _c, _d;
                    return __awaiter(this, void 0, void 0, function* () {
                        expect((_a = res === null || res === void 0 ? void 0 : res.HIT) === null || _a === void 0 ? void 0 : _a.HITStatus).equal("Assignable");
                        expect((_b = res === null || res === void 0 ? void 0 : res.HIT) === null || _b === void 0 ? void 0 : _b.HITId).to.exist;
                        console.log("curr id:" + ((_c = res === null || res === void 0 ? void 0 : res.HIT) === null || _c === void 0 ? void 0 : _c.HITId));
                        var exists = false;
                        const checkHITs = yield mturk.listHITs();
                        checkHITs.forEach(function (value) {
                            var _a;
                            console.log("id" + value.HITId);
                            if (value.HITId === ((_a = res === null || res === void 0 ? void 0 : res.HIT) === null || _a === void 0 ? void 0 : _a.HITId)) {
                                exists = true;
                            }
                        });
                        expect(exists).equal(true);
                        if (res && res.HIT && res.HIT.HITId) {
                            const resHIT = yield mturk.getHIT(res.HIT.HITId);
                            expect(resHIT === null || resHIT === void 0 ? void 0 : resHIT.HITId).to.exist;
                        }
                        const ress = yield mturk.listAssignmentsForHIT(HITId, 10);
                        expect((_d = ress === null || ress === void 0 ? void 0 : ress.Assignments) === null || _d === void 0 ? void 0 : _d.length).to.be.at.least(1);
                    });
                });
            });
        });
        //cannot test this because it requires HIT actually show up and takes a while
        // this.timeout(3000);
        //   setTimeout(done, 2500);
        // it("should create additional assignments for a HIT", async function() {
        //   this.timeout(300000);
        //   await mturk.createAdditionalAssignmentsForHIT(HITId, 1).then((res)=>async function(){
        //     expect(res?.$metadata?.httpStatusCode).to.equal(200);
        //   });
        // });
    });
});
// it("should list qualification types", async function() {
//   const res = await mturk.listQualificationTypes("test", true, false, 10);
//   expect(res?.length).to.be.at.least(1);
// });
describe("Qualification Creation", function () {
    let qualificationTypeId;
    it("should create a qualification type", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let QualifName = generateRandomString(10);
            const params = {
                Name: QualifName,
                Description: "Test qualification for Mechanical Turk API",
                QualificationTypeStatus: "Active"
            };
            const res = yield mturk.createQualificationType(params).then((res) => function () {
                var _a, _b, _c;
                return __awaiter(this, void 0, void 0, function* () {
                    qualificationTypeId = (_a = res === null || res === void 0 ? void 0 : res.QualificationType) === null || _a === void 0 ? void 0 : _a.QualificationTypeId;
                    expect((_b = res === null || res === void 0 ? void 0 : res.QualificationType) === null || _b === void 0 ? void 0 : _b.Name).equal(QualifName);
                    expect((_c = res === null || res === void 0 ? void 0 : res.QualificationType) === null || _c === void 0 ? void 0 : _c.QualificationTypeId).to.exist;
                    let query = "ababa";
                    it("should list qualification types", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const res = yield mturk.listQualificationTypes(query);
                            expect(res === null || res === void 0 ? void 0 : res.length).to.be.at.least(1);
                        });
                    });
                    it("should list all qualification types", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const res = yield mturk.listAllOwnedQualificationTypes(true);
                            expect(res === null || res === void 0 ? void 0 : res.length).to.be.at.least(1);
                        });
                    });
                    it("should return an array of Qualification objects", () => __awaiter(this, void 0, void 0, function* () {
                        const result = yield mturk.listWorkersWithQualificationType(qualificationTypeId);
                        expect(result).to.be.an("array");
                        if (result.length >= 1) {
                            expect(result[0]).to.have.property(qualificationTypeId);
                            expect(result[0]).to.have.property("WorkerId");
                        }
                        // add more assertions here to check for other properties in the Qualification object
                    }));
                    it("should return a maximum of 100 results if MaxResults is not provided", () => __awaiter(this, void 0, void 0, function* () {
                        const result = yield mturk.listWorkersWithQualificationType(qualificationTypeId);
                        expect(result.length).to.be.at.most(100);
                    }));
                    let worker_id = generateAlphanumericString();
                    describe('associate Qualification With Worker', () => {
                        it('should return a 200 status code', () => __awaiter(this, void 0, void 0, function* () {
                            const result = yield mturk.associateQualificationWithWorker(qualificationTypeId, worker_id);
                            expect(result.$metadata.httpStatusCode).to.equal(200);
                        }));
                    });
                    describe('disassociate Qualification With Worker', () => {
                        it('should return a 200 status code', () => __awaiter(this, void 0, void 0, function* () {
                            const result = yield mturk.disassociateQualificationWithWorker(qualificationTypeId, worker_id, 'Reason');
                            expect(result.$metadata.httpStatusCode).to.equal(200);
                        }));
                    });
                });
            });
        });
    });
});
//notifying workers
describe("send notification to workers", function () {
    it("should notify workers", function () {
        return __awaiter(this, void 0, void 0, function* () {
            //let QualifName =  generateRandomString(10);
            const WorkerIds = [generateAlphanumericString(), generateAlphanumericString(), generateAlphanumericString()];
            const Subject = "Test Subject";
            const MessageText = "Test Message";
            const res = yield mturk.notifyWorkers(WorkerIds, Subject, MessageText);
            expect(res.$metadata.httpStatusCode).to.equal(200);
        });
    });
});
describe('bonusWorker', () => {
    it('should send bonus and log message', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield mturk.bonusWorker(generateAlphanumericString(), generateRandomString(10), 5, 'unique_token', 'reason').then((response) => {
            expect(response).to.not.be.undefined;
            expect(response.message).to.equal('Sent $5.00 bonus to worker_id for unique_token');
        }).catch((err) => {
            console.log(err.message);
        });
        ;
    }));
});
function generateAlphanumericString() {
    const minLength = 8;
    const maxLength = 64;
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split(""); // allowed characters
    let length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength; // random length between min and max
    let result = "A"; // start with 'A'
    while (result.length < length) {
        // add random character until desired length is reached
        result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result.match(/^A[A-Z0-9]+$/) ? result : generateAlphanumericString(); // check if string matches pattern, if not, generate a new string
}
function generateRandomString(length) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * characters.length);
        result += characters.charAt(index);
    }
    return result;
}
