import { useEquipment } from './hooks/useEquipment';
import { SetupWizard } from './components/setup/SetupWizard';
import { MainView } from './components/main/MainView';

export default function App() {
  const { isConfigured } = useEquipment();

  if (!isConfigured) {
    return <SetupWizard />;
  }

  return <MainView />;
}
