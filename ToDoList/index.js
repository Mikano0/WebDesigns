import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "todolist",
  password: "Buildstrafe9",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function getItems(){
  const result = await db.query("SELECT * FROM list order by id ASC;")
  let items = result.rows
  return items
}

app.get("/", async (req, res) => {
  const items = await getItems()
  console.log(items)
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  console.log(item)
  try{
    await db.query("INSERT INTO list(title) VALUES ($1);",
      [item]
    )
  } catch(err){
    console.log(err)
  }
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  console.log(req.body)
  const id = req.body.updatedItemId
  const title = req.body.updatedItemTitle
  console.log(id)
  console.log(title)
  try{
    await db.query("UPDATE list SET title = $1 WHERE id = $2;",
      [title, id]
    );
  } catch(err){
    console.log(err)
  }

  res.redirect("/");
});


app.post("/delete", async (req, res) => {
  console.log(req.body)
  const id = req.body.deleteItemId
  try{
    await db.query("DELETE from list where id = $1;",
      [id]
    )
  } catch (err){
    console.log(err)
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
