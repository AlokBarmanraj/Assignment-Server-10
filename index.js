const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = 5000;
require("dotenv").config();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = process.env.MONGODB_URL;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const verifyToken = (req, res, next)=>{
  const jwtToken = req?.headers.authorization;
  if(!jwtToken){
    return res.status(401).json({message:"Unauthorize"})
  }
  const token =jwtToken.split(" ")[1]

  console.log(token);
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db("assignment10");
    const manageScheduleCollection = database.collection("manageSchedule");
    const doctorProfileFormCollection =
      database.collection("doctorProfileForm");
    const doctorAppointmentCollection =
      database.collection("doctorAppointment");

    // Manage Schedule
    // Add Schedule
    app.post("/api/manageSchedule", async (req, res) => {
      const schedule = req.body;
      const result = await manageScheduleCollection.insertOne(schedule);
      res.send(result);
    });
    // List Schedule
    app.get("/api/manageSchedule", async (req, res) => {
      const result = await manageScheduleCollection.find().toArray();
      res.send(result);
    });

    // Edit Schedule
    app.put("/api/manageSchedule/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;

      const filter = {
        _id: new ObjectId(id),
      };

      const updateDoc = {
        $set: {
          day: updateData.day,
          status: updateData.status,
          startTime: updateData.startTime,
          endTime: updateData.endTime,
          duration: updateData.duration,
        },
      };

      const result = await manageScheduleCollection.updateOne(
        filter,
        updateDoc,
      );

      res.send(result);
    });

    // Delete Schedule
    app.delete("/api/manageSchedule/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const result = await manageScheduleCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.send(result);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    });

    // Doctor Profile Form
    // Add doctor Profile Form
    app.post("/api/doctorCreate", async (req, res) => {
      const doctorForm = req.body;
      const result = await doctorProfileFormCollection.insertOne(doctorForm);
      res.send(result);
    });
    // doctor list
    app.get("/api/doctorCreate", async (req, res) => {
      const result = await doctorProfileFormCollection.find().toArray();
      res.send(result);
    });

    // Edit Doctor
    app.put("/api/doctorCreate/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;

      const filter = {
        _id: new ObjectId(id),
      };

      const updateDoc = {
        $set: {
          doctorName: updateData.doctorName,
          specialization: updateData.specialization,
          qualifications: updateData.qualifications,
          experience: updateData.experience,
          consultationFee: updateData.consultationFee,
          hospitalName: updateData.hospitalName,
          profileImage: updateData.profileImage,
          availableDays: updateData.availableDays,
          startTime: updateData.startTime,
          endTime: updateData.endTime,
          verificationStatus: updateData.verificationStatus,
        },
      };

      const result = await doctorProfileFormCollection.updateOne(
        filter,
        updateDoc,
      );

      res.send(result);
    });

    // Delete Doctor
    app.delete("/api/doctorCreate/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const result = await doctorProfileFormCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.send(result);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    });

    // Doctor Details
    app.get("/api/findDoctors/:id",verifyToken, async (req, res) => {

      const { id } = req.params;
      const result = await doctorProfileFormCollection.findOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });

    // appointment
    app.post("/api/appointments", async (req, res) => {
      const appointment = req.body;
      const newAppointment = {
        ...appointment,
        createdAt: new Date(),
      };

      const result =
        await doctorAppointmentCollection.insertOne(newAppointment);

      res.send(result);
    });

    app.get("/api/appointmentRequests", async (req, res) => {
      const result = await doctorAppointmentCollection.find().toArray();
      res.send(result);
    });

    // Accept and Reject
    app.patch("/api/appointmentRequests/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        const filter = {
          _id: new ObjectId(id),
        };

        const updateDoc = {
          $set: {
            status,
            updatedAt: new Date(),
          },
        };

        const result = await doctorAppointmentCollection.updateOne(
          filter,
          updateDoc,
        );

        res.send(result);
      } catch (error) {
        console.error(error);

        res.status(500).send({
          success: false,
          message: "Failed to update appointment status.",
        });
      }
    });
    // Completed

    app.get("/api/appointmentComplete", async (req, res) => {
      try {
        const result = await doctorAppointmentCollection
          .find({ status: "completed" })
          .toArray();

        res.send(result);
      } catch (error) {
        res.status(500).send({
          message: "Failed to fetch completed appointments",
        });
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
