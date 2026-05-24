'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'


export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                router.push('/dashboard')
            }
            setLoading(false)
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) router.push('/dashboard')
        })

        return () => subscription.unsubscribe()
    }, [router])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#9D2235' }}>
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: '#9D2235' }}>
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-sm z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-32 h-auto mb-6">
                        <img
                            src="/brand/logo-ufop-vert.png"
                            alt="UFOP Logo"
                            className="w-full h-auto drop-shadow-2xl invert"
                        />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
                        UFOP <span className="text-white/80">SaaS</span>
                    </h1>
                    <p className="text-white/70 font-medium">Gestão Acadêmica de Pós-Graduação</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-2xl">
                    <Auth
                        supabaseClient={supabase as any}
                        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/confirm`}
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: '#8b0000',
                                        brandAccent: '#660000',
                                        inputBackground: '#f4f4f5',
                                        inputText: '#18181b',
                                        inputPlaceholder: '#71717a',
                                        inputBorder: '#e4e4e7',
                                    },
                                    space: {
                                        inputPadding: '12px 16px',
                                        buttonPadding: '12px 16px',
                                    },
                                    radii: {
                                        borderRadiusButton: '12px',
                                        buttonBorderRadius: '12px',
                                        inputBorderRadius: '12px',
                                    }
                                }
                            }
                        }}
                        theme="dark"
                        providers={[]}
                        localization={{
                            variables: {
                                sign_in: {
                                    email_label: 'E-mail Institucional',
                                    password_label: 'Senha de Acesso',
                                    button_label: 'Entrar na Plataforma',
                                    loading_button_label: 'Iniciando sessão...',
                                    link_text: 'Já possui uma conta? Entre agora',
                                },
                                sign_up: {
                                    email_label: 'E-mail',
                                    password_label: 'Crie uma Senha',
                                    button_label: 'Cadastrar',
                                    loading_button_label: 'Criando conta...',
                                    link_text: 'Não tem conta? Solicite acesso',
                                },
                                forgotten_password: {
                                    email_label: 'E-mail',
                                    button_label: 'Recuperar Senha',
                                    link_text: 'Esqueceu sua senha?',
                                }
                            },
                        }}
                    />
                </div>

                <p className="text-center text-xs text-white/50 mt-8">
                    &copy; {new Date().getFullYear()} Universidade Federal de Ouro Preto. <br />
                    Sistema de Gerenciamento Acadêmico.
                </p>
            </div>
        </div>
    )
}
