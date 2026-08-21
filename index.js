import express from 'express'
import cors from 'cors'
import env from 'dotenv/config'
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';

const app = express();
const port = 3000 || process.env.PORT

// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!');
});



// Mongodb Database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wlt6tgr.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Database create
    const movieDatabase = client.db('MoviePortalDatabase').collection('MoviesCollection')

    // get for all movies json data
    app.get('/movies', async (req, res)=> {
      
        const cursor = movieDatabase.find();

        const result = await cursor.toArray();

        res.send(result);
    })

    app.get('/movies/:title', async(req, res) => {
      const title = req.params.title;

      const query = {"Movie Title": title};

      const result = await movieDatabase.findOne(query);

      res.send(result);
    })

    // post for add new movie and save in database
    app.post('/movies', async (req, res) => {
        const movieData = req.body;


        const result = await movieDatabase.insertOne(movieData);

        res.send(result);
    })

    // delete for delete movie from database
    app.delete('/movies/:title', async(req, res) =>{
      const title = req.params.title;

      const query = {"Movie Title": title};

      const result = await movieDatabase.deleteOne(query);

      res.send(result);
    })

    // favorites collection create
    const favoritesCollection = client.db('MoviePortalDatabase').collection('FavoritesMovies')

    // get favorites movie
    app.get('/favoritesMovies', async(req, res) =>{
      
      const cursor = favoritesCollection.find();
      const result = await cursor.toArray();

        res.send(result);
    })

    // post favorites movie
    app.post('/favoritesMovies', async (req, res) =>{
      const favMovieData = req.body;

      try{
        const existingMovie = await favoritesCollection.findOne({
          MovieTitle: favMovieData.MovieTitle,
          Email: favMovieData.Email
        })

        if(existingMovie){
          return res.status(409).json({
            message: 'Movie already in favorites',
            alreadyExists: true
          })
        }


        const result = await favoritesCollection.insertOne(favMovieData);
  
        res.status(201).json(result)
      }
      catch(error){
        return res.status(500).json({
          message: 'Server Error',
           error: error.message
        })
      }

    })


    //    app.get('/favoritesMovie/:email', async(req, res) =>{
    //   const email = req.params.email

    //     const query = {Email: email}

    //     const result = await favoritesCollection.findOne(query);


    //     res.send(result);
    // })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});