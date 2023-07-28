const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
require("dotenv").config();

const app = express();
app.use(express.static("build"));
app.use(express.json());

morgan.token("post", (req, res) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
});

app.use(morgan(" :method :url :post"));

const PORT = process.env.PORT || 3001;
console.log("Port", PORT);
app.listen(PORT);

app.use(express.static("build"));

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      next(error);
    });
});

app.get("/info", (request, response) => {
  Person.count().then((count) =>
    response.send(
      `<p>Phonebook has info for ${count} people</p> <p> ${Date()}</p>`
    )
  );
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      console.log(result);
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// app.post("/api/persons", (request, response) => {
//   const newPerson = request.body;

//   if (newPerson.name && newPerson.number) {
//     const person = new Person({
//       name: newPerson.name,
//       number: newPerson.number,
//     });
//     person
//       .save()
//       .then(Person.find({}).then((persons) => response.send(persons)));
//   } else {
//     response.status(204).end();
//   }
// });

app.post("/api/persons", (request, response, next) => {
  const [name, number] = [request.body.name, request.body.number];
  const newPerson = new Person({
    name,
    number,
  });

  newPerson
    .save()
    .then((p) => {
      response.json(p);
    })
    .catch((e) => {
      next(e);
    });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);
