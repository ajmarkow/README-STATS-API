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
	const Octokit = require("@octokit/rest");
	const octokit = new Octokit();
	octokit.authenticate({
		type: 'basic',
		username: 'ajmarkow',
		password: process.env.PRIVATE_KEY
	});
	//https://api.github.com/repos/ajmarkow/woodlandmist/community/profile
	let splitSlug = repoSlug.split("/");
	let username = splitSlug[0];
	console.log(username);
	let repo = splitSlug[1];
		console.log(repo);
		try {
      await octokit.repos.getReadme({
        'owner': username,
        'repo': repo,
      });
			return {
				'repository': repoSlug,
				'readmePresent?': true
			};
		} catch (error) {
      if (error.status === 404) {
				return {
				'repository': repoSlug,
				'readmePresent?': false
			};
      } else {
				// handle connection errors
				return {
				'repository': repoSlug,
				'readmePresent?': false
			};
      }
    }
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
		'githubScores': resolvedScores
	};
	return apiResponse;
});