# mturk-helper
Package for supporting recruitment and payment of participants in multiplayer experiments

### scripts
`code` node --experimental-json-modules public/js/app.js
* this runs the program, note the --experimental... enables node to detect config.json file
`code` npm run build
* this cleans all js files in the /public folder and compiles from TS, source maps excluded
`code` npm run test
* this runs tests in src/_test_

### setup
1. install editorconfig as an extension in VSCode
2. the .editorconfig file sets the formats for coding
3. create a config.json under public/js folder and src/ts and fill in the content as follows
```
{
    "accessKeyID": "YOUR_AWS_ACCESS_KEY",
    "secretAccessKey": "YOUR_AWS_SECRET_KEY",
    "sandbox": [boolean value]
}
```
