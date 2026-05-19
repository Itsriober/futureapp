-- Day of month payday falls on (1-31). Null means not set.
alter table budgets
  add column if not exists payday_day smallint check (payday_day between 1 and 31);
