import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { LogOut, User, Settings, Bell } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Caça Tarefa
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              
              <div className="relative group">
                <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {session.user?.name}
                  </span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Perfil
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Link>
                  <hr className="my-1" />
                  <form action={async () => {
                    "use server"
                    const { signOut } = await import("@/auth")
                    await signOut()
                  }}>
                    <button
                      type="submit"
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Bem-vindo ao Dashboard!
            </h2>
            <p className="text-gray-600">
              Olá <strong>{session.user?.name}</strong>, você está autenticado com o email{" "}
              <strong>{session.user?.email}</strong>.
            </p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">Tarefas Pendentes</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">0</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900">Tarefas Concluídas</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">0</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900">Projetos Ativos</h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">0</p>
              </div>
            </div>
            
            <div className="mt-8">
              <p className="text-sm text-gray-500">
                Esta é uma página protegida. Apenas usuários autenticados podem acessá-la.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
