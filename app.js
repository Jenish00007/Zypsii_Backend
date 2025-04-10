require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

//import all the routes here:
const userRoutes = require('./components/users/routers');

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));

const app = express();


// Security Middleware
app.disable("x-powered-by"); // Hide Express Server Info
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(express.json());
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// CORS Configuration
const corsOptions = {
  origin: process.env.ORIGINS, // Change to your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

app.use(limiter);

/** 
const User = require("./models/user.model")
const TravelStory = require("./models/travelStory.model")
const TutorialVideos = require("./models/tutorialVideos.model")
const Descriptionexplore = require("./models/descriptionExplore.model")
const Commentbox = require("./models/commentBox.model");


app.get("/", (req, res) => {
    return res.status(200).json({ "message": "this is AJ" })
})

// ✅ Route to Save a Comment
// app.post("/comments", async (req, res) => {
//     try {
//       const { text } = req.body;
//       if (!text) return res.status(400).json({ error: "Comment cannot be empty" });
  
//       const newComment = new Commentbox({ text });
//       await newComment.save();
//       res.status(201).json({ message: "Comment saved", comment: newComment });
//     } catch (error) {
//       console.error("Error saving comment:", error); // More detailed logs here
//       res.status(500).json({ error: "Internal server error", details: error.message });
//     }
//   });
  
app.post("/comments", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Comment cannot be empty" });
  
      console.log("Before saving comment:", text);  // Log before saving
      const newComment = new Commentbox({ text });
      await newComment.save();
      console.log("After saving comment:", newComment);  // Log after saving
      res.status(201).json({ message: "Comment saved", comment: newComment });
    } catch (error) {
      console.error("Error saving comment:", error); // More detailed logs here
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });
  
  // Route to Fetch All Comments
app.get("/comments", async (req, res) => {
    try {
      const comments = await Commentbox.find().sort({ createdAt: -1 }); // Fetch latest comments first
      console.log("Fetched comments:", comments); // Log comments to confirm the data
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  
  
  // ✅ Route to Fetch All Comments
//   app.get("/comments", async (req, res) => {
//     try {
//       const comments = await Commentbox.find().sort({ createdAt: -1 }); // Fetch latest comments first
//       res.json(comments);
//     } catch (error) {
//       console.error("Error fetching comments:", error);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   });

app.get('/tutorialVideos', async (req, res) => {
    try {
        const tutorialVideos = await TutorialVideos.find(); // Fetch all tutorial videos from the database
        res.status(200).json({ videos: tutorialVideos });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
}); 

app.get("/destination", (req, res) => {
    res.json({
      title: "About Destination",
      shortDescription: "Ooty is a popular hill station located in the southern part of India.",
      fullDescription:
        "Ooty is known for its scenic views, tea plantations, and pleasant weather. The town offers various tourist attractions, such as Ooty Lake, Botanical Gardens, and the Nilgiri Mountain Railway.",
    });
  });

app.get('/descriptionexplore', async (req, res) => {
    try {
        const descriptionexplore = await Descriptionexplore.find(); // Fetch all tutorial videos from the database
        res.status(200).json({ dataexplore: descriptionexplore });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});
//create account
app.post("/create-account", async (req, res) => {
    const { fullName, email, password } = req.body
    if (!fullName || !email || !password) {
        return res.status(400).json({ error: "all fields are required." })
    }
    const isUser = await User.findOne({ email })
    if (isUser) {
        return res
            .status(400)
            .json({ error: true, message: "user already exists" })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
        fullName,
        email,
        password: hashedPassword
    })
    await user.save()

    const accessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "72h" })

    return res.status(201)
        .json({
            error: false,
            user: { fullName: user.fullName, email: user.email },
            accessToken,
            message: "registration success full"
        })
})



//login
app.post("/login", async (req, res) => {
    const { email, password } = req.body
    console.log(email);
    console.log(password);

    if (!email || !password) {
        return res.status(400)
            .json({ error: "all fields are required." })
    }

    const user = await User.findOne({ email })
    if (!user) {
        return res.status(400)
            .json({ error: "user not found" })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
        return res.status(400)
            .json({ "status": "wrong credential" })
    }
    console.log(isPasswordValid)

    const accessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "72h" })
    return res.status(201)
        .json({
            error: false,
            user: { fullName: user.fullName, email: user.email },
            accessToken,
            message: "Login success full"
        })
})

//get user
app.get("/get-user", authenticateToken, async (req, res) => {
    const { userId } = req.user

    const isUser = await User.findOne({ _id: userId })
    if (!isUser) {
        res.sendStatus(401)
    }
    return res.json({
        user: isUser,
        message: "user is here"
    })

})



//route to handle image upload
app.post('/image-upload', upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: true,
                message: "no image uploaded"
            })
        }
        const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`
        res.status(200).json({ imageUrl })
    } catch (err) {
        res.status(500).json({ error: true, message: error.message })
    }
})


//delete an image from uploads folder
app.delete("/delete-image", async (req, res) => {
    const { imageUrl } = req.query
    if (!imageUrl) {
        return res
            .status(400)
            .json({ error: true, message: "imageUrl parameter is required" })
    }

    try {
        const filename = path.basename(imageUrl)
        //define the file path
        const filePath = path.join(__dirname, 'uploads', filename)
        //check if the file exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            res.status(200).json({ message: "image deleted successfully" })
        } else {
            res.status(200).json({ error: true, message: "image not found" })
        }
    } catch (err) {
        res.status(500).json({ error: true, message: "image not found" })
    }
})

//serve static files from the uploads ans assests directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use("/assets", express.static(path.join(__dirname, "assets")))



//add travel story
app.post("/add-travel-story", authenticateToken, async (req, res) => {
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body
    const { userId } = req.user

    //if(!title || !story || !visitedLocation || !imageUrl || !visitedDate){
    if (!title || !story || !visitedLocation || !visitedDate) {

        return res.status(400).json({ error: true, message: "All fields required." })
    }
    //convert visited date from milliseconds to date object
    const parsedVisitedDate = new Date(parseInt(visitedDate))
    try {
        const travelStory = new TravelStory({
            title,
            story,
            visitedLocation,
            userId,
            imageUrl,
            visitedDate: parsedVisitedDate
        });
        await travelStory.save();
        res.status(201).json({ story: travelStory, message: "Added successfully" })
    } catch (err) {
        res.status(400).json({ error: true, message: error.message })
    }

})


//get all travel stories
app.get('/get-all-stories', authenticateToken, async (req, res) => {
    const { userId } = req.user
    try {
        const travelStories = await TravelStory.find({ userId: userId }).sort({ isFavourite: -1 })
        res.status(200).json({ stories: travelStories })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
})

//edit travel story
// app.put("/edit-story/:id",authenticateToken,async (req,res)=>{
//     const {id} = req.params
//     const {title,story,visitedLocation,imageUrl,visitedDate} = req.body
//     const {userId} = req.user

//     //validate required fields
//     if(!title || !story || !visitedLocation || !visitedDate){
//         return res
//         .status(400)
//         .json({error:true,message:"All fields are required."})
//     }

//     //converted visited date from milliseconds to date object
//     const parsedVisitedDate = new Date(parseInt(visitedDate))

//     try{
//         //find travel story by id and ensure it belongs to the authenticated user
//         const travelStory = await TravelStory.findOne({_id:id,userId:userId})
//         if(!travelStory){
//             return res.status(400).   json({error:true,message:"Travel story not found"})
//         }

//         const placeHolderImageUrl = `http://localhost:8000/assets/placeholder.png`

//         travelStory.title = title
//         travelStory.story = story
//         travelStory.visitedLocation = visitedLocation
//         travelStory.imageUrl = imageUrl || placeHolderImageUrl
//         travelStory.visitedDate = parsedVisitedDate

//         await travelStory.save()
//         res.status(200).json({story:travelStory,message:"Update successful"})
//     }catch(err){
//         res.status(500).json({error:true,message:err.message})
//     }
// })

//delete travel story
app.delete("/delete-story/:id", authenticateToken, async (req, res) => {
    const { id } = req.params
    const { userId } = req.user
    console.log(id)
    try {
        //find the travel story by id and ensure it belongs to the authenticated user
        const travelStory = await TravelStory.findOne({ _id: id, userId: userId })

        if (!travelStory) {
            return res.status(404).json({ error: true, message: "Travel story not found" })
        }
        //delete the travel story from the database
        await travelStory.deleteOne({ _id: id, userId: userId })

        //extract the filename from the database
        const imageUrl = travelStory.imageUrl
        const filename = path.basename(imageUrl)

        //define the file path
        const filePath = path.join(__dirname, 'uploads', filename)

        //delete the image file from the uploads folder
        fs.unlink(filePath, (err) => {
            if (err) {
                console.log("Failed to delete image file: ", err)
            }
        })
        res.status(200).json({ message: "Travel story deleted successfully." })
    } catch (err) {
        res.status(500)
    }
})


//update isFavorite
app.put("/update-is-favourite/:id", authenticateToken, async (req, res) => {
    const { id } = req.params
    const { isFavourite } = req.body
    const { userId } = req.user

    try {
        const travelStory = await TravelStory.findOne({ _id: id, userId: userId })
        if (!travelStory) {
            return res.status(404).json({ error: true, message: "Travel story not found" })
        }
        travelStory.isFavourite = isFavourite

        await travelStory.save()
        res.status(200).json({ story: travelStory, message: "Update successful" })
    } catch (err) {
        res.status(500).json({ error: true, message: err.message })
    }
})


//search travel stories
app.get("/search", authenticateToken, async (req, res) => {
    const { query } = req.query
    const { userId } = req.user

    if (!query) {
        return res.status(404).json({ error: true, message: "Query is required" })
    }

    try {
        const searchResults = await TravelStory.find({
            userId: userId,
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { story: { $regex: query, $options: 'i' } },
                { visitedLocation: { $regex: query, $options: "i" } }
            ]
        }).sort({ isFavourite: -1 })

        res.status(200).json({ stories: searchResults })
    } catch (err) {
        res.status(200).json({ stories: searchResults })
    }
})


//filter travel stories by date range
app.get("/travel-stories/filter", authenticateToken, async (req, res) => {
    const { startDate, endDate } = req.query
    const { userId } = req.user

    try {
        //convert startDate and endDate from milliseconds to date objects
        const start = new Date(parseInt(startDate))
        const end = new Date(parseInt(endDate))

        //find travel stories that belong to the authenticated use and fall within the date range
        const filteredStories = await TravelStory.find({
            userId: userId,
            visitedDate: { $gte: start, $lte: end }
        }).sort({ isFavourite: -1 })

        res.status(200).json({ stories: filteredStories })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
})

// Example Express.js Route
app.get('/stories', (req, res) => {
    try {
        const stories = [
            { id: 1, name: 'Your Story', image: '/uploads/userProfile.png' },
            { id: 0, name: 'Ram_Charan', image: '/uploads/profile1.jpg' },
            { id: 0, name: 'Tom', image: '/uploads/profile2.jpg' },
            { id: 0, name: 'The_Groot', image: '/uploads/profile3.jpg' },
            { id: 0, name: 'loverland', image: '/uploads/profile4.jpg' },
            { id: 0, name: 'chillhouse', image: '/uploads/profile5.jpg' }
        ];
        res.json(stories); // Ensure this returns a valid JSON
    } catch (error) {
        console.error('Error fetching stories: ', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/userInfo', (req, res) => {
    // The { userId } = req.user part might cause errors if req.user is undefined
    // Consider adding middleware to validate the user or make this check optional
    try {
        // Use the same property casing as you're expecting in the frontend
        const userInfo = { 
            id: 1, 
            name: 'Jenish', 
            Posts: '100',      // Match the casing in your frontend component
            Followers: '12k',  // Match the casing in your frontend component
            Following: '12k',  // Match the casing in your frontend component
            image: 'https://lh3.googleusercontent.com/p/AF1QipOwcynxRpNebAQYvogATP7Bg7j0k45R21LWYlCN=s1360-w1360-h1020-rw',
            notes:'Just be yourself, there is no one better'
        };
        
        // Set proper content-type header
        res.setHeader('Content-Type', 'application/json');
        res.json(userInfo);
    } catch (error) {
        console.error('Error fetching user info: ', error);
        res.status(500).json({ error: 'Internal Server Error' });  // Return JSON error
    }
});


app.get('/get_favorites', (req, res) => {
    try {
        const places = [
            { id: 1, name: 'Ocean Breeze', title: 'Place 1', subtitle: 'Beachfront', image: '/uploads/userProfile.png' },
            { id: 2, name: 'Mountain Peaks', title: 'Place 2', subtitle: 'Mountain View', image: '/uploads/profile1.jpg' },
            { id: 3, name: 'Sunnyvale', title: 'Place 3', subtitle: 'Sunny Retreat', image: '/uploads/profile2.jpg' },
            { id: 4, name: 'Woodland Haven', title: 'Place 4', subtitle: 'Cozy Cabin', image: '/uploads/profile3.jpg' },
            { id: 5, name: 'Urban Oasis', title: 'Place 5', subtitle: 'Urban Loft', image: '/uploads/profile4.jpg' },
            { id: 6, name: 'Riverfront Getaway', title: 'Place 6', subtitle: 'Riverside', image: '/uploads/profile5.jpg' }
        ];
        res.json(places);
    } catch (error) {
        console.error('Error fetching places: ', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/places', (req, res) => {
    try {
        const places = [
            { id: 1, name: 'Ocean Breeze', title: 'Place 1', subtitle: 'Beachfront', image: '/uploads/userProfile.png' },
            { id: 2, name: 'Mountain Peaks', title: 'Place 2', subtitle: 'Mountain View', image: '/uploads/profile1.jpg' },
            { id: 3, name: 'Sunnyvale', title: 'Place 3', subtitle: 'Sunny Retreat', image: '/uploads/profile2.jpg' },
            { id: 4, name: 'Woodland Haven', title: 'Place 4', subtitle: 'Cozy Cabin', image: '/uploads/profile3.jpg' },
            { id: 5, name: 'Urban Oasis', title: 'Place 5', subtitle: 'Urban Loft', image: '/uploads/profile4.jpg' },
            { id: 6, name: 'Riverfront Getaway', title: 'Place 6', subtitle: 'Riverside', image: '/uploads/profile5.jpg' }
        ];
        res.json(places);
    } catch (error) {
        console.error('Error fetching places: ', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/discover_by_intrest', (req, res) => {
    try {
        const places = [
            { id: 1, name: 'Beach', image: '/uploads/userProfile.png' },
            { id: 2, name: 'Mountains', image: '/uploads/profile1.jpg' },
            { id: 3, name: 'Sunnyvale', image: '/uploads/profile2.jpg' },
            { id: 4, name: 'Woodland Haven',  image: '/uploads/profile3.jpg' },
            { id: 5, name: 'Urban Oasis',  image: '/uploads/profile4.jpg' },
            { id: 6, name: 'Riverfront Getaway',  image: '/uploads/profile5.jpg' }
        ];
        res.json(places);
    } catch (error) {
        console.error('Error fetching places: ', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/best_destination', (req, res) => {
    try {
        const places = [
            { id: 1, name: 'Ocean Breeze', image: '/uploads/userProfile.png' },
            { id: 2, name: 'Mountain Peaks', image: '/uploads/profile1.jpg' },
            { id: 3, name: 'Sunnyvale', image: '/uploads/profile2.jpg' },
            { id: 4, name: 'Woodland Haven',  image: '/uploads/profile3.jpg' },
            { id: 5, name: 'Urban Oasis',  image: '/uploads/profile4.jpg' },
            { id: 6, name: 'Riverfront Getaway',  image: '/uploads/profile5.jpg' }
        ];
        res.json(places);
    } catch (error) {
        console.error('Error fetching places: ', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/all_destination', (req, res) => {
    try {
        const places = [
            { id: 1, name: 'Ocean Breeze', image: '/uploads/userProfile.png' },
            { id: 2, name: 'Mountain Peaks', image: '/uploads/profile1.jpg' },
            { id: 3, name: 'Sunnyvale', image: '/uploads/profile2.jpg' },
            { id: 4, name: 'Woodland Haven',  image: '/uploads/profile3.jpg' },
            { id: 5, name: 'Urban Oasis',  image: '/uploads/profile4.jpg' },
            { id: 6, name: 'Riverfront Getaway',  image: '/uploads/profile5.jpg' }
        ];
        res.json(places);
    } catch (error) {
        console.error('Error fetching places: ', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/destinationdescription', (req, res) => {
    try {
      const AboutDestination = [
        {
            "description": "Ooty is a popular hill station located in the southern part of India. Ooty is known for its scenic views, tea plantations, and pleasant weather. The town offers various tourist attractions, such as the Ooty Lake, Botanical Gardens, and the Nilgiri Mountain Railway, making it a perfect destination for nature lovers and adventure enthusiasts."
          }
          ];
        res.json(AboutDestination);
    } catch (error) {
        console.error('Error fetching places: ', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/discover_by_nearest', (req, res) => {
    try {
      const cardData = [
            {
                id: 1,
                image: 'https://lh3.googleusercontent.com/p/AF1QipOwcynxRpNebAQYvogATP7Bg7j0k45R21LWYlCN=s1360-w1360-h1020-rw',
                title: 'Niladri Reservoir',
                subtitle: 'Tekergat, Sunamgnj',
              },
              {
                id: 2,
                image: 'https://lh3.googleusercontent.com/p/AF1QipMU8xPHOakcdPjjT4bNIiIxuTiv6pQ7DRWxIGfn=s1360-w1360-h1020-rw',
                title: 'Casa Las Tirtugas',
                subtitle: 'Av Damero, Mexico',
              },
              {
                id: 3,
                image: 'https://lh3.googleusercontent.com/p/AF1QipOha67_zF0k8T5CBZyH_IZ6F_e_gGTQaF5Fkx4e=s1360-w1360-h1020-rw',
                title: 'Beautiful Beach',
                subtitle: 'Sunny Coastline, USA',
              },
              {
                id: 4,
                image: 'https://lh3.googleusercontent.com/p/AF1QipMmcWo4Ciw8yex9le9t1hdcvZDQFZVY40JrcjSW=s1360-w1360-h1020-rw',
                title: 'Mountain Retreat',
                subtitle: 'High Peaks, Nepal',
              },
              {
                id: 5,
                image: 'https://lh3.googleusercontent.com/p/AF1QipOSjf8POP7YG7I4HqzI7ZSQKcvrq09XQPwNn8Gw=s1360-w1360-h1020-rw',
                title: 'Historic Castle',
                subtitle: 'Edinburgh, Scotland',
              },
              {
                id: 6,
                image: 'https://lh3.googleusercontent.com/p/AF1QipMmCQKX_-bj12teoTW4iYA8ZkD_r4fHLIIojNpv=s1360-w1360-h1020-rw',
                title: 'Desert Oasis',
                subtitle: 'Sahara, Africa',
              },
              {
                id: 7,
                image: 'https://lh3.googleusercontent.com/p/AF1QipPPqbWVw3ssObZCFJWGBJako_PzCvbjSwep6bLl=s1360-w1360-h1020-rw',
                title: 'Rainforest Escape',
                subtitle: 'Amazon, Brazil',
              },
              {
                id: 8,
                image: 'https://lh3.googleusercontent.com/p/AF1QipPfFlUBfQB8n4b1bG9bW7WwuXh97i3HxE1KOoY3=s1360-w1360-h1020-rw',
                title: 'Snowy Cabin',
                subtitle: 'Alps, Switzerland',
              },
          ];
        res.json(cardData);
    } catch (error) {
        console.error('Error fetching places: ', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/get_all_posts', (req, res) => {
    try {
        const postInfo = [
            {
              id: 1,
              postPersonImage: { uri: 'https://randomuser.me/api/portraits/men/1.jpg' }, // Profile image URL
              postTitle: 'John Doe',
              postImage: { uri: 'https://randomuser.me/api/portraits/men/4.jpg' }, // Post image URL
              likes: 120,
              isLiked: false,
            },
            {
              id: 2,
              postPersonImage: { uri: 'https://randomuser.me/api/portraits/women/1.jpg' },
              postTitle: 'Jane Smith',
              postImage: { uri: 'https://randomuser.me/api/portraits/women/2.jpg' },
              likes: 230,
              isLiked: true,
            },
            {
              id: 3,
              postPersonImage: { uri: 'https://randomuser.me/api/portraits/men/2.jpg' },
              postTitle: 'Robert Johnson',
              postImage: { uri: 'https://randomuser.me/api/portraits/men/2.jpg' },
              likes: 78,
              isLiked: false,
            },
            {
              id: 4,
              postPersonImage: { uri: 'https://randomuser.me/api/portraits/women/2.jpg' },
              postTitle: 'Emily Davis',
              postImage: { uri: 'https://randomuser.me/api/portraits/women/2.jpg' },
              likes: 92,
              isLiked: true,
            },
          ];
          
        res.json(postInfo);
    } catch (error) {
        console.error('Error fetching places: ', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/get_all_shorts', (req, res) => {
    try {
        const videoInfo = [
            {
              id: 1,
              video:{ url: 'https://www.youtube.com/shorts/8OLAi6Eba98?feature=share' } , // Profile image URL
              videoTitle: 'John Doe',
              videoImage: { uri: 'https://randomuser.me/api/portraits/men/4.jpg' }, // Post image URL
              likes: 120,
              isLiked: false,
            },
            {
              id: 2,
              video:{ url: 'https://www.youtube.com/shorts/NsOfgaUD92Q?feature=share' } ,
              videoTitle: 'Jane Smith',
              videoImage: { uri: 'https://randomuser.me/api/portraits/women/2.jpg' },
              likes: 230,
              isLiked: true,
            },
            {
              id: 3,
              video:  { url: 'https://www.youtube.com/shorts/QyGx_Z2tbTA?feature=share' } ,
              videoTitle: 'Robert Johnson',
              videoImage: { uri: 'https://randomuser.me/api/portraits/men/2.jpg' },
              likes: 78,
              isLiked: false,
            },
            {
              id: 4,
              video: { url: 'https://www.youtube.com/shorts/QyGx_Z2tbTA?feature=share' },
              videoTitle: 'Emily Davis',
              videoImage: { uri: 'https://randomuser.me/api/portraits/women/2.jpg' },
              likes: 92,
              isLiked: true,
            },
          ];
          
        res.json(videoInfo);
    } catch (error) {
        console.error('Error fetching places: ', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/get_all_Notification', (req, res) => {
    try {
        const Notification = [
            {
                id: 1,
                title: "New Recipe Alert!",
                description:
                  "Lorem ipsum tempor incididunt ut labore et dolore, in voluptate velit esse cillum",
                time: "10 mins ago",
                date: "Today",
                read: false, // Initially unread
              },
              {
                id: 2,
                title: "Save Recipe Alert!",
                description:
                  "Lorem ipsum tempor incididunt ut labore et dolore, in voluptate velit esse cillum",
                time: "30 mins ago",
                date: "Yesterday",
                read: true, // Initially read
              },
              {
                id: 3,
                title: "Special Offer Alert!",
                description:
                  "Exclusive offers just for you, hurry up before they expire!",
                time: "2 hours ago",
                date: "Today",
                read: false, // Initially unread
              },
          ];
          
        res.json(Notification);
    } catch (error) {
        console.error('Error fetching places: ', error);
        res.status(500).send('Internal Server Error');
    }
});

const peopleData = [
    {
      id: "1",
      name: "Aurelia",
      tagline: "Be your own hero 💪",
      image: "https://www.perfocal.com/blog/content/images/size/w960/2021/01/Perfocal_17-11-2019_TYWFAQ_100_standard-3.jpg",
    },
    {
      id: "2",
      name: "Bristy Haque",
      tagline: "Keep working ✍️",
      image: "https://img.freepik.com/free-photo/business-woman-with-tablet-street_23-2148213471.jpg",
    },
    {
      id: "3",
      name: "John Borino",
      tagline: "Make yourself proud 😇",
      image: "https://imgv3.fotor.com/images/ai-headshot-generator/AI-generated-LinkedIn-profile-picture--of-a-smiling-male-in-the-light-brown-business-suit-with-his-back-to-the-window-from-Fotor.jpg",
    },
    {
      id: "4",
      name: "Ella Fitzgerald",
      tagline: "Stay inspired 🌟",
      image: "https://a.storyblok.com/f/191576/1176x882/f95162c213/profile_picture_hero_before.webp",
    },
    {
      id: "5",
      name: "Michael Stevens",
      tagline: "Dream big 🚀",
      image: "https://t3.ftcdn.net/jpg/06/01/50/96/240_F_601509638_jDwIDvlnryPRhXPsBeW1nXv90pdlbykC.jpg",
    },
    {
      id: "6",
      name: "Sophia Grace",
      tagline: "Never give up 🏆",
      image: "https://img.freepik.com/free-photo/businesswoman-making-phone-call-outdoors_23-2148002104.jpg",
    },
  ];



// Endpoint to search people by name
app.get('/search_people', (req, res) => {
    const query = req.query.query || ''; // Get query parameter or default to empty string
    try {
      const filteredData = peopleData.filter((person) =>
        person.name.toLowerCase().includes(query.toLowerCase())
      );
      res.json(filteredData); // Respond with filtered results based on search query
    } catch (error) {
      console.error('Error searching data: ', error);
      res.status(500).send('Internal Server Error');
    }
  });


  // Endpoint to get all places
app.get('/search_places', (req, res) => {
    const query = req.query.query || '';
    try {
        const places = [
            { id: 1, name: 'Ocean Breeze', title: 'Place 1', subtitle: 'Beachfront', image: 'https://img.freepik.com/free-photo/straight-road-middle-desert-with-magnificent-mountains-sunset_181624-37698.jpg?semt=ais_hybrid' },
            { id: 2, name: 'Mountain Peaks', title: 'Place 2', subtitle: 'Mountain View', image: 'https://img.freepik.com/free-photo/straight-road-middle-desert-with-magnificent-mountains-sunset_181624-37698.jpg?semt=ais_hybrid' },
            { id: 3, name: 'Sunnyvale', title: 'Place 3', subtitle: 'Sunny Retreat', image: 'https://img.freepik.com/free-photo/straight-road-middle-desert-with-magnificent-mountains-sunset_181624-37698.jpg?semt=ais_hybrid' },
            { id: 4, name: 'Woodland Haven', title: 'Place 4', subtitle: 'Cozy Cabin', image: 'https://img.freepik.com/free-photo/straight-road-middle-desert-with-magnificent-mountains-sunset_181624-37698.jpg?semt=ais_hybrid' },
            { id: 5, name: 'Urban Oasis', title: 'Place 5', subtitle: 'Urban Loft', image: 'https://img.freepik.com/free-photo/straight-road-middle-desert-with-magnificent-mountains-sunset_181624-37698.jpg?semt=ais_hybrid' },
            { id: 6, name: 'Riverfront Getaway', title: 'Place 6', subtitle: 'Riverside', image: 'https://img.freepik.com/free-photo/straight-road-middle-desert-with-magnificent-mountains-sunset_181624-37698.jpg?semt=ais_hybrid' }
        ];
      const filteredPlaces = places.filter(place =>
        place.name.toLowerCase().includes(query.toLowerCase())
      );
      res.json(filteredPlaces);
    } catch (error) {
      console.error('Error fetching places: ', error);
      res.status(500).send('Internal Server Error');
    }
  });

  
app.get('/get_all_schedule', (req, res) => {
    try {
        const places = [
            {
                id: 1,
                title: 'Bikers club',
                from: 'Chennai----------',
                to: 'Mysore',
                date: '02-02-25',
                riders: 20,
                joined: true,
                imageUrl: 'https://img.freepik.com/free-photo/straight-road-middle-desert-with-magnificent-mountains-sunset_181624-37698.jpg?semt=ais_hybrid',
                day1Locations: ['Thirumazhisai', 'Sriperumbudur', 'Vellore', 'Vaniyambadi', 'Krishnagiri'],
                day2Locations: ['Krishnagiri', 'Salem', 'Erode'],
              },
              {
                id: 2,
                title: 'R15 club',
                from: 'Coimbatore----------',
                to: 'Goa',
                date: '10-12-24',
                riders: 2,
                joined: true,
                imageUrl: 'https://img.freepik.com/free-photo/straight-road-middle-desert-with-magnificent-mountains-sunset_181624-37698.jpg?semt=ais_hybrid',
                day1Locations: ['Chennai', 'Tiruvannamalai', 'Vellore'],
                day2Locations: ['Erode', 'Coimbatore'],
              },
              {
                id: 3,
                title: 'R16 club',
                from: 'Coimbatore----------',
                to: 'Goa',
                date: '17-12-24',
                riders: 2,
                joined: true,
                imageUrl: 'https://img.freepik.com/free-photo/straight-road-middle-desert-with-magnificent-mountains-sunset_181624-37698.jpg?semt=ais_hybrid',
                day1Locations: ['Madurai', 'Dindigul', 'Karur'],
                day2Locations: ['Salem', 'Coimbatore'],
              },
              {
                id: 4,
                title: 'Bikers club',
                from: 'Chennai----------',
                to: 'Mysore',
                date: '14-02-25',
                riders: 20,
                joined: true,
                imageUrl: 'https://img.freepik.com/free-photo/straight-road-middle-desert-with-magnificent-mountains-sunset_181624-37698.jpg?semt=ais_hybrid',
                day1Locations: ['Thiruvallur', 'Pondicherry'],
                day2Locations: ['Cuddalore', 'Chidambaram'],
              },
              {
                id: 5,
                title: 'Route 46',
                from: 'Chennai----------',
                to: 'Mysore',
                date: '12-02-25',
                riders: 20,
                joined: true,
                imageUrl: 'https://img.freepik.com/free-photo/straight-road-middle-desert-with-magnificent-mountains-sunset_181624-37698.jpg?semt=ais_hybrid',
                day1Locations: ['Bangalore', 'Hosur'],
                day2Locations: ['Coimbatore', 'Mysore'],
              }
        ];
        res.json(places);
    } catch (error) {
        console.error('Error fetching places: ', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/makeschedule', authenticateToken, upload.single('coverImage'), async (req, res) => {
    try {
      const scheduleData = req.body;
  
      const folderPath = path.join(__dirname, 'uploads');

  
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }
  
      // Handle file upload and generate file path
      console.log(scheduleData);
    //   if (req.coverImage) {

    //     const uploadedImagePath = path.join('uploads', req.coverImage);

    //     scheduleData.coverImageUrl = `/${uploadedImagePath}`;
    //     console.log('Uploaded cover image path:', uploadedImagePath);
    //   } else {
    //     return res.status(400).json({ message: 'No cover image uploaded' });
    //   }
  
      const fileName = `schedule_${Date.now()}.json`;
      const filePath = path.join(folderPath, fileName);
  
      // Save the schedule data to a JSON file
      fs.writeFile(filePath, JSON.stringify(scheduleData, null, 2), (err) => {
        if (err) {
          console.error('Error writing schedule data to file:', err);
          return res.status(500).json({ message: 'Failed to save schedule' });
        }
  
        console.log('Schedule data saved to file:', filePath);
  
        // Respond with the saved data and image URL
        res.status(200).json({
          message: 'Schedule received and saved successfully',
          receivedData: scheduleData,
          user: req.user, // Assuming you have user info in req.user
        });
      });
    } catch (error) {
      console.error('Error in making schedule:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/reels_upload', authenticateToken, upload.single('media'), async (req, res) => {
    try {
      const scheduleData = req.body; // The JSON data sent in the body
      const mediaFile = scheduleData.coverImageUrl; // The uploaded file

  
      // Log the received data (for debugging purposes)
      console.log('Received Schedule Data:', scheduleData);
      console.log('Received Media File:', mediaFile);
  
      const folderPath = path.join(__dirname, 'Reels'); // Folder to store the schedules
  
      // Create a schedule object with media file information
      const scheduleWithMedia = {
        title: scheduleData.title,
        description: scheduleData.description,
        coverMediaUrl: mediaFile ? mediaFile : null, // Store the path to the media file
      };
      if(!mediaFile){
        return res.status(400).json({ message: 'Failed to save schedule' });
      }else{
        
      }

  
      const fileName = `schedule_${Date.now()}.json`; // Use a timestamp for unique filenames
      const filePath = path.join(folderPath, fileName);
  
      // Save the schedule data to a JSON file
      fs.writeFile(filePath, JSON.stringify(scheduleWithMedia, null, 2), (err) => {
        if (err) {
          console.error('Error writing schedule data to file:', err);
          return res.status(400).json({ message: 'Failed to save schedule' });
        }
  
        console.log('Schedule data saved to file:', filePath);
  
        res.status(200).json({
          message: 'Schedule received and saved successfully',
          receivedData: scheduleWithMedia,
          user: req.user, // Send the user info back (from token)
        });
      });
    } catch (error) {
      console.error('Error in reels_uplod route:', error);
      res.status(400).json({ message: 'Failed to upload reel' });
    }
  });
  
app.put('/edit_profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const userId = req.user.userId; // Assuming user ID is stored in req.user after authentication

    // **Check if at least one field is provided**
    if (!fullName && !email) {
      return res.status(400).json({ message: 'Please provide fullName or email to update.' });
    }

    // **Validation**
    const updateData = {};

    if (fullName) {
      if (typeof fullName !== 'string' || fullName.length < 3) {
        return res.status(400).json({ message: 'Full name must be at least 3 characters long.' });
      }
      updateData.fullName = fullName;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
      }

      // **Check if Email Already Exists (excluding current user)**
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use by another user.' });
      }

      updateData.email = email;
    }

    // **Update User Profile**
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'Profile updated successfully.', user: updatedUser });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
  
*/

// Use Routes
app.use(userRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`http://localhost:${process.env.SERVER_PORT}`)
})

module.exports = app;