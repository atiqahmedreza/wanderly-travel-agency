Set-Location "$PSScriptRoot\..\client"
$env:GIT_AUTHOR_NAME = 'Wanderly Dev'
$env:GIT_AUTHOR_EMAIL = 'dev@wanderly.com'
$env:GIT_COMMITTER_NAME = 'Wanderly Dev'
$env:GIT_COMMITTER_EMAIL = 'dev@wanderly.com'
if (-not (Test-Path .git)) { git init | Out-Null }

function Commit-Group($paths, $message) {
  git add $paths 2>$null
  git diff --cached --quiet
  if ($LASTEXITCODE -ne 0) { git commit -m $message }
}

Commit-Group @('package.json', '.env.example', 'README.md', '.gitignore', 'next.config.mjs', 'tsconfig.json', 'postcss.config.mjs', 'tailwind.config.ts', 'next-env.d.ts') 'chore: scaffold Next.js client with Tailwind'
Commit-Group @('src/app/globals.css', 'src/app/layout.tsx', 'src/lib') 'feat: add root layout, fonts, and API client'
Commit-Group @('src/contexts', 'src/components/providers') 'feat: add auth hydration and toast providers'
Commit-Group @('src/components/ui') 'feat: build reusable UI design system components'
Commit-Group @('src/components/layout') 'feat: implement navbar and footer with newsletter'
Commit-Group @('src/components/tours/TourCard.tsx') 'feat: add standardized tour card component'
Commit-Group @('src/components/home', 'src/app/page.tsx') 'feat: build data-driven home page sections'
Commit-Group @('src/app/explore') 'feat: add explore page with server-side filters and pagination'
Commit-Group @('src/app/packages') 'feat: add package details, gallery, and booking modal'
Commit-Group @('src/app/login', 'src/app/register', 'src/components/auth') 'feat: implement auth forms with demo login and route guards'
Commit-Group @('src/components/dashboard', 'src/app/dashboard/user/page.tsx', 'src/app/dashboard/user/bookings') 'feat: add user dashboard overview and bookings table'
Commit-Group @('src/app/dashboard/user/wishlist', 'src/app/dashboard/user/profile') 'feat: add wishlist gallery and profile settings'
Commit-Group @('src/app/dashboard/admin/page.tsx') 'feat: add admin overview charts from live API data'
Commit-Group @('src/app/dashboard/admin/users', 'src/app/dashboard/admin/bookings') 'feat: add admin user and booking management'
Commit-Group @('src/app/dashboard/admin/packages') 'feat: add admin package CRUD with imgBB uploads'
Commit-Group @('src/app/dashboard/admin/destinations', 'src/app/dashboard/admin/reports', 'src/app/dashboard/admin/settings') 'feat: add destinations, reports export, and admin settings'
Commit-Group @('src/app/booking') 'feat: add Stripe booking success confirmation flow'
Commit-Group @('src/app/about', 'src/app/contact') 'feat: add about and contact pages'
Commit-Group @('src/app/blog') 'feat: add blog listing and article pages'
Commit-Group @('src/app/privacy', 'src/app/terms', 'src/app/not-found.tsx', 'src/app/error.tsx') 'feat: add legal pages and branded error states'
Commit-Group @('src/app/compare') 'feat: add optional package comparison tool'

Write-Host "Client commits:" (git rev-list --count HEAD)
