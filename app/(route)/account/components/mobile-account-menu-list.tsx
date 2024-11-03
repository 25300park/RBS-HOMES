"use client";

import { useSession } from "next-auth/react";
import { accountSideBarOption } from "@/lib/config/account-options";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaRegUser } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export default function MobileAccountMenu() {
 const { data: session, status } = useSession();
 const router = useRouter();

 // Guest UI
 if (!session) {
   return (
     <div className="flex flex-col min-h-[calc(100dvh-80px)]">
       {/* Guest Profile Section */}
       <div className="p-4 flex flex-col items-center text-center border-b">
         <Avatar className="w-20 h-20 mb-3">
           <AvatarFallback>
             <FaRegUser className="text-2xl" />
           </AvatarFallback>
         </Avatar>
         <h2 className="font-medium">Guest</h2>
         <p className="text-sm text-gray-500">Please sign in to access account features</p>
       </div>

       {/* Banner Section for Guests */}
       <div className="p-4 bg-white">
         <div className="rounded-xl border p-4 flex flex-col items-center text-center">
           <h3 className="font-medium">Welcome to RBS</h3>
           <p className="text-orange-500 text-sm mt-2">Sign in to access all features</p>
           <div className="mt-4 space-x-3">
             <Button 
               onClick={() => router.push('/auth/login')}
               variant="default"
               className="px-8"
             >
               Sign In
             </Button>
             <Button 
               onClick={() => router.push('/auth/register')}
               variant="outline"
               className="px-8"
             >
               Register
             </Button>
           </div>
         </div>
       </div>
     </div>
   );
 }

 // Authenticated User UI
 return (
   <div className="flex flex-col min-h-[calc(100dvh-80px)]">
     {/* Profile Section */}
     <div className="p-4 flex flex-col items-center text-center border-b">
       <Avatar className="w-20 h-20 mb-3">
         <AvatarImage src={session?.user?.image || ""} />
         <AvatarFallback>
           <FaRegUser className="text-2xl" />
         </AvatarFallback>
       </Avatar>
       <h2 className="font-medium">{session.user?.name}</h2>
       <p className="text-sm text-gray-500">{session.user?.email}</p>
     </div>

     {/* Banner Section */}
     <div className="p-4 bg-white">
       <div className="rounded-xl border p-4 flex items-center justify-between">
         <div>
           <h3 className="font-medium">A new space awaits to fill</h3>
           <p className="text-orange-500 text-sm">your life with moments</p>
           <p className="text-xs text-gray-500 mt-1">
             Easily connect with the right properties and clients
           </p>
         </div>
         <img 
           src="/assets/images/house-illustration.png" 
           alt="House" 
           className="w-24 h-24"
         />
       </div>
     </div>

     {/* Settings Menu - Only shown to authenticated users */}
     <div className="p-4">
       <h3 className="text-lg font-semibold mb-4">Setting</h3>
       <div className="space-y-2">
         {accountSideBarOption.map((option) => (
           <div key={option.name}>
             {option.children.length === 0 && option.link ? (
               <button
                 onClick={() => router.push(option.link)}
                 className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50"
               >
                 <div className="flex items-center gap-3">
                   <option.icon className="w-6 h-6 text-gray-500" />
                   <span>{option.name}</span>
                 </div>
                 <ChevronRight className="w-5 h-5 text-gray-400" />
               </button>
             ) : (
               <>
                 {option.children.map((item) => (
                   <button
                     key={item.name}
                     onClick={() => router.push(item.link)}
                     className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50"
                   >
                     <div className="flex items-center gap-3">
                       <item.icon className="w-6 h-6 text-gray-500" />
                       <span>{item.name}</span>
                     </div>
                     <ChevronRight className="w-5 h-5 text-gray-400" />
                   </button>
                 ))}
               </>
             )}
           </div>
         ))}
       </div>
     </div>
   </div>
 );
}