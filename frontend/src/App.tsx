import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Holdings from "./pages/Holdings";
import Dividends from "./pages/Dividends";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/dividends" element={<Dividends />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
