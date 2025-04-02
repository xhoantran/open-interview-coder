import { DynamicContainer } from './components/DynamicContainer';
import { FeatureView } from './features';
import './global.css';

function App() {
  return (
    <DynamicContainer>
      <FeatureView />
    </DynamicContainer>
  );
}

export default App;
