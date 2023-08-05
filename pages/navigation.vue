<template>
  <div class="frames p-5">
    <div class="group values">
      <div class="notes xl">
        <div class="navigation frame general">
          <Note
            name="Navigation"
            box="Navigation"
            :data="getNote('Navigation')"
          />
        </div>
      </div>
    </div>
    <div class="group values">
      <h2>Values</h2>
      <div class="notes md">
        <div class="navigation frame values">
          <Note
            name="Navigation-Prowess"
            box="Navigation"
            :data="getNote('Navigation-Prowess')"
          />
        </div>
        <div class="navigation frame values">
          <Note
            name="Navigation-Values"
            box="Navigation"
            :data="getNote('Navigation-Values')"
          />
        </div>
      </div>
    </div>
    <div class="group novelty">
      <h2>Novelty</h2>
      <div class="notes md">
        <div class="navigation frame updater">
          <Note
            name="Navigation-Outlier"
            box="Navigation"
            :data="getNote('Navigation-Outlier')"
          />
        </div>
        <div class="navigation frame updater">
          <Note
            name="Navigation-Urgency"
            box="Navigation"
            :data="getNote('Navigation-Urgency')"
          />
        </div>
        <div class="navigation frame updater">
          <Note
            name="Navigation-News"
            box="Navigation"
            :data="getNote('Navigation-New')"
          />
        </div>
      </div>
    </div>
    <div class="group Iteration">
      <h2>Iteration</h2>
      <div class="notes md">
        <div class="navigation frame updater">
          <Note
            name="Navigation-Positive"
            box="Navigation"
            :data="getNote('Navigation-Positive')"
          />
        </div>
        <div class="navigation frame updater">
          <Note
            name="Navigation-Challenge"
            box="Navigation"
            :data="getNote('Navigation-Challenge')"
          />
        </div>
        <div class="navigation frame updater">
          <Note
            name="Navigation-Tracking"
            box="Navigation"
            :data="getNote('Navigation-Tracking')"
          />
        </div>
      </div>
    </div>
    <div class="group trinity">
      <h2>Trinity</h2>
      <div class="notes md">
        <div class="navigation frame values">
          <Note
            name="Navigation-Engineering"
            box="Navigation"
            :data="getNote('Navigation-Engineering')"
          />
        </div>
        <div class="navigation frame values">
          <Note
            name="Navigation-Aesthetics"
            box="Navigation"
            :data="getNote('Navigation-Aesthetics')"
          />
        </div>
        <div class="navigation frame values">
          <Note
            name="Navigation-Business"
            box="Navigation"
            :data="getNote('Navigation-Business')"
          />
        </div>
      </div>
    </div>
    <div class="group project">
      <h2>Project</h2>
      <div class="notes">
        <div class="navigation frame">
          <Note
            name="Trinity Inc"
            box="Navigation"
            :data="getNote('Navigation-Trinity_Inc')"
          />
        </div>
        <div class="navigation frame">
          <Note
            name="Bao Binh solutions"
            box="Navigation"
            :data="getNote('Navigation-Bao_Binh_solutions')"
          />
        </div>
        <div class="navigation frame">
          <Note
            name="The Curator Gift Shop"
            box="Navigation"
            :data="getNote('Navigation-The_Curator_Gift_Shop')"
          />
        </div>
      </div>
    </div>
    <div class="group sub">
      <h2>Sub</h2>
      <div class="notes">
        <div class="navigation frame updater">
          <Note
            name="Navigation-Watch"
            box="Navigation"
            :data="getNote('Navigation-Watch')"
          />
        </div>
        <div class="navigation frame updater">
          <Note
            name="Navigation-Solved"
            box="Navigation"
            :data="getNote('Navigation-Solved')"
          />
        </div>
        <div class="navigation frame updater">
          <Note
            name="Navigation-Archive"
            box="Navigation"
            :data="getNote('Navigation-Archive')"
          />
        </div>
      </div>
    </div>
    <div class="group month">
      <h2>Month</h2>
      <div class="notes">
        <div class="navigation frame">
          <Note
            name="Navigation-Day"
            box="Navigation"
            :data="getNote('Navigation-Day')"
          />
        </div>
        <div class="navigation frame">
          <Note
            name="Navigation-Week"
            box="Navigation"
            :data="getNote('Navigation-Week')"
          />
        </div>
        <div class="navigation frame">
          <Note
            name="Navigation-Month"
            box="Navigation"
            :data="getNote('Navigation-Month')"
          />
        </div>
      </div>
    </div>

    <div class="group quarter">
      <h2>Year</h2>
      <div class="notes">
        <div class="navigation frame">
          <Note
            name="Navigation-Quarter-I"
            box="Navigation"
            :data="getNote('Navigation-Quarter-I')"
          />
        </div>
        <div class="navigation frame">
          <Note
            name="Navigation-Quarter-II"
            box="Navigation"
            :data="getNote('Navigation-Quarter-II')"
          />
        </div>
        <div class="navigation frame">
          <Note
            name="Navigation-Quarter-III"
            box="Navigation"
            :data="getNote('Navigation-Quarter-III')"
          />
        </div>
        <div class="navigation frame">
          <Note
            name="Navigation-Quarter-IV"
            box="Navigation"
            :data="getNote('Navigation-Quarter-IV')"
          />
        </div>
        <div class="navigation frame">
          <Note
            name="Navigation-Year"
            box="Navigation"
            :data="getNote('Navigation-Year')"
          />
        </div>
      </div>
    </div>

    <div class="group phase">
      <h2>Deca</h2>
      <div class="notes">
        <div class="navigation frame">
          <Note
            name="Navigation-Phase-I"
            box="Navigation"
            :data="getNote('Navigation-Phase-I')"
          />
        </div>
        <div class="navigation frame">
          <Note
            name="Navigation-Phase-II"
            box="Navigation"
            :data="getNote('Navigation-Phase-II')"
          />
        </div>
        <div class="navigation frame">
          <Note
            name="Navigation-Phase-III"
            box="Navigation"
            :data="getNote('Navigation-Phase-III')"
          />
        </div>
        <div class="navigation frame">
          <Note
            name="Navigation-Phase-IV"
            box="Navigation"
            :data="getNote('Navigation-Phase-IV')"
          />
        </div>
        <div class="navigation frame">
          <Note
            name="Navigation-Phase-V"
            box="Navigation"
            :data="getNote('Navigation-Phase-V')"
          />
        </div>
      </div>
    </div>

    <div class="group deca">
      <h2>david-bui</h2>
      <div class="notes">
        <div class="navigation frame">
          <Note
            name="Navigation-D2"
            box="Navigation"
            :data="getNote('Navigation-D2')"
          />
        </div>
        <div class="navigation frame">
          <Note
            name="Navigation-D3"
            box="Navigation"
            :data="getNote('Navigation-D3')"
          />
        </div>
        <div class="navigation frame">
          <Note
            name="Navigation-D4"
            box="Navigation"
            :data="getNote('Navigation-D4')"
          />
        </div>
        <div class="navigation frame">
          <Note
            name="Navigation-D5"
            box="Navigation"
            :data="getNote('Navigation-D5')"
          />
        </div>
        <div class="navigation frame">
          <Note
            name="Navigation-D6"
            box="Navigation"
            :data="getNote('Navigation-D6')"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { query } from '~~/static/db.js';
const notes = (await query('note', 'box', 'Navigation')).data;
function getNote(name) {
  return notes.value.filter((note) => note.name === name)[0];
}
</script>
<style>
.group .notes {
  @apply grid gap-3 mt-2 mb-5;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.group .notes.md {
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
}
.group .notes.xl {
  grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
}

.group h2 {
  @apply text-xl font-bold p-0 m-0;
}
</style>
