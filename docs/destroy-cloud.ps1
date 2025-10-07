<#
Destroy Cloud script
- Prompts for AWS profile
- Runs terraform destroy --var-file=dev.tfvars
#>

param()

Write-Host "== Fast Food Infra Destroy (Cloud) =="
$awsProfile = Read-Host 'AWS profile to use (e.g. estudos)'
if ([string]::IsNullOrWhiteSpace($awsProfile)) {
    Write-Error 'AWS profile is required. Abort.'
    exit 1
}
$env:AWS_PROFILE = $awsProfile

try {
    $infraPath = (Resolve-Path "$PSScriptRoot\..\..\infra").Path
} catch {
    Write-Error "Cannot find infra directory. Expected at: $PSScriptRoot\..\..\infra"
    exit 1
}
Set-Location -Path $infraPath
Write-Host "Using infra directory: $infraPath"

if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
    Write-Error 'Terraform not found in PATH. Install Terraform and try again.'
    exit 1
}

if (-not (Test-Path .\dev.tfvars)) {
    Write-Error 'dev.tfvars not found in infra. Ensure infra/dev.tfvars exists and try again.'
    exit 1
}

$confirm = Read-Host 'This will destroy all resources created by Terraform in this folder. Are you sure? (Y/N)'
if ($confirm -ne 'Y') {
    Write-Host 'Aborted.'
    exit 0
}

Write-Host 'Running terraform destroy...'
terraform destroy --var-file=dev.tfvars -auto-approve

if ($LASTEXITCODE -ne 0) {
    Write-Error 'Terraform destroy failed.'
    exit $LASTEXITCODE
}

Write-Host 'Terraform destroy complete.' -ForegroundColor Green
