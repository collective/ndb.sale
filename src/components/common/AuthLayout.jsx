import React from "react"
import Header from "./header"
import { Apart, Trees } from "../../utilities/imgImport"
import { ApplicationContext } from "../../context/store"

const AuthLayout = ({ children }) => {
    return (
        <ApplicationContext>
            <main className="signup-page">
                <Header />
                <section className="position-relative">
                    <div className="d-flex container position-relative h-100 align-items-center">
                        <div className="signup">{children}</div>
                        <img src={Apart} alt="apart" className="apart-img z-999" />
                    </div>
                    <img src={Trees} alt="trees" className="trees-img w-100 z-n999" />
                </section>
            </main>
        </ApplicationContext>
    )
}

export default AuthLayout
