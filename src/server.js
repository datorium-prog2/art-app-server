const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose();

// pieslēdzamies mūsu DB
const database = new sqlite3.Database("./src/db/database.db");

// inicializējam express appu
const app = express()

// ļaujam piekļūt serverim no citiem domēniem
app.use(cors({
  origin: '*'
}))

// ļaujam no FE sūtīt jsonu
app.use(bodyParser.json());

// uz servera palaišanu
database.serialize(() => {
  // izveidojam autors tabulu ja tāda neeksistē
  database.run(`
    CREATE TABLE IF NOT EXISTS autors (
      id INTEGER PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );
  `);

  // izveidojam gleznas tabulu ja tāda neeksistē
  database.run(`
    CREATE TABLE IF NOT EXISTS gleznas (
      id INTEGER PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      imgSrc char NOT NULL,
      author_id int,
      FOREIGN KEY (author_id) REFERENCES autors(id)
    ); 
  `);


  // gribam jau pašā sākumā kad izveidojam datubāzes, iesetot pirmos datus, 
  // tāpēc paprasa datus no autors tabulas lai pārliecinātos vai tabula ir tukša vai nav
  // dati būs pieejami funkcijas argumentā autors
  database.get('SELECT * from autors', (err, autors) => {
    // ja autoru nav, tad zinām ka datu vēl datubāzē nav vispār
    if (!autors) {
      // ieliekam iekšā pirmo autoru
      database.run(`
        INSERT INTO autors (name)
        VALUES('Leonardo da Vinci');
    `, () => {
      // kad autors ir ielikt, ieliekam iekšā pirmo gleznu
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

  // izvēlamies visuu datus no autors tabulas
  database.get(`SELECT * FROM autors`, (err, movies) => {
    // kad dati ir atnākuši no autors tabulas tad prasam datus no gleznas tabulas
    database.get(`SELECT * FROM gleznas`,(err, gleznas) => {
      // sūtam prom datus uz frontendu
      res.json({
        movies: movies, 
        gleznas: gleznas
      })
    })

  })
})

// GET http://localhost:3004/autors
// Atgriež visus autorus no DB
app.get('/autors', (req, res) => {
    // database.get atgriež tikai vienu pirmo atrasto rezutlātu
      // database.all atgriež visus atrastos rezultātus
  database.all('SELECT * FROM autors', (error, autori) => {
    res.json(autori)
  })
})

// POST http://localhost:3004/autors
// pievieno jaunu autoru
app.post('/autors', (req, res) => {
  database.run(`
    INSERT INTO autors (name)
    VALUES("${req.body.name}");
  `, () => {
    res.json('Jauns autors pievienots veiksmīgi')
  })

})


// palaižam serveri ar 3004 portu
app.listen(3004, () => {
  console.log(`Example app listening on port 3004`)
})

