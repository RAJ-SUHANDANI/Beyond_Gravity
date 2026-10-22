import {defineConfig,devices} from '@playwright/test';
const live=process.env.E2E_BASE_URL;
export default defineConfig({
 testDir:'./tests',timeout:60000,retries:1,
 use:{baseURL:live||'http://127.0.0.1:4173',trace:'retain-on-failure',video:'retain-on-failure'},
 projects:[{name:'desktop-chromium',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900}}},{name:'mobile-chromium',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}}],
 webServer:live?undefined:{command:'npm run preview -- --host 127.0.0.1 --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI,timeout:30000},
 reporter:[['list'],['html',{open:'never',outputFolder:'playwright-report'}]]
});
