//import * as mturk from "../mturk.ts" ;

import { assert,expect } from "chai";
import { HITStatus } from "@aws-sdk/client-mturk";
import * as mturk from "../src/mturk.js" ;


describe("insanity test", function() {
  it("test is running", function() {
    const a = true
    expect(a).equal(true)
  });
});


describe("HIT Assignment Creation", async function() {
  let HITId: string;

  //before(async function() {
    it("should create a HIT", async function() {
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

    const res = await mturk.createHIT(HITParams);
    HITId = res?.HIT?.HITId!;
    await mturk.createHIT(HITParams).then((res)=>async function(){
      expect(res?.HIT?.HITStatus).equal("Assignable");
      expect(res?.HIT?.HITId).to.exist;
      console.log("curr id:"+res?.HIT?.HITId);
      var exists = false;
      const checkHITs =await mturk.listHITs();
      checkHITs.forEach(function (value) {
        console.log("id"+value.HITId);
        if(value.HITId===res?.HIT?.HITId){
             exists = true;
        }
      });
      expect(exists).equal(true);
      if(res && res.HIT && res.HIT.HITId){
        const resHIT = await mturk.getHIT(res.HIT.HITId)
        expect(resHIT?.HITId).to.exist;
      }
      const ress = await mturk.listAssignmentsForHIT(HITId,10);
      expect(ress?.Assignments?.length).to.be.at.least(1);
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

describe("Qualification Creation", function() {
  let qualificationTypeId: string;

  it("should create a qualification type", async function() {
    let QualifName = generateRandomString(10);
    const params = {
      Name: QualifName,
      Description: "Test qualification for Mechanical Turk API",
      QualificationTypeStatus: "Active"
    };
    const res = await mturk.createQualificationType(params).then((res)=>async function(){
      qualificationTypeId = res?.QualificationType?.QualificationTypeId!;
      expect(res?.QualificationType?.Name).equal(QualifName);
      expect(res?.QualificationType?.QualificationTypeId).to.exist;

      let query = "ababa"
      it("should list qualification types", async function() {
        const res = await mturk.listQualificationTypes(query);
        expect(res?.length).to.be.at.least(1);
      });

      it("should list all qualification types", async function() {
        const res = await mturk.listAllOwnedQualificationTypes(true);
        expect(res?.length).to.be.at.least(1);
      });

      it("should return an array of Qualification objects", async () => {
        const result = await mturk.listWorkersWithQualificationType(qualificationTypeId);
        expect(result).to.be.an("array");
        if(result.length>=1){
          expect(result[0]).to.have.property(qualificationTypeId);
          expect(result[0]).to.have.property("WorkerId");
        }
        // add more assertions here to check for other properties in the Qualification object
      });
    
      it("should return a maximum of 100 results if MaxResults is not provided", async () => {
        const result = await mturk.listWorkersWithQualificationType(qualificationTypeId);
        expect(result.length).to.be.at.most(100);
      });


      let worker_id = generateAlphanumericString();
      describe('associate Qualification With Worker', () => {
        it('should return a 200 status code', async () => {
          const result = await mturk.associateQualificationWithWorker( qualificationTypeId, worker_id);
          expect(result.$metadata.httpStatusCode).to.equal(200);
        });
      });
      
      describe('disassociate Qualification With Worker', () => {
        it('should return a 200 status code', async () => {
          const result = await mturk.disassociateQualificationWithWorker( qualificationTypeId, worker_id, 'Reason');
          expect(result.$metadata.httpStatusCode).to.equal(200);
        });
      });
    });   

  });
});






//notifying workers
describe("send notification to workers", function() {
  it("should notify workers", async function() {
    //let QualifName =  generateRandomString(10);
    const WorkerIds = [ generateAlphanumericString(),generateAlphanumericString(),generateAlphanumericString()];
    const Subject = "Test Subject";
    const MessageText = "Test Message";
    const res = await mturk.notifyWorkers(WorkerIds, Subject, MessageText);
    expect(res.$metadata.httpStatusCode).to.equal(200);
  });
});

describe('bonusWorker', () => {
  it('should send bonus and log message', async () => {
    const result = await mturk.bonusWorker( generateAlphanumericString(), generateRandomString(10), 5, 'unique_token', 'reason').then((response) =>{
      expect(response).to.not.be.undefined;
      expect(response.message).to.equal('Sent $5.00 bonus to worker_id for unique_token');
    }).catch((err) => {
      console.log(err.message);
    });;

  });
});

function generateAlphanumericString(): string {
  const minLength = 8;
  const maxLength = 64;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split(""); // allowed characters
  let length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength; // random length between min and max
  let result = "A"; // start with 'A'
  while (result.length < length) {
    // add random character until desired length is reached
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result.match(/^A[A-Z0-9]+$/) ? result : generateAlphanumericString(); // check if string matches pattern, if not, generate a new string
}

function generateRandomString(length: number): string {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * characters.length);
    result += characters.charAt(index);
  }
  return result;
}
