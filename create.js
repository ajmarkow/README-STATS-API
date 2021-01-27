import fetch from "node-fetch";
import handler from "./libs/handler-lib";
import * as uuid from "uuid";
import dynamoDb from "./libs/dynamodb-lib";
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

async function getGrades(repoSlug) {
	//https://api.github.com/repos/ajmarkow/woodlandmist/community/profile
		let repositoryScore = await fetch(`https://api.github.com/repos/${repoSlug}/community/profile`,{headers: {'Authorization':`token ${process.env.GIT_TOKEN}`}});
		return repositoryScore.json();
};

export const main = handler(async (event, context) => {
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
	let repositoriesScores = [];
	returned_repos.forEach((item) => repositoriesScores.push(getGrades(item)));
	let resolvedScores = await Promise.all(repositoriesScores).then(response => JSON.stringify(response));
	const params = {
<<<<<<< HEAD
    TableName: process.env.TableName,
    Item: {
      //Attributes of item being created by api
      githubUsername: `${usernameParameter}`,
      userId: "123", //author user id
      repositories: `${repositoriesAsJSON}`,
      repositories_scores: `${resolvedScores}`,
      gradeId: uuid.v1(), //unique id for each
      attachment: data.attachment,
      createdAt: Date.now(),
    }
  };``
	await dynamoDb.put(params);
	
	return params.Item;
});
