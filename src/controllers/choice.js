import dayjs from "dayjs";
import db from "../data/db.js";
import { ObjectId } from "mongodb";

export async function sendChoice(req, res) {
  const { title, pollId } = req.body;
  const choice = req.body;
  try {
    const pollObjectId = new ObjectId(pollId);

    const currentPoll = await db.collection("polls").findOne({ _id: pollObjectId, });

    if (!currentPoll) {
      return res
        .status(404)
        .send(
          "Enquete não encontrada. Confira o id informado e o formato do mesmo"
        );
    }

    const pollExpiration = currentPoll.expireAt;
    const dateOfChoice = dayjs().format("YYYY-MM-D hh:mm");
    if (dateOfChoice > pollExpiration) {
      return res
        .status(403)
        .send("O prazo para interação nessa enquete já acabou");
    }

    const pollChoices = await db
      .collection("choices")
      .findOne({ title: title });

    if (pollChoices) {
      return res.status(409).send("Título inválido!");
    }

    await db.collection("choices").insertOne({ ...choice, votes: 0 });

    return res
      .status(201)
      .send(
        `Opção "${title}" adicionada à enquete "${currentPoll.title}" com sucesso!`
      );
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function addVote(req, res) {
  const choiceId = req.params.id;

  try {
    const choice = await db
      .collection("choices")
      .findOne({ _id: new ObjectId(choiceId) });
    if (!choice) {
      return res.status(404).send("Essa não é uma opção válida");
    }

    const pollId = choice.pollId;

    const choicePoll = await db
      .collection("polls")
      .findOne({ _id: new ObjectId(pollId) });

    if (!choicePoll) {
      return res
        .status(404)
        .send("A enquete não foi encontrada. Tente novamente mais tarde");
    }

    const pollExpiration = dayjs(choicePoll.expireAt);
    const currentDate = dayjs();

    if (currentDate.isAfter(pollExpiration)) {
      return res
        .status(403)
        .send("O prazo para votação nessa enquete já acabou");
    }

    const updatedChoice = await db
      .collection("choices")
      .findOneAndUpdate(
        { _id: new ObjectId(choiceId) },
        { $inc: { votes: 1 } },
        { returnOriginal: false }
      );

    return res
      .status(201)
      .send(`Voto para "${updatedChoice.value.title}" enviado com sucesso`);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}
