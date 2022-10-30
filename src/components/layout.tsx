import React, { type ReactNode } from "react";
import NavMenu from "./navMenu";

const Layout = ({ children }: { children: ReactNode | ReactNode[] }) => {
    return (
        <div className="h-screen">
            <NavMenu />
            <div className="mx-6 border-white border-4 my-4 px-4">
                {children}
            </div>
        </div>
    );
};

export default Layout;