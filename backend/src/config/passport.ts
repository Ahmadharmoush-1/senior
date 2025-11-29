// // src/config/passport.ts
// import dotenv from "dotenv";
// dotenv.config();

// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
// import { User } from "../models/User";
// import jwt from "jsonwebtoken";

// interface UserWithToken {
//   user: {
//     _id: string;
//     name: string;
//     email: string;
//   };
//   token: string;
// }

// /**
//  * GOOGLE OAUTH STRATEGY
//  * (keeps your existing code but ensures 'done' returns user object and token)
//  */
// if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
//   passport.use(
//     new GoogleStrategy(
//       {
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         callbackURL: process.env.GOOGLE_CALLBACK_URL,
//       },
//       async (_accessToken, _refreshToken, profile, done) => {
//         try {
//           const email = profile.emails?.[0]?.value || `${profile.id}@google.com`;
//           let user = await User.findOne({ email });

//           if (!user) {
//             user = await User.create({
//               name: profile.displayName,
//               email,
//               password: "google_oauth",
//             });
//           }

//           const token = jwt.sign(
//             { id: user._id, name: user.name, email: user.email },
//             process.env.JWT_SECRET || "secretkey",
//             { expiresIn: "7d" }
//           );

//           const result: UserWithToken = { user: { _id: user._id.toString(), name: user.name, email: user.email }, token };
//           return done(null, result);
//         } catch (err) {
//           console.error("Google OAuth Error:", err);
//           return done(err as Error, false);
//         }
//       }
//     )
//   );
// }

// /**
//  * JWT STRATEGY
//  * This will let you protect routes with `passport.authenticate("jwt", { session: false })`.
//  * It expects JWT payload to contain { id, name, email } as created elsewhere.
//  */
// const jwtSecret = process.env.JWT_SECRET || "secretkey";

// passport.use(
//   new JwtStrategy(
//     {
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: jwtSecret,
//     },
//     async (payload, done) => {
//       try {
//         // payload should contain an `id` (user id)
//         if (!payload || !payload.id) {
//           return done(null, false);
//         }

//         // Optionally, you can fetch the user from DB to verify it still exists:
//         const user = await User.findById(payload.id).select("_id name email");
//         if (!user) return done(null, false);

//         // attach a minimal user object to req.user
//         return done(null, { id: user._id.toString(), name: user.name, email: user.email });
//       } catch (err) {
//         console.error("JWT strategy error", err);
//         return done(err as Error, false);
//       }
//     }
//   )
// );

// export default passport;
