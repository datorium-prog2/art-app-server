const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose();

// pieslēdzamies mūsu DB
const database = new sqlite3.Database("./src/db/database.db");

const app = express()
const port = 3004

// ļaujam piekļūt serverim no citiem domēniem
app.use(cors({
  origin: '*'
}))

app.use(bodyParser.json());

database.serialize(() => {
  database.run(`
    CREATE TABLE IF NOT EXISTS autors (
      id INTEGER PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS gleznas (
      id INTEGER PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      imgSrc char NOT NULL,
      author_id int,
      FOREIGN KEY (author_id) REFERENCES autors(id)
    ); 
  `);


  // gribam jau pašā sākumā kad izveidojam datubāzes, iesetot pirmos datus
  database.get('SELECT * from autors', (err, data) => {
    // ja dati jau eksistē tad mēs negribam to darīt atkārtoti
    if (!data) {

      database.run(`
        INSERT INTO autors (name)
        VALUES('Leonardo da Vinci');
    `, () => {
       
      database.run(`
        INSERT INTO gleznas (name, imgSrc, author_id)
        VALUES(
          'Mona Lisa', 
          'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/1200px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
          1
        );
      `)

      });
    }
  })
});


// controlieris kurš atbild par to, kad tiks prasīts GET piepeasījums uz root, 
// jeb šajā gadījumā http://localhost:3004/
app.get('/', (req, res) => {

  database.get(`SELECT * FROM autors`, (err, movies) => {

    database.get(`SELECT * FROM gleznas`,(err, gleznas) => {
      res.json({movies: movies, gleznas: gleznas})
    })

  })
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

