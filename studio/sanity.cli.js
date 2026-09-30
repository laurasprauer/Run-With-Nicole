import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  server: {
    hostname: 'localhost',
    port: 3333,
  },
  // Deployed Studio lives at https://runwithnicole.sanity.studio
  studioHost: 'runwithnicole',
  deployment: {autoUpdates: false},
})
