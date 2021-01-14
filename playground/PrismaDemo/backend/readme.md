following: https://www.prisma.io/docs/concepts/components/preview-features/sql-server/sql-server-start-from-scratch-typescript

```
npm install @prisma/cli -D
```

```
npx prisma init
```


================================
Your Prisma schema was created at prisma/schema.prisma.
  You can now open it in your favorite editor.

Next steps:
1. Set the DATABASE_URL in the .env file to point to your existing database. If your database has no tables yet, read https://pris.ly/d/getting-started.
2. Set the provider of the datasource block in schema.prisma to match your database: postgresql, mysql or sqlite.
3. Run prisma introspect to turn your database schema into a Prisma data model.
4. Run prisma generate to install Prisma Client. You can then start querying your database.

More information in our documentation:
https://pris.ly/d/getting-started
==================================

set .env connection string 
  DATABASE_URL="sqlserver://localhost;database=C3;integratedsecurity=true;trustServerCertificate=true;"

enable MS SQL server TCP
  open C:\Windows\System32\SQLServerManager15.msc

  click on "SQL Server Network Configuration"
  enable TCP/IP

generate schema
  npx prisma introspect

generate client
  npx prisma generate
