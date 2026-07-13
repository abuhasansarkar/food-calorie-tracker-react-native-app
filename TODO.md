## TODO - Clerk auth + runtime crash fixes

- [x] Fix runtime crash by removing `className` from 6-digit `TextInput` fields in:
  - [x] app/(auth)/verify-email.tsx
  - [x] app/(auth)/forgot-password.tsx
- [x] Add Clerk publishable key dev/prod guard warning in `app/_layout.tsx`
- [ ] Verify build / lint / run to ensure crash is resolved and warnings are clearer
