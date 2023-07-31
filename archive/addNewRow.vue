<template>
      <div class="waste-chore w-1/2">
        <div class="waste">
          <h3 class="pr-1">Waste</h3>
          <!-- <div class="flex items-center">
            <div class="add-waste_move">
              <input
                class="waste_hour input-duration"
                v-model="newWasteMove.duration"
                type="text"
                @keyup.enter="addWasteMove"
              />
              <input
                class="input-as-label"
                v-model="newWasteMove.action"
                type="text"
              />
              <button @click="addWasteMove">↵ Add</button>
              <input
                class="waste_date input-date"
                v-model="newWasteMove.date"
                type="text"
                @keyup.enter="addWasteMove"
              />
              <button @click="showWasteMoves = !showWasteMoves">
                + Show all
              </button>
            </div>
          </div>-->
          <div v-show="showWasteMoves" class="waste_moves pl-7"> 
            <Table
              rows="waste"
              columns="wasteChoreColumns"
              item-name="waste"
              add-row
              :events="wasteEvents"
            />
          </div>
        </div>
        <div class="chore">
          <h3 class="pr-1">Chore</h3>
          <!-- <div class="flex items-center">
            <div class="add-chore_move">
              <input
                class="chore_hour input-duration"
                v-model="newChoreMove.duration"
                type="text"
                @keyup.enter="addChoreMove"
              />
              <input
                class="input-as-label"
                v-model="newChoreMove.action"
                type="text"
              />
              <button @click="addChoreMove">↵ Add</button>
              <input
                class="chore_date input-date"
                v-model="newChoreMove.date"
                type="text"
                @keyup.enter="addChoreMove"
              />
              <button @click="showChoreMoves = !showChoreMoves">
                + Show all
              </button>
            </div>
          </div>-->
          <div v-show="showChoreMoves" class="chore_moves pl-7"> 
            <Table
              rows="chore"
              columns="wasteChoreColumns"
              item-name="chore"
              add-row
              :events="choreEvents"
            />
          </div>
        </div>
      </div>
    </div>

</template><script setup></script><style></style> 