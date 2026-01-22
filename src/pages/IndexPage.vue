<template>
  <q-page class="landing-page">
    <section class="hero-section row items-center justify-between q-pa-md q-ma-none">
      <div class="col-12 col-md-6 q-pa-xl fade-in-left text-center text-md-left">
        <h1 class="text-h3 text-md-h2 text-weight-bold text-primary q-mb-md hero-title">
          Revolutionize Your <br />
          Tuition Center Management
        </h1>
        <p class="text-h6 text-md-h5 text-grey-8 q-mb-xl">
          Streamline operations, enhance student learning, and manage your institute effortlessly
          with our all-in-one Smart Campus solution.
        </p>
        <div class="row q-gutter-md justify-center justify-md-start">
          <q-btn
            unelevated
            rounded
            color="primary"
            size="lg"
            label="Get Started"
            class="q-px-xl q-py-xs btn-hover"
            icon-right="arrow_forward"
            to="/register"
          />
          <q-btn
            outline
            rounded
            color="primary"
            size="lg"
            label="Learn More"
            class="q-px-xl q-py-xs btn-hover"
          />
        </div>
      </div>
      <div class="col-12 col-md-6 row justify-center q-pa-md fade-in-right">
        <q-img
          src="https://img.freepik.com/free-vector/online-tutorials-concept_52683-37480.jpg"
          spinner-color="primary"
          style="max-width: 90%; border-radius: 20px"
          class="hero-image"
        >
          <template v-slot:error>
            <div class="absolute-full flex flex-center bg-grey-2 text-primary">
              Image Placeholder
            </div>
          </template>
        </q-img>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section bg-grey-1 q-py-xl">
      <div class="container text-center q-mb-xl">
        <h2 class="text-h3 text-weight-bold text-dark q-mb-sm">Why Choose Us?</h2>
        <div class="separator bg-primary q-mx-auto"></div>
        <p class="text-h6 text-grey-7 q-mt-md">
          Everything you need to run a successful educational institute.
        </p>
      </div>

      <div class="row justify-center q-gutter-lg q-px-xl">
        <div class="col-12 col-sm-6 col-md-3" v-for="(feature, index) in features" :key="index">
          <q-card class="feature-card q-pa-md text-center no-shadow">
            <q-card-section>
              <q-avatar
                size="80px"
                font-size="40px"
                color="red-1"
                text-color="primary"
                :icon="feature.icon"
              />
            </q-card-section>
            <q-card-section>
              <div class="text-h5 text-weight-bold q-mb-sm">{{ feature.title }}</div>
              <div class="text-subtitle1 text-grey-8">{{ feature.description }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section bg-primary text-white q-py-xl">
      <div class="row justify-center q-gutter-xl text-center">
        <div class="col-12 col-sm-3">
          <div class="text-h2 text-weight-bolder">100+</div>
          <div class="text-h6">Institutes</div>
        </div>
        <div class="col-12 col-sm-3">
          <div class="text-h2 text-weight-bolder">5000+</div>
          <div class="text-h6">Students</div>
        </div>
        <div class="col-12 col-sm-3">
          <div class="text-h2 text-weight-bolder">99.9%</div>
          <div class="text-h6">Uptime</div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta-section q-py-xl text-center">
      <div class="q-pa-md">
        <h2 class="text-h3 text-weight-bold text-dark q-mb-md">
          Ready to Transform Your Institute?
        </h2>
        <p class="text-h5 text-grey-7 q-mb-xl">
          Join hundreds of other institutes managing their campus smartly.
        </p>
        <q-btn
          push
          color="accent"
          size="xl"
          label="Join Now"
          rounded
          class="q-px-xl glow-effect"
          to="/register"
        />
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white q-py-lg">
      <div class="row justify-center q-gutter-lg text-center">
        <div class="col-12">
          <div class="text-h6 text-weight-bold text-red-1">DP Education IT Campus</div>
          <div class="text-caption text-grey-5">© 2024 All Rights Reserved.</div>
          <div class="text-caption text-grey-6 q-mt-xs">Powered by Deepal Jayasekara PVT LTD</div>
        </div>
      </div>
    </footer>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const features = ref([
  {
    title: 'Student Management',
    description: 'Comprehensive profiles, attendance tracking, and performance analytics.',
    icon: 'school',
  },
  {
    title: 'Smart Scheduling',
    description: 'Effortless class scheduling, rescheduling, and automated notifications.',
    icon: 'calendar_today',
  },
  {
    title: 'Financial Tools',
    description: 'Fee collection, payment tracking, and financial reporting made easy.',
    icon: 'payments',
  },
  {
    title: 'Online Learning',
    description: 'Integrated platform for virtual classes and resource sharing.',
    icon: 'cast_for_education',
  },
])
</script>

<style lang="scss" scoped>
.landing-page {
  overflow-x: hidden;
}

.hero-section {
  min-height: 90vh;
  background:
    radial-gradient(circle at top right, $secondary 0%, transparent 40%),
    radial-gradient(circle at bottom left, #ffebee 0%, transparent 40%);
}

.hero-image {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-10px);
  }
}

.separator {
  height: 4px;
  width: 60px;
  border-radius: 2px;
}

.feature-card {
  transition: all 0.3s ease;
  border: 1px solid transparent;
  background: white;
  border-radius: 16px;
  height: 100%;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 30px rgba(211, 47, 47, 0.15) !important;
    border-color: $secondary;
  }
}

.btn-hover {
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.05);
  }
}

.glow-effect {
  box-shadow: 0 0 20px rgba(255, 82, 82, 0.6);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.4);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(255, 82, 82, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0);
  }
}

.fade-in-left {
  animation: fadeInLeft 1s ease-out;
}
.fade-in-right {
  animation: fadeInRight 1s ease-out;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive Typography & Spacing Overrides */
@media (max-width: 599px) {
  .hero-title {
    font-size: 2.5rem !important;
    line-height: 1.1;
  }
  .q-pa-xl {
    padding: 24px !important;
  }
  .q-px-xl {
    padding-left: 24px !important;
    padding-right: 24px !important;
  }
  .q-py-xl {
    padding-top: 32px !important;
    padding-bottom: 32px !important;
  }
}
</style>
