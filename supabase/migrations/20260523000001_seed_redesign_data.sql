-- Seed determinístico — PPGCC UFOP (UFOP-MIG-001)
-- GERADO por supabase/generate-seed.cjs — NÃO editar à mão.
-- Idempotente (ON CONFLICT DO NOTHING). UUIDs via md5('ufop-<tipo>-<id>').

-- ── Professores (12) ──
INSERT INTO professores (id, nome, titulo, email, link_lattes, linha_pesquisa_id, kpi_h, capes_rating, orientandos_count, producao_count, lattes_updated_at) VALUES
  (md5('ufop-prof-d01')::uuid, 'Ana L. Tavares', 'Profa. Dra.', 'ana.tavares@ufop.br', 'http://lattes.cnpq.br/d01', 0, 18, '1A', 6, 12, '2025-04-12'),
  (md5('ufop-prof-d02')::uuid, 'Bruno Sá Carvalho', 'Prof. Dr.', 'bruno.carvalho@ufop.br', 'http://lattes.cnpq.br/d02', 1, 14, '1B', 5, 8, '2025-03-28'),
  (md5('ufop-prof-d03')::uuid, 'Carla Mendes Reis', 'Profa. Dra.', 'carla.reis@ufop.br', 'http://lattes.cnpq.br/d03', 2, 22, '1A', 4, 15, '2025-04-30'),
  (md5('ufop-prof-d04')::uuid, 'Diego F. Oliveira', 'Prof. Dr.', 'diego.oliveira@ufop.br', 'http://lattes.cnpq.br/d04', 0, 11, '2', 7, 6, '2025-02-04'),
  (md5('ufop-prof-d05')::uuid, 'Eduarda V. Pinheiro', 'Profa. Dra.', 'eduarda.pinheiro@ufop.br', 'http://lattes.cnpq.br/d05', 3, 19, '1B', 3, 9, '2025-05-02'),
  (md5('ufop-prof-d06')::uuid, 'Felipe Aragão', 'Prof. Dr.', 'felipe.aragao@ufop.br', 'http://lattes.cnpq.br/d06', 4, 9, '2', 2, 4, '2024-12-18'),
  (md5('ufop-prof-d07')::uuid, 'Gabriela Nunes', 'Profa. Dra.', 'gabriela.nunes@ufop.br', 'http://lattes.cnpq.br/d07', 1, 16, '1B', 5, 10, '2025-04-05'),
  (md5('ufop-prof-d08')::uuid, 'Henrique L. Costa', 'Prof. Dr.', 'henrique.costa@ufop.br', 'http://lattes.cnpq.br/d08', 2, 24, '1A', 6, 14, '2025-04-22'),
  (md5('ufop-prof-d09')::uuid, 'Isabela R. Furtado', 'Profa. Dra.', 'isabela.furtado@ufop.br', 'http://lattes.cnpq.br/d09', 3, 13, '1B', 4, 7, '2025-03-11'),
  (md5('ufop-prof-d10')::uuid, 'João V. Marcondes', 'Prof. Dr.', 'joao.marcondes@ufop.br', 'http://lattes.cnpq.br/d10', 0, 17, '1A', 5, 11, '2025-04-18'),
  (md5('ufop-prof-d11')::uuid, 'Karina B. Saldanha', 'Profa. Dra.', 'karina.saldanha@ufop.br', 'http://lattes.cnpq.br/d11', 4, 12, '2', 3, 5, '2025-01-09'),
  (md5('ufop-prof-d12')::uuid, 'Luiz Otávio Resende', 'Prof. Dr.', 'luiz.resende@ufop.br', 'http://lattes.cnpq.br/d12', 1, 20, '1A', 4, 13, '2025-04-27')
ON CONFLICT (id) DO NOTHING;

