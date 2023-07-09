<template>
  <div class="frames p-5">
    <div class="group">
      <div class="navigation frame values">
        <Note name="Navigation-Values" box="Navigation" title="Values" />
      </div>
      <div class="navigation frame values">
        <Note
          name="Navigation-Engineering"
          box="Navigation"
          title="Engineering"
        />
      </div>
      <div class="navigation frame values">
        <Note
          name="Navigation-Aesthetics"
          box="Navigation"
          title="Aesthetics"
        />
      </div>
      <div class="navigation frame values">
        <Note name="Navigation-Business" box="Navigation" title="Business" />
      </div>
    </div>
    <div class="group">
      <div class="navigation frame general">
        <Note name="Navigation" box="Navigation" title="General" />
      </div>
      <div class="navigation frame">
        <Note name="Trinity Inc" box="Navigation" title="Trinity Inc" />
      </div>
      <div class="navigation frame">
        <Note
          name="Bao Binh solutions"
          box="Navigation"
          title="Bao Binh solutions"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="The Curator Gift Shop"
          box="Navigation"
          title="The Curator Gift Shop"
        />
      </div>
    </div>

    <div class="group">
      <div class="navigation frame">
        <Note name="Navigation-Day" box="Navigation" title="Day" />
      </div>
      <div class="navigation frame">
        <Note name="Navigation-Week" box="Navigation" title="Week" />
      </div>
      <div class="navigation frame">
        <Note name="Navigation-Month" box="Navigation" title="Month" />
      </div>
    </div>

    <div class="group">
      <div class="navigation frame">
        <Note name="Navigation-Quarter-I" box="Navigation" title="Quarter I" />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-Quarter-II"
          box="Navigation"
          title="Quarter II"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-Quarter-III"
          box="Navigation"
          title="Quarter III"
        />
      </div>
      <div class="navigation frame">
        <Note
          name="Navigation-Quarter-IV"
          box="Navigation"
          title="Quarter IV"
        />
      </div>
      <div class="navigation frame">
        <Note name="Navigation-Year" box="Navigation" title="Year" />
      </div>
    </div>

    <div class="group">
      <div class="navigation frame">
        <Note name="Navigation-Phase-II" box="Navigation" title="Phase II" />
      </div>
      <div class="navigation frame">
        <Note name="Navigation-Phase-III" box="Navigation" title="Phase III" />
      </div>
      <div class="navigation frame">
        <Note name="Navigation-Phase-IV" box="Navigation" title="Phase IV" />
      </div>
      <div class="navigation frame">
        <Note name="Navigation-Phase-V" box="Navigation" title="Phase IV" />
      </div>
    </div>

    <div class="group">
      <div class="navigation frame">
        <Note name="Navigation-D2" box="Navigation" title="Deca 20" />
      </div>
      <div class="navigation frame">
        <Note name="Navigation-D3" box="Navigation" title="Deca 30" />
      </div>
      <div class="navigation frame">
        <Note name="Navigation-D4" box="Navigation" title="Deca 40" />
      </div>
      <div class="navigation frame">
        <Note name="Navigation-D5" box="Navigation" title="Deca 50" />
      </div>
      <div class="navigation frame">
        <Note name="Navigation-D6" box="Navigation" title="Deca 60" />
      </div>
    </div>
  </div>
</template>
<script setup></script>
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
