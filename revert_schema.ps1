$path = 'packages/db/prisma/schema.prisma'
$c = Get-Content $path
$c = $c | Where-Object { $_ -notmatch 'url      = env' }
$c | Set-Content $path
