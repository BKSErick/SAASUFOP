-- SEED REAL — PPGEP Engenharia de Produção UFOP (UFOP-MIG-001)
-- GERADO por supabase/generate-real-seed.cjs — NÃO editar à mão.
-- Fonte: aluno_regular-2.xls (89 alunos, 17 orientadores).
-- Substitui o seed mock (20260523000001). Idempotente.
-- Campos sem fonte real (linha_pesquisa, capes, h-index, produções) = NULL/0.

BEGIN;

-- 1) Limpar dados (mock + qualquer anterior). Ordem respeita FKs.
DELETE FROM bancas;
DELETE FROM producoes;
DELETE FROM disciplinas;
DELETE FROM alunos;
DELETE FROM professores;

-- 2) Professores reais (orientadores do export; campos Lattes/CAPES pendentes)
INSERT INTO professores (id, nome, orientandos_count, producao_count, kpi_h) VALUES
  ('99b4606b-07b9-f833-9ff5-2cbb5e618681', 'ALANA DEUSILAN SESTER PEREIRA', 1, 0, 0),
  ('33905c5d-4497-3386-4328-db97ed2bef21', 'ALEXANDRE XAVIER MARTINS', 2, 0, 0),
  ('99bb69f3-bed4-1eb7-5c60-f78262d27778', 'ALOISIO DE CASTRO GOMES JUNIOR', 4, 0, 0),
  ('b30374fd-38d8-8bea-62b5-3d934b9de3be', 'ANDRE LUIS SILVA', 13, 0, 0),
  ('eb3b75a9-3abe-dd3b-3113-81a11ee4ba70', 'FERNANDO BERNARDES DE OLIVEIRA', 6, 0, 0),
  ('e673ff69-12a3-c664-8071-cdf766a4425a', 'FERNANDO LUIZ PEREIRA DE OLIVEIRA', 5, 0, 0),
  ('d10a6b00-1d8b-02bb-dfd9-b5d4a4c33179', 'FRANCISCA DIANA FERREIRA VIANA', 4, 0, 0),
  ('5f1fe40c-7d26-f5ff-3472-e2543bf096aa', 'HELTON CRISTIANO OLIVEIRA E GOMES', 5, 0, 0),
  ('de0ac7ad-cd52-fc14-836a-6ae381a92c69', 'IRCE FERNANDES GOMES GUIMARAES', 3, 0, 0),
  ('83264c3c-12dc-f319-258e-6f1aaeeb886c', 'ISABELA CARVALHO DE MORAIS', 1, 0, 0),
  ('31c687eb-491c-3928-68b9-6372fd5d8c92', 'JUNE MARQUES FERNANDES', 8, 0, 0),
  ('608e7841-16f1-b5aa-37d7-1f32a39ff0f9', 'KARINE ARAUJO FERREIRA', 4, 0, 0),
  ('765668ff-b6a2-5bc4-9fbc-4ccb1d7577ba', 'LUCIANA PAULA REIS', 7, 0, 0),
  ('98289954-eddf-d66a-9c3d-ea24d5a9a5dc', 'RAONI ROCHA SIMOES', 6, 0, 0),
  ('8943e5ef-9210-1243-90e8-143d999887cb', 'SERGIO EVANGELISTA SILVA', 6, 0, 0),
  ('632f0fa0-cd30-b178-13d0-a3c5cab0a642', 'THIAGO AUGUSTO DE OLIVEIRA SILVA', 8, 0, 0),
  ('ea244217-aa10-9f15-663a-1e5045523895', 'WAGNER RAGI CURI FILHO', 5, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- 3) Alunos reais
