import db from "../db.js";
import dayjs from "dayjs";
import { ObjectId } from "mongodb";

export async function sendPool(req, res) {
  const { title, expireAt } = req.body;
  const pool = req.body;

  try {
    const existingPool = await db.collection("pools").findOne({ title });

    if (!!existingPool) {
      return res
        .status(409)
        .send("Já existe uma enquete com esse nome. Por favor, escolha um nome diferente.");
    }

    if (!expireAt) {
      let currentTime = dayjs().add(30, "day").format("YYYY-MM-D hh:mm");

      const completedPool = { title, expireAt: currentTime };
      await db.collection("pools").insertOne(completedPool);
      return res.status(201).send(`Enquete "${title}" criada com sucesso!!`);
    }

    await db.collection("pools").insertOne(pool);
    return res.status(201).send(`Enquete ${title} foi criada!`);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getPool(req, res) {
  const allPools = await db.collection("pools").find().toArray();

  try {
    if (allPools.length === 0) {
      return res.status(204).send("Não há enquetes cadastradas no momento.");
    }
    return res.status(200).send(allPools);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getPoolChoices(req, res) {
  const poolId = req.params.id;

  try {
    const poolChoices = await db
      .collection("choices")
      .find({ poolId: poolId })
      .toArray();
    if (poolChoices.length === 0) {
      return res.status(404).send("Não foi encontrada uma enquete correspondente ao ID fornecido!");
    }

    return res.status(200).send(poolChoices);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function getPoolResults(req, res) {
  const poolId = req.params.id;
  try {
    let choices = await db
      .collection("choices")
      .find({ poolId: poolId })
      .toArray();

    let votesNumber = 0;
    let votesName = "";

    for (let i = 0; i < choices.length; i++) {
      let choiceVotes = choices[i].votes;

      if (choiceVotes > votesNumber) {
        votesNumber = choiceVotes;
        votesName = choices[i].title;
      }
    }

    const pollwithSameVotes = await db
      .collection("choices")
      .find({ votes: votesNumber })
      .toArray();
    let winningChoice = {};
    if (pollwithSameVotes.length === 1) {
      winningChoice = {
        title: votesName,
        votes: votesNumber,
      };
    }

    if (pollwithSameVotes.length > 1 && pollwithSameVotes.length < 3) {
      winningChoice = {
        title: [pollwithSameVotes[0].title, pollwithSameVotes[1].title],
        votes: [pollwithSameVotes[0].votes, pollwithSameVotes[1].votes],
      };
    }

    if (pollwithSameVotes.length >= 3) {
      return res
        .status(207)
        .send(
          "Atualmente, existem mais de 2 opções com os mesmos resultados, aguarde análise"
        );
    }

    const pool = await db
      .collection("pools")
      .findOne({ _id: ObjectId(poolId) });
    const poolResults = { ...pool, winningChoice };

    return res.status(200).send(poolResults);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}