-- ── Alunos (50) ──
INSERT INTO alunos (id, nome, matricula, email, data_ingresso, status_bolsa, status, prazo_jubilamento, professor_orientador_id, nivel, creditos, linha_pesquisa_id, producoes_count, avatar_hue) VALUES
  (md5('ufop-aluno-a001')::uuid, 'Amanda Soares Vilela', '20212000', 'amanda.vilela@ufop.br', '2021-01-01', 'CNPq', 'Aguard. documentação', '2025-03-02', md5('ufop-prof-d01')::uuid, 'Doutorado', 26, 0, 0, 33),
  (md5('ufop-aluno-a002')::uuid, 'Bernardo Quintas Lacerda', '20222001', 'bernardo.lacerda@ufop.br', '2022-02-02', 'FAPEMIG', 'Cursando', '2026-04-03', md5('ufop-prof-d02')::uuid, 'Doutorado', 32, 1, 1, 120),
  (md5('ufop-aluno-a003')::uuid, 'Camila R. Botelho', '20232002', 'camila.botelho@ufop.br', '2023-03-03', 'PROPP', 'Cursando', '2025-05-04', md5('ufop-prof-d03')::uuid, 'Mestrado', 13, 2, 0, 20),
  (md5('ufop-aluno-a004')::uuid, 'Daniel F. Aquino', '20242003', 'daniel.aquino@ufop.br', '2024-04-04', 'Nenhuma', 'Cursando', '2026-06-05', md5('ufop-prof-d04')::uuid, 'Mestrado', 33, 0, 4, 319),
  (md5('ufop-aluno-a005')::uuid, 'Eloá Rabelo Pires', '20212004', 'eloa.pires@ufop.br', '2021-05-05', 'CNPq', 'Qualificado', '2023-07-06', md5('ufop-prof-d05')::uuid, 'Mestrado', 14, 3, 0, 38),
  (md5('ufop-aluno-a006')::uuid, 'Fernanda Vieira Lima', '20222005', 'fernanda.lima@ufop.br', '2022-06-06', 'FAPEMIG', 'Defesa marcada', '2026-08-07', md5('ufop-prof-d06')::uuid, 'Doutorado', 35, 4, 2, 175),
  (md5('ufop-aluno-a007')::uuid, 'Gustavo M. Couto', '20232006', 'gustavo.couto@ufop.br', '2023-07-07', 'PROPP', 'Aguard. documentação', '2027-09-08', md5('ufop-prof-d07')::uuid, 'Doutorado', 34, 1, 2, 162),
  (md5('ufop-aluno-a008')::uuid, 'Helena P. Andrade', '20242007', 'helena.andrade@ufop.br', '2024-08-08', 'CAPES', 'Cursando', '2026-10-09', md5('ufop-prof-d08')::uuid, 'Mestrado', 12, 2, 0, 2),
  (md5('ufop-aluno-a009')::uuid, 'Igor S. Bittencourt', '20212008', 'igor.bittencourt@ufop.br', '2021-09-09', 'CNPq', 'Cursando', '2023-11-10', md5('ufop-prof-d09')::uuid, 'Mestrado', 12, 3, 0, 12),
  (md5('ufop-aluno-a010')::uuid, 'Júlia A. Nascimento', '20222009', 'julia.nascimento@ufop.br', '2022-10-10', 'Nenhuma', 'Cursando', '2024-12-11', md5('ufop-prof-d10')::uuid, 'Mestrado', 29, 0, 3, 259),
  (md5('ufop-aluno-a011')::uuid, 'Kauê T. Bessa', '20232010', 'kaue.bessa@ufop.br', '2023-11-11', 'Nenhuma', 'Qualificado', '2027-01-12', md5('ufop-prof-d11')::uuid, 'Doutorado', 44, 4, 4, 300),
  (md5('ufop-aluno-a012')::uuid, 'Larissa D. Penna', '20242011', 'larissa.penna@ufop.br', '2024-12-12', 'Nenhuma', 'Defesa marcada', '2028-02-13', md5('ufop-prof-d12')::uuid, 'Doutorado', 45, 1, 4, 325),
  (md5('ufop-aluno-a013')::uuid, 'Mateus C. Drumond', '20212012', 'mateus.drumond@ufop.br', '2021-01-13', 'CNPq', 'Aguard. documentação', '2023-03-14', md5('ufop-prof-d01')::uuid, 'Mestrado', 25, 0, 2, 199),
  (md5('ufop-aluno-a014')::uuid, 'Natália S. Vargas', '20222013', 'natalia.vargas@ufop.br', '2022-02-14', 'Nenhuma', 'Cursando', '2024-04-15', md5('ufop-prof-d02')::uuid, 'Mestrado', 27, 1, 3, 236),
  (md5('ufop-aluno-a015')::uuid, 'Otávio L. Martins', '20232014', 'otavio.martins@ufop.br', '2023-03-15', 'Nenhuma', 'Cursando', '2025-05-16', md5('ufop-prof-d03')::uuid, 'Mestrado', 28, 2, 3, 246),
  (md5('ufop-aluno-a016')::uuid, 'Paula F. Belmonte', '20242015', 'paula.belmonte@ufop.br', '2024-04-16', 'Nenhuma', 'Cursando', '2028-06-17', md5('ufop-prof-d04')::uuid, 'Doutorado', 46, 0, 4, 340),
  (md5('ufop-aluno-a017')::uuid, 'Quésia R. Almeida', '20212016', 'quesia.almeida@ufop.br', '2021-05-17', 'CNPq', 'Qualificado', '2025-07-18', md5('ufop-prof-d05')::uuid, 'Doutorado', 38, 3, 2, 210),
  (md5('ufop-aluno-a018')::uuid, 'Rafael P. Toledo', '20222017', 'rafael.toledo@ufop.br', '2022-06-18', 'FAPEMIG', 'Defesa marcada', '2024-08-19', md5('ufop-prof-d06')::uuid, 'Mestrado', 18, 4, 1, 93),
  (md5('ufop-aluno-a019')::uuid, 'Sofia E. Brandão', '20232018', 'sofia.brandao@ufop.br', '2023-07-19', 'PROPP', 'Aguard. documentação', '2025-09-20', md5('ufop-prof-d07')::uuid, 'Mestrado', 13, 1, 0, 19),
  (md5('ufop-aluno-a020')::uuid, 'Thiago A. Madureira', '20242019', 'thiago.madureira@ufop.br', '2024-08-20', 'Nenhuma', 'Cursando', '2026-10-21', md5('ufop-prof-d08')::uuid, 'Mestrado', 28, 2, 3, 240),
  (md5('ufop-aluno-a021')::uuid, 'Ursula G. Lemos', '20212020', 'ursula.lemos@ufop.br', '2021-09-21', 'CNPq', 'Cursando', '2025-11-22', md5('ufop-prof-d09')::uuid, 'Doutorado', 27, 3, 0, 58),
  (md5('ufop-aluno-a022')::uuid, 'Vinícius A. Capanema', '20222021', 'vinicius.capanema@ufop.br', '2022-10-22', 'FAPEMIG', 'Cursando', '2026-12-23', md5('ufop-prof-d10')::uuid, 'Doutorado', 26, 0, 0, 34),
  (md5('ufop-aluno-a023')::uuid, 'Wesley B. Sant''Ana', '20232022', 'wesley.santana@ufop.br', '2023-11-23', 'PROPP', 'Qualificado', '2025-01-24', md5('ufop-prof-d11')::uuid, 'Mestrado', 25, 4, 2, 199),
  (md5('ufop-aluno-a024')::uuid, 'Ximena F. Resende', '20242023', 'ximena.resende@ufop.br', '2024-12-24', 'Nenhuma', 'Defesa marcada', '2026-02-25', md5('ufop-prof-d12')::uuid, 'Mestrado', 31, 1, 4, 294),
  (md5('ufop-aluno-a025')::uuid, 'Yasmin O. Carvalho', '20212024', 'yasmin.carvalho@ufop.br', '2021-01-25', 'CNPq', 'Aguard. documentação', '2023-03-26', md5('ufop-prof-d01')::uuid, 'Mestrado', 17, 0, 1, 83),
  (md5('ufop-aluno-a026')::uuid, 'Zacarias B. Lustosa', '20222025', 'zacarias.lustosa@ufop.br', '2022-02-26', 'Nenhuma', 'Cursando', '2026-04-27', md5('ufop-prof-d02')::uuid, 'Doutorado', 44, 1, 4, 304),
  (md5('ufop-aluno-a027')::uuid, 'Arthur S. Henriques', '20232026', 'arthur.henriques@ufop.br', '2023-03-27', 'PROPP', 'Cursando', '2027-05-01', md5('ufop-prof-d03')::uuid, 'Doutorado', 24, 2, 0, 14),
  (md5('ufop-aluno-a028')::uuid, 'Bianca L. Toledo', '20242027', 'bianca.toledo@ufop.br', '2024-04-01', 'CAPES', 'Cursando', '2026-06-02', md5('ufop-prof-d04')::uuid, 'Mestrado', 12, 0, 0, 3),
  (md5('ufop-aluno-a029')::uuid, 'Caio R. Magalhães', '20212028', 'caio.magalhaes@ufop.br', '2021-05-02', 'Nenhuma', 'Qualificado', '2023-07-03', md5('ufop-prof-d05')::uuid, 'Mestrado', 29, 3, 3, 266),
  (md5('ufop-aluno-a030')::uuid, 'Débora T. Versiani', '20222029', 'debora.versiani@ufop.br', '2022-06-03', 'Nenhuma', 'Defesa marcada', '2024-08-04', md5('ufop-prof-d06')::uuid, 'Mestrado', 26, 4, 3, 218),
  (md5('ufop-aluno-a031')::uuid, 'Estevão R. Bonfim', '20232030', 'estevao.bonfim@ufop.br', '2023-07-04', 'PROPP', 'Aguard. documentação', '2027-09-05', md5('ufop-prof-d07')::uuid, 'Doutorado', 24, 1, 0, 7),
  (md5('ufop-aluno-a032')::uuid, 'Flávia M. Rosado', '20242031', 'flavia.rosado@ufop.br', '2024-08-05', 'CAPES', 'Cursando', '2028-10-06', md5('ufop-prof-d08')::uuid, 'Doutorado', 24, 2, 0, 8),
  (md5('ufop-aluno-a033')::uuid, 'Geraldo J. Cabral', '20212032', 'geraldo.cabral@ufop.br', '2021-09-06', 'CNPq', 'Cursando', '2023-11-07', md5('ufop-prof-d09')::uuid, 'Mestrado', 13, 3, 0, 17),
  (md5('ufop-aluno-a034')::uuid, 'Heloísa C. Pacheco', '20222033', 'heloisa.pacheco@ufop.br', '2022-10-07', 'FAPEMIG', 'Cursando', '2024-12-08', md5('ufop-prof-d10')::uuid, 'Mestrado', 18, 0, 1, 94),
  (md5('ufop-aluno-a035')::uuid, 'Ícaro V. Sampaio', '20232034', 'icaro.sampaio@ufop.br', '2023-11-08', 'Nenhuma', 'Qualificado', '2025-01-09', md5('ufop-prof-d11')::uuid, 'Mestrado', 31, 4, 4, 297),
  (md5('ufop-aluno-a036')::uuid, 'Joana P. Ribeiro', '20242035', 'joana.ribeiro@ufop.br', '2024-12-09', 'CAPES', 'Defesa marcada', '2028-02-10', md5('ufop-prof-d12')::uuid, 'Doutorado', 29, 1, 1, 88),
  (md5('ufop-aluno-a037')::uuid, 'Karla B. Toledo', '20212036', 'karla.toledo@ufop.br', '2021-01-10', 'Nenhuma', 'Aguard. documentação', '2025-03-11', md5('ufop-prof-d01')::uuid, 'Doutorado', 40, 0, 3, 252),
  (md5('ufop-aluno-a038')::uuid, 'Lucas V. Drumond', '20222037', 'lucas.drumond@ufop.br', '2022-02-11', 'FAPEMIG', 'Cursando', '2024-04-12', md5('ufop-prof-d02')::uuid, 'Mestrado', 18, 1, 1, 98),
  (md5('ufop-aluno-a039')::uuid, 'Mariana E. Cordeiro', '20232038', 'mariana.cordeiro@ufop.br', '2023-03-12', 'PROPP', 'Cursando', '2025-05-13', md5('ufop-prof-d03')::uuid, 'Mestrado', 16, 2, 0, 69),
  (md5('ufop-aluno-a040')::uuid, 'Nicolas R. Felício', '20242039', 'nicolas.felicio@ufop.br', '2024-04-13', 'CAPES', 'Cursando', '2026-06-14', md5('ufop-prof-d04')::uuid, 'Mestrado', 23, 0, 2, 165),
  (md5('ufop-aluno-a041')::uuid, 'Olívia S. Vieira', '20212040', 'olivia.vieira@ufop.br', '2021-05-14', 'CNPq', 'Qualificado', '2025-07-15', md5('ufop-prof-d05')::uuid, 'Doutorado', 32, 3, 1, 124),
  (md5('ufop-aluno-a042')::uuid, 'Pedro H. Ramalho', '20222041', 'pedro.ramalho@ufop.br', '2022-06-15', 'Nenhuma', 'Defesa marcada', '2026-08-16', md5('ufop-prof-d06')::uuid, 'Doutorado', 43, 4, 3, 287),
  (md5('ufop-aluno-a043')::uuid, 'Raissa B. Quaresma', '20232042', 'raissa.quaresma@ufop.br', '2023-07-16', 'PROPP', 'Aguard. documentação', '2025-09-17', md5('ufop-prof-d07')::uuid, 'Mestrado', 12, 1, 0, 8),
  (md5('ufop-aluno-a044')::uuid, 'Sávio J. Domingues', '20242043', 'savio.domingues@ufop.br', '2024-08-17', 'Nenhuma', 'Cursando', '2026-10-18', md5('ufop-prof-d08')::uuid, 'Mestrado', 33, 2, 4, 318),
  (md5('ufop-aluno-a045')::uuid, 'Tatiana L. Brito', '20212044', 'tatiana.brito@ufop.br', '2021-09-18', 'CNPq', 'Cursando', '2023-11-19', md5('ufop-prof-d09')::uuid, 'Mestrado', 25, 3, 2, 196),
  (md5('ufop-aluno-a046')::uuid, 'Vitor M. Ferraz', '20222045', 'vitor.ferraz@ufop.br', '2022-10-19', 'FAPEMIG', 'Cursando', '2026-12-20', md5('ufop-prof-d10')::uuid, 'Doutorado', 28, 0, 1, 74),
  (md5('ufop-aluno-a047')::uuid, 'Wagner H. Lustosa', '20232046', 'wagner.lustosa@ufop.br', '2023-11-20', 'PROPP', 'Qualificado', '2027-01-21', md5('ufop-prof-d11')::uuid, 'Doutorado', 35, 4, 2, 165),
  (md5('ufop-aluno-a048')::uuid, 'Yara C. Brandão', '20242047', 'yara.brandao@ufop.br', '2024-12-21', 'CAPES', 'Defesa marcada', '2026-02-22', md5('ufop-prof-d12')::uuid, 'Mestrado', 13, 1, 0, 21),
  (md5('ufop-aluno-a049')::uuid, 'Henrique T. Sá', '20212048', 'henrique.sa@ufop.br', '2021-01-22', 'CNPq', 'Aguard. documentação', '2023-03-23', md5('ufop-prof-d01')::uuid, 'Mestrado', 24, 0, 2, 186),
  (md5('ufop-aluno-a050')::uuid, 'Beatriz F. Calixto', '20222049', 'beatriz.calixto@ufop.br', '2022-02-23', 'FAPEMIG', 'Cursando', '2024-04-24', md5('ufop-prof-d02')::uuid, 'Mestrado', 15, 1, 0, 53)
