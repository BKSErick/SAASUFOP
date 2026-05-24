import { google } from 'googleapis'
import { logError } from '@/lib/logger'

const getAuthClient = () => {
    return new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets.readonly',
            'https://www.googleapis.com/auth/drive.readonly'
        ]
    })
}

export const getDriveClient = async () => {
    const auth = getAuthClient()
    return google.drive({ version: 'v3', auth })
}

export const getSheetsClient = async () => {
    const auth = getAuthClient()
    return google.sheets({ version: 'v4', auth })
}

export const listGoogleSheets = async () => {
    try {
        const drive = await getDriveClient()
        const response = await drive.files.list({
            q: "mimeType='application/vnd.google-apps.spreadsheet'",
            fields: 'files(id, name, modifiedTime)',
            orderBy: 'modifiedTime desc'
        })
        return response.data.files || []
    } catch (error) {
        logError('Erro ao listar arquivos do Drive:', error)
        throw error
    }
}

export const getSpreadsheetData = async (spreadsheetId: string, range: string) => {
    try {
        const sheets = await getSheetsClient()
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        })
        return response.data.values
    } catch (error) {
        logError('Erro ao buscar dados do Google Sheets:', error)
        throw error
    }
}
