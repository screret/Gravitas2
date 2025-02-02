// priority 10

const mapGTMachineIdToTaskId = {
  /* Replace with block id -> task id mapping */
  "gtceu:electric_blast_furnace": "17719888B8BB4E65",
}

const mapGTFluidToTaskId = {
  /* Replace with fluid id -> task id mapping */
  "gtceu:rubber": "4B25F32D88057B65",
}

const $MetaMachine = Java.loadClass("com.gregtechceu.gtceu.api.blockentity.MetaMachineBlockEntity")
const $MultiController = Java.loadClass("com.gregtechceu.gtceu.api.machine.feature.multiblock.IMultiController")
const $WorkableMachine = Java.loadClass("com.gregtechceu.gtceu.api.machine.WorkableTieredMachine")
const $CompoundTag = Java.loadClass("net.minecraft.nbt.CompoundTag")

let observeGtQuest = (event) => {
  if (Client.hitResult != null && Client.hitResult.getType() == "BLOCK") {
    let block = event.level.getBlock(Client.hitResult.getBlockPos())
    if (block && block.id.contains("gtceu")) {
      //console.info('Looking at a GT thing!')
      let blockEntity = block.entity
      // Multiblock handler
      if (blockEntity && blockEntity instanceof $MetaMachine) {
        //console.info('This ' + blockEntity + ' is a MetaMachine')
        // Multiblock is complete
        if (blockEntity.metaMachine instanceof $MultiController) {
          if (blockEntity.metaMachine.isFormed()) {
            //console.info(block.id + ' is formed')
            let taskString = mapGTMachineIdToTaskId[block.id]
            //console.info(taskString + ' is taskString')
            if (taskString) {
              let tag = new $CompoundTag()
              tag.putString("task", taskString)
              event.player.sendData("customTask", tag)
            }
          }
        }
        // Capability machines
        else if (blockEntity.metaMachine instanceof $WorkableMachine) {
          //console.info('We have got ourselves a WorkableMachine')
          // let tanks = blockEntity.metaMachine.importFluids.storages;
          let tanks = blockEntity.metaMachine.exportFluids.storages
          for (let i = 0; i < tanks.length; ++i) {
            let tank = tanks[i]
            let fluid = tank.fluid.rawFluid.builtInRegistryHolder().key().location()
            let taskString = mapGTFluidToTaskId[fluid.toString()]
            console.info(fluid.toString() + " is fluid " + i + ", corresponding to " + taskString)
            console.info(tank.fluid.rawFluid.toString() + " is tank.fluid.rawFluid")
            if (taskString) {
              let tag = new $CompoundTag()
              tag.putString("task", taskString)
              event.player.sendData("customTask", tag)
            }
          }
        }
      }
    }
  }
}

let clientObserveGtTask = (event) => {
  const { entity, data, level } = event
  let taskString = data.task
  let task = FTBQuests.getObject(level, taskString)
  let playerQuestData = FTBQuests.getData(entity)
  if (task && playerQuestData && !playerQuestData.isCompleted(task) && playerQuestData.canStartTasks(task.quest)) {
    playerQuestData.addProgress(task, 1)
  }
}
