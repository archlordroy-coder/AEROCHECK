// Données ASECNA complètes - 19 pays, 76 aéroports
export const asecnaPays = [
  { id: 'pays-bj', code: 'BJ', nom: 'Bénin', nomFr: 'Bénin' },
  { id: 'pays-bf', code: 'BF', nom: 'Burkina Faso', nomFr: 'Burkina Faso' },
  { id: 'pays-cm', code: 'CM', nom: 'Cameroun', nomFr: 'Cameroun' },
  { id: 'pays-cf', code: 'CF', nom: 'Centrafrique', nomFr: 'Centrafrique' },
  { id: 'pays-km', code: 'KM', nom: 'Comores', nomFr: 'Comores' },
  { id: 'pays-cg', code: 'CG', nom: 'Congo', nomFr: 'Congo' },
  { id: 'pays-ci', code: 'CI', nom: "Côte d'Ivoire", nomFr: "Côte d'Ivoire" },
  { id: 'pays-gq', code: 'GQ', nom: 'Guinée Équatoriale', nomFr: 'Guinée Équatoriale' },
  { id: 'pays-ga', code: 'GA', nom: 'Gabon', nomFr: 'Gabon' },
  { id: 'pays-gw', code: 'GW', nom: 'Guinée-Bissau', nomFr: 'Guinée-Bissau' },
  { id: 'pays-mg', code: 'MG', nom: 'Madagascar', nomFr: 'Madagascar' },
  { id: 'pays-ml', code: 'ML', nom: 'Mali', nomFr: 'Mali' },
  { id: 'pays-mr', code: 'MR', nom: 'Mauritanie', nomFr: 'Mauritanie' },
  { id: 'pays-ne', code: 'NE', nom: 'Niger', nomFr: 'Niger' },
  { id: 'pays-rw', code: 'RW', nom: 'Rwanda', nomFr: 'Rwanda' },
  { id: 'pays-sn', code: 'SN', nom: 'Sénégal', nomFr: 'Sénégal' },
  { id: 'pays-td', code: 'TD', nom: 'Tchad', nomFr: 'Tchad' },
  { id: 'pays-tg', code: 'TG', nom: 'Togo', nomFr: 'Togo' },
];

