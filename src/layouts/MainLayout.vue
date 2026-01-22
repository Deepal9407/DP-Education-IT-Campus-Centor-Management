<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { supabase } from 'src/boot/supabase'

const leftDrawerOpen = ref(false)
const user = ref(null)
const router = useRouter()
const $q = useQuasar()

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

onMounted(async () => {
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  user.value = currentUser

  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null
  })
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  $q.notify({
    color: 'positive',
    message: 'Logged out successfully',
    icon: 'logout',
  })
  router.push('/login')
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-primary q-py-xs" bordered height-hint="58">
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold text-h5">
          <q-icon name="school" size="md" class="q-mr-sm" />
          DP Education IT Campus
        </q-toolbar-title>

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap gt-sm">
          <q-btn flat label="Home" color="dark" />
          <q-btn flat label="Features" color="dark" />
          <q-btn flat label="About" color="dark" />
          <q-separator vertical spaced />
          <template v-if="user">
            <q-btn flat label="Dashboard" to="/dashboard" color="dark" />
            <q-btn
              unelevated
              rounded
              color="negative"
              label="Logout"
              class="q-px-lg"
              @click="handleLogout"
            />
          </template>
          <template v-else>
            <q-btn unelevated rounded color="primary" label="Login" class="q-px-lg" to="/login" />
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <div class="lt-md">
          <q-btn
            flat
            dense
            round
            icon="menu"
            aria-label="Menu"
            color="dark"
            @click="toggleLeftDrawer"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="right" bordered behavior="mobile" class="bg-grey-1">
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item-label header class="text-weight-bold text-primary">Navigation</q-item-label>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section> Home </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="star" />
            </q-item-section>
            <q-item-section> Features </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>
            <q-item-section> About </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <template v-if="user">
            <q-item clickable v-ripple to="/dashboard">
              <q-item-section avatar>
                <q-icon name="dashboard" />
              </q-item-section>
              <q-item-section> Dashboard </q-item-section>
            </q-item>

            <div class="q-px-md q-mt-md">
              <q-btn
                unelevated
                rounded
                color="negative"
                label="Logout"
                class="full-width"
                size="lg"
                @click="handleLogout"
              />
            </div>
          </template>
          <template v-else>
            <div class="q-px-md">
              <q-btn
                unelevated
                rounded
                color="primary"
                label="Login"
                class="full-width"
                size="lg"
                to="/login"
              />
            </div>
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
