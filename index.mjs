import express from 'express';
import fetch from 'node-fetch'; //fetching API keys will by hidden! Also, this is used to fetch data from the API.
const planets = (await import('npm-solarsystem')).default;


const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

//routes
//HOME ROUTE: fetch a random Solar System image from Pixabay API and render to the home page
app.get('/', async (req, res) => {
   try {
   //assigned the API URL key to pixabayURL variable.
   const pixabayURL = "https://pixabay.com/api/?key=20426927-497d14db9c234faf7d0df8317&per_page=50&orientation=horizontal&q=solar+system";

   // the key word `fetch ` is used to make a request to the API and get the data. The response is stored in the `response` variable.
   // the `response` variable will contain API data in JSON format. 
   // the JSON data will create a random image of the solar system to be rendered on the home page because of the `q=solar system` query parameter in the API URL.
   const response = await fetch(pixabayURL);

   // the `json()` method is used to parse the JSON data from the API response and store it in the `data` variable. This allows us to access the image data and other information returned by the API.
   const data = await response.json();

   //Pick a random image out of the 50 results 
   const randomIndex = Math.floor(Math.random() * data.hits.length);
   const randomImage = data.hits[randomIndex].webformatURL; 

   res.render('home.ejs', { imageURL:randomImage});
   } catch (error) {
      console.error("Error fetching data from Pixabay API:", error);
      res.render('home.ejs', { imageURL: "" }); // If there's an error, render the home page without an image or with a default image.
   }

});

// DYNAMIC PLANET ROUTE: Handles all Planets, Asteroids, and Comets!
app.get('/planetInfo', (req, res) => {
    // This grabs the planet name from the URL (stuff like... /planetInfo?planet=Mars)
    const requestedObject = req.query.planet; 
    
    // Dynamically call the package function (stuff like... planets.getMars())
    let planetData = planets[`get${requestedObject}`]();
    
    // Fix broken Mars, Jupiter, Uranus images from the package (as mentioned in Lecture 2)
     if (requestedObject === "Mars") {
        planetData.image = "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg";
    } else if (requestedObject === "Jupiter") {
        planetData.image = "https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg";
    } else if (requestedObject === "Uranus") {
        planetData.image = "https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg";
    }

   //Fix missing descriptions for Asteroids and Comets
    if (requestedObject === "Asteroids") {
        planetData.description = planetData.def;
        planetData.distanceFromSun = "2.2 to 3.2 AU (Main Belt)";
        planetData.yearLength = "3 to 6 Earth Years";
        planetData.radius = "Up to 296 miles (Ceres)";
        planetData.moons = "Some have small moons (like Ida, which has Dactyl)";
    } else if (requestedObject === "Comets") {
        planetData.description = planetData.def;
        planetData.distanceFromSun = "Highly eccentric (plunges toward Sun, retreats past Neptune)";
        planetData.yearLength = "A few years to millions of years";
        planetData.radius = "Nucleus is typically 0.6 to 6 miles";
        planetData.moons = "0";
    }

    // Pass the name and data to a single EJS file
    res.render('planet.ejs', { 
        planetName: requestedObject, 
        planetData: planetData 
    });
});

//NASA POD ROUTE: Fetches the CURRENT day's picture
app.get('/nasa', async (req, res) => {
    try {
        // Omitting the &date parameter forces NASA's API to return TODAY's picture
        const nasaUrl = "https://api.nasa.gov/planetary/apod?api_key=9mUzIkhlZCZaOoMfspg7jMmwZCZ4LiRHtkgkambD";
        const response = await fetch(nasaUrl);
        const podData = await response.json();
        
        res.render('nasa.ejs', { podData: podData });
    } catch (error) {
        console.log("NASA API Error:", error);
        res.render('nasa.ejs', { podData: null });
    }
});


app.listen(3000, () => {
   console.log('server started');
});