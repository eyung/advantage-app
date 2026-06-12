import { useEquipment } from './hooks/useEquipment';
import { SetupWizard } from './components/setup/SetupWizard';
import { AppShell } from './components/shell/AppShell';

export default function App() {
  const { isConfigured } = useEquipment();

  if (!isConfigured) {
    return <SetupWizard />;
  }

  return <AppShell />;
}
