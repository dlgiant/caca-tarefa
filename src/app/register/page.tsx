"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const router = useRouter()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  
  const validatePassword = (password: string) => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push("Mínimo 8 caracteres")
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Uma letra maiúscula")
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Uma letra minúscula")
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Um número")
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Um caractere especial")
    }
    
    return errors
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError("")
    
    if (name === "password") {
      setPasswordErrors(validatePassword(value))
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }
    
    if (passwordErrors.length > 0) {
      setError("A senha não atende aos requisitos de segurança")
      setIsLoading(false)
      return
    }
    
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || "Erro ao criar conta")
        return
      }
      
      // Fazer login automático após registro
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false
      })
      
      if (result?.ok) {
        router.push("/dashboard")
        router.refresh()
      } else {
        // Se o login automático falhar, redirecionar para página de login
        router.push("/login?registered=true")
      }
      
    } catch (error) {
      console.error("Erro ao registrar:", error)
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }
  
  const getPasswordStrengthColor = () => {
    if (!formData.password) return "bg-gray-200"
    if (passwordErrors.length === 0) return "bg-green-500"
    if (passwordErrors.length <= 2) return "bg-yellow-500"
    return "bg-red-500"
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Crie sua conta
            </h2>
            <p className="mt-2 text-gray-600">
              Comece a organizar suas tarefas hoje mesmo
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="João Silva"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="seu@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${getPasswordStrengthColor()}`}
                          style={{ 
                            width: `${Math.max(20, 100 - (passwordErrors.length * 20))}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {passwordErrors.length === 0 ? "Forte" : 
                         passwordErrors.length <= 2 ? "Média" : "Fraca"}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      {[
                        { text: "Mínimo 8 caracteres", test: formData.password.length >= 8 },
                        { text: "Uma letra maiúscula", test: /[A-Z]/.test(formData.password) },
                        { text: "Uma letra minúscula", test: /[a-z]/.test(formData.password) },
                        { text: "Um número", test: /[0-9]/.test(formData.password) },
                        { text: "Um caractere especial", test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) }
                      ].map((req, idx) => (
                        <div key={idx} className="flex items-center text-xs">
                          {req.test ? (
                            <Check className="h-3 w-3 text-green-500 mr-1" />
                          ) : (
                            <X className="h-3 w-3 text-red-500 mr-1" />
                          )}
                          <span className={req.test ? "text-green-700" : "text-gray-600"}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar senha
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">As senhas não coincidem</p>
                )}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || passwordErrors.length > 0 || formData.password !== formData.confirmPassword}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </button>
            
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Entre aqui
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
