# 師大資工營報名系統

即刻前往 <https://camp-app.csie.cool/> 進行報名！

## Tech Stack

Infrastructure:

- Cloudflare Pages for Hosting
- Cloudflare D1 for Database
- Cloudflare R2 for Object Storage
- Hermes for Email Delivery
- D1 Manager for Database Management

Application:

- SvelteKit for Full-Stack Framework
- TailwindCSS w/ DaisyUI for UI Framework
- Zod for Schema Validation
- Sentry for Error Tracking

> 因為時間的關係，在技術堆疊的選擇上，我選擇盡量簡化的雲端解決方案，同時必須兼具安全性及方便性。
> 其中以 Cloudflare 系列產品為核心，避免了維護伺服器的麻煩，同時直接享有 Cloudflare 提供的簡單安全防護。
> 雖然原本預期只有重構後端，但依舊選擇使用 SvelteKit 作為框架，考量到也許前端也需要重構，加上個人不是非常熟悉 React，在必須短時間內完成的情況下，選擇 SvelteKit 直接擴展前端部分相對較為方便。
