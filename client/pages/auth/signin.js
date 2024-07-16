// import { getProviders, signIn } from "next-auth/react";
// import { useState } from "react";

// export default function SignIn({ providers }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     signIn('credentials', { email, password });
//   };

//   return (
//     <>
//       <form onSubmit={handleSubmit}>
//         <input 
//           type="email" 
//           placeholder="Email" 
//           value={email} 
//           onChange={(e) => setEmail(e.target.value)} 
//           required 
//         />
//         <input 
//           type="password" 
//           placeholder="Password" 
//           value={password} 
//           onChange={(e) => setPassword(e.target.value)} 
//           required 
//         />
//         <button type="submit">Sign In</button>
//       </form>

//       {Object.values(providers).map((provider) => (
//         provider.name !== 'Credentials' && (
//           <div key={provider.name}>
//             <button onClick={() => signIn(provider.id)}>
//               Sign in with {provider.name}
//             </button>
//           </div>
//         )
//       ))}
//     </>
//   );
// }

// export async function getServerSideProps(context) {
//   const providers = await getProviders();
//   return {
//     props: { providers },
//   };
// }
// /pages/auth/signin.js

import { signIn } from "next-auth/react";
import React from "react";

const SignIn = () => {
  return (
    <div className="signin-container">
      <h1>Sign In</h1>
      <button onClick={() => signIn("google")}>Sign in with Google</button>
    </div>
  );
};

export default SignIn;
