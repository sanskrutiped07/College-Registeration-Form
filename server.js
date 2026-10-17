
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const dataFile = path.join(__dirname, "students.json");

if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, "[]");
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/students", (req, res) => {
  const students = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  res.json(students);
});

app.post("/register", (req, res) => {
  const {
    name, dob, gender, email, mobile,
    address, course, year, percentage
  } = req.body;

  if (
    !name || name.trim().length < 3 ||
    !dob || !gender ||
    !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !/^\d{10}$/.test(mobile || "") ||
    !address || address.trim().length < 10 ||
    !course || !year ||
    percentage === "" || percentage === undefined ||
    !Number.isFinite(Number(percentage)) ||
    Number(percentage) < 0 || Number(percentage) > 100 ||
    new Date(dob) > new Date()
  ) {
    return res.status(400).json({
      message: "Please enter valid details in all fields."
    });
  }

  const students = JSON.parse(fs.readFileSync(dataFile, "utf8"));

  if (students.some(s => s.email.toLowerCase() === email.trim().toLowerCase())) {
    return res.status(409).json({
      message: "This email is already registered."
    });
  }

  const student = {
    id: Date.now(),
    name: name.trim(),
    dob,
    gender,
    email: email.trim().toLowerCase(),
    mobile,
    address: address.trim(),
    course,
    year,
    percentage: Number(percentage)
  };

  students.push(student);
  fs.writeFileSync(dataFile, JSON.stringify(students, null, 2));

  res.status(201).json({
    message: "Registration successful!",
    student
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
