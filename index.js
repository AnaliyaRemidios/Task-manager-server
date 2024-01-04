const express = require("express");
const bodyparser = require("body-parser");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const pgp = require("pg-promise")();
const db = pgp("postgres://postgres:1234@localhost:5432/postgres");
const saltRounds = 10;
app.use(cors());
app.use(express.json());

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const query =
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)";
    await db.query(query, [name, email, hashedPassword]);
    res
      .status(201)
      .json({ success: true, message: "User signed up successfully" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await db.query(query, [email]);
    console.log(result);
    if (!result.length) {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    } else {
      const success = await bcrypt.compare(password, result[0].password);

      if (success) {
        res
          .status(200)
          .json({ success: true, message: "User signed in successfully" });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }
    }
  } catch (error) {
    console.error("Error during signin:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/tasklist/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { name, priority, completed } = req.body;
    console.log(req.body);
    var status = false;
    if (completed) {
      status = "true";
    }
    const query =
      "INSERT INTO tasks (email,task,priority,status) VALUES ($1, $2, $3,$4)";
    await db.query(query, [email, name, priority, status]);
    res
      .status(200)
      .json({ message: "Data successfully inserted into PostgreSQL" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/tasklist/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { completed, name } = req.body;
    console.log(req.body);
    const query = "UPDATE tasks SET status = $1 WHERE email = $2 AND task=$3";
    await db.query(query, [completed, email, name]);
    res
      .status(200)
      .json({ message: "Status successfully updated in PostgreSQL" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/tasklist/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const query = "SELECT* from  tasks  WHERE email = $1 ";
    const tasks = await db.query(query, [email]);
    console.log(tasks);
    res.status(200).json(tasks);
  } catch (err) {
    console.log("error");
  }
});

app.delete("/tasklist/:task/:email", async (req, res) => {
  try {
    const { task, email } = req.params;
    console.log(task);
    const query = "DELETE from tasks WHERE task=$1 AND email=$2";
    await db.query(query, [task, email]);
    res
      .status(200)
      .json({ message: "Task successfully deleted in PostgreSQL" });
  } catch (err) {
    console.log("error");
  }
});

// app.get("/", async (req, res) => {
//   try {
//     const users = await db.query("SELECT * FROM users");
//     const usersWithHashedPasswords = users.map((user) => {
//       const { password, ...userWithoutPassword } = user;
//       return {
//         ...userWithoutPassword,
//         hashedPassword: bcrypt.hashSync(password, saltRounds),
//       };
//     });

//     res.json(usersWithHashedPasswords);
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

//     res.json(users);
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.listen(5000, () => {
  console.log("App listening on port 5000");
});
