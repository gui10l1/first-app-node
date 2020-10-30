const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateBody(request, response, next) {
	const { title, url, techs } = request.body;

	if(!title || !url || !techs) {
		return response.status(400).json({message: "Bad request"});
	}

	next();
}

function validateParams(request, response, next) {
	const { id } = request.params;

	if (!isUuid(id)) {
		return response.status(400).json({message: `${id} is not a valid id`});
	}

	next();
}

app.get("/repositories", (request, response) => {
  return response.status(200).json(repositories);
});

app.post("/repositories", validateBody, (request, response) => {
	const { title, url, techs } = request.body;

	const id = uuid();
	
	const newRepository = {
		id: id,
		title: title,
		url: url,
		techs: techs,
		likes: 0
	}

	repositories.push(newRepository);

	return response.status(201).json(newRepository);
});

app.put("/repositories/:id", validateParams, validateBody, (request, response) => {
	const { id } = request.params;
	const { title, url, techs } = request.body;

	const actualRepository = repositories.find(repository => id === repository.id);
	const repositoryIndex = repositories.findIndex(repository => id === repository.id);

	if (repositoryIndex < 0) {
		return response.status(400).json({message: "Not found"});
	}

	const { likes } = actualRepository; 

	const repository = {
		id,
		title,
		url,
		techs,
		likes
	}

	repositories[repositoryIndex] = repository;

	return response.json(repository);
});

app.delete("/repositories/:id", validateParams, (request, response) => {
	const { id } = request.params;
	
	const repositoryIndex = repositories.findIndex(repository => id === repository.id);

	if(repositoryIndex < 0){
		return response.status(404).json({message: "Not found"});
	}

	repositories.splice(repositoryIndex, 1);

	return response.status(204).json();
});

app.post("/repositories/:id/like", validateParams, (request, response) => {
	const { id } = request.params;
	
	const actualRepository = repositories.find(repository => id === repository.id);
	const repositoryIndex = repositories.findIndex(repository => id === repository.id);

	if(repositoryIndex < 0) {
		return response.status(404).json({message: "Not found"});
	}

	var { title, url, techs, likes } = actualRepository;

	likes += 1;

	const repository = {
		id,
		title,
		url,
		techs,
		likes,
	}

	repositories[repositoryIndex] = repository;

	return response.status(200).json(repository);
});

module.exports = app;
