import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#28511D]">
    <SignUp 
      path="/sign-up" 
      routing="path" 
      appearance={{
        elements: {
          formButtonPrimary: "bg-[#CEE422] hover:bg-[#28511D] text-[#28511D] hover:text-[#CEE422]",
          card: "bg-white",
        },
      }}
    />
  </div>
);

export default SignUpPage;