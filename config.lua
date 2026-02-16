Config = {}

Config.UseAnimation = false          -- Activer l'animation à l'ouverture
Config.Framework = "auto"            -- auto, esx, qbox, ou qbcore

Config.DistributionPoints = {
    {
        name = "Mairie de Los Santos",
        coords = vector3(-544.7, -204.1, 40), -- Coordonnées
        heading = 210.5,                        -- Orientation (important si Ped activé)
        usePed = true,                          -- Spawner un PED 
        pedModel = "s_m_m_postal_01",           -- Modèle du PED
        targetLabel = "Prendre une feuille vierge",
        targetIcon = "fas fa-file-signature"
    },
    {
        name = "Commissariat",
        coords = vector3(440.953857, -980.228577, 31.925293),
        heading = 170.0,
        usePed = false,                           -- Ici ce sera juste un point target
        pedModel = "",
        targetLabel = "Prendre une feuille vierge",  
        targetIcon = "fas fa-clipboard"
    },
    -- Ajouter les points en suivant le modèle
}