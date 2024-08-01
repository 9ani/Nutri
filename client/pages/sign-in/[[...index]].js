import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#28511D]">
    <SignIn 
      path="/sign-in" 
      routing="path" 
      forceRedirectUrl="/"
      appearance={{
        elements: {
          formButtonPrimary: "bg-[#CEE422] hover:bg-[#28511D] text-[#28511D] hover:text-[#CEE422]",
          card: "bg-white",
        },
      }}
    />
  </div>
);

export default SignInPage;