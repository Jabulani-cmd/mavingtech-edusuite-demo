ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'card';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'eft';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'snapscan';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'zapper';