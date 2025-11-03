const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Home page
app.get("/", (req, res) => res.render("index"));

//  CREATE USER (no try/catch)
app.post("/create", async (req, res) => {
  let { name, email, password } = req.body;

  // Check if user already exists
  let existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return res.send("Email already exists");

  // Hash password
  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(password, salt);

  // Create new user
  let createdUser = await prisma.user.create({
    data: { name, email, password: hash },
  });

  // Create token
  let token = jwt.sign({ email }, "password", { expiresIn: "1h" });

  // Set cookie
  res.cookie("token", token, { httpOnly: true });

  res.send(createdUser);
});

// LOGIN PAGE
app.get("/login", (req, res) => res.render("login"));

// LOGIN USER 
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.send("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.send("Invalid email or password");

  const token = jwt.sign({ email: user.email }, "password", { expiresIn: "1h" });

  res.cookie("token", token, { httpOnly: true });

  res.send(`Welcome back, ${user.name}`);
});

// LOGOUT
app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

// Start server
app.listen(3000, () => console.log("Server running at http://localhost:3000"));