ON CONFLICT (id) DO NOTHING;

-- ── Disciplinas (6) ──
INSERT INTO disciplinas (id, codigo, nome, creditos, professor_id, periodo, matriculados) VALUES
  (md5('ufop-disc-PPGCC-501')::uuid, 'PPGCC-501', 'Aprendizado de Máquina Estatístico', 4, md5('ufop-prof-d01')::uuid, '2026/1', 18),
  (md5('ufop-disc-PPGCC-512')::uuid, 'PPGCC-512', 'Sistemas Distribuídos Avançados', 4, md5('ufop-prof-d03')::uuid, '2026/1', 14),
  (md5('ufop-disc-PPGCC-528')::uuid, 'PPGCC-528', 'Visão Computacional', 4, md5('ufop-prof-d05')::uuid, '2026/1', 11),
  (md5('ufop-disc-PPGCC-540')::uuid, 'PPGCC-540', 'Otimização Combinatória', 4, md5('ufop-prof-d06')::uuid, '2026/1', 9),
  (md5('ufop-disc-PPGCC-555')::uuid, 'PPGCC-555', 'Engenharia de Software Empírica', 4, md5('ufop-prof-d02')::uuid, '2026/1', 12),
  (md5('ufop-disc-PPGCC-602')::uuid, 'PPGCC-602', 'Tópicos Especiais — LLMs em Saúde', 4, md5('ufop-prof-d07')::uuid, '2026/1', 16)
