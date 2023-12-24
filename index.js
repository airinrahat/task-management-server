const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dbdkno8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const taskCollection = client.db("taskManagement").collection("alltask");
    const NotificationCollection = client
      .db("taskManagement")
      .collection("notification");

    // notification post
    app.post("/notification", async (req, res) => {
      const addnotification = req.body;
      const result = await NotificationCollection.insertOne(addnotification);
      res.send(result);
    });

    // notification get
    app.get("/notification", async (req, res) => {
      const result = await NotificationCollection.find().toArray();
      res.send(result);
    });

    //add task get
    app.get("/tasks", async (req, res) => {
      const result = await taskCollection.find().toArray();
      res.send(result);
    });

    //add task post
    app.post("/tasks", async (req, res) => {
      const addtask = req.body;
      const result = await taskCollection.insertOne(addtask);
      res.send(result);
      // console.log(addtask);
    });

    //task update
    app.get("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.findOne(query);
      res.send(result);
    });

    // my task email gays
    app.get("/getMyTask", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });

    // status ways task
    app.get("/taskstatus", async (req, res) => {
      console.log(req.query.status);
      let query = {};
      if (req.query?.status) {
        query = { status: req.query.status };
      }
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });

    // status change
    app.patch("/tasks/ongoingstatus/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "ongoing",
        },
      };

      const result = await taskCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/tasks/completedstatus/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "completed",
        },
      };

      const result = await taskCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // task update
    app.put("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateTask = req.body;

      const taskUpdate = {
        $set: {
          time: updateTask.time,
          title: updateTask.title,
          priority: updateTask.priority,
          description: updateTask.description,
        },
      };

      const result = await taskCollection.updateOne(
        filter,
        taskUpdate,
        options
      );
      res.send(result);
    });

    //task data deleted
    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(" task management is running");
});

app.listen(port, () => {
  console.log(`task management  is running on port ${port}`);
});
