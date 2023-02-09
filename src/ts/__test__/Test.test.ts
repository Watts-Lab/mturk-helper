//import * as mturk from "../mturk.ts" ;
import * as mturk from "../mturk.js" ;
test("this is test tes", () => {
    const a = true
    expect(a).toEqual(true)
})


test("it creates a HIT on MTURk", async () => {
    const HITParams = {
        AssignmentDurationInSeconds: 60,
        Description: "Test HIT",
        LifetimeInSeconds: 60 * 60,
        Reward: "0.00", //this is how much the hit will pay out to a worker. We try to pay $15/hour.
        Title: "API Test",
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

      const response = await mturk.createHIT(HITParams)
      expect(response.HIT?.HITStatus).toEqual(200);
      expect(response.HIT?.HITId).toBeTruthy;
    }
)

test("it gets the status/info of a running HIT", async () => {

})

test("it f")
