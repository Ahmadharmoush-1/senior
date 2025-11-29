// import { useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";

// const GoogleCallback = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const { setUser } = useAuth();

//   useEffect(() => {
//     const userParam = searchParams.get("user");
//     if (userParam) {
//       try {
//         const user = JSON.parse(decodeURIComponent(userParam));
//         setUser(user); // Set user in AuthContext and localStorage
//         localStorage.setItem("carfinder_user", JSON.stringify(user));
//         navigate("/"); // Redirect to home
//       } catch (err) {
//         console.error("Failed to parse Google user:", err);
//         navigate("/login");
//       }
//     } else {
//       navigate("/login");
//     }
//   }, [searchParams, setUser, navigate]);

//   return <div>Loading...</div>;
// };

// export default GoogleCallback;
