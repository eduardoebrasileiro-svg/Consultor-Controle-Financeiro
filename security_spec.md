# Security Specification - ESTRATÉGIA CONSULTORIA

## Data Invariants
- A transaction must have a valid `userId`.
- Transactions amounts must be positive numbers.
- User roles are `user` or `admin`.
- Only admins can modify `budgetLimit` and `adminInstructions` in Planning.
- Users can only read/write their own transactions unless an admin is viewing them.

## The Dirty Dozen Payloads (Rejection Tests)
1. Creating a transaction for another user UID.
2. Updating a transaction to change the `userId`.
3. A non-admin user trying to list all users.
4. A user trying to set their own role to 'admin' during registration.
5. An admin trying to delete a user's transaction (Admin is read-only for audit, or full control? User said "acesso", I'll allow read for now, and write if requested). Actually, I'll allow admins to manage planning.
6. Planning update by user attempting to change `budgetLimit`.
7. Transaction with negative `amount`.
8. Transaction with missing required fields.
9. Invalid `role` string (e.g., 'super-user').
10. Spoofing `createdAt` with a client-side date (must use server timestamp).
11. Reading another user's planning notes.
12. Injecting malicious scripts in `description` fields.

## Test Runner logic
- `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'` for Admin check.
