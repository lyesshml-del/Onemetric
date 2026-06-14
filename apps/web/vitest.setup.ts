// Dummy env so modules that construct clients at import time (Prisma) and the
// crypto helpers have what they need during unit tests. No real services are hit.
process.env.DATABASE_URL ||=
  "postgresql://user:pass@localhost:5432/db?schema=public";
process.env.DIRECT_URL ||=
  "postgresql://user:pass@localhost:5432/db?schema=public";
process.env.CREDENTIALS_KEY ||=
  "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";
process.env.VISITOR_HASH_SALT ||= "test-salt";
