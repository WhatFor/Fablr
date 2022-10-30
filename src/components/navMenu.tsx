import React, { Fragment } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

// Top-level, LHS navbar links
const MainNavSection =
    <Fragment>
        <Link className="text-base hover:text-red-700" href="/">
            Fablr
        </Link>
        <Link className="text-base hover:text-red-700" href="/games">
            Games
        </Link>
    </Fragment>;

// top-level, RHS navbar links - Not logged in
const UnauthenticatedView =
    <Fragment>
        <button
            className="text-base uppercase hover:text-red-700"
            onClick={() => signIn("auth0")}>
            Login
        </button>
    </Fragment>;

// top-level, RHS navbar links - Logged in
const AuthenticatedView =
    <Fragment>
        <Link className="text-base hover:text-red-700" href={"profilePath"}>Account</Link>
        <button className="text-base uppercase hover:text-red-700" onClick={() => signOut()}>Logout</button>
    </Fragment>;

const NavMenu = () => {
    const { status } = useSession();

    return (
        <header>
            <div className="flex mx-6 px-6 mt-5 border-white border-4 justify-between">
                <div className="mb-2 space-x-8">
                    {MainNavSection}
                </div>
                <div className="mb-2 space-x-5">
                    {status === "authenticated" ? AuthenticatedView : UnauthenticatedView}
                </div>
            </div>
        </header>
    );
};

export default NavMenu;