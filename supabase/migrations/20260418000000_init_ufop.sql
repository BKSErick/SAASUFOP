-- UFOP Academic SaaS - Database Schema
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Not strictly needed for gen_random_uuid()

-- Docentes
CREATE TABLE IF NOT EXISTS professores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE,
    link_lattes TEXT,
    kpi_h INTEGER DEFAULT 0,
    kpi_fwci DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alunos
CREATE TABLE IF NOT EXISTS alunos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    matricula TEXT UNIQUE NOT NULL,
    email TEXT,
    data_ingresso DATE,
    status_bolsa TEXT DEFAULT 'Nenhuma', -- Ex: Capes, Fapemig, Nenhuma
    prazo_jubilamento DATE,
    professor_orientador_id UUID REFERENCES professores(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Produções Acadêmicas (Artigos, etc)
CREATE TABLE IF NOT EXISTS producoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID REFERENCES professores(id),
    titulo TEXT NOT NULL,
    journal TEXT,
    qualis TEXT, -- A1, A2, etc
    link_scopus TEXT,
    data_publicacao DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bancas de Defesa/Qualificação
CREATE TABLE IF NOT EXISTS bancas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES alunos(id),
    titulo_trabalho TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('Qualificação', 'Defesa')),
    data_hora TIMESTAMP WITH TIME ZONE,
    local TEXT,
    link_transmissao TEXT,
    status_publicacao_site BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) - Basic Example
ALTER TABLE professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE producoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bancas ENABLE ROW LEVEL SECURITY;
