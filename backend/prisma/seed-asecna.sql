-- Seed ASECNA Countries and Airports
-- 19 pays membres ASECNA avec 76 aéroports

-- ============================================
-- PAYS ASECNA (19 pays)
-- ============================================

INSERT INTO references_data (kind, id, code, nom, nom_fr) VALUES
('pays', 'pays-bj', 'BJ', 'Benin', 'Bénin'),
('pays', 'pays-bf', 'BF', 'Burkina Faso', 'Burkina Faso'),
('pays', 'pays-cm', 'CM', 'Cameroun', 'Cameroun'),
('pays', 'pays-cf', 'CF', 'Centrafrique', 'Centrafrique'),
('pays', 'pays-cg', 'CG', 'Congo', 'Congo'),
('pays', 'pays-ci', 'CI', "Cote d'Ivoire", "Côte d'Ivoire"),
('pays', 'pays-gq', 'GQ', 'Guinee Equatoriale', 'Guinée Équatoriale'),
('pays', 'pays-ga', 'GA', 'Gabon', 'Gabon'),
('pays', 'pays-gw', 'GW', 'Guinee-Bissau', 'Guinée-Bissau'),
('pays', 'pays-mg', 'MG', 'Madagascar', 'Madagascar'),
('pays', 'pays-ml', 'ML', 'Mali', 'Mali'),
('pays', 'pays-mr', 'MR', 'Mauritanie', 'Mauritanie'),
('pays', 'pays-ne', 'NE', 'Niger', 'Niger'),
('pays', 'pays-rw', 'RW', 'Rwanda', 'Rwanda'),
('pays', 'pays-sn', 'SN', 'Senegal', 'Sénégal'),
('pays', 'pays-td', 'TD', 'Tchad', 'Tchad'),
('pays', 'pays-tg', 'TG', 'Togo', 'Togo'),
('pays', 'pays-km', 'KM', 'Comores', 'Comores');

-- ============================================
-- AÉROPORTS ASECNA (76 aéroports)
-- ============================================

