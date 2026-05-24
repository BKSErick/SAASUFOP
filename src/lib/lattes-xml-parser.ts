import { XMLParser } from 'fast-xml-parser'

export interface ArtigoLattes {
    titulo: string
    ano: string
    periodico: string
    issn?: string
    doi?: string
}

export interface ConferenciaLattes {
    titulo: string
    ano: string
    evento: string
    cidade?: string
    natureza: string
    classificacao: string
}

export interface ProjetoLattes {
    titulo: string
    ano_inicio: string
    ano_fim?: string
    situacao: string
    financiador?: string
}

export interface OrientacaoLattes {
    tipo: string
    titulo: string
    ano: string
    orientado: string
    situacao: 'CONCLUIDA' | 'EM_ANDAMENTO'
    instituicao?: string
}

export interface LattesIndicators {
    indexH?: number
    fwci?: number
    artigos: ArtigoLattes[]
    conferencias: ConferenciaLattes[]
    projetos: ProjetoLattes[]
    orientacoes: OrientacaoLattes[]
}

function toArray<T>(val: T | T[] | undefined): T[] {
    if (!val) return []
    return Array.isArray(val) ? val : [val]
}

function findCurriculum(jsonObj: any): any {
    if (!jsonObj || typeof jsonObj !== 'object') return null

    // Busca direta
    for (const key of Object.keys(jsonObj)) {
        if (key.toUpperCase().includes('CURRICULO')) {
            return jsonObj[key]
        }
    }

    // Fallback: primeiro valor que seja objeto (ignora strings/números)
    for (const key of Object.keys(jsonObj)) {
        if (key === '?xml' || key === 'xml') continue
        const val = jsonObj[key]
        if (val && typeof val === 'object') return val
    }

    return null
}

