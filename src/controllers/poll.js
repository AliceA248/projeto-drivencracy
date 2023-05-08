import db from "../data/db.js";
import dayjs from "dayjs";
import { ObjectId } from "mongodb";



export async function sendPoll(req, res) {
  const { title, expireAt } = req.body;
  const poll = req.body;

  try {
    const existingPool = await db.collection("poll").findOne({ title, expireAt });

    if (existingPool) {
      return res
        .status(409)
        .send("Já existe uma enquete com o mesmo título e data de expiração. Por favor, escolha um título e/ou data diferente(s).");
    }

    const defaultExpiration = dayjs().add(30, "day").format("YYYY-MM-DD hh:mm");
    const expirationDate = expireAt || defaultExpiration;

    if (!dayjs(expirationDate).isValid() || dayjs(expirationDate).isBefore(dayjs())) {
      return res
        .status(422)
        .send("A data de expiração informada é inválida ou anterior à data atual. Por favor, informe uma data válida e futura.");
    }

    const completedPoll = { title, expireAt: expirationDate };
    await db.collection("poll").insertOne(completedPoll);
    return res.status(201).send(`Enquete "${title}" criada com sucesso!`);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getPoll(req, res) {
  try {
    const allPolls = await db.collection("poll").find().toArray();

    if (allPolls.length === 0) {
      return res.status(404).send("Não há enquetes cadastradas no momento.");
    }

    return res.status(200).send(allPolls);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}


export async function getPollChoices(req, res) {
  try {
    const pollId = req.params.id;

    const pollChoices = await db.collection("choices").find({ pollId }).toArray();

    if (pollChoices.length === 0) {
      return res.status(404).send("Não foi encontrada uma enquete correspondente ao ID fornecido!");
    }

    return res.status(200).send(pollChoices);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}


export async function getPollResults(req, res) {
  const pollId = req.params.id;
  try {
    const choices = await db
      .collection("choices")
      .find({ pollId: pollId })
      .toArray();

    if (choices.length === 0) {
      return res.status(404).send("Não foi encontrada uma enquete correspondente ao ID fornecido!");
    }

    const sortedChoices = choices.sort((a, b) => b.votes - a.votes);
    const winningChoice = {
      title: sortedChoices[0].title,
      votes: sortedChoices[0].votes,
    };

    if (sortedChoices[1] && sortedChoices[1].votes === winningChoice.votes) {
      winningChoice.title = [winningChoice.title, sortedChoices[1].title];
      winningChoice.votes = [winningChoice.votes, sortedChoices[1].votes];
    }

    if (sortedChoices.length > 2 && sortedChoices[2].votes === winningChoice.votes) {
      return res.status(207).send("Existem mais de 2 opções com os mesmos resultados, aguarde análise");
    }

    const poll = await db
      .collection("poll")
      .findOne({ _id: new ObjectId(pollId) });

    const poolResults = {
      ...poll,
      winningChoice,
    };

    return res.status(200).send(poolResults);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}
