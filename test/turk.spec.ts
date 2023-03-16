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

describe("HIT creation", function() {
  it("hit created", async function() {
    const HITParams = {
      AssignmentDurationInSeconds: 60,
      Description: "Test HIT",
      LifetimeInSeconds: 60 * 60,
      Reward: "0.08", //this is how much the hit will pay out to a worker. We try to pay $15/hour.
      Title: "Another API Test",
      AutoApprovalDelayInSeconds: 3,
      Keywords: "test",
      MaxAssignments: 1,
      QualificationRequirements: [], // add 'qualification' in the brackets to enable it.
      Question: `
        <ExternalQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd">
          <ExternalURL>https://watts-lab.github.io/deliberation-portal/participate</ExternalURL>
          <FrameHeight>400</FrameHeight>
        </ExternalQuestion>
      `,
    };

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
    });
  });
});

