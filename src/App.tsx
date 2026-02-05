import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Top } from "./components/Top";
import { Board } from "./components/Board";

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Top />} />
      <Route path="/b/:boardId" element={<Board />} />
    </Routes>
  </BrowserRouter>
);

export default App;