-- BÉNIN (4 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-coo', 'DBBK', 'Aeroport International Cadjehoun', 'Cotonou', 'pays-bj'),
('aeroports', 'apt-pko', 'DBBP', 'Aeroport de Parakou', 'Parakou', 'pays-bj'),
('aeroports', 'apt-nte', 'DBBN', 'Aeroport de Natitingou', 'Natitingou', 'pays-bj'),
('aeroports', 'apt-kdc', 'DBBB', 'Aeroport de Kandi', 'Kandi', 'pays-bj');

-- BURKINA FASO (4 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-oua', 'DFFD', 'Aeroport International de Ouagadougou', 'Ouagadougou', 'pays-bf'),
('aeroports', 'apt-bob', 'DFEL', 'Aeroport de Bobo-Dioulasso', 'Bobo-Dioulasso', 'pays-bf'),
('aeroports', 'apt-ded', 'DFEE', 'Aeroport de Dedougou', 'Dedougou', 'pays-bf'),
('aeroports', 'apt-ouah', 'DFOO', 'Aeroport de Ouahigouya', 'Ouahigouya', 'pays-bf');

-- CAMEROUN (7 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-dla', 'FKKD', 'Aeroport International de Douala', 'Douala', 'pays-cm'),
('aeroports', 'apt-nsi', 'FKYS', 'Aeroport International de Yaounde-Nsimalen', 'Yaounde', 'pays-cm'),
('aeroports', 'apt-gou', 'FKKR', 'Aeroport International de Garoua', 'Garoua', 'pays-cm'),
('aeroports', 'apt-nga', 'FKKN', 'Aeroport de Ngaoundere', 'Ngaoundere', 'pays-cm'),
('aeroports', 'apt-baf', 'FKKB', 'Aeroport de Bafoussam', 'Bafoussam', 'pays-cm'),
('aeroports', 'apt-mvr', 'FKKL', 'Aeroport de Maroua-Salak', 'Maroua', 'pays-cm'),
('aeroports', 'apt-bert', 'FKKI', 'Aeroport de Bertoua', 'Bertoua', 'pays-cm');

-- CENTRAFRIQUE (4 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-bgf', 'FEFB', 'Aeroport International de Bangui M''Poko', 'Bangui', 'pays-cf'),
('aeroports', 'apt-berb', 'FEFY', 'Aeroport de Berberati', 'Berberati', 'pays-cf'),
('aeroports', 'apt-bouar', 'FEFF', 'Aeroport de Bouar', 'Bouar', 'pays-cf'),
('aeroports', 'apt-boss', 'FEFL', 'Aeroport de Bossangoa', 'Bossangoa', 'pays-cf');

-- CONGO (4 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-bzv', 'FCBB', 'Aeroport International Maya-Maya', 'Brazzaville', 'pays-cg'),
('aeroports', 'apt-pnr', 'FCPP', 'Aeroport International Agostinho Neto', 'Pointe-Noire', 'pays-cg'),
('aeroports', 'apt-dis', 'FCBD', 'Aeroport de Dolisie', 'Dolisie', 'pays-cg'),
('aeroports', 'apt-owo', 'FCMM', 'Aeroport d''Owando', 'Owando', 'pays-cg');

-- CÔTE D'IVOIRE (6 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-abj', 'DIAP', 'Aeroport International Felix Houphouet-Boigny', 'Abidjan', 'pays-ci'),
('aeroports', 'apt-bqk', 'DIBU', 'Aeroport de Bouake', 'Bouake', 'pays-ci'),
('aeroports', 'apt-dal', 'DIDK', 'Aeroport de Daloa', 'Daloa', 'pays-ci'),
('aeroports', 'apt-man', 'DIMN', 'Aeroport de Man', 'Man', 'pays-ci'),
('aeroports', 'apt-spy', 'DISG', 'Aeroport de San Pedro', 'San Pedro', 'pays-ci'),
('aeroports', 'apt-ask', 'DIYO', 'Aeroport de Yamoussoukro', 'Yamoussoukro', 'pays-ci');

-- GABON (5 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-lbv', 'FOOL', 'Aeroport International Leon Mba', 'Libreville', 'pays-ga'),
('aeroports', 'apt-pog', 'FOOG', 'Aeroport International de Port-Gentil', 'Port-Gentil', 'pays-ga'),
('aeroports', 'apt-mvb', 'FOON', 'Aeroport International M''Vengue', 'Franceville', 'pays-ga'),
('aeroports', 'apt-oye', 'FOOR', 'Aeroport d''Oyem', 'Oyem', 'pays-ga'),
('aeroports', 'apt-lam', 'FOLS', 'Aeroport de Lambaréné', 'Lambaréné', 'pays-ga');

-- GUINÉE-BISSAU (2 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-oxb', 'GGOV', 'Aeroport International Osvaldo Vieira', 'Bissau', 'pays-gw'),
('aeroports', 'apt-bub', 'GGBU', 'Aeroport de Bubaque', 'Bubaque', 'pays-gw');

-- GUINÉE ÉQUATORIALE (3 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-ssg', 'FGSL', 'Aeroport International de Malabo', 'Malabo', 'pays-gq'),
('aeroports', 'apt-bsg', 'FGBT', 'Aeroport International de Bata', 'Bata', 'pays-gq'),
('aeroports', 'apt-mong', 'FGMY', 'Aeroport de Mongomo', 'Mongomo', 'pays-gq');

-- MADAGASCAR (8 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-tnr', 'FMMI', 'Aeroport International d''Ivato', 'Antananarivo', 'pays-mg'),
('aeroports', 'apt-mjn', 'FMST', 'Aeroport Philibert Tsiranana', 'Mahajanga', 'pays-mg'),
('aeroports', 'apt-die', 'FMSD', 'Aeroport d''Arrachart', 'Diego Suarez', 'pays-mg'),
('aeroports', 'apt-ftu', 'FMSR', 'Aeroport de Fort-Dauphin', 'Taolagnaro', 'pays-mg'),
('aeroports', 'apt-toa', 'FMSS', 'Aeroport de Tamatave', 'Toamasina', 'pays-mg'),
('aeroports', 'apt-wfi', 'FMSM', 'Aeroport de Fianarantsoa', 'Fianarantsoa', 'pays-mg'),
('aeroports', 'apt-moq', 'FMSE', 'Aeroport de Morondava', 'Morondava', 'pays-mg');

-- MALI (6 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-bko', 'GABS', 'Aeroport International President Modibo Keita', 'Bamako', 'pays-ml'),
('aeroports', 'apt-kys', 'GASK', 'Aeroport de Kayes', 'Kayes', 'pays-ml'),
('aeroports', 'apt-mzi', 'GAMD', 'Aeroport de Mopti-Ambodedjo', 'Mopti', 'pays-ml'),
('aeroports', 'apt-tom', 'GATB', 'Aeroport de Tombouctou', 'Tombouctou', 'pays-ml'),
('aeroports', 'apt-gao', 'GAGK', 'Aeroport de Gao', 'Gao', 'pays-ml'),
('aeroports', 'apt-kdl', 'GAKL', 'Aeroport de Kidal', 'Kidal', 'pays-ml');

-- MAURITANIE (5 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-nkc', 'GQNO', 'Aeroport International Oumtounsy', 'Nouakchott', 'pays-mr'),
('aeroports', 'apt-ndb', 'GQNF', 'Aeroport de Nouadhibou', 'Nouadhibou', 'pays-mr'),
('aeroports', 'apt-tiy', 'GQNT', 'Aeroport de Tidjikja', 'Tidjikja', 'pays-mr'),
('aeroports', 'apt-ouz', 'GQNZ', 'Aeroport de Zouerat', 'Zouerat', 'pays-mr'),
('aeroports', 'apt-atr', 'GQNA', 'Aeroport d''Atar', 'Atar', 'pays-mr');

-- NIGER (5 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-nim', 'DRRN', 'Aeroport International Diori Hamani', 'Niamey', 'pays-ne'),
('aeroports', 'apt-aja', 'DRZA', 'Aeroport International Mano Dayak', 'Agadez', 'pays-ne'),
('aeroports', 'apt-thz', 'DRZL', 'Aeroport de Tahoua', 'Tahoua', 'pays-ne'),
('aeroports', 'apt-mfj', 'DRZM', 'Aeroport de Maradi', 'Maradi', 'pays-ne'),
('aeroports', 'apt-znd', 'DRZR', 'Aeroport de Zinder', 'Zinder', 'pays-ne');

-- RWANDA (1 aéroport)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-kgl', 'HRYR', 'Aeroport International de Kigali', 'Kigali', 'pays-rw');

-- SÉNÉGAL (5 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-dss', 'GOBD', 'Aeroport International Blaise Diagne', 'Dakar', 'pays-sn'),
('aeroports', 'apt-dkr', 'GOOY', 'Aeroport Leopold Sedar Senghor (ancien)', 'Dakar', 'pays-sn'),
('aeroports', 'apt-zig', 'GOGK', 'Aeroport de Ziguinchor', 'Ziguinchor', 'pays-sn'),
('aeroports', 'apt-xls', 'GOSS', 'Aeroport de Saint-Louis', 'Saint-Louis', 'pays-sn'),
('aeroports', 'apt-csk', 'GOGG', 'Aeroport de Cap Skirring', 'Cap Skirring', 'pays-sn');

-- TCHAD (5 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-ndj', 'FTTJ', 'Aeroport International Hassan Djamous', 'N''Djamena', 'pays-td'),
('aeroports', 'apt-aeh', 'FTTD', 'Aeroport d''Abeche', 'Abeche', 'pays-td'),
('aeroports', 'apt-mqu', 'FTTM', 'Aeroport de Moundou', 'Moundou', 'pays-td'),
('aeroports', 'apt-srh', 'FTTS', 'Aeroport de Sarh', 'Sarh', 'pays-td'),
('aeroports', 'apt-fyt', 'FTTF', 'Aeroport de Faya-Largeau', 'Faya-Largeau', 'pays-td');

-- TOGO (2 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-lfw', 'DXXX', 'Aeroport International Gnassingbe Eyadema', 'Lome', 'pays-tg'),
('aeroports', 'apt-lrl', 'DXNG', 'Aeroport International de Niamtougou', 'Niamtougou', 'pays-tg');

-- COMORES (3 aéroports)
INSERT INTO references_data (kind, id, code, nom, ville, pays_id) VALUES
('aeroports', 'apt-hah', 'FMCH', 'Aeroport International Prince Said Ibrahim', 'Moroni', 'pays-km'),
('aeroports', 'apt-nwa', 'FMCV', 'Aeroport de Bandar-Es-Salam', 'Moheli', 'pays-km'),
('aeroports', 'apt-aja', 'FMCA', 'Aeroport de Ouani', 'Anjouan', 'pays-km');