export const asecnaAeroports = [
  // BÉNIN (4)
  { id: 'apt-coo', code: 'DBBK', nom: "Aéroport International Cadjehoun", ville: 'Cotonou', paysId: 'pays-bj' },
  { id: 'apt-pko', code: 'DBBP', nom: 'Aéroport de Parakou', ville: 'Parakou', paysId: 'pays-bj' },
  { id: 'apt-nte', code: 'DBBN', nom: 'Aéroport de Natitingou', ville: 'Natitingou', paysId: 'pays-bj' },
  { id: 'apt-kdc', code: 'DBBB', nom: 'Aéroport de Kandi', ville: 'Kandi', paysId: 'pays-bj' },
  // BURKINA FASO (4)
  { id: 'apt-oua', code: 'DFFD', nom: 'Aéroport International de Ouagadougou', ville: 'Ouagadougou', paysId: 'pays-bf' },
  { id: 'apt-bob', code: 'DFEL', nom: 'Aéroport de Bobo-Dioulasso', ville: 'Bobo-Dioulasso', paysId: 'pays-bf' },
  { id: 'apt-ded', code: 'DFEE', nom: 'Aéroport de Dédougou', ville: 'Dédougou', paysId: 'pays-bf' },
  { id: 'apt-ouah', code: 'DFOO', nom: 'Aéroport de Ouahigouya', ville: 'Ouahigouya', paysId: 'pays-bf' },
  // CAMEROUN (7)
  { id: 'apt-dla', code: 'FKKD', nom: 'Aéroport International de Douala', ville: 'Douala', paysId: 'pays-cm' },
  { id: 'apt-nsi', code: 'FKYS', nom: "Aéroport International de Yaoundé-Nsimalen", ville: 'Yaoundé', paysId: 'pays-cm' },
  { id: 'apt-gou', code: 'FKKR', nom: 'Aéroport International de Garoua', ville: 'Garoua', paysId: 'pays-cm' },
  { id: 'apt-nga', code: 'FKKN', nom: 'Aéroport de Ngaoundéré', ville: 'Ngaoundéré', paysId: 'pays-cm' },
  { id: 'apt-baf', code: 'FKKB', nom: 'Aéroport de Bafoussam', ville: 'Bafoussam', paysId: 'pays-cm' },
  { id: 'apt-mvr', code: 'FKKL', nom: 'Aéroport de Maroua-Salak', ville: 'Maroua', paysId: 'pays-cm' },
  { id: 'apt-bert', code: 'FKKI', nom: 'Aéroport de Bertoua', ville: 'Bertoua', paysId: 'pays-cm' },
  // CENTRAFRIQUE (4)
  { id: 'apt-bgf', code: 'FEFB', nom: "Aéroport International de Bangui M'Poko", ville: 'Bangui', paysId: 'pays-cf' },
  { id: 'apt-berb', code: 'FEFY', nom: 'Aéroport de Berbérati', ville: 'Berbérati', paysId: 'pays-cf' },
  { id: 'apt-bouar', code: 'FEFF', nom: 'Aéroport de Bouar', ville: 'Bouar', paysId: 'pays-cf' },
  { id: 'apt-boss', code: 'FEFL', nom: 'Aéroport de Bossangoa', ville: 'Bossangoa', paysId: 'pays-cf' },
  // CONGO (4)
  { id: 'apt-bzv', code: 'FCBB', nom: 'Aéroport International Maya-Maya', ville: 'Brazzaville', paysId: 'pays-cg' },
  { id: 'apt-pnr', code: 'FCPP', nom: "Aéroport International Agostinho Neto", ville: 'Pointe-Noire', paysId: 'pays-cg' },
  { id: 'apt-dis', code: 'FCBD', nom: 'Aéroport de Dolisie', ville: 'Dolisie', paysId: 'pays-cg' },
  { id: 'apt-owo', code: 'FCMM', nom: "Aéroport d'Owando", ville: 'Owando', paysId: 'pays-cg' },
  // CÔTE D'IVOIRE (6)
  { id: 'apt-abj', code: 'DIAP', nom: "Aéroport International Félix Houphouët-Boigny", ville: 'Abidjan', paysId: 'pays-ci' },
  { id: 'apt-bqk', code: 'DIBU', nom: 'Aéroport de Bouaké', ville: 'Bouaké', paysId: 'pays-ci' },
  { id: 'apt-dal', code: 'DIDK', nom: 'Aéroport de Daloa', ville: 'Daloa', paysId: 'pays-ci' },
  { id: 'apt-man', code: 'DIMN', nom: 'Aéroport de Man', ville: 'Man', paysId: 'pays-ci' },
  { id: 'apt-spy', code: 'DISG', nom: 'Aéroport de San Pédro', ville: 'San Pédro', paysId: 'pays-ci' },
  { id: 'apt-ask', code: 'DIYO', nom: 'Aéroport de Yamoussoukro', ville: 'Yamoussoukro', paysId: 'pays-ci' },
  // GABON (5)
  { id: 'apt-lbv', code: 'FOOL', nom: "Aéroport International Léon Mba", ville: 'Libreville', paysId: 'pays-ga' },
  { id: 'apt-pog', code: 'FOOG', nom: 'Aéroport International de Port-Gentil', ville: 'Port-Gentil', paysId: 'pays-ga' },
  { id: 'apt-mvb', code: 'FOON', nom: "Aéroport International M'Vengue", ville: 'Franceville', paysId: 'pays-ga' },
  { id: 'apt-oye', code: 'FOOR', nom: "Aéroport d'Oyem", ville: 'Oyem', paysId: 'pays-ga' },
  { id: 'apt-lam', code: 'FOLS', nom: 'Aéroport de Lambaréné', ville: 'Lambaréné', paysId: 'pays-ga' },
  // GUINÉE-BISSAU (2)
  { id: 'apt-oxb', code: 'GGOV', nom: 'Aéroport International Osvaldo Vieira', ville: 'Bissau', paysId: 'pays-gw' },
  { id: 'apt-bub', code: 'GGBU', nom: 'Aéroport de Bubaque', ville: 'Bubaque', paysId: 'pays-gw' },
  // GUINÉE ÉQUATORIALE (3)
  { id: 'apt-ssg', code: 'FGSL', nom: 'Aéroport International de Malabo', ville: 'Malabo', paysId: 'pays-gq' },
  { id: 'apt-bsg', code: 'FGBT', nom: 'Aéroport International de Bata', ville: 'Bata', paysId: 'pays-gq' },
  { id: 'apt-mong', code: 'FGMY', nom: 'Aéroport de Mongomo', ville: 'Mongomo', paysId: 'pays-gq' },
  // MADAGASCAR (7)
  { id: 'apt-tnr', code: 'FMMI', nom: "Aéroport International d'Ivato", ville: 'Antananarivo', paysId: 'pays-mg' },
  { id: 'apt-mjn', code: 'FMST', nom: 'Aéroport Philibert Tsiranana', ville: 'Mahajanga', paysId: 'pays-mg' },
  { id: 'apt-die', code: 'FMSD', nom: "Aéroport d'Arrachart", ville: 'Diego Suarez', paysId: 'pays-mg' },
  { id: 'apt-ftu', code: 'FMSR', nom: 'Aéroport de Fort-Dauphin', ville: 'Taolagnaro', paysId: 'pays-mg' },
  { id: 'apt-toa', code: 'FMSS', nom: 'Aéroport de Tamatave', ville: 'Toamasina', paysId: 'pays-mg' },
  { id: 'apt-wfi', code: 'FMSM', nom: 'Aéroport de Fianarantsoa', ville: 'Fianarantsoa', paysId: 'pays-mg' },
  { id: 'apt-moq', code: 'FMSE', nom: 'Aéroport de Morondava', ville: 'Morondava', paysId: 'pays-mg' },
  // MALI (6)
  { id: 'apt-bko', code: 'GABS', nom: 'Aéroport International Président Modibo Keïta', ville: 'Bamako', paysId: 'pays-ml' },
  { id: 'apt-kys', code: 'GASK', nom: 'Aéroport de Kayes', ville: 'Kayes', paysId: 'pays-ml' },
  { id: 'apt-mzi', code: 'GAMD', nom: 'Aéroport de Mopti-Ambodédjo', ville: 'Mopti', paysId: 'pays-ml' },
  { id: 'apt-tom', code: 'GATB', nom: 'Aéroport de Tombouctou', ville: 'Tombouctou', paysId: 'pays-ml' },
  { id: 'apt-gao', code: 'GAGK', nom: 'Aéroport de Gao', ville: 'Gao', paysId: 'pays-ml' },
  { id: 'apt-kdl', code: 'GAKL', nom: 'Aéroport de Kidal', ville: 'Kidal', paysId: 'pays-ml' },
  // MAURITANIE (5)
  { id: 'apt-nkc', code: 'GQNO', nom: 'Aéroport International Oumtounsy', ville: 'Nouakchott', paysId: 'pays-mr' },
  { id: 'apt-ndb', code: 'GQNF', nom: 'Aéroport de Nouadhibou', ville: 'Nouadhibou', paysId: 'pays-mr' },
  { id: 'apt-tiy', code: 'GQNT', nom: 'Aéroport de Tidjikja', ville: 'Tidjikja', paysId: 'pays-mr' },
  { id: 'apt-ouz', code: 'GQNZ', nom: 'Aéroport de Zouérat', ville: 'Zouérat', paysId: 'pays-mr' },
  { id: 'apt-atr', code: 'GQNA', nom: "Aéroport d'Atar", ville: 'Atar', paysId: 'pays-mr' },
  // NIGER (5)
  { id: 'apt-nim', code: 'DRRN', nom: 'Aéroport International Diori Hamani', ville: 'Niamey', paysId: 'pays-ne' },
  { id: 'apt-ajz', code: 'DRZA', nom: 'Aéroport International Mano Dayak', ville: 'Agadez', paysId: 'pays-ne' },
  { id: 'apt-thz', code: 'DRZL', nom: 'Aéroport de Tahoua', ville: 'Tahoua', paysId: 'pays-ne' },
  { id: 'apt-mfj', code: 'DRZM', nom: 'Aéroport de Maradi', ville: 'Maradi', paysId: 'pays-ne' },
  { id: 'apt-znd', code: 'DRZR', nom: 'Aéroport de Zinder', ville: 'Zinder', paysId: 'pays-ne' },
  // RWANDA (1)
  { id: 'apt-kgl', code: 'HRYR', nom: 'Aéroport International de Kigali', ville: 'Kigali', paysId: 'pays-rw' },
  // SÉNÉGAL (5)
  { id: 'apt-dss', code: 'GOBD', nom: 'Aéroport International Blaise Diagne', ville: 'Dakar', paysId: 'pays-sn' },
  { id: 'apt-dkr', code: 'GOOY', nom: 'Aéroport Léopold Sédar Senghor (ancien)', ville: 'Dakar', paysId: 'pays-sn' },
  { id: 'apt-zig', code: 'GOGK', nom: 'Aéroport de Ziguinchor', ville: 'Ziguinchor', paysId: 'pays-sn' },
  { id: 'apt-xls', code: 'GOSS', nom: 'Aéroport de Saint-Louis', ville: 'Saint-Louis', paysId: 'pays-sn' },
  { id: 'apt-csk', code: 'GOGG', nom: 'Aéroport de Cap Skirring', ville: 'Cap Skirring', paysId: 'pays-sn' },
  // TCHAD (5)
  { id: 'apt-ndj', code: 'FTTJ', nom: "Aéroport International Hassan Djamous", ville: "N'Djaména", paysId: 'pays-td' },
  { id: 'apt-aeh', code: 'FTTD', nom: "Aéroport d'Abéché", ville: 'Abéché', paysId: 'pays-td' },
  { id: 'apt-mqu', code: 'FTTM', nom: 'Aéroport de Moundou', ville: 'Moundou', paysId: 'pays-td' },
  { id: 'apt-srh', code: 'FTTS', nom: 'Aéroport de Sarh', ville: 'Sarh', paysId: 'pays-td' },
  { id: 'apt-fyt', code: 'FTTF', nom: 'Aéroport de Faya-Largeau', ville: 'Faya-Largeau', paysId: 'pays-td' },
  // TOGO (2)
  { id: 'apt-lfw', code: 'DXXX', nom: 'Aéroport International Gnassingbé Eyadéma', ville: 'Lomé', paysId: 'pays-tg' },
  { id: 'apt-lrl', code: 'DXNG', nom: 'Aéroport International de Niamtougou', ville: 'Niamtougou', paysId: 'pays-tg' },
  // COMORES (3)
  { id: 'apt-hah', code: 'FMCH', nom: 'Aéroport International Prince Said Ibrahim', ville: 'Moroni', paysId: 'pays-km' },
  { id: 'apt-nwa', code: 'FMCV', nom: 'Aéroport de Bandar-Es-Salam', ville: 'Mohéli', paysId: 'pays-km' },
  { id: 'apt-ajn', code: 'FMCA', nom: 'Aéroport de Ouani', ville: 'Anjouan', paysId: 'pays-km' },
];
