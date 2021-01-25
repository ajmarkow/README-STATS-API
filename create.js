import fetch from "node-fetch";
import * as uuid from "uuid";
import AWS from "aws-sdk";
import repos from 'repos';

const options = {
  token: process.env.GIT_TOKEN,
};

const dynamoDb = new AWS.DynamoDB.DocumentClient();
function addResponse(response, array) {
  response.forEach((item) =>
    array.push(item.full_name));
    return array;
};

async function getGrades(inputArray) {
	let Scores = [];
	for (const item of inputArray) {
	fetch(`http://readmescore.ajm.codes/score.json?url=${item}`)
    .then((response) => Scores.push(response))
    .catch((error) => {
      let errorMessage = JSON.stringify(error);
      console.log(errorMessage);
    });  }
	return Scores;
};
export async function main(event, context){
//Request body is parsed as a json string
	let listOfRepos = [];
	let usernameParameter = event["queryStringParameters"]["username"];
	const data = JSON.parse(event.body);
	let returned_repos = await repos([`${usernameParameter}`], options)
		.then((response) => addResponse(response, listOfRepos))
		.catch((error) => {
			let errorMessage = JSON.stringify(error);
			console.log(errorMessage);
		});
	let repositoriesAsJSON = JSON.stringify(returned_repos);
	let repositoriesScores = getGrades(repositoriesAsJSON);
	const params = {
    TableName: process.env.TableName,
    Item: {
      //Attributes of item being created by api
      githubUsername: `${usernameParameter}`,
      userId: "123", //author user id
      repositories: `${repositoriesAsJSON}`,
      repositories_scores: `${repositoriesScores}`,
      gradeId: uuid.v1(), //unique id for each
      attachment: data.attachment,
      createdAt: Date.now(),
    },
  };

	try {
		await dynamoDb.put(params).promise();
		return {
			statusCode:200,
			body: JSON.stringify(params.Item)
			};
     } catch (e) {
		return {
			statusCode:500,
			body:JSON.stringify({error: e.message})
			};
		}
}