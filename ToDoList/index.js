import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "todolist",
  password: "",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const routes = {
  Today: "/",
  Weekly: "/week",
  Monthly: "/month",
}

async function getItems(listType){
  const result = await db.query("SELECT * FROM list WHERE list_type = $1 order by id ASC;",
    [listType]
  )
  let items = result.rows
  return items
}

app.get("/", async (req, res) => {
  const listType = "Today"

  const items = await getItems(listType)
  console.log(items)
  res.render("index.ejs", {
    listTitle: listType,
    listItems: items,
  });
});

app.get("/week", async(req,res) =>{
  const listType = "Weekly"

  const items = await getItems(listType)
  console.log(items)
  res.render("index.ejs",{
    listTitle: listType,
    listItems: items
  })
})

app.get("/month", async(req,res) =>{
  const listType = "Monthly"

  const items = await getItems(listType)
  console.log(items)
  res.render("index.ejs",{
    listTitle: listType,
    listItems: items
  })
})


app.post("/add", async (req, res) => {
  console.log(req.body)
  const item = req.body.newItem;
  const listTitle = req.body.listTitle;
  try{
    await db.query("INSERT INTO list(title, list_type) VALUES ($1, $2);",
      [item, listTitle]
    )
  } catch(err){
    console.log(err)
  }
  res.redirect(routes[listTitle]);
});

app.post("/edit", async (req, res) => {
  console.log(req.body)
  const listTitle = req.body.listTitle;
  const id = req.body.updatedItemId
  const title = req.body.updatedItemTitle
  try{
    await db.query("UPDATE list SET title = $1 WHERE id = $2;",
      [title, id]
    );
  } catch(err){
    console.log(err)
  }

  res.redirect(routes[listTitle]);
});


app.post("/delete", async (req, res) => {
  console.log(req.body)
  const id = req.body.deleteItemId
  const listTitle = req.body.listTitle;
  try{
    await db.query("DELETE from list where id = $1;",
      [id]
    )
  } catch (err){
    console.log(err)
  }
  res.redirect(routes[listTitle])
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