ON CONFLICT (id) DO NOTHING;

-- ── Produções (10) ──
INSERT INTO producoes (id, professor_id, titulo, journal, qualis, data_publicacao, tipo) VALUES
  (md5('ufop-prod-p1')::uuid, md5('ufop-prof-d01')::uuid, 'Federated learning under non-IID partitions for medical imaging', 'IEEE TMI', 'A1', '2025-01-01', 'ARTIGO'),
  (md5('ufop-prod-p2')::uuid, md5('ufop-prof-d02')::uuid, 'Static analysis of concurrent Go programs with happens-before refinement', 'ICSE', 'A1', '2025-01-01', 'ARTIGO'),
  (md5('ufop-prod-p3')::uuid, md5('ufop-prof-d03')::uuid, 'Edge replication strategies for mobile-first social graphs', 'Middleware', 'A2', '2024-01-01', 'ARTIGO'),
  (md5('ufop-prod-p4')::uuid, md5('ufop-prof-d04')::uuid, 'Self-supervised retrieval for low-resource Portuguese', 'EMNLP', 'A1', '2025-01-01', 'ARTIGO'),
  (md5('ufop-prod-p5')::uuid, md5('ufop-prof-d05')::uuid, 'Sparse depth completion under specular lighting', 'CVPR-W', 'A2', '2024-01-01', 'ARTIGO'),
  (md5('ufop-prod-p6')::uuid, md5('ufop-prof-d06')::uuid, 'Convex hull approximations for street-network sketching', 'GeoInformatica', 'B1', '2024-01-01', 'ARTIGO'),
  (md5('ufop-prod-p7')::uuid, md5('ufop-prof-d07')::uuid, 'Causal reasoning with latent confounders in observational EHR', 'AAAI', 'A1', '2025-01-01', 'ARTIGO'),
  (md5('ufop-prod-p8')::uuid, md5('ufop-prof-d08')::uuid, 'Adversarial calibration for surgical phase recognition', 'MICCAI', 'A1', '2025-01-01', 'ARTIGO'),
  (md5('ufop-prod-p9')::uuid, md5('ufop-prof-d09')::uuid, 'Embedding-based code search over monorepos', 'FSE', 'A1', '2024-01-01', 'ARTIGO'),
  (md5('ufop-prod-p10')::uuid, md5('ufop-prof-d10')::uuid, 'Topology-aware sharding for blockchain consensus', 'OSDI', 'A1', '2025-01-01', 'ARTIGO')
