const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

morgan.token("post", (req, res) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
});

app.use(morgan(" :method :url :post"));

const PORT = process.env.PORT || 3001;
console.log("Port", PORT);
app.listen(PORT);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const personById = persons.find((i) => i.id === Number(request.params.id));

  if (personById) {
    response.json(personById);
  } else {
    response.status(404).end();
  }
});

app.get("/info", (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p> <p> ${Date()}</p>`
  );
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  if (persons.find((i) => i.id === id)) {
    const newPersonList = persons.filter((i) => i.id !== id);
    persons = newPersonList;
    response.send(persons);
  } else {
    response.status(404).end();
  }
});

app.post("/api/persons", (request, response) => {
  const id = Math.max(...persons.map((i) => i.id)) + 1;
  const newPerson = request.body;
  if (persons.map((i) => i.name).indexOf(newPerson.name) !== -1) {
    response.status(400).send({ error: "name must be unique" }).end();
  }
  if (newPerson.name && newPerson.number) {
    persons.push({
      id: id,
      name: newPerson.name,
      number: newPerson.number,
    });
    response.send(persons);
  } else {
    response.status(204).end();
  }
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);
