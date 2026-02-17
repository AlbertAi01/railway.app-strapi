import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Characters from './pages/Characters';
import CharacterDetail from './pages/CharacterDetail';
import Weapons from './pages/Weapons';
import Equipment from './pages/Equipment';
import Blueprints from './pages/Blueprints';
import Guides from './pages/Guides';
import Recipes from './pages/Recipes';
import InteractiveMap from './pages/InteractiveMap';
import AscensionPlanner from './pages/AscensionPlanner';
import EssenceSolver from './pages/EssenceSolver';
import GearArtificingSolver from './pages/GearArtificingSolver';
import FactoryPlanner from './pages/FactoryPlanner';
import TierListBuilder from './pages/TierListBuilder';
import HeadhuntTracker from './pages/HeadhuntTracker';
import AchievementTracker from './pages/AchievementTracker';
import SummonSimulator from './pages/SummonSimulator';
import CharacterCardCreator from './pages/CharacterCardCreator';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Profile from './pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/characters/:slug" element={<CharacterDetail />} />
            <Route path="/weapons" element={<Weapons />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/blueprints" element={<Blueprints />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/map" element={<InteractiveMap />} />
            <Route path="/ascension-planner" element={<AscensionPlanner />} />
            <Route path="/essence-solver" element={<EssenceSolver />} />
            <Route path="/gear-artificing" element={<GearArtificingSolver />} />
            <Route path="/factory-planner" element={<FactoryPlanner />} />
            <Route path="/tier-list" element={<TierListBuilder />} />
            <Route path="/headhunt-tracker" element={<HeadhuntTracker />} />
            <Route path="/achievements" element={<AchievementTracker />} />
            <Route path="/summon-simulator" element={<SummonSimulator />} />
            <Route path="/character-card" element={<CharacterCardCreator />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback/:provider" element={<AuthCallback />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
