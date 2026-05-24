'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { logError } from '@/lib/logger'

function ConfirmContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/dashboard'

    useEffect(() => {
        // Se não houver token, redireciona para o login
        if (!tokenHash) {
            router.push('/login')
        }
    }, [tokenHash, router])

    const handleConfirm = async () => {
        setLoading(true)
        setError(null)

        try {
            if (!tokenHash || !type) {
                throw new Error('Link de confirmação inválido ou incompleto.')
            }

            const { error } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: type as any,
            })

            if (error) {
                throw error
            }

            setMessage('E-mail confirmado com sucesso! Redirecionando...')
            setTimeout(() => {
                router.push(next)
            }, 2000)
        } catch (err: any) {
            logError('auth-confirm', err)
            setError(err.message || 'Ocorreu um erro ao confirmar seu e-mail. O link pode ter expirado.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#9D2235]">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl text-center">
                <div className="inline-flex items-center justify-center w-24 h-auto mb-6">
                    <img
                        src="/brand/logo-ufop-vert.png"
                        alt="UFOP Logo"
                        className="w-full h-auto drop-shadow-xl"
                    />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Confirmação de Cadastro
                </h1>

                {message ? (
                    <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-xl">
                        {message}
                    </div>
                ) : error ? (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-xl">
                        {error}
                        <div className="mt-4">
                            <button
                                onClick={() => router.push('/login')}
                                className="text-sm font-semibold underline"
                            >
                                Voltar para o login
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-600 mb-8">
                            Para garantir a segurança da sua conta, clique no botão abaixo para confirmar seu e-mail institucional.
                        </p>

                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="w-full py-4 px-6 bg-[#8b0000] hover:bg-[#660000] text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Confirmando...' : 'Confirmar E-mail'}
                        </button>
                    </>
                )}

                <p className="text-xs text-gray-400 mt-8">
                    ESTA É UMA MEDIDA DE SEGURANÇA PARA EVITAR CADASTROS AUTOMATIZADOS.
                </p>
            </div>
        </div>
    )
}

export default function ConfirmPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#9D2235]" />}>
            <ConfirmContent />
        </Suspense>
    )
}
