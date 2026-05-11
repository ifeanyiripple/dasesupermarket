import type { ReactNode } from "react"
import BottomNavbar from "@/components/layout/BottomNav"

import LeftSidebar from "@/components/layout/LeftSideBar"
import RightSidebar from "@/components/layout/RightSideBar"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
         
      <BottomNavbar />
      <LeftSidebar />
      {/* <RightSidebar /> */}
        <main
          className="
            flex-1
            lg:pl-[68px]
          lg:pr-10
          xl:pl-[80px]
          xl:pr-15
            pb-[74px] lg:pb-0
            transition-all duration-300
          "
        >
        {children}
      </main>
      

    </div>
  )
}


