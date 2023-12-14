// import mongoose from "mongoose";

// mongoose.connect("mongodb://127.0.0.1:27017/vclt", { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('connection sucessful'))
//     .catch((err) => console.log(err));

// export default mongoose;

import mongoose from "mongoose";

// mongoose.connect("mongodb://127.0.0.1:27017/vclt", { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connect("mongodb+srv://mohitbasediyaa:wzlyfHYUTP0dC6cD@vclt.5qaykud.mongodb.net/vclt")
    .then(() => console.log('connection sucessful'))
    .catch((err) => console.log("Error while dealing with mongoDB Database With Atlas : " , err));

export default mongoose;