export const parseLattesXML = async (xmlContent: string): Promise<LattesIndicators> => {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        trimValues: true,
        parseAttributeValue: false,
        processEntities: true,
    })

    let jsonObj: any
    try {
        jsonObj = parser.parse(xmlContent)
    } catch (e: any) {
        throw new Error(`Falha ao parsear o XML: ${e.message}`)
    }

    const curriculum = findCurriculum(jsonObj)

    if (!curriculum) {
        const keys = Object.keys(jsonObj ?? {}).join(', ')
        throw new Error(`XML não reconhecido como Lattes. Tags raiz encontradas: [${keys}]`)
    }

    // ── Artigos em Periódicos ──────────────────────────────────────────────────
    const producaoBibliografica = curriculum['PRODUCAO-BIBLIOGRAFICA'] ?? {}

    const artigos: ArtigoLattes[] = toArray(
        producaoBibliografica['ARTIGOS-PUBLICADOS']?.['ARTIGO-PUBLICADO']
    ).map((art: any) => ({
        titulo: art['DADOS-BASICOS-DO-ARTIGO']?.['TITULO-DO-ARTIGO'] ?? '',
        ano: String(art['DADOS-BASICOS-DO-ARTIGO']?.['ANO-DO-ARTIGO'] ?? ''),
        periodico: art['DETALHAMENTO-DO-ARTIGO']?.['TITULO-DO-PERIODICO-OU-REVISTA'] ?? '',
        issn: art['DETALHAMENTO-DO-ARTIGO']?.['ISSN'] ?? undefined,
        doi: art['DADOS-BASICOS-DO-ARTIGO']?.['DOI'],
    }))

    // ── Trabalhos em Eventos ──────────────────────────────────────────────────
    const conferencias: ConferenciaLattes[] = toArray(
        producaoBibliografica['TRABALHOS-EM-EVENTOS']?.['TRABALHO-EM-EVENTOS']
    ).map((t: any) => ({
        titulo: t['DADOS-BASICOS-DO-TRABALHO']?.['TITULO-DO-TRABALHO'] ?? '',
        ano: String(t['DADOS-BASICOS-DO-TRABALHO']?.['ANO-DO-TRABALHO'] ?? ''),
        natureza: t['DADOS-BASICOS-DO-TRABALHO']?.['NATUREZA'] ?? '',
        evento: t['DETALHAMENTO-DO-TRABALHO']?.['NOME-DO-EVENTO'] ?? '',
        cidade: t['DETALHAMENTO-DO-TRABALHO']?.['CIDADE-DO-EVENTO'],
        classificacao: t['DETALHAMENTO-DO-TRABALHO']?.['CLASSIFICACAO-DO-EVENTO'] ?? '',
    }))

    // ── Projetos de Pesquisa ──────────────────────────────────────────────────
    const projetos: ProjetoLattes[] = []
    const atuacoes = toArray(
        curriculum['DADOS-GERAIS']?.['ATUACOES-PROFISSIONAIS']?.['ATUACAO-PROFISSIONAL']
    )

    for (const atuacao of atuacoes) {
        const pesquisas = toArray(
            atuacao['ATIVIDADES-DE-PESQUISA-E-DESENVOLVIMENTO']?.['PESQUISA-E-DESENVOLVIMENTO']
        )
        for (const pesq of pesquisas) {
            const dados = pesq['DADOS-BASICOS-DA-PESQUISA-E-DESENVOLVIMENTO'] ?? {}
            projetos.push({
                titulo: dados['NOME-DO-PROJETO'] ?? dados['TITULO-DO-PROJETO'] ?? '',
                ano_inicio: String(dados['ANO-INICIO'] ?? ''),
                ano_fim: dados['ANO-FIM'] ? String(dados['ANO-FIM']) : undefined,
                situacao: dados['SITUACAO'] ?? '',
                financiador: toArray(pesq['FINANCIADORES']?.['FINANCIADOR'])
                    .map((f: any) => f['NOME-DA-INSTITUICAO-FINANCIADORA'])
                    .filter(Boolean)
                    .join(', ') || undefined,
            })
        }
    }

    // ── Orientações Concluídas ────────────────────────────────────────────────
    const outraProducao = curriculum['OUTRA-PRODUCAO'] ?? {}
    const orientacoesConcluidas: OrientacaoLattes[] = toArray(
        outraProducao['ORIENTACOES-CONCLUIDAS']?.['ORIENTACAO-CONCLUIDA']
    ).map((ori: any) => ({
        tipo: ori['DADOS-BASICOS-DE-ORIENTACOES-CONCLUIDAS']?.['NATUREZA'] ?? '',
        titulo: ori['DADOS-BASICOS-DE-ORIENTACOES-CONCLUIDAS']?.['TITULO'] ?? '',
        ano: String(ori['DADOS-BASICOS-DE-ORIENTACOES-CONCLUIDAS']?.['ANO'] ?? ''),
        orientado: ori['DETALHAMENTO-DE-ORIENTACOES-CONCLUIDAS']?.['NOME-DO-ORIENTADO'] ?? '',
        situacao: 'CONCLUIDA',
        instituicao: ori['DETALHAMENTO-DE-ORIENTACOES-CONCLUIDAS']?.['NOME-DA-INSTITUICAO'],
    }))

    // ── Orientações em Andamento ──────────────────────────────────────────────
    const orientAndamento = curriculum['DADOS-GERAIS']?.['ORIENTACOES-EM-ANDAMENTO'] ?? {}
    const orientacoesAndamento: OrientacaoLattes[] = []

    const tiposAndamento: [string, string, string][] = [
        ['MESTRADO', 'ORIENTACAO-EM-ANDAMENTO-DE-MESTRADO', 'MESTRADO'],
        ['DOUTORADO', 'ORIENTACAO-EM-ANDAMENTO-DE-DOUTORADO', 'DOUTORADO'],
        ['POS-DOUTORADO', 'ORIENTACAO-EM-ANDAMENTO-DE-POS-DOUTORADO', 'POS-DOUTORADO'],
        ['INICIACAO-CIENTIFICA', 'ORIENTACAO-EM-ANDAMENTO-DE-INICIACAO-CIENTIFICA', 'IC'],
        ['TRABALHO-DE-CONCLUSAO-DE-CURSO-GRADUACAO', 'ORIENTACAO-EM-ANDAMENTO-DE-TRABALHO-DE-CONCLUSAO-DE-CURSO-GRADUACAO', 'TCC'],
    ]

    for (const [chave, tag, tipo] of tiposAndamento) {
        toArray(orientAndamento[chave]?.[tag]).forEach((ori: any) => {
            const dados = ori['DADOS-BASICOS-DA-ORIENTACAO-EM-ANDAMENTO'] ?? {}
            const det = ori['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO'] ?? {}
            orientacoesAndamento.push({
                tipo,
                titulo: dados['TITULO'] ?? '',
                ano: String(dados['ANO-DE-INICIO'] ?? ''),
                orientado: det['NOME-DO-ORIENTANDO'] ?? '',
                situacao: 'EM_ANDAMENTO',
                instituicao: det['NOME-DA-INSTITUICAO'],
            })
        })
    }

    return {
        artigos,
        conferencias,
        projetos,
        orientacoes: [...orientacoesConcluidas, ...orientacoesAndamento],
    }
}
