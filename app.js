require("dotenv").config();

const http = require("http");
const express = require("express");
const mysql = require("mysql2/promise");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = Number(process.env.PORT) || 3000;

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "guestbook",
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4"
});



async function initDatabase() {
  const conn = await pool.getConnection();

  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS guestbook (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        message VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } finally {
    conn.release();
  }
}

async function getGuestbookRows() {
  const [rows] = await pool.query(`
    SELECT id, name, message, created_at
    FROM guestbook
    ORDER BY id DESC
  `);

  return rows;
}







app.get("/", async (req, res) => {
  try {
    const rows = await getGuestbookRows();

    res.render("index", {
      rows,
      error: null
    });
  } catch (err) {
    console.error("조회 오류:", err);
    res.status(500).send("데이터베이스 조회 중 오류가 발생했습니다.");
  }
});

app.get("/api/guestbook", async (req, res) => {
  try {
    const rows = await getGuestbookRows();
    res.json(rows);
  } catch (err) {
    console.error("API 조회 오류:", err);
    res.status(500).json({ error: "방명록을 조회할 수 없습니다." });
  }
});

app.post("/guestbook", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const message = String(req.body.message || "").trim();

  if (!name || !message) {
    return res.status(400).send("이름과 내용을 입력해주세요.");
  }

  if (name.length > 50 || message.length > 500) {
    return res.status(400).send("입력 가능한 글자 수를 초과했습니다.");
  }

  try {
    await pool.execute(
      "INSERT INTO guestbook (name, message) VALUES (?, ?)",
      [name, message]
    );

    res.redirect("/");
  } catch (err) {
    console.error("등록 오류:", err);
    res.status(500).send("방명록 등록 중 오류가 발생했습니다.");
  }
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

async function start() {
  try {
    await initDatabase();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`서버 실행: http://localhost:${PORT}`);
      console.log(`DB: ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 3306}`);
    });
  } catch (err) {
    console.error("서버 시작 실패:", err);
    process.exit(1);
  }
}

start();
