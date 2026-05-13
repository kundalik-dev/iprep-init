param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$target,

  [Parameter(Position = 1)]
  [string]$direction = "upstream",

  [int]$depth = 3,

  [string]$repo = "iprep-init",

  [switch]$include_tests
)

$args = @(
  "pnpm",
  "exec",
  "gitnexus",
  "impact",
  $target,
  "--direction",
  $direction,
  "--depth",
  $depth.ToString(),
  "--repo",
  $repo
)

if ($include_tests) {
  $args += "--include-tests"
}

& corepack @args
exit $LASTEXITCODE

