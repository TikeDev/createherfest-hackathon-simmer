import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ViewPreferencesProvider } from './contexts/ViewPreferencesContext'
import Landing from './pages/Landing'
import Home from './pages/Home'
import CookingModeWrapper from './pages/CookingMode'
import Extract from './pages/Extract'
import RecipeDetail from './pages/RecipeDetail'
import AppLayout from './components/layout/AppLayout'
import { OfflineBanner } from './components/ui/OfflineBanner'

export default function App() {
  return (
    <ViewPreferencesProvider>
      <BrowserRouter>
        <OfflineBanner />
        <Routes>
          <Route path="/cook/:id" element={<CookingModeWrapper />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/recipes" element={<Home />} />
            <Route path="/extract" element={<Extract />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ViewPreferencesProvider>
  )
}
