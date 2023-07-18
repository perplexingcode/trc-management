<template>
  <div class="frames p-5">
    <div class="group">
      <div class="navigation frame values">
        <Note
          name="Navigation-Values"
          box="Navigation"
          title="Values"
          :data="getNote('Navigation-Values')"
        />
      </div>
      <div class="navigation frame values">
        <Note
          name="Navigation-Engineering"
          box="Navigation"
          title="Engineering"
          :data="getNote('Navigation-Engineering')"
        />
      </div>
      <div class="navigation frame values">
        <Note
          name="Navigation-Aesthetics"
          box="Navigation"
          title="Aesthetics"
          :data="getNote('Navigation-Aesthetics')"
        />
      </div>
      <div class="navigation frame values">
        <Note
          name="Navigation-Business"
          box="Navigation"
          title="Business"
          :data="getNote('Navigation-Business')"
        />
      </div>
    </div>
    <div class="group">
      <div class="navigation frame general">
        <Note
          name="Navigation"
          box="Navigation"
          title="General"
          :data="getNote('Navigation')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Trinity Inc"
          box="Navigation"
          title="Trinity Inc"
          :data="getNote('Navigation-Trinity_Inc')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Bao Binh solutions"
          box="Navigation"
          title="Bao Binh solutions"
          :data="getNote('Navigation-Bao_Binh_solutions')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="The Curator Gift Shop"
          box="Navigation"
          title="The Curator Gift Shop"
          :data="getNote('Navigation-The_Curator_Gift_Shop')"
        />
      </div>
    </div>

    <div class="group">
      <div class="navigation frame">
        <Note
          name="Navigation-Day"
          box="Navigation"
          title="Day"
          :data="getNote('Navigation-Day')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-Week"
          box="Navigation"
          title="Week"
          :data="getNote('Navigation-Week')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-Month"
          box="Navigation"
          title="Month"
          :data="getNote('Navigation-Month')"
        />
      </div>
    </div>

    <div class="group">
      <div class="navigation frame">
        <Note
          name="Navigation-Quarter-I"
          box="Navigation"
          title="Quarter I"
          :data="getNote('Navigation-Quarter-I')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-Quarter-II"
          box="Navigation"
          title="Quarter II"
          :data="getNote('Navigation-Quarter-II')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-Quarter-III"
          box="Navigation"
          title="Quarter III"
          :data="getNote('Navigation-Quarter-III')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-Quarter-IV"
          box="Navigation"
          title="Quarter IV"
          :data="getNote('Navigation-Quarter-IV')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-Year"
          box="Navigation"
          title="Year"
          :data="getNote('Navigation-Year')"
        />
      </div>
    </div>

    <div class="group">
      <div class="navigation frame">
        <Note
          name="Navigation-Phase-I"
          box="Navigation"
          title="Phase I"
          :data="getNote('Navigation-Phase-I')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-Phase-II"
          box="Navigation"
          title="Phase II"
          :data="getNote('Navigation-Phase-II')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-Phase-III"
          box="Navigation"
          title="Phase III"
          :data="getNote('Navigation-Phase-III')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-Phase-IV"
          box="Navigation"
          title="Phase IV"
          :data="getNote('Navigation-Phase-IV')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-Phase-V"
          box="Navigation"
          title="Phase V"
          :data="getNote('Navigation-Phase-V')"
        />
      </div>
    </div>

    <div class="group">
      <div class="navigation frame">
        <Note
          name="Navigation-D2"
          box="Navigation"
          title="Deca 20"
          :data="getNote('Navigation-D2')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-D3"
          box="Navigation"
          title="Deca 30"
          :data="getNote('Navigation-D3')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-D4"
          box="Navigation"
          title="Deca 40"
          :data="getNote('Navigation-D4')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-D5"
          box="Navigation"
          title="Deca 50"
          :data="getNote('Navigation-D5')"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-D6"
          box="Navigation"
          title="Deca 60"
          :data="getNote('Navigation-D6')"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { query } from "~~/static/db.js";
const notes = (await query("note", "box", "Navigation")).data;
function getNote(name) {
  return notes.value.filter((note) => note.name === name)[0];
}
</script>
<style>
.frames .group {
  @apply grid items-center gap-3 mt-5;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
/* span 2 cols */
.frames .group .general {
  grid-column: span 2;
}
</style>
