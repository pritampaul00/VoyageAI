// import { SignIn } from '@clerk/nextjs'
// import { div } from 'motion/react-client'

// export default function Page() {
//   return (
//     <div className='flex items-center justify-center h-screen'>
//         <SignIn/>
//     </div>
//   )
// }

import { SignIn, SignedIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Page() {
  return (
    <>
      <SignedIn>
        {redirect("/create-new-trip")}
      </SignedIn>

      <SignIn />
    </>
  );
}