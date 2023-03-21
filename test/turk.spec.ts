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

// describe("HIT creation", function() {
//   it("hit created", async function() {
//     const HITParams = {
//       AssignmentDurationInSeconds: 60,
//       Description: "Test HIT",
//       LifetimeInSeconds: 60 * 60,
//       Reward: "0.08", //this is how much the hit will pay out to a worker. We try to pay $15/hour.
//       Title: "Another API Test",
//       AutoApprovalDelayInSeconds: 3,
//       Keywords: "test",
//       MaxAssignments: 1,
//       QualificationRequirements: [], // add 'qualification' in the brackets to enable it.
//       Question: `
//         <ExternalQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd">
//           <ExternalURL>https://watts-lab.github.io/deliberation-portal/participate</ExternalURL>
//           <FrameHeight>400</FrameHeight>
//         </ExternalQuestion>
//       `,
//     };

    
// });

describe("HIT Assignment Creation", function() {
  let HITId: string;

  before(async function() {
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
  // it("should create additional assignments for a HIT", async function() {
  //   await mturk.createAdditionalAssignmentsForHIT(HITId, 1).then((res)=>async function(){
  //     expect(res?.$metadata?.httpStatusCode).to.equal(200);
  //   });
  // });


});


// it("should list qualification types", async function() {
//   const res = await mturk.listQualificationTypes("test", true, false, 10);
//   expect(res?.length).to.be.at.least(1);
// });

describe("Qualification Creation", function() {
  let qualificationTypeId: string;

  it("should create a qualification type", async function() {
    const params = {
      Name: "Test Qualification",
      Description: "Test qualification for Mechanical Turk API",
      QualificationTypeStatus: "Active"
    };
    const res = await mturk.createQualificationType(params).then((res)=>async function(){
      qualificationTypeId = res?.QualificationType?.QualificationTypeId!;
      expect(res?.QualificationType?.Name).equal("Test Qualification");
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

    });
    
  });
});
