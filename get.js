import fetch from "node-fetch";
import handler from "./libs/handler-lib";
import repos from 'repos';

const options = {
  token: process.env.GIT_TOKEN,
};

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
	let returned_repos = await repos([`${usernameParameter}`], options)
		.then((response) => addResponse(response, listOfRepos))
		.catch((error) => {
			let errorMessage = JSON.stringify(error);
			console.log(errorMessage);
		});
	let repositoriesScores = [];
	returned_repos.forEach((item) => repositoriesScores.push(getGrades(item)));
	let resolvedScores = await Promise.all(repositoriesScores);
	let apiResponse = {
		'githubUsername': `${usernameParameter}`,
		'githubRepositories': returned_repos,
		'readmeGrades': resolvedScores,
	};
	return apiResponse;
});