ON CONFLICT (id) DO NOTHING;

-- ── Bancas (6) ──
INSERT INTO bancas (id, aluno_id, titulo_trabalho, tipo, data_hora, local, status_publicacao_site) VALUES
  (md5('ufop-banca-b1')::uuid, md5('ufop-aluno-a004')::uuid, 'Modelos de difusão para super-resolução em imagens de satélite', 'Defesa', '2026-05-21 14:00', 'ICEB-2 sala 201', true),
  (md5('ufop-banca-b2')::uuid, md5('ufop-aluno-a039')::uuid, 'Inferência causal aplicada a EHR longitudinal', 'Qualificação', '2026-05-23 10:00', 'ICEB-3 sala 105', true),
  (md5('ufop-banca-b3')::uuid, md5('ufop-aluno-a038')::uuid, 'Sharding adaptativo em consenso blockchain', 'Defesa', '2026-05-28 16:00', 'Online · Meet', true),
  (md5('ufop-banca-b4')::uuid, md5('ufop-aluno-a008')::uuid, 'Recomendação semi-supervisionada com grafos heterogêneos', 'Qualificação', '2026-06-04 09:00', 'ICEB-2 sala 309', true),
  (md5('ufop-banca-b5')::uuid, md5('ufop-aluno-a046')::uuid, 'Análise estática de programas Go concorrentes', 'Defesa', '2026-06-11 15:30', 'ICEB-2 sala 201', true),
  (md5('ufop-banca-b6')::uuid, md5('ufop-aluno-a005')::uuid, 'Calibração adversarial em reconhecimento cirúrgico', 'Qualificação', '2026-06-18 11:00', 'ICEB-3 sala 105', true)
ON CONFLICT (id) DO NOTHING;
