const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const express = require("express");
const axios = require("axios");
const url = "mongodb+srv://TharakaThilakasiri:up308725@clusterrnm.qqwj8.mongodb.net/RnM";
const client = new MongoClient(url, { useNewUrlParser: true });
const app = express();
const PORT = 3000;
const page = "/?page=1";
const dbName = "RnM";
const expireTime = 60;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

async function makeGetRequest(path) {
  let res = await axios.get(`https://rickandmortyapi.com/api${path}`);
  let data = res.data;
  console.log(data);
  return data;
}

app.get("/", async (req, res, next) => {
  try {
    let responseArray = [];
    await client.connect();
    const db = client.db(dbName);
    const Characters = db.collection("Characters");
    //const cursor = Characters.find({});
    const characterResult = await Characters.find({}).toArray();
    console.log(characterResult.length);
    // console.log(Characters)
    if (characterResult.length !== 0) {
      // const cursor = Characters.find({});
      // const result = await cursor.toArray();
      const recordDate = characterResult[0].saveDate;
      const currentDate = new Date();
      const diff = (currentDate.getTime() - recordDate.getTime()) / 1000;
      if (diff > expireTime) {
        await Characters.deleteMany({});
        const response = await makeGetRequest(`/character${page}`);
        let characters = response.results || [];
        let tempCharacters = [];
        characters.forEach((element) => {
          tempCharacters.push({ ...element, saveDate: new Date() });
        });
        // console.log(tempCharacters);
        await Characters.insertMany(tempCharacters);
        console.log("data updated in database");
        responseArray = tempCharacters;
      } else {
        responseArray = characterResult;
        console.log("oldData");
      }
      res.status(200).json(responseArray);
    } else {
      const response = await makeGetRequest(`/character${page}`);
      let characters = response.results || [];
      let tempCharacters = [];
      characters.forEach((element) => {
        tempCharacters.push({ ...element, saveDate: new Date() });
      });
      // console.log(tempCharacters);
      const result = await Characters.insertMany(tempCharacters);
      console.log("newData");
      res.status(200).json(characters);
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.post("/", async (req, res, next) => {
  try {
    const user = req.body.id;
    console.log(user);
    await client.connect();
    const db = client.db(dbName);
    const username = db.collection("username");
    const usernameResult = await username.find({}).toArray();
    const count = 0;
    usernameResult.forEach((element) => {
      if (user == element.id) {
        const result = await username.findOne({_id: ObjectId(id)});
        count++;
        console.log(result);
        res.status(200).send(result)
      }
    })
    if (count == 0) {
      const result = await username.insertOne(user);
      console.log(result);
      res.status(200).send("Success");
    } else {
      res.status(200).send("A user of that username already exsist")
    }
  } catch (error) {
    console.log(err);
    res.status(500).send("Failed to send data");
  }
});