INSERT INTO alunos (id, nome, matricula, email, data_ingresso, status_bolsa, status, prazo_jubilamento, professor_orientador_id, nivel, creditos, linha_pesquisa_id, producoes_count, avatar_hue) VALUES
  ('e963b45f-b8fd-5f03-c488-083f8ea488cf', 'ANDRÉ CESAR PEREIRA', '2026.10118', 'andre.cesar@aluno.ufop.edu.br', '2026-01-25', 'Nenhuma', 'Cursando', '2028-07-25', '8943e5ef-9210-1243-90e8-143d999887cb', 'Mestrado', 16, NULL, 0, 64),
  ('8394d2bb-602e-88dc-068d-86680f336470', 'PALOMA SATIERF BRITO AMERICO', '2025.10124', 'paloma.americo@aluno.ufop.edu.br', '2025-02-11', 'Nenhuma', 'Cursando', '2027-08-11', 'b30374fd-38d8-8bea-62b5-3d934b9de3be', 'Mestrado', 16, NULL, 0, 190),
  ('7a4d0423-5067-d003-e1c5-570f066b993b', 'LUIS CARLOS SEGURA ANGULO', '2026.10552', 'luis.angulo@aluno.ufop.edu.br', '2026-02-26', 'FAPEMIG', 'Cursando', '2028-08-26', 'b30374fd-38d8-8bea-62b5-3d934b9de3be', 'Mestrado', 0, NULL, 0, 64),
  ('01b4bc60-b0d4-4af7-b662-149b65613baa', 'VERONICA VIEIRA DE CARVALHO', '2024.10229', 'veronica.carvalho@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Qualificado', '2026-08-01', 'b30374fd-38d8-8bea-62b5-3d934b9de3be', 'Mestrado', 28, NULL, 0, 132),
  ('d6b6a9a5-33fb-27fd-1ff2-b8323871e8c4', 'VANIA APARECIDA DE ALMEIDA BARBOSA', '2026.10027', 'vania.almeida@aluno.ufop.edu.br', '2026-01-08', 'Nenhuma', 'Cursando', '2028-07-08', 'b30374fd-38d8-8bea-62b5-3d934b9de3be', 'Mestrado', 12, NULL, 0, 15),
  ('ed6aa076-6d1e-7221-3076-ff2cf8c06551', 'LUCAS FELIPE DE VIVEIROS LINHARES', '2026.10014', 'lucas.linhares@aluno.ufop.edu.br', '2026-01-08', 'Nenhuma', 'Cursando', '2028-07-08', '8943e5ef-9210-1243-90e8-143d999887cb', 'Mestrado', 12, NULL, 0, 27),
  ('45a03e33-9feb-7d4c-d718-c96181ff32a8', 'PEDRO AFONSO MENDES E MARINHO', '2026.10015', 'pedro.marinho@aluno.ufop.edu.br', '2026-01-08', 'CAPES', 'Cursando', '2028-07-08', '765668ff-b6a2-5bc4-9fbc-4ccb1d7577ba', 'Mestrado', 0, NULL, 0, 319),
  ('97cb48d8-101b-e192-2c35-7db1c32e75b6', 'GLEIZER VITOR NONATO', '2024.10211', 'gleizzer@yahoo.com.br', '2024-02-01', 'Nenhuma', 'Qualificado', '2026-08-01', 'b30374fd-38d8-8bea-62b5-3d934b9de3be', 'Mestrado', 28, NULL, 0, 261),
  ('ac0b5bb6-5491-4ac5-1141-d28b0854df6f', 'KELLY LAURA GUIMARAES ALVES', '2025.10201', 'kelly.alves@aluno.ufop.edu.br', '2025-02-13', 'Nenhuma', 'Cursando', '2027-08-13', 'ea244217-aa10-9f15-663a-1e5045523895', 'Mestrado', 12, NULL, 0, 43),
  ('3f82df76-e8e1-516f-5780-0483d7ff45b7', 'JOSE AUGUSTO DA SILVA', '2026.10275', 'jose.as@aluno.ufop.edu.br', '2026-02-06', 'Nenhuma', 'Cursando', '2028-08-06', NULL, 'Mestrado', 0, NULL, 0, 59),
  ('60df0631-3ccb-af80-3d43-b88b3bc92dc7', 'ABELARD RAMOS FERNANDES', '2026.10024', 'abelard.fernandes@aluno.ufop.edu.br', '2026-01-08', 'Nenhuma', 'Cursando', '2028-07-08', 'b30374fd-38d8-8bea-62b5-3d934b9de3be', 'Mestrado', 12, NULL, 0, 223),
  ('a734db6c-e93c-51df-3f88-8b05b5a5fce4', 'DANIEL LUCAS SANTOS ROCHA', '2026.10023', 'daniel.lsr@aluno.ufop.edu.br', '2026-01-08', 'Nenhuma', 'Cursando', '2028-07-08', '5f1fe40c-7d26-f5ff-3472-e2543bf096aa', 'Mestrado', 0, NULL, 0, 148),
  ('c6e1f5fe-7e33-b218-dec8-ebe897e29d0f', 'ARACELLE TAVEIRA VIEIRA', '2026.10022', 'aracelle.vieira@aluno.ufop.edu.br', '2026-01-08', 'Nenhuma', 'Cursando', '2028-07-08', '31c687eb-491c-3928-68b9-6372fd5d8c92', 'Mestrado', 4, NULL, 0, 255),
  ('41b0de77-d254-9276-0947-de68bae45317', 'EDUARDA DUARTE FERREIRA PEDROSA', '2026.10596', 'eduarda.duarte@aluno.ufop.edu.br', '2026-03-02', 'Nenhuma', 'Cursando', '2028-09-02', 'b30374fd-38d8-8bea-62b5-3d934b9de3be', 'Mestrado', 8, NULL, 0, 189),
  ('f018b327-6b34-36dd-62b8-4b20a94b1e1c', 'THALLES CESAR TEIXEIRA BARBOSA', '2026.10553', 'thalles.teixeira@aluno.ufop.edu.br', '2026-02-26', 'Nenhuma', 'Cursando', '2028-08-26', 'eb3b75a9-3abe-dd3b-3113-81a11ee4ba70', 'Mestrado', 16, NULL, 0, 356),
  ('058d25ba-1250-12e8-2725-df3dc3d9c37f', 'TAINARA LUANA DE ARAUJO DALCIN', '2026.10277', 'tainara.dalcin@aluno.ufop.edu.br', '2026-02-09', 'Nenhuma', 'Cursando', '2028-08-09', '99b4606b-07b9-f833-9ff5-2cbb5e618681', 'Mestrado', 0, NULL, 0, 343),
  ('7cff7276-f6a8-83fa-3333-4c972ba14c2d', 'IGOR AZEVEDO DOS SANTOS CITTY ROSA', '2025.10116', 'igor.citty@aluno.ufop.edu.br', '2025-02-11', 'FAPEMIG', 'Cursando', '2027-08-11', 'ea244217-aa10-9f15-663a-1e5045523895', 'Mestrado', 16, NULL, 0, 119),
  ('24971579-1c61-9c1b-e6be-7f2c7cbea720', 'ADRIANO ALVES DE AZEVEDO', '2026.10030', 'adriano.azevedo@aluno.ufop.edu.br', '2026-01-08', 'Nenhuma', 'Cursando', '2028-07-08', 'd10a6b00-1d8b-02bb-dfd9-b5d4a4c33179', 'Mestrado', 12, NULL, 0, 238),
  ('83b2359c-97b9-076e-0084-d601a6a4d353', 'RAFAELA SILVA MIRANDA', '2026.10029', 'rafaela.miranda@aluno.ufop.edu.br', '2026-01-08', 'CAPES', 'Cursando', '2028-07-08', 'eb3b75a9-3abe-dd3b-3113-81a11ee4ba70', 'Mestrado', 0, NULL, 0, 217),
  ('443aac2a-224f-4ad1-961d-c69482bf26fa', 'ALINE LETÍCIA MARTINS FRAGOSO', '2026.10028', 'aline.fragoso@aluno.ufop.edu.br', '2026-01-08', 'CNPq', 'Cursando', '2028-07-08', 'eb3b75a9-3abe-dd3b-3113-81a11ee4ba70', 'Mestrado', 8, NULL, 0, 247),
  ('47488eba-8735-aed9-0558-0be9c48e2227', 'SAULO HALLAH MOURA', '2026.10117', 'saulo.hallah@aluno.ufop.edu.br', '2026-01-25', 'Nenhuma', 'Cursando', '2028-07-25', 'b30374fd-38d8-8bea-62b5-3d934b9de3be', 'Mestrado', 8, NULL, 0, 96),
  ('6a57f5df-6cd0-ffd2-979a-d4c61b798608', 'KLEIDER MATHEUS MENDES PAULA', '2026.10025', 'kleider.mendes@aluno.ufop.edu.br', '2026-01-08', 'Nenhuma', 'Cursando', '2028-07-08', 'b30374fd-38d8-8bea-62b5-3d934b9de3be', 'Mestrado', 16, NULL, 0, 158),
  ('ddb153ee-f941-fa84-5ab6-7828c29a5521', 'WELINGTON JÚNIOR DE OLIVEIRA', '2026.10018', 'welington.jo@aluno.ufop.edu.br', '2026-01-08', 'Nenhuma', 'Cursando', '2028-07-08', '765668ff-b6a2-5bc4-9fbc-4ccb1d7577ba', 'Mestrado', 8, NULL, 0, 35),
  ('af2c657d-3153-01a6-cc08-e80718587a63', 'THIERRY JEFFERSON BARROS SCURSULIM', '2026.10017', 'thierry.scursulim@aluno.ufop.edu.br', '2026-01-08', 'Nenhuma', 'Cursando', '2028-07-08', '31c687eb-491c-3928-68b9-6372fd5d8c92', 'Mestrado', 0, NULL, 0, 89),
  ('d3985140-86b6-f61f-94c1-bbfe93ef2d93', 'RANGEL PEREIRA DA SILVA', '2026.10016', 'rangel.silva@aluno.ufop.edu.br', '2026-01-08', 'Nenhuma', 'Cursando', '2028-07-08', '765668ff-b6a2-5bc4-9fbc-4ccb1d7577ba', 'Mestrado', 0, NULL, 0, 223),
  ('623b7d33-10ec-518a-9aee-9a66c406663e', 'JOSE EUGENIO PACELI LOPES JUNIOR', '2026.10013', 'jose.paceli@aluno.ufop.edu.br', '2026-01-08', 'Nenhuma', 'Cursando', '2028-07-08', '31c687eb-491c-3928-68b9-6372fd5d8c92', 'Mestrado', 0, NULL, 0, 235),
  ('3b212469-8e1a-6c1b-0ca8-98bf0fb369a0', 'JÉSSICA NATÁLIA MIRANDA PAIVA', '2026.10012', 'jessica.paiva@aluno.ufop.edu.br', '2026-01-08', 'Nenhuma', 'Cursando', '2028-07-08', '99bb69f3-bed4-1eb7-5c60-f78262d27778', 'Mestrado', 0, NULL, 0, 63),
  ('4a84c9fa-8812-5429-bbcf-046f15ecf841', 'DILCILENE MARIA FELICIO', '2026.10116', 'dilcilene.felicio@aluno.ufop.edu.br', '2026-01-25', 'Nenhuma', 'Cursando', '2028-07-25', 'ea244217-aa10-9f15-663a-1e5045523895', 'Mestrado', 4, NULL, 0, 232),
  ('150ebdff-2a5e-7cb2-8d4b-888ce7faaf11', 'DALTON FRANCISCO PEREIRA', '2026.10115', 'dalton.pereira@aluno.ufop.edu.br', '2026-01-25', 'Nenhuma', 'Cursando', '2028-07-25', 'de0ac7ad-cd52-fc14-836a-6ae381a92c69', 'Mestrado', 0, NULL, 0, 108),
  ('7baf7e22-d51b-8bdd-95f4-260f188e633b', 'CHARLES ELÁDIO NAZARETH FARIA', '2026.10009', 'charles.nazareth@aluno.ufop.edu.br', '2026-01-08', 'CAPES', 'Cursando', '2028-07-08', 'd10a6b00-1d8b-02bb-dfd9-b5d4a4c33179', 'Mestrado', 0, NULL, 0, 268),
  ('0ab43a28-e481-af00-8d5f-e48cd9f7a3ab', 'ANA CLARA FREITAS DOS SANTOS', '2026.10007', 'ana.cfs1@aluno.ufop.edu.br', '2026-01-08', 'CNPq', 'Cursando', '2028-07-08', '608e7841-16f1-b5aa-37d7-1f32a39ff0f9', 'Mestrado', 0, NULL, 0, 239),
  ('b2548954-e0ff-2092-a565-685cf7f746cd', 'ANA FLAVIA DOS REIS', '2026.10008', 'ana.fr@aluno.ufop.edu.br', '2026-01-08', 'CAPES', 'Cursando', '2028-07-08', '98289954-eddf-d66a-9c3d-ea24d5a9a5dc', 'Mestrado', 0, NULL, 0, 166),
  ('fc910e0d-e712-f8c7-dfa3-2dac0f30e801', 'DANIEL SILVA DA COSTA', '2024.10236', 'daniel.sc1@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Cursando', '2026-08-01', 'eb3b75a9-3abe-dd3b-3113-81a11ee4ba70', 'Mestrado', 17, NULL, 0, 249),
  ('563de577-c886-4520-6e57-fdb2b28ba6a9', 'STHER DE OLIVEIRA CALSAVARA', '2025.10119', 'sther.calsavara@aluno.ufop.edu.br', '2025-02-11', 'CAPES', 'Cursando', '2027-08-11', '608e7841-16f1-b5aa-37d7-1f32a39ff0f9', 'Mestrado', 16, NULL, 0, 230),
  ('8f8a98d9-6d7c-e01c-bb5c-eba41daec7d6', 'ROSÁRIA DA LUZ REIS CACIANO', '2025.10117', 'rosaria.caciano@aluno.ufop.edu.br', '2025-02-11', 'Nenhuma', 'Cursando', '2027-08-11', 'd10a6b00-1d8b-02bb-dfd9-b5d4a4c33179', 'Mestrado', 20, NULL, 0, 20),
  ('6179281c-9bad-2f24-f73a-4e9e47982db2', 'ANNA VICTORIA MEDEIROS CORGOSINHO', '2024.10233', 'anna.corgosinho@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Qualificado', '2026-08-01', '98289954-eddf-d66a-9c3d-ea24d5a9a5dc', 'Mestrado', 28, NULL, 0, 314),
  ('be5d4605-68bf-2e03-26a1-f6fc87ba6f9c', 'RODRIGO APONTE MAZZA', '2025.10125', 'rodrigo.mazza@aluno.ufop.edu.br', '2025-02-11', 'CAPES', 'Cursando', '2027-08-11', '632f0fa0-cd30-b178-13d0-a3c5cab0a642', 'Mestrado', 12, NULL, 0, 150),
  ('f525254d-ed08-0c99-e0d3-ac2ded914af3', 'VICENTE TEODORO ANASTACIO', '2024.11001', 'vicente.ta@aluno.ufop.edu.br', '2024-08-06', 'Nenhuma', 'Cursando', '2027-02-06', 'd10a6b00-1d8b-02bb-dfd9-b5d4a4c33179', 'Mestrado', 20, NULL, 0, 109),
  ('e5f1006c-ed5c-3d45-d1f8-3dd5f403b3e3', 'LENNON DE ALMEIDA FREIRE', '2025.10203', 'lennon.freire@aluno.ufop.edu.br', '2025-02-13', 'Nenhuma', 'Cursando', '2027-08-13', '8943e5ef-9210-1243-90e8-143d999887cb', 'Mestrado', 12, NULL, 0, 39),
  ('af0400a8-a919-b175-d273-68e78e404c87', 'PRISCILA JARDIM MARIANO CABRAL', '2023.10045', 'priscila.mariano@aluno.ufop.edu.br', '2023-01-26', 'Nenhuma', 'Qualificado', '2025-07-26', '31c687eb-491c-3928-68b9-6372fd5d8c92', 'Mestrado', 28, NULL, 0, 124),
  ('315b0bbc-c008-3d97-6713-021f62fc921a', 'JENNYFER DA CONCEICAO FONSECA SANTOS', '2024.10214', 'jennyfer.santos@aluno.ufop.edu.br', '2024-02-01', 'CNPq', 'Qualificado', '2026-08-01', '765668ff-b6a2-5bc4-9fbc-4ccb1d7577ba', 'Mestrado', 28, NULL, 0, 7),
  ('ad50c675-9921-7262-c6cd-80727c839641', 'EMANUEL FERREIRA DOMINGOS DOS SANTOS', '2025.10446', 'emanuel.domingos@aluno.ufop.edu.br', '2025-03-10', 'CAPES', 'Cursando', '2027-09-10', '31c687eb-491c-3928-68b9-6372fd5d8c92', 'Mestrado', 16, NULL, 0, 359),
  ('91cd5aa3-a8e6-cf7b-9662-57db644a6ed2', 'JÚLIO CÉSAR GUIMARÃES ANDRADE', '2025.10202', 'julio.andrade@aluno.ufop.edu.br', '2025-02-13', 'Nenhuma', 'Qualificado', '2027-08-13', '765668ff-b6a2-5bc4-9fbc-4ccb1d7577ba', 'Mestrado', 24, NULL, 0, 11),
  ('4ce208bd-6bdd-56dd-b972-82ab2064bb63', 'CARLOS AUGUSTO DE CARVALHO ANDREOSI', '2025.10115', 'carlos.andreosi@aluno.ufop.edu.br', '2025-02-11', 'Nenhuma', 'Cursando', '2027-08-11', '765668ff-b6a2-5bc4-9fbc-4ccb1d7577ba', 'Mestrado', 20, NULL, 0, 88),
  ('d9dc9c16-4e99-fc3e-b91d-d1536c93c57c', 'JESSICA DA SILVA SOARES CUNHA', '2024.10999', 'jessica.cunha@aluno.ufop.edu.br', '2024-08-06', 'Nenhuma', 'Cursando', '2027-02-06', '31c687eb-491c-3928-68b9-6372fd5d8c92', 'Mestrado', 16, NULL, 0, 246),
  ('768198f4-265e-0d69-abe7-e00988202ab2', 'FILIPE FRANÇA SILVA', '2024.10208', 'filipe.franca@aluno.ufop.edu.br', '2024-02-01', 'CAPES', 'Cursando', '2026-08-01', '5f1fe40c-7d26-f5ff-3472-e2543bf096aa', 'Mestrado', 16, NULL, 0, 7),
  ('7a68d6da-d16c-47d5-0214-7cbe55a3a494', 'LUCAS TAYRONE MOREIRA RIBEIRO', '2024.10220', 'lucas.tayrone@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Qualificado', '2026-08-01', '99bb69f3-bed4-1eb7-5c60-f78262d27778', 'Mestrado', 28, NULL, 0, 299),
  ('5871c82f-1be7-6ea5-0771-3c0bce48e213', 'LAURA ELIZA FERREIRA SILVA', '2024.10218', 'laura.eliza@aluno.ufop.edu.br', '2024-02-01', 'FAPEMIG', 'Cursando', '2026-08-01', 'de0ac7ad-cd52-fc14-836a-6ae381a92c69', 'Mestrado', 18, NULL, 0, 227),
  ('aed69901-3b7c-c1d4-44ca-f2b75d7282f1', 'LUDMILA COSTA ISAAC DE PAULA', '2025.10121', 'ludmila.esperidiao@aluno.ufop.edu.br', '2025-02-11', 'FAPEMIG', 'Cursando', '2027-08-11', '98289954-eddf-d66a-9c3d-ea24d5a9a5dc', 'Mestrado', 12, NULL, 0, 177),
  ('42dbe910-c745-0d89-2fc6-ebdf19ae5702', 'LUIZ PAULO DE FREITAS CARNEIRO', '2024.10223', 'luiz.carneiro@aluno.ufop.edu.br', '2024-02-01', 'CNPq', 'Qualificado', '2026-08-01', 'e673ff69-12a3-c664-8071-cdf766a4425a', 'Mestrado', 40, NULL, 0, 205),
  ('de551c07-5148-cfd6-fd00-344b0775e470', 'LOUIS GUILHERME MARINHO DE RESENDE', '2025.10204', 'louis.resende@aluno.ufop.edu.br', '2025-02-13', 'Nenhuma', 'Cursando', '2027-08-13', '632f0fa0-cd30-b178-13d0-a3c5cab0a642', 'Mestrado', 4, NULL, 0, 249),
  ('99395efe-3d62-0a49-c9f6-2095a08f404d', 'PEDRO EUSTÁQUIO FERREIRA JÚNIOR', '2025.10200', 'pedro.eustaquio@aluno.ufop.edu.br', '2025-02-13', 'Nenhuma', 'Cursando', '2027-08-13', 'eb3b75a9-3abe-dd3b-3113-81a11ee4ba70', 'Mestrado', 8, NULL, 0, 42),
  ('135fc48d-a0fc-fe2b-ea53-e759edfcd017', 'LUCAS FERNANDES VASCONCELOS', '2025.10126', 'lucas.vasconcelos@aluno.ufop.edu.br', '2025-02-11', 'Nenhuma', 'Cursando', '2027-08-11', '5f1fe40c-7d26-f5ff-3472-e2543bf096aa', 'Mestrado', 12, NULL, 0, 194),
  ('066a8984-ebf0-fa3b-6775-4a89dc839709', 'MARCELO MONTEIRO E SILVA', '2025.10123', 'marcelo.monteiro@aluno.ufop.edu.br', '2025-02-11', 'CAPES', 'Cursando', '2027-08-11', 'e673ff69-12a3-c664-8071-cdf766a4425a', 'Mestrado', 16, NULL, 0, 124),
  ('0a0e8367-59ac-47ba-afb5-90c7697d1846', 'PAULA DE OLIVEIRA FERNANDES', '2025.10122', 'paula.of@aluno.ufop.edu.br', '2025-02-11', 'Nenhuma', 'Trancado', '2027-08-11', '632f0fa0-cd30-b178-13d0-a3c5cab0a642', 'Mestrado', 8, NULL, 0, 159),
  ('d018ffab-9628-3d98-1291-ca4915e463c5', 'SCHESLEY JOSE DO NASCIMENTO DIAS', '2025.10118', 'schesley.dias@aluno.ufop.edu.br', '2025-02-11', 'Nenhuma', 'Cursando', '2027-08-11', 'de0ac7ad-cd52-fc14-836a-6ae381a92c69', 'Mestrado', 0, NULL, 0, 130),
  ('3378a225-831d-17b6-d3c1-70c50389067f', 'MARNA LAIS BRIDE VENTURA', '2024.10225', 'marna.bride@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Qualificado', '2026-08-01', 'ea244217-aa10-9f15-663a-1e5045523895', 'Mestrado', 28, NULL, 0, 287),
  ('c15bdc2c-78c4-067d-3881-f5da12e28405', 'ADILSON TEIXEIRA BARRAL JÚNIOR', '2024.10998', 'adilson.barral@aluno.ufop.edu.br', '2024-08-06', 'Nenhuma', 'Qualificado', '2027-02-06', '8943e5ef-9210-1243-90e8-143d999887cb', 'Mestrado', 32, NULL, 0, 11),
  ('cf9c91b5-98b2-54fa-30cf-f159c646aa46', 'DILSE ADRIANA SOARES GUIMARAES', '2023.10024', 'dilse.guimaraes@aluno.ufop.edu.br', '2023-01-12', 'Nenhuma', 'Defesa marcada', '2025-07-12', 'b30374fd-38d8-8bea-62b5-3d934b9de3be', 'Mestrado', 28, NULL, 0, 52),
  ('fc155dee-9956-09fa-437a-38c0b029c4f6', 'LARISSA CRISTINA DE CAMARGO', '2023.10015', 'larissa.cc@aluno.ufop.edu.br', '2023-01-12', 'Nenhuma', 'Qualificado', '2025-07-12', '5f1fe40c-7d26-f5ff-3472-e2543bf096aa', 'Mestrado', 24, NULL, 0, 341),
  ('31585dac-0320-6c6e-2d98-9bb3a6be8480', 'CECILIA SILVA MONNERAT', '2024.10207', 'cecilia.monnerat@aluno.ufop.edu.br', '2024-02-01', 'CNPq', 'Qualificado', '2026-08-01', '8943e5ef-9210-1243-90e8-143d999887cb', 'Mestrado', 30, NULL, 0, 109),
  ('18de2f79-947b-d72e-b8e9-e6cec09e6ff6', 'KEILA DE CARVALHO FREITAS', '2024.10217', 'keila.freitas@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Qualificado', '2026-08-01', '33905c5d-4497-3386-4328-db97ed2bef21', 'Mestrado', 29, NULL, 0, 269),
  ('5bea79bd-cf6a-5879-8c0c-9abffa5a677e', 'WAGNER PIRES DIAS', '2024.10230', 'wagner.pires@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Qualificado', '2026-08-01', '608e7841-16f1-b5aa-37d7-1f32a39ff0f9', 'Mestrado', 32, NULL, 0, 202),
  ('6b34b961-0e1b-2f4b-fd6d-e0fb9fce60f3', 'LUIZ FELIPE PEREIRA MATHIAS', '2024.10235', 'luiz.mathias@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Qualificado', '2026-08-01', 'b30374fd-38d8-8bea-62b5-3d934b9de3be', 'Mestrado', 28, NULL, 0, 66),
  ('93f64166-4d45-715b-1731-459d6481b479', 'RODRIGO AUGUSTO DOS SANTOS', '2024.10234', 'rodrigo.as@aluno.ufop.edu.br', '2024-02-01', 'FAPEMIG', 'Cursando', '2026-08-01', '98289954-eddf-d66a-9c3d-ea24d5a9a5dc', 'Mestrado', 16, NULL, 0, 54),
  ('c9ba2d45-302b-4595-2984-11184f33e7f1', 'CAROLINA SOARES VIEIRA', '2024.10232', 'carolina.vieira@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Defesa marcada', '2026-08-01', 'e673ff69-12a3-c664-8071-cdf766a4425a', 'Mestrado', 28, NULL, 0, 238),
  ('36d1de1a-ba37-b4fc-a92c-a886764c99c4', 'WERLEN DE OLIVEIRA MARTINS', '2024.10231', 'werlen.martins@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Qualificado', '2026-08-01', '8943e5ef-9210-1243-90e8-143d999887cb', 'Mestrado', 32, NULL, 0, 309),
  ('21d27933-7a93-c81d-f413-2bfeb0bb6e55', 'TAINARA KESSE DA SILVA', '2024.10228', 'tainara.silva@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Cursando', '2026-08-01', '632f0fa0-cd30-b178-13d0-a3c5cab0a642', 'Mestrado', 16, NULL, 0, 333),
  ('d380cc17-1779-007d-cc0c-6a3132abcabb', 'PRISCILA DE AVILA ALVES', '2024.10227', 'priscila.avila@aluno.ufop.edu.br', '2024-02-01', 'CAPES', 'Defesa marcada', '2026-08-01', '33905c5d-4497-3386-4328-db97ed2bef21', 'Mestrado', 30, NULL, 0, 76),
  ('b36666fc-5f6a-5b18-bb23-59cd490f56ff', 'PAULO CÉSAR DE FREITAS LAGARES', '2024.10226', 'paulo.lagares@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Qualificado', '2026-08-01', '83264c3c-12dc-f319-258e-6f1aaeeb886c', 'Mestrado', 28, NULL, 0, 115),
  ('7a2fc0a5-9d63-fa39-4f31-9ba16799403c', 'LUCIANO DE LOURDES BARBOSA', '2024.10222', 'luciano.barbosa@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Qualificado', '2026-08-01', '5f1fe40c-7d26-f5ff-3472-e2543bf096aa', 'Mestrado', 28, NULL, 0, 214),
  ('fc73df52-fec6-cdb4-aee7-bbb6a191bb4d', 'LETICIA RESENDE MIRANDA', '2024.10219', 'leticia.miranda@aluno.ufop.edu.br', '2024-02-01', 'CNPq', 'Cursando', '2026-08-01', '98289954-eddf-d66a-9c3d-ea24d5a9a5dc', 'Mestrado', 16, NULL, 0, 247),
  ('601fb192-c34c-bd2d-42f2-c0d4f5e4e33e', 'JULIO CESAR DE FIGUEIREDO', '2024.10216', 'julio.figueiredo@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Cursando', '2026-08-01', '99bb69f3-bed4-1eb7-5c60-f78262d27778', 'Mestrado', 16, NULL, 0, 315),
  ('871cf7d8-87fe-a80a-411f-afc335d5b162', 'JULIANO LAGES LIMA', '2024.10215', 'juliano.lima@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Qualificado', '2026-08-01', 'b30374fd-38d8-8bea-62b5-3d934b9de3be', 'Mestrado', 28, NULL, 0, 319),
  ('93e2eb47-2f9c-caef-2188-37c8d22585a0', 'FLAVIO HIROTAKA MINE', '2024.10210', 'flavio.mine@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Cursando', '2026-08-01', '632f0fa0-cd30-b178-13d0-a3c5cab0a642', 'Mestrado', 17, NULL, 0, 235),
  ('63efcd4b-4d9e-ffd4-15d7-7c9548f1a0d3', 'FILIPE RICARDO JACQUES BUTTA', '2024.10209', 'filipe.butta@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Qualificado', '2026-08-01', 'eb3b75a9-3abe-dd3b-3113-81a11ee4ba70', 'Mestrado', 28, NULL, 0, 161),
  ('f84e736e-2e1b-fc28-f197-b285df3ab1a2', 'BRUNA CRISTINA FREITAS DO CARMO', '2024.10206', 'bruna.carmo@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Cursando', '2026-08-01', '632f0fa0-cd30-b178-13d0-a3c5cab0a642', 'Mestrado', 16, NULL, 0, 322),
  ('2a554356-2815-376c-7451-0b4ef0ec7172', 'BEATRIZ DE LOURDES SANTOS PEREIRA', '2024.10205', 'beatriz.pereira@aluno.ufop.edu.br', '2024-02-01', 'FAPEMIG', 'Qualificado', '2026-08-01', 'ea244217-aa10-9f15-663a-1e5045523895', 'Mestrado', 30, NULL, 0, 18),
  ('cb53932b-7e3d-4688-175a-c22f8745c2fb', 'ANDERSON SILVEIRA LOPES', '2024.10203', 'anderson.silveira@aluno.ufop.edu.br', '2024-02-01', 'Nenhuma', 'Cursando', '2026-08-01', '608e7841-16f1-b5aa-37d7-1f32a39ff0f9', 'Mestrado', 16, NULL, 0, 40),
  ('3415a2b3-08d8-ba87-80a2-bf4bbf2650df', 'ANDRE LUIS ROBINE DE SOUZA', '2023.10060', 'andre.robine@aluno.ufop.edu.br', '2023-01-31', 'CAPES', 'Defesa marcada', '2025-07-31', 'e673ff69-12a3-c664-8071-cdf766a4425a', 'Mestrado', 30, NULL, 0, 143),
  ('e2592d30-4aeb-f2cc-7724-89c5e2217e43', 'CAROLINA LIMA SILVA', '2023.10017', 'carolina.lima@aluno.ufop.edu.br', '2023-01-12', 'Nenhuma', 'Defesa marcada', '2025-07-12', '31c687eb-491c-3928-68b9-6372fd5d8c92', 'Mestrado', 28, NULL, 0, 183),
  ('b0bdcc61-edfe-266c-2b15-a9caf9b11afd', 'THIAGO GERALDO DOS SANTOS', '2023.10033', 'thiago.geraldo@aluno.ufop.edu.br', '2023-01-26', 'Nenhuma', 'Qualificado', '2025-07-26', '31c687eb-491c-3928-68b9-6372fd5d8c92', 'Mestrado', 28, NULL, 0, 42),
  ('92c9102c-bf8b-2bb1-73ef-04148f6c0efd', 'IHASMIM DE OLIVEIRA SANTOS', '2023.10025', 'ihasmim.santos@aluno.ufop.edu.br', '2023-01-16', 'Nenhuma', 'Defesa marcada', '2025-07-16', '765668ff-b6a2-5bc4-9fbc-4ccb1d7577ba', 'Mestrado', 28, NULL, 0, 28),
  ('5f89096c-f3ce-f73f-d164-b7dcbd4bb22a', 'CHRISTIANO CALIJORNE DE BARROS', '2023.10034', 'christiano.barros@aluno.ufop.edu.br', '2023-01-26', 'Nenhuma', 'Defesa marcada', '2025-07-26', '99bb69f3-bed4-1eb7-5c60-f78262d27778', 'Mestrado', 28, NULL, 0, 129),
  ('aa1afc5b-5293-7aaa-fbea-e8010a2cdd4f', 'MARCO ANTONIO BONELLI JUNIOR', '2023.10018', 'marco.bonelli@aluno.ufop.edu.br', '2023-01-12', 'Nenhuma', 'Qualificado', '2025-07-12', '632f0fa0-cd30-b178-13d0-a3c5cab0a642', 'Mestrado', 28, NULL, 0, 310),
  ('af917884-6b9b-6e78-dacb-14380a2c88ea', 'ALYSSON DA SILVA ROICE SOUZA OLIVEIRA', '2023.10032', 'alysson.roice@aluno.ufop.edu.br', '2023-01-26', 'Nenhuma', 'Defesa marcada', '2025-07-26', 'b30374fd-38d8-8bea-62b5-3d934b9de3be', 'Mestrado', 28, NULL, 0, 54),
  ('72d67cdf-1c1c-1be8-321f-d19bbc44ff7d', 'PHILLIPE FERREIRA DA SILVA', '2023.10013', 'phillipe.silva@aluno.ufop.edu.br', '2023-01-12', 'Nenhuma', 'Cursando', '2025-07-12', '98289954-eddf-d66a-9c3d-ea24d5a9a5dc', 'Mestrado', 16, NULL, 0, 273),
  ('a022421a-8486-7335-c1c9-b06554151594', 'AMANDA OLIVEIRA MAGALHAES', '2022.10632', 'amanda.magalhaes1@aluno.ufop.edu.br', '2022-08-02', 'Nenhuma', 'Qualificado', '2025-02-02', '632f0fa0-cd30-b178-13d0-a3c5cab0a642', 'Mestrado', 28, NULL, 0, 348),
  ('57b59d10-c136-fa73-2ce8-ccc038680e50', 'JOSIANE ROBERTA DOS SANTOS SILVA', '2022.10357', 'josiane.silva@aluno.ufop.edu.br', '2022-03-03', 'CAPES', 'Defesa marcada', '2024-09-03', 'e673ff69-12a3-c664-8071-cdf766a4425a', 'Mestrado', 28, NULL, 0, 341)
ON CONFLICT (id) DO NOTHING;

COMMIT;
