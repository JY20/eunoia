import logo from './logo.svg';
import './App.css';
import DonatePage from './pages/DonatePage';
import { AppProvider } from './components/AppProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <AppProvider>
      <Navbar />
      <DonatePage />
      <Footer />
    </AppProvider>
  );
}

export default App;
