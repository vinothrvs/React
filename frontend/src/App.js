import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <marquee><img src={logo} className="App-logo" alt="logo" /></marquee>
        
        <marquee><h1>Hello, World!</h1></marquee>
      </header>
    </div>
  );
}

export default App;
