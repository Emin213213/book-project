# Forgot/Reset Password Forms — Design

**Date:** 2026-05-31
**Scope:** UI/markup only. No backend calls, no changes to `userService`/`useUserStore`, no URL-token handling.

## Goal

Add a "Forgot password?" link to the login form and create two new pages that visually match the existing `LoginPage` card design:

1. **Request reset** — user enters email so a reset letter can be "sent".
2. **Reset password** — user reaches it from the email link and enters a new password + confirmation.

## Changes

### 1. `LoginPage.tsx`
Add a "Забыли пароль?" link in the card footer next to the existing "Зарегистрироваться" link, pointing to `/forgot-password`, styled with the existing `.footerLink` class.

### 2. `ForgotPasswordPage` (`/forgot-password`)
Card matching login styling:
- Gradient icon square, title "Восстановление пароля", subtitle.
- Email input field.
- "Отправить ссылку" button.
- On submit (local state only, no network): switch to a success view — check icon + "Мы отправили письмо на {email}…".
- "← Назад ко входу" link.

### 3. `ResetPasswordPage` (`/reset-password`)
Card matching login styling:
- Gradient icon square, title "Новый пароль", subtitle.
- "Новый пароль" + "Повторите пароль" inputs (both `type=password`).
- Basic UI-only validation that passwords match (reuse `.error` style).
- "Сохранить пароль" button → success view with a "Войти" link.

### Styling
Each new page gets its own `.module.css` reusing the same class names/structure as `LoginPage.module.css` (`wrapper`, `card`, `header`, `iconWrap`, `title`, `subtitle`, `form`, `group`, `label`, `input`, `submitBtn`, `footer`, `footerLink`, `error`). Matches the repo's one-module-per-page convention.

### Routes
Add `/forgot-password` and `/reset-password` to the `PublicLayout` children in `App.tsx`.

## Out of scope
Real fetch requests, store/service changes, reset-token parsing, email delivery.