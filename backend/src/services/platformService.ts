// // This service coordinates posting a car to multiple platforms

// import { postToFacebook } from "./facebookService";
// import { postToOlx } from "./olxService";
// import { postToEdmunds } from "./edmundsService";

// export const postToPlatforms = async (car: any, platforms: string[]) => {
//   const results: any[] = [];

//   // Loop through platforms selected by user
//   for (const platform of platforms || []) {
//     switch (platform) {
//       case "facebook":
//         results.push(await postToFacebook(car));
//         break;

//       case "olx":
//         results.push(await postToOlx(car));
//         break;

//       case "edmunds":
//         results.push(await postToEdmunds(car));
//         break;

//       default:
//         results.push({
//           platform,
//           status: "FAILED",
//           reason: "Unknown platform",
//         });
//     }
//   }

//   return results;
// };