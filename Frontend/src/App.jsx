import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./Pages/Home";
import Document from "./Pages/Document";
import Chatbot from "./Pages/Chatbot";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />}/>
                <Route path="/upload-legal-doc" element={<Document/>}/>
                <Route path="/chatbot" element={<Chatbot/>}/>
            </Route>
        </Routes>
    );
}

export default App;
