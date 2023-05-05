import dayjs from "dayjs";
import db from "../db.js";
import { ObjectId } from "mongodb";

export async function sendChoice(req, res) {
  const { title, poolId } = req.body;

  try {
    const poolObjectId = ObjectId(poolId);
    const foundPool = await db.collection("pools").findOne({ _id: poolObjectId });

    if (!foundPool) {
      return res
        .status(404)
        .send(
          "Enquete não encontrada. Confira o id informado e o formato do mesmo"
        );
    }

    const expirationDate = foundPool.expireAt;
    const currentDate = dayjs().format("YYYY-MM-D hh:mm");
    if (currentDate > expirationDate) {
      return res
        .status(403)
        .send("O prazo para interação nessa enquete já acabou");
    }

    const poolChoices = await db.collection("choices").findOne({ title });

    if (poolChoices) {
      return res.status(409).send("Título inválido!");
    }

    const newChoice = { title, votes: 0, poolId };
    const result = await db.collection("choices").insertOne(newChoice);

    return res
      .status(201)
      .send(
        `Opção "${title}" adicionada à enquete "${foundPool.title}" com sucesso!`
      );
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}


export async function addVote(req, res) {
  const choiceId = req.params.id;

  try {
    // Verifica se a opção existe
    const choice = await db
      .collection("choices")
      .findOne({ _id: ObjectId(choiceId) });
    if (!choice) {
      return res.status(404).send("Opção não encontrada");
    }

    // Verifica se a enquete existe
    const poolId = choice.poolId;
    const pool = await db
      .collection("pools")
      .findOne({ _id: ObjectId(poolId) });
    if (!pool) {
      return res.status(404).send("Enquete não encontrada");
    }

    // Verifica se o prazo para votação ainda está aberto
    const expirationDate = pool.expireAt;
    const currentDate = dayjs().format("YYYY-MM-D hh:mm");
    if (currentDate > expirationDate) {
      return res
        .status(403)
        .send("O prazo para votação nessa enquete já acabou");
    }

    // Incrementa o número de votos da opção
    await db
      .collection("choices")
      .findOneAndUpdate({ _id: ObjectId(choiceId) }, { $inc: { votes: 1 } });

    return res
      .status(201)
      .send(`Voto para "${choice.title}" registrado com sucesso`);
  } catch (error) {
    console.error(error);

    // Verifica o tipo do erro para retornar uma mensagem mais específica
    if (error instanceof MongoError) {
      return res.status(500).send("Erro ao acessar o banco de dados");
    }

    return res.status(500).send("Erro interno do servidor");
  }
}
