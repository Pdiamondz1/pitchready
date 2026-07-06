import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import Home from "@/pages/Home";
import Score from "@/pages/Score";
import Decks from "@/pages/Decks";
import NewDeck from "@/pages/NewDeck";
import DeckEditor from "@/pages/DeckEditor";
import Present from "@/pages/Present";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Full-screen presentation is outside the app chrome */}
        <Route path="/decks/:id/present" element={<Present />} />

        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/score" element={<Score />} />
          <Route path="/decks" element={<Decks />} />
          <Route path="/new" element={<NewDeck />} />
          <Route path="/decks/:id" element={<DeckEditor />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
