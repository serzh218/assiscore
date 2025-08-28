# PostgreSQL performance guide

## pg_stat_statements

Enable the extension and view aggregated query stats:

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 20;
```

Useful fields:

| Field        | Description                |
| ------------ | -------------------------- |
| `query`      | normalized statement text  |
| `calls`      | number of executions       |
| `total_time` | total execution time in ms |

## EXPLAIN ANALYZE

Use the helper script to inspect query plans:

```bash
ts-node scripts/explain.ts <user-id>
```

The output shows whether indexes are used (`Index Scan`) and buffer usage.

## Indexes

Key indexes used for frequent filters and pagination:

| Model          | Index                                                                                |
| -------------- | ------------------------------------------------------------------------------------ |
| `Project`      | `ownerId`, `visibility`, `(ownerId, updatedAt DESC)`, `(visibility, updatedAt DESC)` |
| `ChatMessage`  | `(projectId, createdAt DESC)`                                                        |
| `Subscription` | `userId` (unique), `planId`, `status`, `endDate`                                     |
| `Entitlement`  | `(userId, feature)`, `expiresAt`                                                     |

## Pagination rules

Use cursor pagination with `orderBy` on an indexed column:

```ts
const items = await prisma.project.findMany({
  where: { ownerId },
  orderBy: { updatedAt: 'desc' },
  take: PAGE_SIZE + 1,
  cursor: cursor ? { id: cursor } : undefined,
})
```

Return `nextCursor` based on the extra item.

## Logs and metrics

The database logs statements slower than 200 ms. Prometheus metrics and alerts
should track query latency and connection usage.

## Connection pooling

The default `DATABASE_URL` includes `connection_limit=10` and `pool_timeout=15`
for Prisma's driver. In production, route traffic through PgBouncer in
`transaction` mode to keep the database from hitting `too many connections`.
