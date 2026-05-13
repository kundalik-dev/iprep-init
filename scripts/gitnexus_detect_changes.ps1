param(
  [Parameter(Position = 0)]
  [ValidateSet("unstaged", "staged", "all", "compare")]
  [string]$scope = "unstaged",

  [string]$base_ref = "main",

  [string]$repo = "iprep-init"
)

$args = @(
  "pnpm",
  "exec",
  "gitnexus",
  "detect_changes",
  "--scope",
  $scope,
  "--repo",
  $repo
)

if ($scope -eq "compare") {
  $args += @("--base-ref", $base_ref)
}

& corepack @args
exit $LASTEXITCODE

