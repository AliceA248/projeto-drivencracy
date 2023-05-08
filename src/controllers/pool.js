import db from "../data/db.js";
import dayjs from "dayjs";
import { ObjectId } from "mongodb";



export async function sendPool(req, res) {
  const { title, expireAt } = req.body;
  const pool = req.body;

  try {
    const existingPool = await db.collection("pools").findOne({ title, expireAt });

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

    const completedPool = { title, expireAt: expirationDate };
    await db.collection("pools").insertOne(completedPool);
    return res.status(201).send(`Enquete "${title}" criada com sucesso!`);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getPool(req, res) {
  try {
    const allPools = await db.collection("pools").find().toArray();

    if (allPools.length === 0) {
      return res.status(404).send("Não há enquetes cadastradas no momento.");
    }

    return res.status(200).send(allPools);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}


export async function getPoolChoices(req, res) {
  try {
    const poolId = req.params.id;

    const poolChoices = await db.collection("choices").find({ poolId }).toArray();

    if (poolChoices.length === 0) {
      return res.status(404).send("Não foi encontrada uma enquete correspondente ao ID fornecido!");
    }

    return res.status(200).send(poolChoices);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}


export async function getPoolResults(req, res) {
  const poolId = req.params.id;
  try {
    const choices = await db
      .collection("choices")
      .find({ poolId: poolId })
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

    const pool = await db
      .collection("pools")
      .findOne({ _id: new ObjectId(poolId) });

    const poolResults = {
      ...pool,
      winningChoice,
    };

    return res.status(200).send(poolResults);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}
