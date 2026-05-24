export const QUALIS_WEIGHTS: Record<string, number> = {
    'A1': 100,
    'A2': 85,
    'A3': 70,
    'A4': 55,
    'B1': 40,
    'B2': 30,
    'B3': 20,
    'B4': 10,
    'C': 0
}

export const calculateProgramScore = (productions: any[]) => {
    const totalScore = productions.reduce((acc, prod) => {
        const weight = QUALIS_WEIGHTS[prod.qualis] || 0
        return acc + weight
    }, 0)

    return {
        totalScore,
        averagePerProd: productions.length > 0 ? (totalScore / productions.length).toFixed(2) : 0,
        countByQualis: productions.reduce((acc: any, prod) => {
            const q = prod.qualis || 'Indefinido'
            acc[q] = (acc[q] || 0) + 1
            return acc
        }, {})
    }
}

export const groupByYear = (productions: any[]) => {
    return productions.reduce((acc: any, prod) => {
        const year = prod.data_publicacao ? new Date(prod.data_publicacao).getFullYear() : 'Indefinido'
        acc[year] = (acc[year] || 0) + 1
        return acc
    }, {})
}
