import * as XLSX from 'xlsx'
import { supabase } from './supabase'

const parseDateCell = (val: any): string | null => {
    if (!val) return null
    if (val instanceof Date) {
        const y = val.getFullYear()
        const m = String(val.getMonth() + 1).padStart(2, '0')
        const d = String(val.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }
    const str = String(val).trim()
    if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(str)) {
        const [day, month, year] = str.split('/')
        const fullYear = year.length === 2 ? `20${year}` : year
        return `${fullYear}-${month}-${day}`
    }
    return str || null
}

export const processSRAExport = async (file: File): Promise<number> => {
    const binaryData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'))
        reader.readAsBinaryString(file)
    })

    const workbook = XLSX.read(binaryData, { type: 'binary', cellDates: true })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 })

    let headerRowIndex = -1
    let headers: string[] = []

    for (let i = 0; i < rawRows.length; i++) {
        const row = rawRows[i]
        if (!row || !Array.isArray(row)) continue
        const rowStrings = row.map(cell => String(cell || '').trim().toUpperCase())
        if (
            (rowStrings.some(h => h === 'NOME' || h === 'ALUNO' || h === 'NOME DO ALUNO')) &&
            (rowStrings.some(h => h === 'MATRICULA' || h === 'MATRÍCULA' || h === 'REGISTRO'))
        ) {
            headerRowIndex = i
            headers = rowStrings
            break
        }
    }

    if (headerRowIndex === -1) {
        throw new Error('Não foi possível encontrar as colunas "NOME" e "MATRICULA" na planilha.')
    }

    const findCol = (...names: string[]) => {
        for (const n of names) {
            const idx = headers.indexOf(n)
            if (idx !== -1) return idx
        }
        return -1
    }

    const iNome = findCol('NOME', 'NOME DO ALUNO', 'ALUNO')
    const iMatricula = findCol('MATRICULA', 'MATRÍCULA', 'REGISTRO')
    const iEmail = findCol('EMAIL INSTITUCIONAL', 'EMAIL', 'E-MAIL')
    const iIngresso = findCol('DATA INGRESSO', 'DATA DE INGRESSO', 'ANO INGRESSO')
    const iBolsa = findCol('BOLSA', 'DESCRICAO BOLSA', 'TIPO BOLSA')
    const iOrientador = findCol(
        'ORIENTADOR', 'PROFESSOR ORIENTADOR', 'NOME DO ORIENTADOR',
        'DOCENTE ORIENTADOR', 'PROFESSOR', 'ORIENTADOR(A)'
    )
    const iStatus = findCol(
        'SITUACAO', 'SITUAÇÃO', 'STATUS', 'SITUAÇÃO DO DISCENTE',
        'STATUS DISCENTE', 'SITUAÇÃO DISCENTE'
    )
    const iPrazo = findCol(
        'PRAZO', 'PRAZO FINAL', 'PRAZO DE DEFESA', 'DATA PRAZO',
        'PRAZO DEFESA', 'DATA DE DEFESA', 'DATA DEFESA', 'PRAZO (MESES)'
    )

    // Build professor name → id map for matching
    const { data: professores } = await supabase.from('professores').select('id, nome')
    const profMap = new Map<string, string>()
    for (const p of professores ?? []) {
        profMap.set(String(p.nome).trim().toUpperCase(), p.id)
    }

    const studentsToInsert: any[] = []

    for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
        const row = rawRows[i]
        if (!row || !Array.isArray(row) || row.length === 0) continue

        const get = (idx: number) => (idx !== -1 ? row[idx] : undefined)
        const matricula = get(iMatricula)
        if (!matricula) continue

        const rawNome = get(iNome)
        const nome = rawNome ? String(rawNome).trim() : `Aluno Anonimizado (${matricula})`

        const orientadorNome = get(iOrientador)
        const professor_id = orientadorNome
            ? (profMap.get(String(orientadorNome).trim().toUpperCase()) ?? null)
            : null

        studentsToInsert.push({
            nome,
            matricula: String(matricula).trim(),
            email: get(iEmail) ? String(get(iEmail)).trim() : null,
            data_ingresso: parseDateCell(get(iIngresso)),
            prazo_jubilamento: parseDateCell(get(iPrazo)),
            status_bolsa: get(iBolsa) ? String(get(iBolsa)).trim() : 'Nenhuma',
            status: get(iStatus) ? String(get(iStatus)).trim() : 'ATIVO',
            professor_orientador_id: professor_id,
        })
    }

    if (studentsToInsert.length === 0) {
        throw new Error('Nenhum aluno válido encontrado na planilha. Verifique se as colunas NOME e MATRICULA possuem dados.')
    }

    const { error } = await supabase
        .from('alunos')
        .upsert(studentsToInsert, { onConflict: 'matricula' })

    if (error) throw error
    return studentsToInsert.length
}
