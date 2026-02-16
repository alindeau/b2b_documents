local currentSlot = nil
local spawnedPeds = {}

function usePaper(data)
    currentSlot = data.slot
    local freshMetadata = lib.callback.await('b2b_documents:getFreshMetadata', 200, currentSlot)
    local metadata = freshMetadata or data.metadata or {}
    
    local docId = metadata.docId
    if docId == "nil" then docId = nil end

    if Config.UseAnimation then
    TaskStartScenarioInPlace(cache.ped, "PROP_HUMAN_PARKING_METER", 0, true)
    end
    
    local content = ""
    if docId then
        content = lib.callback.await('b2b_documents:getContent', 500, docId)
    end

    SendNUIMessage({
        action = "open",
        animation = Config.UseAnimation, 
        content = content,
        title = metadata.title or "Document",
        locked = metadata.locked or false
    })
    
    SetNuiFocus(true, true)
end
exports('usePaper', usePaper)

RegisterNUICallback('close', function(data, cb)
    SetNuiFocus(false, false)
    currentSlot = nil
    
    ClearPedTasks(cache.ped)
    cb('ok')
end)

RegisterNUICallback('doAction', function(data, cb)
    local success, newId = lib.callback.await('b2b_documents:handleAction', 1000, data, currentSlot)
    cb(success)
end)

CreateThread(function()
    for _, v in pairs(Config.DistributionPoints) do
        if v.usePed then
            local model = GetHashKey(v.pedModel)
            RequestModel(model)
            while not HasModelLoaded(model) do Wait(1) end
            
            local ped = CreatePed(4, model, v.coords.x, v.coords.y, v.coords.z - 1.0, v.heading, false, true)
            
            SetEntityInvincible(ped, true)
            SetBlockingOfNonTemporaryEvents(ped, true)
            FreezeEntityPosition(ped, true)
            SetEntityCanBeDamaged(ped, false)
            
            table.insert(spawnedPeds, ped)
        end

        exports.ox_target:addSphereZone({
            coords = v.coords,
            radius = 1.5,
            debug = false,
            options = {
                {
                    name = 'distrib_point_' .. _,
                    icon = v.targetIcon,
                    label = v.targetLabel,
                    distance = 3.0,
                    onSelect = function()
                        TriggerServerEvent('b2b_documents:server:requestPaper')
                    end
                }
            }
        })
    end
end)

AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    for _, ped in ipairs(spawnedPeds) do
        if DoesEntityExist(ped) then DeleteEntity(ped) end
    end
end)