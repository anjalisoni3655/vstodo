import express from "express";
require("dotenv-safe").config();
import { join } from "path";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { __prod__ } from "../constants";
import { User } from "./entities/User";
import { Strategy as GitHubStrategy } from "passport-github";
import passport from "passport";
import jwt from "jsonwebtoken";
import cors from "cors";
import { Todo } from "./entities/Todo";
import { isAuth, ReqWithUserId } from "./isAuth";

//annonymous function call itself
const main = async () => {
  const connection = await createConnection({
    type: "postgres",
    database: "postgres",
    entities: [join(__dirname), "./entities/*.*"],
    username: "postgres",
    dropSchema: true,
    password: "postgres",
    logging: !__prod__,
    synchronize: !__prod__,
  });
  //   const user = await User.create({ name: "bob" }).save();
  //   console.log("user", { user });

  const app = express();
  passport.serializeUser((user: any, done) => {
    done(null, user.accessToken);
  });
  app.use(cors({ origin: "*" }));
  app.use(passport.initialize());
  app.use(express.json());

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/github/callback",
      },
      async (_, __, profile, cb) => {
        let user = await User.findOne({ where: { githubId: profile.id } });
        if (user) {
          user.name = profile.displayName;
          await user.save();
        } else {
          user = await User.create({
            name: profile.displayName,
            githubId: profile.id,
          }).save();
        }

        // profile.id

        console.log("profile", profile);
        cb(null, {
          accessToken: jwt.sign(
            { userId: user.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1y" }
          ),
          refreshToken: "",
        });
        //   User.findOrCreate({ githubId: profile.id }, function (err, user) {
        //     return cb(err, user);
        //   });
      }
    )
  );
  app.get("/auth/github", passport.authenticate("github", { session: false }));

  app.get(
    "/auth/github/callback",
    passport.authenticate(
      "github",
      { session: false }
      //    { failureRedirect: "/login" }
    ),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
      //  res.send(req.user);
      // res.send("you are logged in to github");
    }
  );
 app.get("/todo", isAuth, async (req: any, res) => {
   const todos = await Todo.find({
     where: { creatorId: req.userId },
     order: { id: "DESC" },
   });

   res.send({ todos });
 });
  /*  app.post("/todo", isAuth, async (req, res) => {
    const todo = await Todo.create({
      text: req.body.text,
      creatorId: req.userId,
    }).save();
    res.send({ todo });
  }); */
app.put("/todo", isAuth, async (req:any, res) => {
  const todo = await Todo.findOne(req.body.id);
  if (!todo) {
    res.send({ todo: null });
    return;
  }
  if (todo.creatorId !== req.userId) {
    throw new Error("not authorized");
  }
  todo.completed = !todo.completed;
  await todo.save();
  res.send({ todo });
});

  app.get("/me", async (req, res) => {
    //Bearer nbqwjsdascsc
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.send({ user: null });
      return;
    }
    const token = authHeader.split("")[1];
    if (!token) {
      res.send({ user: null });
      return;
    }
    let userId = "";
    try {
      const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      userId = payload.userId;
    } catch (err) {
      res.send({ user: null });
      return;
    }
    if (!userId) {
      res.send({ user: null });
      return;
    }
    const user = await User.findOne(userId);
    res.send({ user });
  });

  app.get("/", (_req, res) => {
    res.send("hello");
  });
  app.listen(3000, () => {
    console.log("listening on port 3000");
  });
};
main();
