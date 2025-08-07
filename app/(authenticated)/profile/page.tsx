import { Metadata } from 'next';
import ProfileContent from './profile-content';
export const metadata: Metadata = {
  title: 'Perfil | Caça Tarefa',
  description: 'Visualize e edite suas informações pessoais',
};
export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>
      <ProfileContent />
    </div>
  );
}
