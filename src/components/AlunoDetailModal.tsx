'use client'

import { useEffect, useRef, useMemo } from 'react'
import { X, GraduationCap, Mail, Calendar, Clock } from 'lucide-react'

export interface Aluno {
  id: string
  nome: string
  matricula: string
  email?: string | null
  data_ingresso?: string | null
  status?: string | null
  status_bolsa?: string | null
  prazo_jubilamento?: string | null
  professor_orientador_id?: string | null
  professores?: { nome: string } | null
}

interface AlunoDetailModalProps {
  aluno: Aluno | null
  onClose: () => void
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="px-6 py-4 border-b border-zinc-800/60 last:border-b-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-zinc-600">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
      </div>
      <div className="text-sm text-zinc-100 pl-5">{value}</div>
    </div>
  )
}

export function AlunoDetailModal({ aluno, onClose }: AlunoDetailModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  const mesesNoCurso = useMemo(() => {
    if (!aluno?.data_ingresso) return null
    const ingresso = new Date(aluno.data_ingresso)
    const hoje = new Date()
    return (hoje.getFullYear() - ingresso.getFullYear()) * 12 + (hoje.getMonth() - ingresso.getMonth())
  }, [aluno])

  useEffect(() => {
    if (!aluno) return
    dialogRef.current?.focus()
  }, [aluno])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!aluno) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="aluno-modal-title"
        tabIndex={-1}
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto outline-none shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-zinc-600">{aluno.matricula}</span>
            <button
              onClick={onClose}
              className="text-zinc-600 hover:text-white transition-colors -mt-1"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>
          <h2 id="aluno-modal-title" className="text-lg font-black text-white uppercase tracking-wide leading-tight">
            {aluno.nome}
          </h2>
          <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-300 px-3 py-1 rounded">
            {aluno.status || 'REGULAR'}
          </span>
        </div>

        <div className="border-t border-zinc-800">
          <Field
            icon={<GraduationCap size={13} />}
            label="Orientador"
            value={aluno.professores?.nome || 'Não atribuído'}
          />
          <Field
            icon={<Mail size={13} />}
            label="E-mail"
            value={aluno.email || '—'}
          />
          <Field
            icon={<Calendar size={13} />}
            label="Data de Ingresso"
            value={formatDate(aluno.data_ingresso)}
          />
          <Field
            icon={<Clock size={13} />}
            label="Prazo de Jubilamento"
            value={formatDate(aluno.prazo_jubilamento)}
          />
          {mesesNoCurso !== null && (
            <Field
              icon={<Clock size={13} />}
              label="Meses no Curso"
              value={`${mesesNoCurso} ${mesesNoCurso === 1 ? 'mês' : 'meses'}`}
            />
          )}
          <Field
            icon={<GraduationCap size={13} />}
            label="Status Bolsa"
            value={aluno.status_bolsa || 'Nenhuma'}
          />
        </div>
      </div>
    </div>
  )
}
